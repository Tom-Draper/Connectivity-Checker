package database

import (
	"context"
	"log"
	"os"
	"time"

	// "github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
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

var Websites = [...]string{"pldashboard.com", "tomdraper.dev", "notion-courses.netlify.app", "colour-themes.netlify.app"}

func getEnv(key string) string {
	// err := godotenv.Load(".env")
	// if err != nil {
	// 	log.Fatalf("Some error occured. Err: %s", err)
	// }

	val := os.Getenv(key)

	return val
}

func UpdateDatabase(collection *mongo.Collection, address string, ping Ping) {
	// collection := ConnectToDatabase()
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

func ConnectToDatabase() *mongo.Collection {
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
