package main

import (
	"fmt"
	"sync"
	"time"

	"refresh/lib/database"

	"github.com/go-ping/ping"
)

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
		ping := database.Ping{Loss: stats.PacketLoss, Response: int64(stats.AvgRtt), Time: time.Now()}
		database.UpdateDatabase(address, ping)

	}

	pinger.Run()
}

func runSingle() {
	var wg sync.WaitGroup
	for _, address := range database.Websites {
		wg.Add(1)
		go func(address string) {
			defer wg.Done()
			testConnectivity(address)
		}(address)
	}
	wg.Wait()
}

func runContinuous() {
	for _, address := range database.Websites {
		go testConnectivity(address)
	}
	for range time.Tick(time.Minute * 60) {
		for _, address := range database.Websites {
			go testConnectivity(address)
		}
	}
}

func main() {
	runSingle()
}
