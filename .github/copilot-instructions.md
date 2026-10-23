# SDL India - AI Coding Agent Instructions

## Project Overview
Next.js 15 e-commerce application for SDL India (Ayurvedic products). Multi-tenant system with Customer and Doctor user roles, each with distinct UI themes.

## Critical Architecture Patterns

### 1. Provider Hierarchy (Must Follow Order)
**Location:** `src/layout/index.jsx`
```
ReactQueryProvider → ThemeOptionProvider → GoogleMapsProvider → UserProvider → 
ThemeProvider → AccountProvider → [Other Providers]
```
- **UserProvider must load before ThemeProvider** - Theme depends on user role
- **ReactQueryProvider wraps all** - Required for SSR hydration
- 15+ nested Context providers manage global state

### 2. Dual-Theme System
**Docs:** `THEME_SYSTEM_GUIDE.md`
- Customer theme: Green (#0da487)
- Doctor theme: Blue (#2563eb)
- Theme switches automatically on login based on `isDoctor` field
- **ALWAYS use CSS variables** like `var(--theme-color)`, never hardcoded colors
- Theme class applied to `<html>` element: `.theme-customer` or `.theme-doctor`

### 3. React Query + SSR Pattern
**Docs:** `REACT_QUERY_SSR_GUIDE.md`

**Server Component (page.js):**
```javascript
import { getQueryClient } from '@/utils/getQueryClient';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

export default async function Page() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['data', params],
    queryFn: () => fetchData(params),
  });
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientComponent />
    </HydrationBoundary>
  );
}
```

**Client Component:**
```javascript
'use client';
const { data } = useQuery({
  queryKey: ['data', params], // MUST match server queryKey
  queryFn: () => fetchData(params),
});
```

### 4. API Layer Structure
**Pattern:** `src/api/[resource].api.js` + `src/utils/hooks/use[Resource].js`

**API File:**
- Export async functions: `fetchHerbs()`, `fetchHerbDetail()`, etc.
- Return standardized format: `{ success: boolean, message: string, data: {...} }`
- Include pagination: `{ data: { items: [], pagination: { page, total, ... } } }`

**Hook File:**
```javascript
export const useHerbs = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['herbs', params],
    queryFn: () => fetchHerbs(params),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...options,
  });
};
```

### 5. Routing & Layouts
- **Main Layout:** `src/app/(mainLayout)/` - Contains header/footer
- **Theme Routes:** `src/app/(mainLayout)/theme/[theme]/page.jsx` - Dynamic themes (paris, tokyo, etc.)
- **Default Route:** Rewrites `/` → `/theme/paris` in `next.config.mjs`
- **Dynamic Routes:** Use Next.js 15 App Router conventions

### 6. Component Patterns

**Reusable Components:** `src/components/common/`
- `CommonSearchBar` - Fuzzy search with suggestions, recent searches in localStorage
- `CustomDropdown` - Fully styled dropdown (no browser defaults)
- `Pagination` - Standard pagination component
- `CustomModal`, `ConfirmationModal`, `SuccessModal` - Modal variants

**Feature Components:** `src/components/[feature]/`
- Organized by domain: `herbs/`, `events/`, `stores/`, `productDetails/`, etc.

**Client Components:**
- Always add `'use client'` directive at top
- Wrap third-party libraries (Slider, Maps) with dynamic imports

### 7. Styling Conventions

**Global Styles:** `public/assets/scss/`
```
app.scss (main entry)
├── base/ (reset, typography)
├── components/ (buttons, modals, forms)
├── layout/ (header, footer, nav)
├── pages/ (page-specific styles)
├── themes/ (theme-variables, dark mode)
└── utils/ (variables, mixins, breakpoints)
```

**CSS Modules:** `[Component].module.scss`
- Use for component-scoped styles
- Import with: `import styles from './Component.module.scss'`
- Apply with: `className={styles['class-name']}`

**Theme Variables (Always Use):**
```scss
// ✅ CORRECT
.button { 
  background: var(--theme-color);
  color: var(--btn-primary-text);
}

// ❌ WRONG
.button { background: #0da487; }
```

**Responsive Breakpoints:**
```scss
@use '../utils/mixin/breakpoints';
@include breakpoints.mq-max(lg) { ... } // max-width
@include breakpoints.mq-min(md) { ... } // min-width
```

### 8. State Management Patterns

**Global State:** Context Providers
- User auth: `useUser()` from `src/utils/hooks/useUser.js`
- Cart: `CartProvider` → `useCart()`
- Wishlist: `WishlistProvider` → `useWishlist()`
- Theme: `ThemeProvider` → `useTheme()`

**Server State:** React Query
- All API data managed via React Query hooks
- Cache invalidation via `queryClient.invalidateQueries()`
- Mutations follow pattern: `useMutation({ onSuccess: () => refetch() })`

**Local State:** useState, useRef for component-specific state

### 9. Google Maps Integration
**Provider:** `GoogleMapsProvider` loads Maps API with key from `NEXT_PUBLIC_MAPS_API_KEY`
- Status hook: `useGoogleMapsStatus()` returns `MapsStatus.READY|LOADING|FAILED`
- Store Finder: `src/components/stores/StoreMap.jsx` - Custom marker implementation
- Clinic Finder: Similar pattern
- **Never use Leaflet** - Project migrated to Google Maps

### 10. Authentication Flow
**Docs:** `USER_PROVIDER_GUIDE.md`
1. User logs in via OTP (phone number)
2. JWT token stored in `sessionStorage` with key `userToken`
3. `UserProvider` auto-fetches profile from `/api/getauthcustomer`
4. Theme switches based on `isDoctor` field in user data
5. Protected routes check `isAuthenticated` from `useUser()`

### 11. Form Handling
- **Formik** for complex forms with validation
- **react-hook-form** for simpler forms
- **Yup/Zod** for schema validation
- Error handling via `react-toastify`

## Development Commands
```bash
npm run dev        # Development server (port 3000)
npm run build      # Production build
npm run start      # Production server
npm run lint       # ESLint
npm run format     # Prettier
```

## File Naming Conventions
- Components: PascalCase - `CommonSearchBar.jsx`, `StoreList.jsx`
- API files: kebab-case - `herbs.api.js`, `events.api.js`
- Hooks: camelCase - `useHerbs.js`, `useUser.js`
- CSS Modules: PascalCase - `Component.module.scss`
- Pages: lowercase - `page.jsx`, `layout.js`

## Import Aliases
- `@/` → `src/` (configured in `jsconfig.json`)
- Example: `import { useUser } from '@/utils/hooks/useUser'`

## Common Pitfalls
1. **Don't hardcode colors** - Always use CSS variables
2. **Match queryKey exactly** between server prefetch and client useQuery
3. **UserProvider before ThemeProvider** in provider hierarchy
4. **'use client' required** for hooks, events, browser APIs
5. **Dynamic imports for maps/sliders** to avoid SSR issues
6. **Token in sessionStorage** not localStorage (key: `userToken`)
7. **Theme cookie persistence** - Set on login, read by ThemeProvider

## Key Files to Reference
- Theme system: `src/providers/ThemeProvider.jsx`
- User auth: `src/helper/userContext/UserProvider.jsx`
- API patterns: `src/api/herbs.api.js`, `src/utils/hooks/useHerbs.js`
- Search component: `src/components/common/CommonSearchBar.jsx`
- Layout structure: `src/layout/index.jsx`
- Style entry: `public/assets/scss/app.scss`

## Additional Documentation
- `REACT_QUERY_SSR_GUIDE.md` - Server-side data fetching
- `USER_PROVIDER_GUIDE.md` - Authentication & session management  
- `THEME_SYSTEM_GUIDE.md` - Theme switching & CSS variables
- `RETURN_ORDER_FILE_UPLOAD_GUIDE.md` - File upload patterns
