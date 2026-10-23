const PRESCRIPTION_DB_NAME = 'sdlindia-prescription-db';
const PRESCRIPTION_DB_VERSION = 1;
const PRESCRIPTION_FILE_STORE = 'prescription-files';
const PRESCRIPTION_INDEX_KEY = 'prescription-index-v1';

export const PRESCRIPTION_DRAFT_SYNC_EVENT =
  'sdlindia:prescription-draft-sync';

const buildDefaultIndex = () => ({
  version: 1,
  draft: [],
  orders: {},
});

const canUseStorage = () =>
  typeof window !== 'undefined' &&
  typeof window.localStorage !== 'undefined' &&
  typeof window.indexedDB !== 'undefined';

const cloneRecord = (record = {}) => ({
  id: record.id,
  name: record.name || 'Prescription',
  type: record.type || 'application/octet-stream',
  size: Number(record.size || 0),
  lastModified: Number(record.lastModified || Date.now()),
  isImage: Boolean(record.isImage),
  createdAt: Number(record.createdAt || Date.now()),
});

const openPrescriptionDb = () => {
  if (!canUseStorage()) {
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(
      PRESCRIPTION_DB_NAME,
      PRESCRIPTION_DB_VERSION
    );

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(PRESCRIPTION_FILE_STORE)) {
        db.createObjectStore(PRESCRIPTION_FILE_STORE, { keyPath: 'id' });
      }
    };
  });
};

const runTransaction = async (mode, callback) => {
  const db = await openPrescriptionDb();

  if (!db) {
    return null;
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(PRESCRIPTION_FILE_STORE, mode);
    const store = transaction.objectStore(PRESCRIPTION_FILE_STORE);

    let callbackResult;

    try {
      callbackResult = callback(store);
    } catch (error) {
      reject(error);
      return;
    }

    transaction.oncomplete = () => {
      resolve(callbackResult ?? null);
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  }).finally(() => {
    db.close();
  });
};

const getIndex = () => {
  if (!canUseStorage()) {
    return buildDefaultIndex();
  }

  try {
    const rawIndex = window.localStorage.getItem(PRESCRIPTION_INDEX_KEY);

    if (!rawIndex) {
      return buildDefaultIndex();
    }

    const parsedIndex = JSON.parse(rawIndex);

    return {
      ...buildDefaultIndex(),
      ...parsedIndex,
      draft: Array.isArray(parsedIndex?.draft)
        ? parsedIndex.draft.map(cloneRecord)
        : [],
      orders:
        parsedIndex?.orders && typeof parsedIndex.orders === 'object'
          ? Object.entries(parsedIndex.orders).reduce((acc, [orderId, records]) => {
              acc[orderId] = Array.isArray(records)
                ? records.map(cloneRecord)
                : [];
              return acc;
            }, {})
          : {},
    };
  } catch (error) {
    return buildDefaultIndex();
  }
};

const setIndex = (indexValue) => {
  if (!canUseStorage()) {
    return;
  }

  const safeIndex = {
    ...buildDefaultIndex(),
    ...(indexValue || {}),
    draft: Array.isArray(indexValue?.draft)
      ? indexValue.draft.map(cloneRecord)
      : [],
    orders:
      indexValue?.orders && typeof indexValue.orders === 'object'
        ? Object.entries(indexValue.orders).reduce((acc, [orderId, records]) => {
            acc[orderId] = Array.isArray(records)
              ? records.map(cloneRecord)
              : [];
            return acc;
          }, {})
        : {},
  };

  window.localStorage.setItem(PRESCRIPTION_INDEX_KEY, JSON.stringify(safeIndex));
  window.dispatchEvent(new CustomEvent(PRESCRIPTION_DRAFT_SYNC_EVENT));
};

