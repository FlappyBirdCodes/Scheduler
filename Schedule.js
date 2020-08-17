import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";

export class Schedule extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: null,
      nothingScheduled: null,
    };
    this.getEvents = this.getEvents.bind(this);
    this.deleteEvent = this.deleteEvent.bind(this);
  }

  getEvents(username) {
    return fetch(
      "https://scheduler-heroku-api.herokuapp.com/allSchedule/" + username
    )
      .then((response) => response.json())
      .then((json) => {
        this.setState({ events: json.message });
        if (json.message.length > 0) {
          this.setState({ nothingScheduled: false });
        } else {
          this.setState({ nothingScheduled: true });
        }
      });
  }

  deleteEvent(id, username) {
    Alert.alert("Your event has been deleted.");
    return fetch(
      "https://scheduler-heroku-api.herokuapp.com/deleteEvent/" + id
    ).then(() => {
      this.getEvents(username);
    });
  }

  componentDidMount() {
    let { username } = this.props.route.params;
    this.getEvents(username);
  }

  render() {
    let { username } = this.props.route.params;
    if (this.state.nothingScheduled == null) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignSelf: "center" }}
        >
          <Text style={{ fontSize: 20 }}>Loading...</Text>
          <ActivityIndicator size="large" style={{ marginTop: 10 }} />
        </View>
      );
    }

    if (!this.state.nothingScheduled) {
      return (
        <FlatList
          style={ScheduleStyles.container}
          data={this.state.events}
          renderItem={({ item }) => (
            <View>
              {item.date ? (
                <Text style={ScheduleStyles.header}>{item.date}</Text>
              ) : null}
              <View style={{ flexDirection: "row" }}>
                <Text style={ScheduleStyles.time}>{item.time}</Text>
                <Text style={ScheduleStyles.event}>{item.event}</Text>

                <TouchableOpacity
                  onPress={() => this.deleteEvent(item._id, item.username)}
                >
                  <Image
                    style={{
                      width: 50,
                      height: 50,
                    }}
                    source={{
                      uri:
                        "https://cdn4.iconfinder.com/data/icons/controls-add-on-flat/48/Contols_-_Add_On-35-512.png",
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      );
    } else if (this.state.nothingScheduled) {
      return (
        <View>
          <Text style={{ fontSize: 32, textAlign: "center", marginTop: 40 }}>
            You have no events scheduled.
          </Text>
          <TouchableOpacity
            style={ScheduleStyles.button}
            onPress={() =>
              this.props.navigation.replace("New Event", {
                username: username,
              })
            }
          >
            <Text style={{ color: "white", fontSize: 17 }}>
              Schedule a New Event
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
  }
}

const ScheduleStyles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    marginLeft: 20,
  },
  header: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 5,
    marginLeft: 10,
    marginTop: 20,
  },
  time: {
    fontSize: 20,
    marginBottom: 8,
    marginLeft: 10,
    marginRight: 4,
    width: 100,
    paddingTop: 10,
    color: "blue",
  },
  event: {
    fontSize: 20,
    marginBottom: 8,
    width: 175,
    marginTop: 10,
    marginRight: 8,
  },
  button: {
    width: 285,
    height: 40,
    backgroundColor: "#3498DB",
    fontSize: 35,
    justifyContent: "center",
    alignSelf: "center",
    alignItems: "center",
    marginTop: 20,
  },
});
