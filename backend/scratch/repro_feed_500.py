import requests
import time

# Use the task ID provided by the user or a dummy one that exists in DB
# The user provided d3916a9979a03034f37cdc31c1071f88 in the message, 
# but that looks like a task ID.
task_id = "d3916a9979a03034f37cdc31c1071f88"
url = f"http://127.0.0.1:8005/api/music/feed/{task_id}"

print(f"Testing GET to {url}...")
try:
    response = requests.get(url, timeout=10)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
