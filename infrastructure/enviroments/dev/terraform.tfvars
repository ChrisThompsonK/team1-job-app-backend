# General Configuration
location            = "uksouth"
environment         = "dev"
resource_group_name = "team1-job-app-backend-rg"

# Container Registry Configuration
acr_name                = "aiacademy25"
acr_resource_group_name = "container-registry"

# Key Vault Configuration
key_vault_name                = "team1-job-app-keyvault"
key_vault_resource_group_name = "team1-job-app-shared-rg"

# Container App Environment Configuration
container_app_environment_name                = "team1-job-app-container-app-environment"
container_app_environment_resource_group_name = "team1-job-app-shared-rg"

# Container App Configuration
container_image_tag = "v1.0.1"
container_cpu       = "0.5"
container_memory    = "1Gi"
container_port      = 3001

# Application Configuration
app_name        = "team1-job-app-backend"
better_auth_url = "http://team1-job-app-backend.team1-job-app-backend-env.internal:3001"
