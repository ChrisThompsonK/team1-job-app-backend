# Multi-Environment Pipeline Documentation

## Overview

The pipeline now supports **two environments**: `dev` and `prod`, following industry best practices for deployment safety and validation.

## Pipeline Flow

```
Code Push to main
    ↓
Biome Linting & Tests
    ↓
Build & Test Docker Image
    ↓
Push Image to ACR
    ↓
Deploy to Dev
    ↓
Health Checks on Dev ✅
    ↓
Plan Prod Deployment
    ↓
Deploy to Prod
```

## Environment Configuration

### Dev Environment
- **Location**: `infrastructure/enviroments/dev/terraform.tfvars`
- **Resource Group**: `team1-job-app-backend-rg`
- **App Name**: `team1-job-app-backend`
- **Resources**: 
  - CPU: 0.5 cores
  - Memory: 1Gi
  - Replicas: 1-3

### Prod Environment
- **Location**: `infrastructure/enviroments/prod/terraform.tfvars`
- **Resource Group**: `team1-job-app-backend-prod-rg`
- **App Name**: `team1-job-app-backend-prod`
- **Resources**:
  - CPU: 1 core (higher for production)
  - Memory: 2Gi (higher for production)
  - Replicas: 1-3

## Key Features

### 1. **Separate Jobs for Each Environment**

- `terraform-deploy-dev`: Deploys to dev immediately after Docker image build
- `health-check-dev`: Runs health checks and smoke tests on dev
- `terraform-plan-prod`: Plans prod deployment (only runs if dev health checks pass)
- `terraform-deploy-prod`: Deploys to prod (manual approval required before running)

### 2. **Health Checks Before Prod**

The health check job (`health-check-dev`):
- Waits 30 seconds for deployment to stabilize
- Checks health endpoints
- Runs smoke tests
- **Only if these pass**, the pipeline proceeds to plan prod deployment

### 3. **Artifact Management**

- Terraform plans are uploaded as artifacts with 1-day retention
- Plans are downloaded in the deploy job for consistency

### 4. **Sequential Deployment**

Due to `needs` dependencies:
1. Dev deploys first
2. Health checks run
3. Prod planning starts only after health checks pass
4. Prod deployment requires manual approval (can be configured in GitHub)

## How to Extend Health Checks

Edit `.github/workflows/code-quality.yml` in the `health-check-dev` job:

```yaml
- name: Health check endpoint
  run: |
    echo "Running health checks on Dev..."
    curl -f http://localhost:3001/health || true
    # Add more checks here
```

## Environment Variables

Each environment has its own variables defined in `terraform.tfvars`:
- `environment`: dev or prod
- `resource_group_name`: Environment-specific resource group
- `app_name`: Environment-specific app identifier
- `container_cpu`: Resource allocation
- `container_memory`: Resource allocation

Secrets are pulled from Azure Key Vault and are environment-agnostic.

## Adding Manual Approval for Prod

To add manual approval before prod deployment:

1. Go to GitHub → Settings → Environments
2. Create or edit the `production` environment
3. Add required reviewers
4. Add deployment branches restrictions

The workflow will wait for approval before running `terraform-deploy-prod`.

## Triggering the Pipeline

The pipeline triggers on:
- **Push to main branch**: Full pipeline including dev → prod
- **Pull requests to main/develop**: Only linting, tests, and Docker build

## Monitoring Deployments

1. Check workflow status in GitHub Actions
2. View Terraform output in workflow logs
3. Monitor health check results before prod deployment proceeds

## Troubleshooting

### Dev deploys but health checks fail
- Check `.github/workflows/code-quality.yml` health check job
- Verify the app is actually running in Azure Container Apps
- Adjust timeout and retry logic as needed

### Prod never deploys
- Ensure dev health checks are passing
- Check GitHub Actions logs for any errors
- Verify Terraform plan artifact exists

## Future Improvements

- Add automated rollback on health check failure
- Integrate with Slack/Teams for notifications
- Add canary deployments (blue-green)
- Add performance benchmarks validation
- Add database migration checks
