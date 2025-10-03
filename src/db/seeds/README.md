# Database Seeds

This directory contains seed data for populating the database with initial or test data.

## Files

- `jobRolesSeeds.ts` - Contains seed data for the Job_Roles table
- `runSeeds.ts` - Script to execute all seed operations
- `index.ts` - Exports all seed modules

## Usage

### First time setup (migrate + seed)

```bash
npm run db:setup
```

### Run migrations only

```bash
npm run db:migrate
```

### Run seeds only

```bash
npm run db:seed
```

### Generate new migrations

```bash
npm run db:generate
```

### Import seeds in your code

```typescript
import { jobRolesSeeds, runSeeds } from "./src/db/seeds";

// Use seed data
console.log(jobRolesSeeds);

// Run seeds programmatically
await runSeeds();
```

## Seed Data

### Job Roles
The job roles seed includes 10 sample positions with:
- Various job titles (Senior Software Engineer, Product Manager, etc.)
- Different capability areas (Engineering, Product, Data & Analytics, etc.)
- Multiple band levels (Junior, Mid, Senior, Principal)
- Different locations across the UK
- Mixed open/closed status
- Realistic job descriptions and responsibilities

## Adding New Seeds

1. Create a new seed file (e.g., `userSeeds.ts`)
2. Define your seed data array
3. Export the data from the file
4. Import and add the seeds to `runSeeds.ts`
5. Update the `index.ts` file to export your new seeds

## Notes

- The seed runner clears existing data before inserting new data
- All seeds use the same database connection configured in `drizzle.config.ts`
- Seeds are designed to be idempotent (can be run multiple times safely)