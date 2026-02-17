# Infrastructure & Deployment Guide

## Overview
ValidaRFC runs on Google Cloud Platform (GCP) with enterprise-grade infrastructure:
- **Orchestration**: Google Kubernetes Engine (GKE)
- **Database**: Cloud SQL (PostgreSQL 15)
- **Container Registry**: Artifact Registry
- **Load Balancing**: Cloud Load Balancer + Nginx Ingress
- **CI/CD**: GitHub Actions

## Architecture

```
┌─────────────────────────────────────────────────┐
│          Google Cloud Platform (GCP)            │
├─────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────┐  │
│  │  Artifact Registry (validarfc)           │  │
│  │  - fastapi:latest, next-js:latest, etc. │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  GKE Cluster (validarfc-gke)             │  │
│  │  ┌────────────────────────────────────┐  │  │
│  │  │  Namespace: production              │  │  │
│  │  │  - FastAPI Pods (2-10 replicas)     │  │  │
│  │  │  - Next.js Pods (2-10 replicas)     │  │  │
│  │  │  - Service objects + Ingress        │  │  │
│  │  └────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Cloud SQL (validarfc-postgres)          │  │
│  │  - PostgreSQL 15                         │  │
│  │  - Private VPC endpoint                  │  │
│  │  - Automatic backups / Point-in-time     │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Prerequisites

1. **GCP Account & Project**
   - Project ID: `validarfc-mx`
   - Billing enabled

2. **Tools**
   ```bash
   gcloud CLI
   terraform >= 1.0
   kubectl >= 1.20
   helm >= 3.0
   docker
   ```

3. **Credentials**
   - GCP Service Account key (JSON file)
   - GitHub Personal Access Token (for pushing to GCR)

## Terraform Setup

### 1. Initialize Terraform Backend
```bash
# Create GCS bucket for state (do this manually once)
gsutil mb gs://validarfc-mx-tfstate

# Initialize terraform
cd terraform
terraform init
```

### 2. Create tfvars File
```bash
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

### 3. Plan & Apply
```bash
terraform plan
terraform apply
```

**This will create:**
- GKE cluster (validarfc-gke) with 3 nodes
- Cloud SQL PostgreSQL database
- Artifact Registry repository
- VPC network and security rules

### 4. Save Outputs
```bash
terraform output
# Save these for later configuration:
# - gke_cluster_name
# - cloudsql_connection_name
# - artifact_registry_url
```

## Kubernetes Deployment

### 1. Configure kubectl
```bash
gcloud container clusters get-credentials validarfc-gke \
  --zone us-central1 \
  --project validarfc-mx
```

### 2. Create Production Namespace
```bash
kubectl create namespace production
```

### 3. Deploy with Helm
```bash
helm repo add validarfc-local ./k8s/helm/

helm install validarfc validarfc-local/validarfc \
  --namespace production \
  --set image.repository=us-central1-docker.pkg.dev/validarfc-mx/validarfc/fastapi \
  --set image.tag=latest \
  --set env.DATABASE_URL="postgresql://..."
```

### 4. Verify Deployment
```bash
kubectl get pods -n production
kubectl get svc -n production
kubectl logs -n production <pod-name>
```

## GitHub Actions CI/CD

### 1. Configure Secrets
In your GitHub repo, add these secrets:
- `GCP_SA_KEY`: GCP Service Account JSON (base64 encoded)
- `GCP_PROJECT`: validarfc-mx

### 2. Workflows

**Build & Push** (`.github/workflows/build-and-push.yml`)
- Triggered on: push to main/develop with changes in `services/`
- Builds Docker images for each service
- Pushes to Artifact Registry

**Deploy to GKE** (`.github/workflows/deploy-gke.yml`)
- Triggered on: push to main with changes in `k8s/`
- Deploys via Helm to production namespace
- Automatic rollout/rollback support

## Database Migration & Maintenance

### 1. Apply Schema (One-time)
```bash
gcloud sql connect validarfc-postgres \
  --user=postgres \
  --instance=validarfc-postgres

# Inside psql:
\i migrations/init.sql
```

