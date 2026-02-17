variable "gcp_project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "validarfc-mx"
}

variable "gcp_region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "gke_node_count" {
  description = "Initial node count for GKE"
  type        = number
  default     = 3
}

variable "gke_machine_type" {
  description = "Machine type for GKE nodes"
  type        = string
  default     = "e2-standard-4"
}

variable "cloudsql_tier" {
  description = "Cloud SQL machine tier"
  type        = string
  default     = "db-custom-2-8192"
}

variable "db_password" {
  description = "Cloud SQL root password"
  type        = string
  sensitive   = true
}
