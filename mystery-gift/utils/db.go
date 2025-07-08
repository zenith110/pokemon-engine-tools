package utils

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"time"

	"github.com/BurntSushi/toml"
	"github.com/dgraph-io/badger/v4"
	"github.com/fsnotify/fsnotify"
	Models "github.com/zenith110/pokemon-go-engine-toml-models/models"
)

var client *badger.DB

func SetUpDB() {
	var err error
	opt := badger.DefaultOptions("").WithInMemory(true)
	client, err = badger.Open(opt)
	if err != nil {
		fmt.Printf("Error while setting up db!\nError is %v", err)
	}
}

func InsertDBData() {
	file, err := os.Open("gifts.toml")
	if err != nil {
		panic(err)
	}
	defer file.Close()

	bytes, err := io.ReadAll(file)
	if err != nil {
		panic(err)
	}

	var mysteryGifts Models.MysteryGiftsServer

	err = toml.Unmarshal(bytes, &mysteryGifts)

	if err != nil {
		fmt.Printf("Error occured while reading data!\nError is %v", err)
		panic(err)
	}

	for mysteryGiftIndex := range mysteryGifts.Mysterygifts {
		fmt.Printf("Looking at %s event!\n", mysteryGifts.Mysterygifts[mysteryGiftIndex].Name)
		transactionErr := client.Update(func(txn *badger.Txn) error {
			if mysteryGifts.Mysterygifts[mysteryGiftIndex].GiftType == "Pokemon" {
				data, err := json.Marshal(mysteryGifts.Mysterygifts[mysteryGiftIndex])
				if err != nil {
					return err
				}
				txn.Set([]byte(mysteryGifts.Mysterygifts[mysteryGiftIndex].Name), data)
				fmt.Printf("Have successfully inserted pokemon event %s!\n", mysteryGifts.Mysterygifts[mysteryGiftIndex].Name)
				return nil
			}
			return nil
		})
		if transactionErr != nil {
			fmt.Printf("Error occured while inserting data!\nError is %v\n", err)
			panic(transactionErr)
		}
	}
}

func TimeCheck(startDate, endDate, playerDate time.Time) bool {
	return startDate.After(playerDate) && endDate.Before(playerDate)
}

func SearchDBData(currentDate string) Models.MysteryGiftServer {
	// Create the struct to dump the returned data into
	var mysteryGift Models.MysteryGiftServer
	// Begins the transaction of viewing the data
	err := client.View(func(txn *badger.Txn) error {
		opts := badger.DefaultIteratorOptions
		opts.PrefetchSize = 10
		it := txn.NewIterator(opts)
		defer it.Close()
		for it.Rewind(); it.Valid(); it.Next() {
			item := it.Item()
			err := item.Value(func(v []byte) error {
				var gift Models.MysteryGiftServer
				err := json.Unmarshal(v, &gift)
				if err != nil {
					fmt.Printf("Unmarshal error: %v\nValue: %s\n", err, string(v)) // Debug print
					return err
				}
				if currentDate >= gift.BeginningDate && currentDate <= gift.EndDate {
					mysteryGift = gift
				}
				return nil
			})
			if err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		fmt.Printf("Error occured while opening db!, error is %v\n", err)
	}
	fmt.Print(mysteryGift)
	return mysteryGift
}

func WatchGiftsFile() {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		fmt.Printf("Error creating file watcher: %v\n", err)
		return
	}
	defer watcher.Close()

	// Add the gifts.toml file to watch
	err = watcher.Add("gifts.toml")
	if err != nil {
		fmt.Printf("Error adding file to watcher: %v\n", err)
		return
	}

	fmt.Println("Watching gifts.toml for changes...")

	// Debounce timer to avoid multiple reloads
	var reloadTimer *time.Timer
	var lastReloadTime time.Time

	for {
		select {
		case event, ok := <-watcher.Events:
			if !ok {
				return
			}
			if event.Op&fsnotify.Write == fsnotify.Write {
				// Check if we've reloaded recently to avoid duplicate events
				if time.Since(lastReloadTime) < 1*time.Second {
					fmt.Println("Skipping duplicate write event...")
					continue
				}

				fmt.Println("gifts.toml modified, reloading data...")

				// Cancel previous timer if it exists
				if reloadTimer != nil {
					reloadTimer.Stop()
				}

				// Debounce the reload to avoid multiple rapid reloads
				reloadTimer = time.AfterFunc(1*time.Second, func() {
					InsertDBData()
					lastReloadTime = time.Now()
					fmt.Println("Database reloaded successfully")
				})
			}
		case err, ok := <-watcher.Errors:
			if !ok {
				return
			}
			fmt.Printf("File watcher error: %v\n", err)
		}
	}
}
