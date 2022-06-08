package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
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

var websites = [...]string{"pldashboard.com", "tomdraper.dev", "notion-courses.netlify.app", "colour-themes.netlify.app"}

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

func main() {
	for _, address := range websites {
		testConnectivity(address)
	}
}
