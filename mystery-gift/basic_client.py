from websocket import create_connection
from datetime import datetime
import json

ws = create_connection("ws://127.0.0.1:8080/mysterygift")
print("Sending 'Hello, World'...")

data = {"time": datetime.now().isoformat()}
ws.send(json.dumps(data))
print("Sent")
print("Receiving...")
result =  ws.recv()
print("Received '%s'" % result)
ws.close()
