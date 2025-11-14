variable "backend_resource_group_name" {
  description = "Azure resource group for Terraform state storage"
  type        = string
}

variable "backend_storage_account_name" {
  description = "Azure storage account for Terraform state"
  type        = string
}

variable "backend_container_name" {
  description = "Azure storage container for Terraform state"
  type        = string
}

variable "backend_key" {
  description = "Path to state file in storage container"
  type        = string
}