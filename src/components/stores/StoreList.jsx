'use client';

import { useEffect, useRef } from 'react';
import { RiMapPinLine, RiPhoneLine, RiMailLine } from 'react-icons/ri';

const StoreListItem = ({ store, isSelected, onClick, onContactClick, onDirectionClick }) => {
  const itemRef = useRef(null);

  useEffect(() => {
    if (isSelected && itemRef.current) {
      // itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      itemRef.current.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }
  }, [isSelected]);

  const formatAddress = () => {
    const parts = [
      store.addressLine1,
      store.addressLine2,
      store.city,
      store.state,
      store.pincode,
    ].filter(Boolean);

    return parts.join(', ');
  };

  return (
    <div
      ref={itemRef}
      className="store-list-item clinic-card"
    // onClick={() => onClick(store)}
    // role="button"
    // tabIndex={0}
    // onKeyDown={(e) => {
    //   if (e.key === 'Enter' || e.key === ' ') {
    //     e.preventDefault();
    //     onClick(store);
    //   }
    // }}
    >
      {/* <div className="store-item-icon">
        <RiMapPinLine />
      </div> */}

      <div className="store-item-content">
        <h3 className="clinic-card-name" title={store.name}>
          {store.name}
        </h3>

        {store.phone && (
          <a href={`tel:${store.phone}`} className="store-contact-item">
            <RiPhoneLine className="info-icon" />
            <span>{store.phone}</span>
          </a>
        )}

        {store.email && (
          <a href={`mailto:${store.email}`} className="store-contact-item">
            <RiMailLine className="info-icon" />
            <span>{store.email}</span>
          </a>
        )}

        <p className="store-address">
          <RiMapPinLine className="info-icon" />
          <span>{formatAddress()}</span>
        </p>

        <div className="clinic-card-actions">
          <button
            type="button"
            className="clinic-action-btn contact-btn btn-secondary"
            onClick={(e) => {
              e.stopPropagation();
              onContactClick?.(store);
            }}
          >
            <RiPhoneLine className="btn-icon" />
            <span>Contact Us</span>
          </button>

          {store.latitude && <button
            type="button"
            className="clinic-action-btn direction-btn btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              onDirectionClick?.(store);
            }}
          >
            <RiMapPinLine className="btn-icon" />
            <span>Direction</span>
          </button>}
        </div>
      </div>
    </div>
  );
};

const StoreList = ({ stores = [], selectedStoreId, onStoreClick, totalStores, onContactClick, onDirectionClick }) => {
  if (stores.length === 0) {
    return (
      <div className="store-list-empty">
        <p>Enter Store Name, Pincode or City to find stores.</p>
      </div>
    );
  }

  return (
    <div className="store-list common-scrollbar" data-lenis-prevent>
      {totalStores !== undefined && totalStores > 0 && (
        <div className="store-list-header">
          <p className="store-count my-2 text-secondary">
            {totalStores} {totalStores === 1 ? 'store' : 'stores'} found
          </p>
        </div>
      )}
      <div className='clinic-list'>
        {stores.map((store) => (
          <StoreListItem
            key={store.uid}
            store={store}
            isSelected={selectedStoreId === store.uid}
            onClick={onStoreClick}
            onContactClick={onContactClick}
            onDirectionClick={onDirectionClick}
          />
        ))}
      </div>
    </div>
  );
};

export default StoreList;
