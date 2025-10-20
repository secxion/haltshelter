Backfill adoption dates

This script finds Animal documents with `status: 'Adopted'` and no `adoptionDate` and sets an adoptionDate using `updatedAt` or `createdAt` as a best-effort value. It also sets `isRecentlyAdopted: true` for updated records.

Usage:

- Dry-run (no writes):
  node server/scripts/backfillAdoptionDates.js --dry-run
  or
  npm run backfill:dry

- Apply backfill (writes to DB):
  node server/scripts/backfillAdoptionDates.js
  or
  npm run backfill

Safety:
- Run a DB backup or test in staging first.
- The script only updates records matching { status: 'Adopted', adoptionDate: { $exists: false } }.
- Dry-run prints the intended updates without modifying data.
