terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
  backend "gcs" {
    bucket = "validarfc-mx-tfstate"
    prefix = "prod"
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

# GKE Cluster
resource "google_container_cluster" "primary" {
  name     = "validarfc-gke"
  location = var.gcp_region

  initial_node_count = var.gke_node_count

  node_config {
    machine_type = var.gke_machine_type
    disk_size_gb = 50
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
    ]
  }

  addons_config {
    http_load_balancing {
      disabled = false
    }
    horizontal_pod_autoscaling {
      disabled = false
    }
  }

  maintenance_policy {
    daily_maintenance_window {
      start_time = "03:00"
    }
  }
}

# Cloud SQL (PostgreSQL)
resource "google_sql_database_instance" "postgres" {
  name             = "validarfc-postgres"
  database_version = "POSTGRES_15"
  region           = var.gcp_region

  settings {
    tier              = var.cloudsql_tier
    availability_type = "REGIONAL"
    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = true
      transaction_log_retention_days = 7
    }
    ip_configuration {
      require_ssl       = true
      private_network   = google_compute_network.vpc.id
      ipv4_enabled      = true
      authorized_networks {
        value = "0.0.0.0/0"
        name  = "allow-all"
      }
    }
  }

  depends_on = [google_service_networking_connection.private_vpc_connection]

  deletion_protection = true
}

resource "google_sql_database" "validarfc_db" {
  name     = "validarfc"
  instance = google_sql_database_instance.postgres.name
}

resource "google_sql_user" "db_user" {
  name     = "validarfc_user"
  instance = google_sql_database_instance.postgres.name
  password = var.db_password
}

# VPC for Cloud SQL private IP
resource "google_compute_network" "vpc" {
  name                    = "validarfc-vpc"
  auto_create_subnetworks = true
}

resource "google_compute_global_address" "private_ip_address" {
  name          = "private-ip-address"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
}

# Artifact Registry (Container Repo)
resource "google_artifact_registry_repository" "validarfc" {
  location      = var.gcp_region
  repository_id = "validarfc"
  description   = "Container images for ValidaRFC"
  format        = "DOCKER"
}

# Outputs
output "gke_cluster_name" {
  value       = google_container_cluster.primary.name
  description = "GKE cluster name"
}

output "cloudsql_connection_name" {
  value       = google_sql_database_instance.postgres.connection_name
  description = "Cloud SQL connection string"
}

output "cloudsql_private_ip" {
  value       = google_sql_database_instance.postgres.private_ip_address
  description = "Cloud SQL private IP"
}

output "artifact_registry_url" {
  value       = "${var.gcp_region}-docker.pkg.dev/${var.gcp_project_id}/validarfc"
  description = "Artifact Registry URL"
}
