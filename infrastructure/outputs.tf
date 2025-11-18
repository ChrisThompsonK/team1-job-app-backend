# Resource Group
output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "resource_group_location" {
  description = "Location of the resource group"
  value       = azurerm_resource_group.main.location
}

# Container App
output "container_app_id" {
  description = "ID of the backend Container App"
  value       = azurerm_container_app.backend.id
}

output "container_app_latest_revision_fqdn" {
  description = "Latest revision FQDN of the Container App"
  value       = azurerm_container_app.backend.latest_revision_fqdn
}

output "container_app_latest_revision_name" {
  description = "Latest revision name of the Container App"
  value       = azurerm_container_app.backend.latest_revision_name
}

# Managed Identity
output "managed_identity_id" {
  description = "ID of the managed identity"
  value       = azurerm_user_assigned_identity.container_identity.id
}

output "managed_identity_principal_id" {
  description = "Principal ID of the managed identity"
  value       = azurerm_user_assigned_identity.container_identity.principal_id
}

output "managed_identity_client_id" {
  description = "Client ID of the managed identity"
  value       = azurerm_user_assigned_identity.container_identity.client_id
}

# Container Registry
output "acr_login_server" {
  description = "Login server of the Azure Container Registry"
  value       = data.azurerm_container_registry.acr.login_server
}

# Key Vault
output "key_vault_uri" {
  description = "URI of the Key Vault"
  value       = data.azurerm_key_vault.kv.vault_uri
}
