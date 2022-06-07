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

type Ping struct {
	Loss         float64 `json:"loss"`
	ResponseTime int64   `json:"responseTime"`
}

type Record struct {
	Name  string
	Pings []Ping
}

func periodicallyPing() {
	go testConnectivity("pldashboard.com")
	for range time.Tick(time.Minute * 30) {
		go testConnectivity("pldashboard.com")
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
	router.GET("/data/:id", getData)

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
	// username := getEnv("USERNAME")
	// password := getEnv("PASSWORD")

	// serverAPIOptions := options.ServerAPI(options.ServerAPIVersion1)
	// clientOptions := options.Client().
	// 	ApplyURI("mongodb+srv://" + username + ":" + password + "@main.pvnry.mongodb.net/?retryWrites=true&w=majority").
	// 	SetServerAPIOptions(serverAPIOptions)
	// ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	// defer cancel()
	// client, err := mongo.Connect(ctx, clientOptions)
	// if err != nil {
	// 	log.Fatal(err)
	// }

	// collection := client.Database("Connectivity").Collection("Pings")

	collection := connectToDatabase()
	print(id)
	var result Data
	filter := bson.D{{"name", id}}

	err := collection.FindOne(context.TODO(), filter).Decode(&result)
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

	// collection.Aggregate(context.TODO(),
	// 	bson.D{"$project", bson.D{{"name", address}, {bson.D{{"$size", "$pings"}}}}})

	// Remove oldest ping (if more than 150 pings collected)
	pingsCount := 16
	if pingsCount > 150 {
		filter = bson.D{{"name", address}}
		update = bson.D{{"$pop", bson.D{{"pings", -1}}}}
		_, err = collection.UpdateOne(context.TODO(), filter, update, opts)
		if err != nil {
			panic(err)
		}
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

	// pinger.OnRecv = func(pkt *ping.Packet) {
	// 	fmt.Printf("%d bytes from %s: icmp_seq=%d time=%v\n",
	// 		pkt.Nbytes, pkt.IPAddr, pkt.Seq, pkt.Rtt)
	// }
	pinger.OnFinish = func(stats *ping.Statistics) {
		fmt.Printf("\n--- %s ping statistics ---\n", stats.Addr)
		fmt.Printf("%d packets transmitted, %d packets received, %v%% packet loss\n",
			stats.PacketsSent, stats.PacketsRecv, stats.PacketLoss)
		fmt.Printf("round-trip min/avg/max/stddev = %v/%v/%v/%v\n",
			stats.MinRtt, stats.AvgRtt, stats.MaxRtt, stats.StdDevRtt)
		// loss := stats.PacketLoss
		ping := Ping{Loss: stats.PacketLoss, ResponseTime: int64(stats.AvgRtt)}
		updateDatabase(address, ping)

	}

	pinger.Run()
}
