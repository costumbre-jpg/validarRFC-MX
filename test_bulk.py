
import requests

url = "http://localhost:3000/api/validate/bulk"
files = {'file': open('test.csv', 'rb')}

try:
    response = requests.post(url, files=files)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")
