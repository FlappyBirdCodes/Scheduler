import requests

while True:
    requests.get("https://scheduler-heroku-api.herokuapp.com/sendNotification")
