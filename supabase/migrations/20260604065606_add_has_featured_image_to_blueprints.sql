/*
  # Add has_featured_image to blueprints

  Adds a boolean flag to distinguish blueprints where a human has deliberately
  uploaded a real screenshot from those showing only the default wireframe placeholder.

  1. Changes
    - `blueprints`: new column `has_featured_image` (boolean, default false)

  2. Data backfill
    - Set true for all blueprints that have a screenshot_url, EXCEPT the one known
      to have the wireframe placeholder uploaded (New York, id = edf479dc-...)

  3. Notes
    - The sort in the gallery will use this flag instead of `screenshot_url IS NOT NULL`
      so only intentionally uploaded images cause a blueprint to rank higher.
*/

ALTER TABLE blueprints
  ADD COLUMN IF NOT EXISTS has_featured_image boolean NOT NULL DEFAULT false;

UPDATE blueprints
SET has_featured_image = true
WHERE screenshot_url IS NOT NULL
  AND id != 'edf479dc-81f5-40b3-87ec-9cfc5f35e237';
