

# Device Models Feature

## What This Does
Admin can create device models (e.g., "iPhone 15 Pro Max", "Samsung Galaxy S24") from the admin panel. On every category page (Phone Cases, Screen Guards, Chargers, etc.), users see a "Models" filter button. Clicking it shows all models; selecting a model filters products to show only those assigned to that model. Admin can assign existing products to models from the admin panel.

## Database Changes

**New table: `device_models`**
- `id` (uuid, PK)
- `name` (text, e.g., "iPhone 15 Pro Max")
- `slug` (text, unique)
- `brand_id` (uuid, nullable, FK to brands)
- `image` (text, nullable - model image/logo)
- `created_at`, `updated_at`
- RLS: SELECT for everyone, admin RPCs for insert/update/delete

**New table: `product_models`** (junction table)
- `id` (uuid, PK)
- `product_id` (uuid, FK to products)
- `model_id` (uuid, FK to device_models)
- unique constraint on (product_id, model_id)
- RLS: SELECT for everyone, admin RPCs for insert/delete

**New RPC functions:**
- `admin_insert_model`, `admin_update_model`, `admin_delete_model`
- `admin_assign_product_to_model`, `admin_unassign_product_from_model`

## Admin Panel Changes

**New "Models" tab in AdminPage** (7th tab):
- List all device models in a table (name, brand, product count)
- "Create Model" button opens a form (name, slug auto-generated, brand dropdown, image)
- Edit/delete models
- Each model row expands or has a "Manage Products" button that opens a dialog showing:
  - Currently assigned products (with remove button)
  - Full product library searchable list with "Add" button to assign products to the model

## Category Page Changes

**Model filter on CategoryPage:**
- Add a horizontal scrollable row of model buttons/chips below the header (before the product grid)
- Fetch all models that have at least one product in the current category
- When user clicks a model chip, filter products to only show those assigned to that model
- Active model shown as selected chip with clear option

## Files to Create/Modify

| File | Action |
|------|--------|
| Migration SQL | Create `device_models` + `product_models` tables + RPC functions |
| `src/components/admin/ModelsTab.tsx` | New - admin models management with product assignment |
| `src/pages/AdminPage.tsx` | Add Models tab (7th tab) |
| `src/hooks/useProducts.ts` | Add `useDeviceModels` and `useProductModels` hooks |
| `src/pages/CategoryPage.tsx` | Add model filter chips row |
| `src/types/product.ts` | Add `DeviceModel` interface |

## User Flow

```text
ADMIN:
  Admin Panel → Models Tab → Create Model (e.g. "iPhone 15 Pro")
  → Manage Products → Search & assign existing products to model

USER:
  Category Page (e.g. Phone Cases) 
  → See model chips: [All] [iPhone 15 Pro] [Samsung S24] ...
  → Click "iPhone 15 Pro" 
  → Only phone cases for iPhone 15 Pro shown
```