const createPrescriptionId = () =>
  `prescription_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const decorateFileWithId = (file, id) => {
  if (!file || !id || file.__prescriptionId === id) {
    return file;
  }

  try {
    Object.defineProperty(file, '__prescriptionId', {
      configurable: true,
      writable: true,
      enumerable: false,
      value: id,
    });
  } catch (error) {
    file.__prescriptionId = id;
  }

  return file;
};

const buildRecordFromFile = (file, fileId) => ({
  id: fileId,
  name: file?.name || 'Prescription',
  type: file?.type || 'application/octet-stream',
  size: Number(file?.size || 0),
  lastModified: Number(file?.lastModified || Date.now()),
  isImage: String(file?.type || '').startsWith('image/'),
  createdAt: Date.now(),
});

const putFileBlob = async (fileId, file) => {
  if (!fileId || !file) {
    return;
  }

  await runTransaction('readwrite', (store) => {
    store.put({ id: fileId, blob: file });
  });
};

const getFileBlobById = async (fileId) => {
  if (!fileId) {
    return null;
  }

  const db = await openPrescriptionDb();

  if (!db) {
    return null;
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(PRESCRIPTION_FILE_STORE, 'readonly');
    const store = transaction.objectStore(PRESCRIPTION_FILE_STORE);
    const request = store.get(fileId);

    request.onsuccess = () => {
      resolve(request.result?.blob || null);
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };

    transaction.onerror = () => {
      db.close();
    };
  });
};

const deleteFileBlobById = async (fileId) => {
  if (!fileId) {
    return;
  }

  await runTransaction('readwrite', (store) => {
    store.delete(fileId);
  });
};

const collectReferencedIds = (indexValue) => {
  const ids = new Set();

  (indexValue?.draft || []).forEach((record) => {
    if (record?.id) {
      ids.add(record.id);
    }
  });

  Object.values(indexValue?.orders || {}).forEach((records) => {
    (records || []).forEach((record) => {
      if (record?.id) {
        ids.add(record.id);
      }
    });
  });

  return ids;
};

const toFileFromRecord = (record, blob) => {
  const file = new File([blob], record.name, {
    type: record.type,
    lastModified: record.lastModified,
  });

  decorateFileWithId(file, record.id);

  return file;
};

export const persistDraftPrescriptionFiles = async (files = []) => {
  if (!canUseStorage()) {
    return [];
  }

  const indexValue = getIndex();
  const previousDraft = Array.isArray(indexValue.draft) ? indexValue.draft : [];
  const nextRecords = [];

  for (const file of files) {
    if (!file) {
      continue;
    }

    const fileId = file.__prescriptionId || createPrescriptionId();
    decorateFileWithId(file, fileId);
    await putFileBlob(fileId, file);
    nextRecords.push(buildRecordFromFile(file, fileId));
  }

  indexValue.draft = nextRecords;
  setIndex(indexValue);

  const referencedIds = collectReferencedIds(indexValue);

  await Promise.all(
    previousDraft
      .map((record) => record?.id)
      .filter(Boolean)
      .filter((fileId) => !referencedIds.has(fileId))
      .map((fileId) => deleteFileBlobById(fileId))
  );

  return nextRecords;
};

export const loadDraftPrescriptionFiles = async () => {
  if (!canUseStorage()) {
    return [];
  }

  const indexValue = getIndex();
  const draftRecords = Array.isArray(indexValue.draft) ? indexValue.draft : [];
  const draftFiles = [];

  for (const record of draftRecords) {
    try {
      const blob = await getFileBlobById(record.id);

      if (!blob) {
        continue;
      }

      draftFiles.push(toFileFromRecord(record, blob));
    } catch (error) {
      continue;
    }
  }

  return draftFiles;
};

export const clearDraftPrescriptionFiles = async () => {
  if (!canUseStorage()) {
    return;
  }

  const indexValue = getIndex();
  const previousDraft = Array.isArray(indexValue.draft) ? indexValue.draft : [];

  indexValue.draft = [];
  setIndex(indexValue);

  const referencedIds = collectReferencedIds(indexValue);

  await Promise.all(
    previousDraft
      .map((record) => record?.id)
      .filter(Boolean)
      .filter((fileId) => !referencedIds.has(fileId))
      .map((fileId) => deleteFileBlobById(fileId))
  );
};

export const finalizeDraftPrescriptionForOrder = async (orderId) => {
  if (!canUseStorage() || !orderId) {
    return [];
  }

  const indexValue = getIndex();
  const draftRecords = Array.isArray(indexValue.draft) ? indexValue.draft : [];

  if (!draftRecords.length) {
    indexValue.orders = {
      ...(indexValue.orders || {}),
      [orderId]: [],
    };
    setIndex(indexValue);
    return [];
  }

  indexValue.orders = {
    ...(indexValue.orders || {}),
    [orderId]: draftRecords.map(cloneRecord),
  };
  indexValue.draft = [];
  setIndex(indexValue);

  return indexValue.orders[orderId] || [];
};

export const loadOrderPrescriptionFiles = async (orderId) => {
  if (!canUseStorage() || !orderId) {
    return [];
  }

  const indexValue = getIndex();
  const orderRecords = Array.isArray(indexValue?.orders?.[orderId])
    ? indexValue.orders[orderId]
    : [];

  const orderFiles = [];

  for (const record of orderRecords) {
    try {
      const blob = await getFileBlobById(record.id);

      if (!blob) {
        continue;
      }

      const file = toFileFromRecord(record, blob);
      const previewUrl = window.URL.createObjectURL(blob);

      orderFiles.push({
        ...cloneRecord(record),
        file,
        previewUrl,
      });
    } catch (error) {
      continue;
    }
  }

  return orderFiles;
};

export const revokePrescriptionPreviewUrls = (files = []) => {
  if (typeof window === 'undefined') {
    return;
  }

  (Array.isArray(files) ? files : []).forEach((file) => {
    if (file?.previewUrl) {
      window.URL.revokeObjectURL(file.previewUrl);
    }
  });
};
