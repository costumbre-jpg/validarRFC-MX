use actix_web::{web, App, HttpResponse, HttpServer, middleware};
use chrono::Utc;
use regex::Regex;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use lazy_static::lazy_static;

#[derive(Serialize, Deserialize)]
struct ValidationRequest {
    rfc: String,
}

#[derive(Serialize)]
struct ValidationResponse {
    rfc: String,
    is_valid: bool,
    created_at: String,
}

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    timestamp: String,
}

lazy_static! {
    static ref RFC_REGEX: Regex = Regex::new(r"^[A-ZÑ&]{3,4}\d{6}(?:[A-Z0-9]{3})?$").unwrap();
}

async fn health() -> HttpResponse {
    HttpResponse::Ok().json(HealthResponse {
        status: "ok".to_string(),
        timestamp: Utc::now().to_rfc3339(),
    })
}

async fn validate(req: web::Json<ValidationRequest>) -> HttpResponse {
    let rfc = req.rfc.to_uppercase().trim().to_string();
    let is_valid = RFC_REGEX.is_match(&rfc);
    
    HttpResponse::Ok().json(ValidationResponse {
        rfc,
        is_valid,
        created_at: Utc::now().to_rfc3339(),
    })
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("Starting ValidaRFC Rust service on 0.0.0.0:8000");

    HttpServer::new(|| {
        App::new()
            .wrap(middleware::Logger::default())
            .route("/health", web::get().to(health))
            .route("/api/validate", web::post().to(validate))
    })
    .bind("0.0.0.0:8000")?
    .run()
    .await
}
