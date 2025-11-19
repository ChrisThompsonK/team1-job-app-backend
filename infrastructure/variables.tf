# General Configuration
variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "uksouth"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
  default     = "team1-job-app-backend-rg"
}

# Container Registry Configuration
variable "acr_name" {
  description = "Name of the existing Azure Container Registry"
  type        = string
  default     = "aiacademy25"
}

variable "acr_resource_group_name" {
  description = "Resource group containing the ACR"
  type        = string
  default     = "container-registry"
}

# Key Vault Configuration
variable "key_vault_name" {
  description = "Name of the existing Key Vault"
  type        = string
  default     = "team1-job-app-keyvault"
}

variable "key_vault_resource_group_name" {
  description = "Resource group containing the Key Vault"
  type        = string
  default     = "team1-job-app-shared-rg"
}

# Shared Container App Environment Configuration
variable "container_app_environment_name" {
  description = "Name of the Container App Environment"
  type        = string
  default     = "team1-job-app-container-app-environment"
}

variable "container_app_environment_resource_group_name" {
  description = "Resource group containing the Container App Environment"
  type        = string
  default     = "team1-job-app-shared-rg"
}

# Container App Configuration
variable "container_image_tag" {
  description = "Tag of the container image to deploy"
  type        = string
  default     = "v1.0.0"
}

variable "container_cpu" {
  description = "CPU cores for the container (e.g., '0.5', '1', '2')"
  type        = string
  default     = "0.5"
}

variable "container_memory" {
  description = "Memory for the container (e.g., '1Gi', '2Gi')"
  type        = string
  default     = "1Gi"
}

variable "container_port" {
  description = "Port the container listens on"
  type        = number
  default     = 3001
}

# Application Configuration
variable "app_name" {
  description = "Application name"
  type        = string
  default     = "team1-job-app-backend"
}

variable "better_auth_url" {
  description = "Better Auth URL for the application"
  type        = string
  default     = "http://team1-job-app-backend.team1-job-app-backend-env.internal:3001"
}