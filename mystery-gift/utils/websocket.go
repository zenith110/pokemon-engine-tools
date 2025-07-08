package utils

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"

	"github.com/BurntSushi/toml"
	"github.com/gorilla/websocket"
)

var addr *string

type Config struct {
	Port      string `toml:"port"`
	IPAddress string `toml:"ipaddress"`
}

type TimeResponse struct {
	Time string `json:"time"`
}

func LoadConfig(filename string) (*Config, error) {
	var config struct {
		Config Config `toml:"config"`
	}
	if _, err := toml.DecodeFile(filename, &config); err != nil {
		return nil, err
	}
	return &config.Config, nil
}

func Echo(w http.ResponseWriter, r *http.Request) {
	var upgrader = websocket.Upgrader{} // use default options
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}
	defer c.Close()
	for {
		mt, message, err := c.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			break
		}

		var timeResponse TimeResponse
		if err := json.Unmarshal(message, &timeResponse); err != nil {
			log.Println("unmarshal:", err)
			break
		}

		log.Printf("recv: %s", timeResponse.Time)
		gift := SearchDBData(timeResponse.Time)

		// Convert gifts to JSON bytes
		giftBytes, err := json.Marshal(gift)
		if err != nil {
			log.Println("marshal:", err)
			break
		}

		err = c.WriteMessage(mt, giftBytes)
		fmt.Println("Sent all active events!")
		if err != nil {
			log.Println("write:", err)
			break
		}
	}
}

func HandleRoutes() {
	flag.Parse()
	log.SetFlags(0)

	// Load configuration
	config, err := LoadConfig("config.toml")
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	// Set address using config
	addr = flag.String("addr", fmt.Sprintf("0.0.0.0:%s", config.Port), "http service address")

	http.HandleFunc("/mysterygift", Echo)
	log.Fatal(http.ListenAndServe(*addr, nil))
	fmt.Println("Now running!")
}
