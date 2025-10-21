# Job Scheduler Cron Configuration

The job scheduler now uses cron expressions instead of intervals for better control over when job status updates occur.

## Environment Variable

Set the `JOB_SCHEDULER_CRON_EXPRESSION` environment variable to control when the job scheduler runs.

**Default:** `"0 1 * * *"` (runs daily at 1:00 AM UTC)

## Cron Expression Format

Cron expressions consist of 5 fields separated by spaces:

```
* * * * *
│ │ │ │ │
│ │ │ │ └── Day of week (0-6, Sunday=0)
│ │ │ └──── Month (1-12)
│ │ └────── Day of month (1-31)
│ └──────── Hour (0-23)
└────────── Minute (0-59)
```

## Common Examples

### Daily Schedules
- `"0 1 * * *"` - Every day at 1:00 AM
- `"30 2 * * *"` - Every day at 2:30 AM
- `"0 9 * * *"` - Every day at 9:00 AM
- `"0 18 * * *"` - Every day at 6:00 PM

### Weekly Schedules
- `"0 1 * * 0"` - Every Sunday at 1:00 AM
- `"0 9 * * 1"` - Every Monday at 9:00 AM
- `"30 23 * * 5"` - Every Friday at 11:30 PM

### Multiple Times Per Day
- `"0 */6 * * *"` - Every 6 hours (at 00:00, 06:00, 12:00, 18:00)
- `"0 8,20 * * *"` - Twice daily at 8:00 AM and 8:00 PM
- `"0 */4 * * *"` - Every 4 hours

### Monthly Schedules
- `"0 1 1 * *"` - First day of every month at 1:00 AM
- `"0 9 15 * *"` - 15th day of every month at 9:00 AM

## Advantages Over Intervals

1. **Predictable Timing:** Jobs run at specific times rather than X minutes after startup
2. **Better Resource Management:** Avoid running during peak hours
3. **Maintenance Windows:** Schedule during low-traffic periods
4. **Timezone Awareness:** Scheduler runs in UTC for consistency

## Setting the Environment Variable

### Development (.env file)
```env
JOB_SCHEDULER_CRON_EXPRESSION="0 1 * * *"
```

### Production
Set the environment variable based on your deployment platform:

**Docker:**
```bash
docker run -e JOB_SCHEDULER_CRON_EXPRESSION="0 2 * * *" your-app
```

**Kubernetes:**
```yaml
env:
  - name: JOB_SCHEDULER_CRON_EXPRESSION
    value: "0 2 * * *"
```

**systemd:**
```ini
Environment=JOB_SCHEDULER_CRON_EXPRESSION="0 2 * * *"
```

## Validation

The application validates cron expressions on startup and will fail to start with an invalid expression. Make sure to test your cron expression before deploying.

## Online Tools

- [Crontab.guru](https://crontab.guru/) - Interactive cron expression builder and validator
- [Cron Expression Generator](https://www.freeformatter.com/cron-expression-generator-quartz.html)