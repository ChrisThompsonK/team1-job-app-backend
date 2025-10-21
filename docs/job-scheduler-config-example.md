````markdown
# Job Scheduler Configuration Example

## Overview

The job scheduler now uses **cron expressions** instead of intervals for better control over when jobs run. This provides predictable timing rather than running X minutes after startup.

## Configuration

### Environment Variable
```bash
# Set cron expression (default: "0 1 * * *" = daily at 1:00 AM UTC)
JOB_SCHEDULER_CRON_EXPRESSION="0 1 * * *"
```

### Common Examples
```bash
# Daily at 2:30 AM
JOB_SCHEDULER_CRON_EXPRESSION="30 2 * * *"

# Every 6 hours (at 00:00, 06:00, 12:00, 18:00)
JOB_SCHEDULER_CRON_EXPRESSION="0 */6 * * *"

# Every Monday at 9:00 AM
JOB_SCHEDULER_CRON_EXPRESSION="0 9 * * 1"

# First day of every month at 2:00 AM
JOB_SCHEDULER_CRON_EXPRESSION="0 2 1 * *"

# Twice daily (8:00 AM and 8:00 PM)
JOB_SCHEDULER_CRON_EXPRESSION="0 8,20 * * *"
```

## Cron Expression Format

```
* * * * *
│ │ │ │ │
│ │ │ │ └── Day of week (0-6, Sunday=0)
│ │ │ └──── Month (1-12)
│ │ └────── Day of month (1-31)
│ └──────── Hour (0-23)
└────────── Minute (0-59)
```

## Usage in Code

### Import the configuration
```typescript
import { env, getJobSchedulerCronExpression } from '../config/env.js';
```

### Access the cron expression
```typescript
const cronExpression = env.jobSchedulerCronExpression;
console.log(`Job scheduler will run with cron: ${cronExpression}`);
```

### Use with node-cron
```typescript
import * as cron from 'node-cron';
import { getJobSchedulerCronExpression } from '../config/env.js';

const task = cron.schedule(getJobSchedulerCronExpression(), () => {
  // Run scheduled job
}, {
  timezone: 'UTC'
});
```

## Benefits

1. **Predictable Timing**: Jobs run at specific times rather than X minutes after startup
2. **Better Resource Management**: Avoid running during peak hours by scheduling during off-peak times
3. **Maintenance Windows**: Schedule jobs during planned maintenance or low-traffic periods
4. **Timezone Consistency**: All jobs run in UTC for consistent behavior across deployments
5. **Flexibility**: Support for complex schedules (multiple times per day, specific days, etc.)
6. **Industry Standard**: Cron expressions are widely understood and supported

## Migration from Intervals

If migrating from the old interval-based system:

**Old (intervals):**
```bash
JOB_SCHEDULER_INTERVAL_MINUTES=1440  # 24 hours
```

**New (cron):**
```bash
JOB_SCHEDULER_CRON_EXPRESSION="0 1 * * *"  # Daily at 1:00 AM
```

## Validation

The application validates cron expressions on startup. Common validation errors:
- Wrong number of parts (must be 5)
- Invalid values for each field
- Malformed expressions

Use [crontab.guru](https://crontab.guru/) to validate and test your cron expressions.
````