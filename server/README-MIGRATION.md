Migration summary: BlogLike index canonicalization

What this change does

- Ensures BlogLike collection indexes match the schema's design:
  - Unique partial index on { blogId: 1, userId: 1 }
  - Unique partial index on { blogId: 1, ipHash: 1 }
  - TTL index on { createdAt: 1 } with partialFilterExpression on ipHash and expireAfterSeconds (BLOGLIKE_TTL_SECONDS, default 90 days)

Scripts

- `server/scripts/migrateBlogLikeIndexes.js`
  - Options:
    - `--dry-run`: show planned actions without making changes
    - `--backup`: attempt to create `backup_<legacyName>` (or timestamped) indexes before destructive changes
    - `--yes` or `-y`: skip interactive confirmation
  - Behavior:
    - Detects existing indexes and will skip creating desired indexes when an equivalent already exists.
    - When a same-name index exists with a different spec, the script will create the desired index with a timestamped name instead of failing.
    - When running with `--backup`, it will attempt to create a backup index named `backup_<legacyName>`, and if that exists, `backup_<legacyName>_<ts>`.

What we ran

1. Dry-run to inspect planned changes:
   - `node server/scripts/migrateBlogLikeIndexes.js --dry-run`
   - Verified existing indexes and planned actions (no changes made).

2. Backup attempt:
   - `node server/scripts/migrateBlogLikeIndexes.js --backup --yes`
   - Backup index creation attempts failed when equivalent indexes already existed under canonical names. The script handled collisions and proceeded.

3. Apply migration:
   - `node server/scripts/migrateBlogLikeIndexes.js --yes`
   - The script dropped the legacy indexes and re-created the desired indexes from the schema. It created some indexes anew and skipped creation when an equivalent index was already present. Final index set was validated.

Safety & recovery notes

- The script uses non-destructive backups when possible. However, when an equivalent index already exists under a canonical name, backups are unnecessary and the script will skip or avoid duplicating an equivalent spec.
- If you want to preserve backups regardless, run the backup script on a copy of the collection (or export index specs manually) and confirm before dropping any indexes.
- To restore an index from a backup index (if present):
  1. Use `db.collection.getIndexes()` in `mongosh` to inspect index specs and names.
  2. Drop the current index: `db.bloglikes.dropIndex('createdAt_1')` (example).
  3. Recreate the index from the backup spec: `db.bloglikes.createIndex({ createdAt: 1 }, { name: 'createdAt_1', expireAfterSeconds: 7776000, partialFilterExpression: {...} })`.

Recommendations

- Monitor TTL expirations and query performance for 24–72 hours following the change to ensure behavior is as expected.
- Remove any leftover timestamped backup indexes only after confirming their specs are redundant. No `backup_` or `prepromote_` prefixed indexes remain in our final run.
- Keep `server/scripts/migrateBlogLikeIndexes.js` in the repo for future controlled migrations and add a short unit/integration test if you plan to reuse it.

Contact

- If anything unexpected appears, revert using the index recreation steps above and contact the person who ran the migration for assistance.
