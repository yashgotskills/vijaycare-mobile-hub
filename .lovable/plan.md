

# Fix Model Selector Dropdown Covering Full Screen

## Problem
The model selector dropdown on the product detail page shows a full-screen-covering list because the Radix Select Viewport has a conflicting height setting. The base `select.tsx` component sets `h-[var(--radix-select-trigger-height)]` on the Viewport in popper mode, which doesn't properly constrain the list height. Combined with 30+ iPhone models, this makes the dropdown enormous.

## Fix

**File: `src/components/ui/select.tsx`** (line 82)
- Change the Viewport class from `h-[var(--radix-select-trigger-height)]` to `max-h-[var(--radix-select-content-available-height)]` so it respects viewport boundaries

**File: `src/pages/ProductDetailPage.tsx`** (line 257)
- Keep `position="popper"` and ensure `max-h-60` is applied, giving a compact 240px max dropdown
- Add `sideOffset={4}` for better spacing

This is a targeted 2-line fix that will make the dropdown scrollable within a bounded area instead of covering the screen.

