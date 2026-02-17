# ValidaRFC - Polyglot Microservices

Plataforma de validación de RFC implementada como un ecosistema de microservicios en 6 lenguajes diferentes, todo orquestado en Kubernetes.

## 📦 Servicios Disponibles

### 🐍 Python - FastAPI
- **Ubicación**: `services/python/fastapi/`
- **Puerto**: 8000
- **Características**: 
  - Validación de RFC con expresión regular
  - Historial paginado de validaciones
  - Conexión a PostgreSQL
  - Health check
- **Stack**: FastAPI, psycopg2, Pydantic
- **Build**: `docker build -t validarfc-python:latest services/python/fastapi/`
- **Run**: `uvicorn main:app --reload`

### ☕ Java - Spring Boot
- **Ubicación**: `services/java/spring-boot/`
- **Puerto**: 8000
- **Características**:
  - REST API con Spring Web
  - Validación con regex
  - Entity Framework (JPA ready)
  - Actuator health endpoint
- **Stack**: Spring Boot 3.2, PostgreSQL driver, Maven
- **Build**: `mvn clean package -DskipTests`
- **Run**: `java -jar target/validarfc-java-1.0.0.jar`

### 🔷 C# - ASP.NET Core
- **Ubicación**: `services/csharp/aspnet-core/`
- **Puerto**: 8000
- **Características**:
  - Minimal APIs con ASP.NET Core 8
  - Entity Framework Core
  - Validación con Regex
  - OpenAPI/Swagger integrado
- **Stack**: .NET 8, Npgsql, Swagger
- **Build**: `dotnet build && dotnet publish -c Release`
- **Run**: `dotnet ValidaRFC.dll`

### 🐹 Go - Gin
- **Ubicación**: `services/go/gin/`
- **Puerto**: 8000
- **Características**:
  - Alta performance con Gin framework
  - Validación con regex
  - PostgreSQL con lib/pq
  - Sin dependencias externas en runtime
- **Stack**: Go 1.21, Gin, lib/pq
- **Build**: `go build -o validarfc`
- **Run**: `./validarfc`

### 🦀 Rust - Actix-web
- **Ubicación**: `services/rust/actix/`
- **Puerto**: 8000
- **Características**:
  - Performance máximo y seguridad de memoria
  - Actix-web async/await
  - Validación con regex
  - Thread-safe operations
- **Stack**: Rust 1.73, Actix-web, Tokio, Chrono
- **Build**: `cargo build --release`
- **Run**: `./target/release/validarfc`

### 📱 JavaScript/TypeScript - Next.js
- **Ubicación**: `app/` (Next.js 14)
- **Puerto**: 3000
- **Características**:
  - Frontend React moderna
  - API routes del servidor
  - Autenticación con Auth0
  - Dashboard con gráficas
- **Stack**: Next.js 14, React, Tailwind CSS, TypeScript
- **Build**: `npm run build`
- **Run**: `npm run dev`

## 🚀 Deployment

### Local Development
```bash
# Con docker-compose
docker-compose up -d

# O individual por servicio
cd services/python/fastapi && docker build -t validarfc-python:latest . && docker run -p 8000:8000 validarfc-python:latest
```

### Kubernetes/GKE
```bash
# Deploy con Helm
helm install validarfc ./k8s/helm \
  --set image.repository=us-central1-docker.pkg.dev/validarfc-mx/validarfc/fastapi \
  --namespace production \
  --create-namespace
```

### GitHub Actions CI/CD
- **.github/workflows/build-and-push.yml**: Construye y pushea cada servicio a Artifact Registry
- **.github/workflows/deploy-gke.yml**: Deploya a GKE con Helm

## 🏗️ Arquitectura

