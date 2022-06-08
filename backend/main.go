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

	"github.com/go-ping/ping"
)

type Ping struct {
	Loss     float64   `json:"loss"`
	Response int64     `json:"response"`
	Time     time.Time `json:"time"`
}

type Data struct {
	Name  string `json:"name"`
	Pings []Ping `json:"pings"`
}

type Response struct {
	Time time.Time `json:"time"`
	Data Data      `json:"data"`
}

type AllDataResponse struct {
	Time time.Time `json:"time"`
	Data []Data    `json:"data"`
}

var websites = [...]string{"pldashboard.com", "tomdraper.dev", "notion-courses.netlify.app", "colour-themes.netlify.app"}

func periodicallyPing() {
	for _, address := range websites {
		go testConnectivity(address)
	}
	for range time.Tick(time.Minute * 1) {
		for _, address := range websites {
			go testConnectivity(address)
		}
	}
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

func main() {
	go periodicallyPing()

	router := gin.Default()
	router.Use(CORSMiddleware())
	router.GET("/data", getAllData)
	router.GET("/data/:id", getData)

	port := os.Getenv("PORT")
	router.Run(":" + port)
	// router.run("localhost:8080")
}

func getEnv(key string) string {
	// err := godotenv.Load(".env")
	// if err != nil {
	// 	log.Fatalf("Some error occured. Err: %s", err)
	// }

	val := os.Getenv(key)

	return val
}

func validAddress(address string) bool {
	for _, v := range websites {
		if v == address {
			return true
		}
	}

	return false
}

func fetchData(id string) Data {
	if !validAddress(id) {
		return Data{}
	}

	var data Data
	collection := connectToDatabase()

	filter := bson.D{{"name", id}}

	err := collection.FindOne(context.TODO(), filter).Decode(&data)
	if err != nil {
		panic(err)
	}

	fmt.Println(data)

	return data
}

func fetchAllData() []Data {
	var data []Data
	collection := connectToDatabase()

	cur, err := collection.Find(context.TODO(), bson.D{})
	if err != nil {
		panic(err)
	}

	for cur.Next(context.TODO()) {
		//Create a value into which the single document can be decoded
		var elem Data
		err := cur.Decode(&elem)
		if err != nil {
			log.Fatal(err)
		}

		data = append(data, elem)
	}

	return data

}

func getData(c *gin.Context) {
	id := c.Param("id")
	data := fetchData(id)
	res := Response{time.Now(), data}
	c.IndentedJSON(http.StatusOK, res)
}

func getAllData(c *gin.Context) {
	data := fetchAllData()
	res := AllDataResponse{time.Now(), data}
	c.IndentedJSON(http.StatusOK, res)
}

func connectToDatabase() *mongo.Collection {
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
	return collection
}

func updateDatabase(address string, ping Ping) {
	collection := connectToDatabase()
	// Add ping to database
	opts := options.Update().SetUpsert(true)
	filter := bson.D{{"name", address}}
	update := bson.D{{"$push", bson.D{{"pings", ping}}}}
	_, err := collection.UpdateOne(context.TODO(), filter, update, opts)
	if err != nil {
		panic(err)
	}

	// Remove oldest ping
	filter = bson.D{{"name", address}}
	update = bson.D{{"$pop", bson.D{{"pings", -1}}}}
	_, err = collection.UpdateOne(context.TODO(), filter, update, opts)
	if err != nil {
		panic(err)
	}
}

func testConnectivity(address string) {
	pinger, err := ping.NewPinger(address)
	if err != nil {
		panic(err)
	}
	pinger.Count = 3
	pinger.Timeout = time.Second * 3
	pinger.SetPrivileged(true)

	pinger.OnFinish = func(stats *ping.Statistics) {
		fmt.Printf("\n--- %s ping statistics ---\n", stats.Addr)
		fmt.Printf("%d packets transmitted, %d packets received, %v%% packet loss\n",
			stats.PacketsSent, stats.PacketsRecv, stats.PacketLoss)
		fmt.Printf("round-trip min/avg/max/stddev = %v/%v/%v/%v\n",
			stats.MinRtt, stats.AvgRtt, stats.MaxRtt, stats.StdDevRtt)
		ping := Ping{Loss: stats.PacketLoss, Response: int64(stats.AvgRtt), Time: time.Now()}
		updateDatabase(address, ping)

	}

	pinger.Run()
}
