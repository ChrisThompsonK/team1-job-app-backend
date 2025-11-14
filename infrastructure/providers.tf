terraform {
  required_version = ">= 1.9.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }

  backend "azurerm" {
    # Set via backend-config flags or environment variables
  }
}

provider "azurerm" {
  features {}
  # Automatically uses ARM_* environment variables for authentication
}

