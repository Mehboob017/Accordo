const SDL_BASE_URL = process.env.SDL_BASE_URL || process.env.NEXT_PUBLIC_SDL_BASE_URL;

const normalizeDepartment = (department) => {
  if (!department) {
    return null;
  }

  const slug = department.slug || '';

  return {
    uid: department.uid ?? '',
    name: department.name ?? '',
    slug,
    description: department.description ?? '',
    value: slug,
    disabled: !slug,
  };
};

const normalizeDepartments = (data = {}) => {
  const departments = Array.isArray(data?.Departments)
    ? data.Departments
    : Array.isArray(data?.departments)
      ? data.departments
      : [];

  return departments.map(normalizeDepartment).filter((department) => department?.name);
};

export const fetchDepartments = async () => {
  const url = `${SDL_BASE_URL}/departments`;

  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      return {
        success: false,
        message: `Failed to fetch departments (${res.status})`,
        data: {
          departments: [],
        },
      };
    }

    const json = await res.json();

    return {
      success: Boolean(json?.success),
      message: json?.message || 'Departments fetched successfully',
      data: {
        departments: normalizeDepartments(json?.data),
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to fetch departments',
      data: {
        departments: [],
      },
    };
  }
};