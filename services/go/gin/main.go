package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"
	"regexp"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

var RfcRegex = regexp.MustCompile(`^[A-ZÑ&]{3,4}\d{6}(?:[A-Z0-9]{3})?$`)

type ValidationRequest struct {
	RFC string `json:"rfc" binding:"required"`
}

type ValidationResponse struct {
	RFC       string    `json:"rfc"`
	IsValid   bool      `json:"is_valid"`
	CreatedAt time.Time `json:"created_at"`
}

type HealthResponse struct {
	Status    string    `json:"status"`
	Timestamp time.Time `json:"timestamp"`
}

var db *sql.DB

func init() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgres://postgres:postgres@localhost:5432/validarfc?sslmode=disable"
	}
	
	var err error
	db, err = sql.Open("postgres", dsn)
	if err != nil {
		log.Printf("Database connection warning: %v", err)
	}
}

func main() {
	router := gin.Default()

	router.GET("/health", health)
	router.POST("/api/validate", validate)
	router.GET("/api/history", history)

	router.Run(":8000")
}

func health(c *gin.Context) {
	c.JSON(http.StatusOK, HealthResponse{
		Status:    "ok",
		Timestamp: time.Now().UTC(),
	})
}

func validate(c *gin.Context) {
	var req ValidationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	rfc := req.RFC
	isValid := RfcRegex.MatchString(rfc)

	if db != nil {
		_, err := db.Exec(
			"INSERT INTO validations (rfc, is_valid, created_at) VALUES ($1, $2, $3)",
			rfc, isValid, time.Now(),
		)
		if err != nil {
			log.Printf("DB error: %v", err)
		}
	}

	c.JSON(http.StatusOK, ValidationResponse{
		RFC:       rfc,
		IsValid:   isValid,
		CreatedAt: time.Now().UTC(),
	})
}

func history(c *gin.Context) {
	page := 1
	perPage := 20
	
	if p := c.Query("page"); p != "" {
		if parsed, err := strconv.Atoi(p); err == nil {
			page = parsed
		}
	}
	if pp := c.Query("per_page"); pp != "" {
		if parsed, err := strconv.Atoi(pp); err == nil {
			perPage = parsed
		}
	}

	if db == nil {
		c.JSON(http.StatusOK, gin.H{
			"total":    0,
			"page":     page,
			"per_page": perPage,
			"items":    []interface{}{},
		})
		return
	}

	var total int
	db.QueryRow("SELECT COUNT(*) FROM validations").Scan(&total)

	offset := (page - 1) * perPage
	rows, err := db.Query(
		"SELECT rfc, is_valid, created_at FROM validations ORDER BY created_at DESC LIMIT $1 OFFSET $2",
		perPage, offset,
	)
	if err != nil {
		log.Printf("DB error: %v", err)
	}
	defer rows.Close()

	items := []map[string]interface{}{}
	for rows.Next() {
		var rfc string
		var isValid bool
		var createdAt time.Time
		if err := rows.Scan(&rfc, &isValid, &createdAt); err == nil {
			items = append(items, map[string]interface{}{
				"rfc":        rfc,
				"is_valid":   isValid,
				"created_at": createdAt,
			})
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"total":    total,
		"page":     page,
		"per_page": perPage,
		"items":    items,
	})
}
