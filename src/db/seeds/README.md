# Database Seeds

This directory contains seed data for populating the database with test data.

## Quick Start

```bash
# Run seeds
npm run db:seed

# Run migrations and seeds
npm run db:setup
```

## Available Seed Files

### 1. `comprehensiveJobSeeds.ts` ⭐ (RECOMMENDED)
**48 job roles** covering all edge cases and test scenarios.

**Use this for:**
- Development and testing
- QA testing
- Comprehensive feature validation
- Edge case testing
- Performance testing with realistic data

**Coverage:**
- ✅ All bands: Junior, Mid, Senior, Principal
- ✅ All capabilities: Engineering, Data, Workday
- ✅ All statuses: Open, Closed, Draft
- ✅ Date ranges: Past, present, and future
- ✅ Position counts: 0-20 positions
- ✅ 15+ unique locations across UK
- ✅ Special characters and formatting
- ✅ Various work arrangements (remote, hybrid, part-time)

### 2. `jobRolesSeeds.ts` (LEGACY)
**10 job roles** with basic coverage.

**Use this for:**
- Quick smoke tests
- Minimal data scenarios
- Learning the schema

## Current Active Seeds

The `runSeeds.ts` script currently uses **`comprehensiveJobSeeds`** by default.

To switch to legacy seeds, edit `src/db/seeds/runSeeds.ts`:

```typescript
// Current (comprehensive)
await db.insert(jobRolesTable).values(comprehensiveJobSeeds);

// To use legacy seeds instead
await db.insert(jobRolesTable).values(jobRolesSeeds);
```

## Documentation

See [`SEED_DATA_DOCUMENTATION.md`](./SEED_DATA_DOCUMENTATION.md) for:
- Detailed edge case coverage
- Test scenario examples
- Data integrity guidelines
- Maintenance instructions
- Query examples

## Creating New Seeds

1. Create a new file: `src/db/seeds/yourSeedName.ts`
2. Follow this pattern:

```typescript
import type { jobsTable } from "../schemas/jobs";

export const yourSeedData: (typeof jobsTable.$inferInsert)[] = [
  {
    jobRoleName: "Example Role",
    description: "Description here",
    responsibilities: "Comma separated responsibilities",
    jobSpecLink: "https://company.com/careers/example-role",
    location: "London, UK",
    capability: "Engineering", // Must be: Engineering, Data, or Workday
    band: "Mid", // Must be: Junior, Mid, Senior, or Principal
    closingDate: "2025-12-31", // ISO format: YYYY-MM-DD
    status: "Open", // Must be: Open, Closed, or Draft
    numberOfOpenPositions: 1, // Number >= 0
  },
];
```

3. Export from `index.ts`:
```typescript
export * from "./yourSeedName";
```

4. Update `runSeeds.ts` to use your seeds
5. Run linter: `npm run lint`
6. Run formatter: `npm run format`
7. Test: `npm run db:seed`

## Important Notes

⚠️ **Running seeds clears all existing job data**
- The seed script deletes all existing records before inserting
- Make sure you have backups if running on production data
- Consider commenting out the delete line in `runSeeds.ts` if you want to append

✅ **Data Validation**
- All seed data is validated against the schema
- Invalid data will cause the seed script to fail
- Check console output for specific error messages

🔄 **Idempotency**
- Seeds can be run multiple times safely
- Each run clears and re-inserts all data
- No duplicate records will be created

## Files in This Directory

```
seeds/
├── README.md                      # This file - quick reference
├── SEED_DATA_DOCUMENTATION.md     # Detailed documentation
├── comprehensiveJobSeeds.ts       # 48 comprehensive job roles ⭐
├── jobRolesSeeds.ts              # 10 legacy job roles
├── index.ts                       # Exports all seeds
└── runSeeds.ts                    # Seed runner script
```

## Troubleshooting

### Seed script fails
```bash
# Check for schema changes
npm run db:generate

# Run migrations
npm run db:migrate

# Try seeding again
npm run db:seed
```

### Linter errors
```bash
# Auto-fix linting issues
npm run lint:fix

# Auto-fix formatting
npm run format
```

### Type errors
```bash
# Check TypeScript compilation
npm run type-check
```

## Related Commands

```bash
# Database operations
npm run db:generate    # Generate migrations from schema changes
npm run db:migrate     # Run pending migrations
npm run db:seed        # Run seed data
npm run db:setup       # Migrate + seed

# Code quality
npm run lint           # Check linting
npm run lint:fix       # Fix linting issues
npm run format         # Format code
npm run check          # Lint + format check
npm run check:fix      # Fix both

# Development
npm run dev            # Start dev server with seeds loaded
npm run test           # Run tests with seed data
```