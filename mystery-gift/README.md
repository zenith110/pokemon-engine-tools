# mystery-gift
## What is this project about?
This project serves as a simple websocket based mystery gift system similar to the one found in gen 3 - gen 4 games.

The system will allow you to pass pokemon, custom events, and other gifts to a [pokemon engine](https://github.com/zenith110/pokemon-go-engine) that is being developed.

It utilizes an inmemory db called badgerdb to grab the contents from the toml file, then is able to send out to the fangame via a websocket client connection. Once the client connection is closed, players can pick up their gifts from the pokemon center like in the games.

This project is intended to run as a standalone binary, and will be have a fully built release to be downloaded within the release tab once ready.

The default binary will run on port 8080, to change it update the config.toml and rerun the application using go run main.go

## Changelog
### 7.8.2025
Finished config system, added basic system to see if gift.toml is updated.
### 2.23.2025
Finished up basic server and client(server in go, client in python)
### 7.13.2024
Have DB syncing toml working properly and a basic server client working.
