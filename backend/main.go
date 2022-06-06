package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/go-ping/ping"
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

func main() {
	router := gin.Default()
	router.GET("/data/:id", getData)
	router.GET("/check", checkConnectivity)

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

func checkConnectivity(c *gin.Context) {
	pinger, err := ping.NewPinger("www.google.com")
	if err != nil {
		panic(err)
	}
	pinger.Count = 3
	err = pinger.Run() // Blocks until finished.
	if err != nil {
		panic(err)
	}
	stats := pinger.Statistics() // get send/receive/duplicate/rtt stats
	print(stats)
}
