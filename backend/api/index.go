package handler

import (
	"net/http"
	"time"

	"backend/database"

	"github.com/gin-gonic/gin"
)

var (
	app *gin.Engine
)

type Response struct {
	Time time.Time     `json:"time"`
	Data database.Data `json:"data"`
}

type AllDataResponse struct {
	Time time.Time       `json:"time"`
	Data []database.Data `json:"data"`
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Header("Access-Control-Allow-Methods", "POST,HEAD,PATCH, OPTIONS, GET, PUT")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func getData(c *gin.Context) {
	id := c.Param("id")
	data := database.FetchData(id)
	res := Response{time.Now(), data}
	c.IndentedJSON(http.StatusOK, res)
}

func getAllData(c *gin.Context) {
	data := database.FetchAllData()
	res := AllDataResponse{time.Now(), data}
	c.IndentedJSON(http.StatusOK, res)
}

func init() {
	app = gin.Default()

	r := app.Group("/api") // Vercel - must be /api/xxx

	r.Use(CORSMiddleware())
	r.GET("/data", getAllData)
	r.GET("/data/:id", getData)
}

func Handler(w http.ResponseWriter, r *http.Request) {
	app.ServeHTTP(w, r)
}