### 2. Backup Strategy
- Automatic daily backups retained 30 days
- Point-in-time recovery enabled (7 days)
- Manual backup:
  ```bash
  gcloud sql backups create --instance=validarfc-postgres
  ```

### 3. Connect from Local
```bash
# Via Cloud SQL Proxy
cloud-sql-proxy validarfc-mx:us-central1:validarfc-postgres \
  --port 5432 &

# Then connect:
psql postgresql://validarfc_user:PASSWORD@localhost/validarfc
```

## Monitoring & Logging

### 1. GKE Monitoring
```bash
# View cluster status
kubectl cluster-info

# View nodes
kubectl get nodes -o wide

# View workload
kubectl get pods -n production -o wide
```

### 2. Cloud SQL Monitoring
- **GCP Console**: Cloud SQL → validarfc-postgres → Metrics
- CPU, Memory, Disk I/O, Network

### 3. Application Logs
```bash
# Tail logs from pod
kubectl logs -f -n production <pod-name> --tail=100

# Or view in GCP Logs:
# Cloud Logging → validarfc-gke → production namespace
```

## Scaling & Performance

### 1. Horizontal Pod Autoscaling
Configured in `values.yaml`:
- Min replicas: 2
- Max replicas: 10
- Target CPU: 80%

Auto-scales based on CPU utilization.

### 2. Cluster Autoscaling
Configured in Terraform:
- Min nodes: 3
- Max nodes: (configurable)
- Scales based on pending pods

### 3. Database Scaling
For increased load, edit `cloudsql_tier` in `variables.tf`:
- Current: `db-custom-2-8192` (2 vCPU, 8GB RAM)
- Larger: `db-custom-4-16384`, `db-custom-8-32768`

## Troubleshooting

### Pod Won't Start
```bash
kubectl describe pod -n production <pod-name>
kubectl logs -n production <pod-name>
```

### Database Connection Failed
```bash
# Check Cloud SQL proxy
kubectl exec -it -n production <pod-name> -- /bin/sh
nslookup postgres-db
```

### Out of Memory
```bash
# Check resource limits
kubectl describe deployment -n production validarfc

# Increase if needed
helm upgrade validarfc ./k8s/helm \
  --set resources.requests.memory=512Mi \
  --namespace production
```

## Cost Optimization

1. **GKE**:
   - Reduce node count (3 → 2 for dev)
   - Use `e2-medium` instead of `e2-standard-4` for dev
   - Enable cluster autoscaling

2. **Cloud SQL**:
   - Use `db-f1-micro` for development
   - Enable shared-core instances
   - Scale down during off-hours

3. **Network**:
   - Use Cloud NAT for outbound traffic
   - Reserve IPs if running 24/7

## Security

1. **Credentials**:
   - Store Service Account keys in secure vaults (1Password, GitHub Secrets)
   - Rotate keys quarterly
   - Never commit secrets to git

2. **Network**:
   - Cloud SQL uses private VPC endpoint
   - GKE nodes in private subnet
   - Ingress restricted to HTTPS

3. **RBAC**:
   - Service accounts per namespace
   - Least privilege IAM roles
   - Audit logging enabled

## Disaster Recovery

### Backup & Restore
```bash
# List backups
gcloud sql backups list --instance=validarfc-postgres

# Restore from backup
gcloud sql backups restore BACKUP_ID \
  --backup-instance=validarfc-postgres \
  --target-instance=validarfc-postgres
```

### Multi-region Failover
For production, consider:
- Cloud SQL replication to secondary region
- GKE cluster in secondary region
- Cloud Load Balancer with failover

## Support & Documentation

- **Terraform**: https://registry.terraform.io/providers/hashicorp/google/latest
- **GKE**: https://cloud.google.com/kubernetes-engine/docs
- **Cloud SQL**: https://cloud.google.com/sql/docs
- **Helm**: https://helm.sh/docs/
