from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime
import psycopg2
import os
import re

app = FastAPI(title="ValidaRFC API - Python FastAPI")

# RFC Regex Pattern
RFC_RE = re.compile(r'^[A-ZÑ&]{3,4}\d{6}(?:[A-Z0-9]{3})?$')

# Database connection
def get_db():
    try:
        conn = psycopg2.connect(
            dbname="validarfc",
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", "postgres"),
            host=os.getenv("DB_HOST", "localhost"),
            port=os.getenv("DB_PORT", "5432")
        )
        return conn
    except:
        return None

class ValidateIn(BaseModel):
    rfc: str

class ValidateOut(BaseModel):
    rfc: str
    is_valid: bool
    created_at: str

@app.get("/health")
def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

@app.post("/validate", response_model=ValidateOut)
def validate(body: ValidateIn):
    rfc = body.rfc.strip().upper()
    is_valid = bool(RFC_RE.match(rfc))
    created_at = datetime.utcnow().isoformat()
    
    conn = get_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO validations (rfc, is_valid, created_at) VALUES (%s, %s, %s)",
                (rfc, is_valid, created_at)
            )
            conn.commit()
            cur.close()
        except Exception as e:
            print(f"DB error: {e}")
        finally:
            conn.close()
    
    return ValidateOut(rfc=rfc, is_valid=is_valid, created_at=created_at)

@app.get("/history")
def history(page: int = 1, per_page: int = 20):
    conn = get_db()
    if not conn:
        return {"total": 0, "page": page, "per_page": per_page, "items": []}
    
    try:
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM validations")
        total = cur.fetchone()[0]
        
        offset = (page - 1) * per_page
        cur.execute(
            "SELECT rfc, is_valid, created_at FROM validations ORDER BY created_at DESC LIMIT %s OFFSET %s",
            (per_page, offset)
        )
        items = [{"rfc": row[0], "is_valid": row[1], "created_at": row[2].isoformat()} for row in cur.fetchall()]
        cur.close()
        
        return {
            "total": total,
            "page": page,
            "per_page": per_page,
            "items": items
        }
    except Exception as e:
        print(f"DB error: {e}")
        return {"total": 0, "page": page, "per_page": per_page, "items": []}
    finally:
        conn.close()
