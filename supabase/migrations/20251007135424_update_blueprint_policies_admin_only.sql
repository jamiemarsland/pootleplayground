/*
  # Update Blueprint Policies - Admin Only Deletion

  1. Changes
    - Drop the existing "Anyone can delete blueprints" policy
    - Since we don't have auth implemented yet, we'll remove the delete policy entirely
    - Deletion will be handled through the application layer with admin password check
    
  2. Security
    - No direct database deletion access
    - Admin verification required at application level before deletion
*/

-- Drop the existing open delete policy
DROP POLICY IF EXISTS "Anyone can delete blueprints" ON blueprints;

-- No new delete policy - deletions will be controlled by application logic