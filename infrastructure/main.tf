# Resource Group
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location

  tags = {
    Environment = var.environment
    Application = var.app_name
    ManagedBy   = "Terraform"
  }
}

# Data Source: Existing Azure Container Registry
data "azurerm_container_registry" "acr" {
  name                = var.acr_name
  resource_group_name = var.acr_resource_group_name
}

# Data Source: Existing Key Vault
data "azurerm_key_vault" "kv" {
  name                = var.key_vault_name
  resource_group_name = var.key_vault_resource_group_name
}

# Data Source: Existing Container App Environment (from shared resources repo)
data "azurerm_container_app_environment" "platform_env" {
  name                = var.container_app_environment_name
  resource_group_name = var.container_app_environment_resource_group_name
}

# User-Assigned Managed Identity for Container App
resource "azurerm_user_assigned_identity" "container_identity" {
  name                = var.app_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location

  tags = {
    Environment = var.environment
    Application = var.app_name
  }
}

# Role Assignment: Grant AcrPull to Managed Identity
resource "azurerm_role_assignment" "acr_pull" {
  scope                = data.azurerm_container_registry.acr.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_user_assigned_identity.container_identity.principal_id
}

# Role Assignment: Grant Key Vault Secrets User to Managed Identity
resource "azurerm_role_assignment" "kv_secrets_user" {
  scope                = data.azurerm_key_vault.kv.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_user_assigned_identity.container_identity.principal_id
}

# Container App for Backend
resource "azurerm_container_app" "backend" {
  name                         = "${var.app_name}-app"
  container_app_environment_id = data.azurerm_container_app_environment.platform_env.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.container_identity.id]
  }

  registry {
    server   = data.azurerm_container_registry.acr.login_server
    identity = azurerm_user_assigned_identity.container_identity.id
  }

  template {
    container {
      name   = var.app_name
      image  = "${data.azurerm_container_registry.acr.login_server}/${var.app_name}:${var.container_image_tag}"
      cpu    = var.container_cpu
      memory = var.container_memory

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "PORT"
        value = tostring(var.container_port)
      }

      env {
        name  = "BETTER_AUTH_URL"
        value = var.better_auth_url
      }

      env {
        name        = "BETTER_AUTH_SECRET"
        secret_name = "better-auth-secret"
      }

      env {
        name        = "DATABASE_URL"
        secret_name = "database-url"
      }

      env {
        name        = "GEMINI_API_KEY"
        secret_name = "gemini-api-key"
      }
    }

    min_replicas = 1
    max_replicas = 3
  }

  secret {
    name                = "better-auth-secret"
    key_vault_secret_id = "${data.azurerm_key_vault.kv.vault_uri}secrets/better-auth-secret"
    identity            = azurerm_user_assigned_identity.container_identity.id
  }

  secret {
    name                = "database-url"
    key_vault_secret_id = "${data.azurerm_key_vault.kv.vault_uri}secrets/database-url"
    identity            = azurerm_user_assigned_identity.container_identity.id
  }

  secret {
    name                = "gemini-api-key"
    key_vault_secret_id = "${data.azurerm_key_vault.kv.vault_uri}secrets/gemini-api-key"
    identity            = azurerm_user_assigned_identity.container_identity.id
  }

  ingress {
    allow_insecure_connections = false
    external_enabled           = false
    target_port                = var.container_port
    transport                  = "https"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  tags = {
    Environment = var.environment
    Application = var.app_name
    ManagedBy   = "Terraform"
  }

  depends_on = [
    azurerm_role_assignment.acr_pull,
    azurerm_role_assignment.kv_secrets_user
  ]
}
