# Firebase Timestamp Conversion Fix

## Issue
Runtime error: `TypeError: product.restockDate.getTime is not a function`

## Root Cause
Firebase Firestore returns `Timestamp` objects when fetching documents, but our code expected JavaScript `Date` objects with the `.getTime()` method. The error occurred when trying to calculate time differences for badge displays and product availability checks.

## Solution
Implemented comprehensive timestamp conversion across all product fetch locations in the application.

### 1. Created Universal Date Converter (`lib/productUtils.ts`)
```typescript
function toDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === 'function') return value.toDate();
  if (typeof value === 'number') return new Date(value);
  if (typeof value === 'string') return new Date(value);
  return null;
}
```

This helper function handles:
- JavaScript Date objects (returns as-is)
- Firebase Timestamp objects (calls `.toDate()`)
- Unix timestamps (numbers)
- ISO date strings
- Null/undefined values

### 2. Updated Product Utility Functions (`lib/productUtils.ts`)
- **`getProductBadge()`**: Converts `availableDate` and `restockDate` using `toDate()` helper
- **`isProductAvailable()`**: Converts `availableDate` using `toDate()` helper

### 3. Updated All Product Fetch Locations
Added timestamp conversions in the mapping logic for all locations that fetch products from Firebase:

#### Product Detail Page (`app/product/[id]/page.tsx`)
```typescript
availableDate: docSnap.data().availableDate?.toDate(),
restockDate: docSnap.data().restockDate?.toDate(),
```

#### Sections Helper (`lib/sections.ts`)
- `getProductsBySection()`: Added timestamp conversions
- `getAllProducts()`: Added timestamp conversions

#### useProducts Hook (`hooks/useProducts.ts`)
```typescript
availableDate: doc.data().availableDate?.toDate(),
restockDate: doc.data().restockDate?.toDate(),
```

#### RelatedProducts Component (`components/RelatedProducts.tsx`)
- Section query mapping: Added timestamp conversions
- Category query mapping: Added timestamp conversions

#### Category Page (`app/category/[slug]/page.tsx`)
```typescript
availableDate: doc.data().availableDate?.toDate(),
restockDate: doc.data().restockDate?.toDate(),
```

#### ComingSoonSection (`components/sections/ComingSoonSection.tsx`)
Already had proper timestamp conversions ✓

## Files Modified
1. `lib/productUtils.ts` - Added `toDate()` helper, updated utility functions
2. `app/product/[id]/page.tsx` - Added timestamp conversions in fetch
3. `lib/sections.ts` - Added conversions in both functions
4. `hooks/useProducts.ts` - Added conversions in product mapping
5. `components/RelatedProducts.tsx` - Added conversions in both queries
6. `app/category/[slug]/page.tsx` - Added conversions in product mapping

## Verification
- ✅ Build completed successfully with no errors
- ✅ All TypeScript types validated
- ✅ Pattern consistently applied across all fetch locations
- ✅ Timestamp fields handled: `createdAt`, `updatedAt`, `availableDate`, `restockDate`

## Pattern for Future Development
When fetching products from Firebase, always include timestamp conversions:

```typescript
const products = snapshot.docs.map((doc) => ({
  id: doc.id,
  ...doc.data(),
  createdAt: doc.data().createdAt?.toDate(),
  updatedAt: doc.data().updatedAt?.toDate(),
  availableDate: doc.data().availableDate?.toDate(),
  restockDate: doc.data().restockDate?.toDate(),
})) as Product[];
```

For utility functions that work with product dates, use the `toDate()` helper:
```typescript
import { toDate } from '@/lib/productUtils';

const availableDate = toDate(product.availableDate);
if (availableDate) {
  // Safe to use .getTime() now
  const timestamp = availableDate.getTime();
}
```
