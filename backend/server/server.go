package main

import (
	"net/http"
	"time"

	database "server/lib"

	"github.com/gin-gonic/gin"
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

func main() {
	router := gin.Default()
	router.Use(CORSMiddleware())
	router.GET("/data", getAllData)
	router.GET("/data/:id", getData)

	// port := os.Getenv("PORT")
	// router.Run(":" + port)
	router.Run("localhost:8080")
}