```
                    Internet
                       ↓
                  GCP Load Balancer
                       ↓
              Kubernetes Ingress (Nginx)
                       ↓
        ┌─────────────────────────────┐
        │   GKE Cluster (3+ nodes)    │
        │                             │
        │  ┌──────────────────────┐   │
        │  │  Python FastAPI      │   │
        │  │  (2-10 replicas)     │   │
        │  └──────────────────────┘   │
        │  ┌──────────────────────┐   │
        │  │  Java Spring Boot    │   │
        │  │  (2-10 replicas)     │   │
        │  └──────────────────────┘   │
        │  ┌──────────────────────┐   │
        │  │  C# ASP.NET Core     │   │
        │  │  (2-10 replicas)     │   │
        │  └──────────────────────┘   │
        │  └──────────────────────┐   │
        │  │  Go Gin Service      │   │
        │  │  (2-10 replicas)     │   │
        │  └──────────────────────┘   │
        │  ┌──────────────────────┐   │
        │  │  Rust Actix Service  │   │
        │  │  (2-10 replicas)     │   │
        │  └──────────────────────┘   │
        │  ┌──────────────────────┐   │
        │  │  Next.js Frontend    │   │
        │  │  (2-10 replicas)     │   │
        │  └──────────────────────┘   │
        └─────────────────────────────┘
                       ↓
              Cloud SQL (PostgreSQL)
                       ↓
              Automatic Backups
          Point-in-time Recovery
```

## 📊 API Endpoints Comunes

Todos los servicios exponen:

```
GET  /health                - Health check
POST /api/validate          - Validar RFC
GET  /api/history?page=1    - Historial paginado
```

### Ejemplo de Request
```bash
curl -X POST http://localhost:8000/api/validate \
  -H "Content-Type: application/json" \
  -d '{"rfc": "ABC123456XYZ"}'
```

### Ejemplo de Response
```json
{
  "rfc": "ABC123456XYZ",
  "is_valid": true,
  "created_at": "2024-02-16T10:30:00Z"
}
```

## 📈 Scaling & Performance

- **Python (FastAPI)**: ~5,000 req/s (single instance)
- **Java (Spring Boot)**: ~3,000 req/s (single instance)
- **C# (ASP.NET)**: ~4,000 req/s (single instance)
- **Go (Gin)**: ~10,000 req/s (single instance)
- **Rust (Actix)**: ~15,000 req/s (single instance)

HPA (Horizontal Pod Autoscaler) configurado para escalar 2-10 replicas basado en CPU utilization (80%).

## 🔒 Seguridad

- Todos los servicios validan entrada (RFC format)
- HTTPS en producción (GCP Load Balancer)
- Secrets manejados por K8s Secrets
- Database passwords en AWS Secrets Manager (plan futuro)
- RBAC en Kubernetes por namespace

## 📝 Variabilidad de Lenguajes

Esta arquitectura demuestra:
- **Performance**: Rust > Go > Python/C# > Java
- **Development Speed**: Python > JavaScript > C# > Go > Rust > Java
- **Community Ecosystem**: JavaScript > Python > Java > Go > C# > Rust
- **Memory Efficiency**: Rust > Go > Java ≈ C# > Python
- **Hot Reload**: JavaScript > Python > Go > C#/Java > Rust

Puedes reemplazar cualquier servicio sin afectar los demás. La API es consistente.

## 🛠️ Desarrollo Local

### Requisitos
- Docker & Docker Compose
- Git
- `kubectl` y `helm` (para K8s)
- Credentials de GCP (para GKE)

### Quickstart
```bash
# 1. Clone repo
git clone https://github.com/costumbre-jpg/validarRFC-MX.git
cd validarRFC-MX

# 2. Start local environment
docker-compose up -d

# 3. Check health
curl http://localhost:8000/health

# 4. Test validation
curl -X POST http://localhost:8000/api/validate \
  -H "Content-Type: application/json" \
  -d '{"rfc": "ABC123456XYZ"}'
```

## 📚 Documentación Adicional

- [INFRASTRUCTURE.md](../INFRASTRUCTURE.md) - Setup GCP/Terraform/Kubernetes
- [API_DOCUMENTATION.md](../API_DOCUMENTATION.md) - API contracts
- [README.md](../README.md) - Documentación general del proyecto

## 🤝 Contribuciones

1. Fork el repo
2. Crea un branch para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

MIT License - Ver LICENSE file para details
