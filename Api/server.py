from flask import Flask, render_template, request, redirect, session, flash
from pymongo import MongoClient
import pymongo
import datetime
from pytz import timezone
from bson.objectid import ObjectId
import requests
import json

app = Flask(__name__)
app.secret_key = "secret key"

client = MongoClient(
    "mongodb+srv://flappybird:patrickpatterson333@scheduler.befmb.mongodb.net/<dbname>?retryWrites=true&w=majority")
Users = client.Scheduler.Users
Events = client.Scheduler.Events


@app.route("/login/<username>/<password>")
def login(username, password):
    userExists = Users.find_one({"username": username, "password": password})
    if userExists:
        return "Exists"
    return "Does not exist"


@app.route("/signup/<username>/<password>")
def signup(username, password):

    allUsers = list(Users.find({}))
    allUsernames = [user["username"] for user in allUsers]
    if username in allUsernames:
        return "This username has already been taken. Please try again."

    newUser = {
        "username": username,
        "password": password,
    }
    Users.insert_one(newUser)

    return "success"


def getDate(date):
    date = date.split(" ")

    month = datetime.datetime.strptime(date[0], "%B").month
    day = int(date[1][:-2])
    year = int(date[2])
    chosenDate = datetime.date(year, month, day)
    return chosenDate


def getCurrentDate():
    tz = timezone('US/Eastern')
    dateReference = datetime.datetime.now(tz)
    currentDate = datetime.date(
        dateReference.year, dateReference.month, dateReference.day)
    return currentDate


def isDateHigher(date):
    chosenDate = getDate(date)
    currentDate = getCurrentDate()

    if chosenDate > currentDate:
        return "Date is higher"
    elif chosenDate == currentDate:
        return "Date is the same"
    else:
        return "Date is lower"


def turnInto24Hour(time):
    in_time = datetime.datetime.strptime(time, "%I:%M %p")
    out_time = datetime.datetime.strftime(in_time, "%H:%M")
    out_time = out_time.split(":")
    return out_time


def isTimeHigher(time, equal=False):
    tz = timezone('US/Eastern')
    time = turnInto24Hour(time)
    now = datetime.datetime.now(tz)
    chosen = now.replace(hour=int(time[0]), minute=int(time[1]))
    if equal == True:
        if chosen == now:
            return "Time is the same"
    if chosen >= now:
        return "Time is higher"
    else:
        return "Time is lower"


@app.route("/newEvent/<username>/<event>/<date>/<time>")
def createNewEvent(username, event, date, time):

    higherDate = isDateHigher(date)
    higherTime = isTimeHigher(time)

    if higherDate == "Date is higher" or higherDate == "Date is the same" and higherTime == "Time is higher":
        newEvent = {
            "username": username,
            "event": event,
            "date": date,
            "time": time
        }
        Events.insert_one(newEvent)
        return "success"
    elif higherDate == "Date is lower":
        return "The scheduled date of this event has already passed. Please try again."
    elif higherTime == "Time is lower":
        return "The scheduled time of this event must be ahead of the current time. Please try again."


@app.route("/todaySchedule/<username>")
def todaySchedule(username):
    userEvents = list(Events.find({"username": username}))

    todayEvents = []

    for event in userEvents:
        if getDate(event["date"]) == getCurrentDate():
            eventData = {
                "time": event["time"],
                "event": event["event"]
            }
            in24hour_time = turnInto24Hour(event["time"])[
                0] + ":" + turnInto24Hour(event["time"])[1]
            todayEvents.append([eventData, in24hour_time])

    todayEvents = sorted(todayEvents, key=lambda x: x[1])
    todayEvents = [event[0] for event in todayEvents]

    for event in todayEvents:
        if event["time"][0] == "0":
            event["time"] = event["time"][1:]

    return {
        "message": todayEvents
    }


@app.route("/allSchedule/<username>")
def allSchedule(username):
    userEvents = list(Events.find({"username": username}))

    allDates = []

    for event in userEvents:
        if event["date"] not in allDates:
            allDates.append(event["date"])

    refDates = []
    for event in userEvents:
        if event["date"] in allDates:
            allDates.remove(event["date"])
        event["_id"] = str(event["_id"])
        if event["time"][0] == "0":
            event["time"] = event["time"][1:]
        if event["date"] not in refDates:
            refDates.append(event["date"])

    total = []
    for date in refDates:
        allWithSameDate = [
            event for event in userEvents if event["date"] == date]
        total.append(allWithSameDate)
    total = sorted(total, key=lambda x: x[0]["date"])

    newOrder = []
    for each in total:
        each = sorted(each, key=lambda x: turnInto24Hour(x["time"]))
        newOrder.append(each)
    newOrder = [bruh for each in newOrder for bruh in each]

    dates = []
    for each in newOrder:
        if each["date"] not in dates:
            dates.append(each["date"])
        else:
            del each["date"]

    return {
        "message": newOrder
    }

    total = []

    each_date = []
    for i in range(len(userEvents)):
        each_date.append(userEvents[i])
        if i + 1 < len(userEvents):
            if "date" in userEvents[i + 1].keys():
                total.append(each_date)
                each_date = []
    if len(each_date) > 0:
        total.append(each_date)

    newOrder = []
    dateInOrder = sorted(total, key=lambda x: getDate(x[0]["date"]))
    for each in dateInOrder:
        each = sorted(each, key=lambda x: turnInto24Hour(x["time"]))
        newOrder.append(each)

    newOrder = [bruh for each in newOrder for bruh in each]

    return {
        "message": newOrder
    }


@app.route("/deleteEvent/<eventID>")
def deleteEvent(eventID):
    event = Events.find_one({"_id": ObjectId(eventID)})
    Events.delete_one(event)
    return "Done"


@app.route("/addToken/<username>/<token>")
def addToken(username, token):
    user = Users.find_one({"username": username})

    if "token" not in user.keys():
        newUser = {
            "username": user["username"],
            "password": user["password"],
            "token": token
        }
        Users.delete_one(user)
        Users.insert_one(newUser)

    return "done"


@app.route("/sendNotification")
def sendNotification():
    users = Users.find({})

    for user in users:

        events = Events.find({"username": user["username"]})

        for event in events:
            if getCurrentDate() == getDate(event["date"]):
                time = isTimeHigher(event["time"], True)
                if time == "Time is the same":

                    eventTime = event["time"]
                    if eventTime[0] == "0":
                        eventTime = eventTime[1:]

                    message = {
                        "to": user["token"],
                        "sound": "default",
                        "title": "You have an event scheduled at " + eventTime + ".",
                        "body": event["event"],
                    }
                    response = requests.post("https://exp.host/--/api/v2/push/send",
                                             data=message)
                    Events.delete_one(event)
                elif time == "Time is lower":
                    Events.delete_one(event)

    return "done"


if __name__ == "__main__":
    app.run(debug=True, threaded=True)
