package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/joho/godotenv"
)

// album represents data about a record album.
// type Ping struct {
// 	ID           int16   `json:"id"`
// 	Status       int16   `json:"status"`
// 	ResponseTime float64 `json:"responseTime"`
// }

type Ping struct {
	Status       int16   `json:"status"`
	ResponseTime float64 `json:"responseTime"`
}

type Data struct {
	Name  string
	Pings []Ping
}

// var pings = []Ping{
// 	{ID: 1, Status: 200, ResponseTime: 59},
// 	{ID: 2, Status: 200, ResponseTime: 102},
// 	{ID: 3, Status: 200, ResponseTime: 64},
// 	{ID: 4, Status: 200, ResponseTime: 60},
// 	{ID: 5, Status: 200, ResponseTime: 59},
// 	{ID: 6, Status: 200, ResponseTime: 56},
// 	{ID: 7, Status: 200, ResponseTime: 69},
// }

func main() {
	router := gin.Default()
	router.GET("/data/:id", getData)
	// router.GET("/data/:id", getAlbumByID)
	// router.POST("/albums", postAlbums)

	router.Run("localhost:8080")
}

func getEnv(key string) string {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatalf("Some error occured. Err: %s", err)
	}

	val := os.Getenv(key)

	return val
}

func fetchData(id string) Data {
	username := getEnv("USERNAME")
	password := getEnv("PASSWORD")

	serverAPIOptions := options.ServerAPI(options.ServerAPIVersion1)
	clientOptions := options.Client().
		ApplyURI("mongodb+srv://" + username + ":" + password + "@main.pvnry.mongodb.net/?retryWrites=true&w=majority").
		SetServerAPIOptions(serverAPIOptions)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	collection := client.Database("Connectivity").Collection("Pings")

	var result Data
	filter := bson.D{{"name", "pldashboard.com"}}

	err = collection.FindOne(context.TODO(), filter).Decode(&result)
	if err != nil {
		panic(err)
	}

	fmt.Println(result)
	data := result

	return data
}

func getData(c *gin.Context) {
	id := c.Param("id")
	data := fetchData(id)
	c.IndentedJSON(http.StatusOK, data)
}
