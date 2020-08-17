import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import * as Permissions from "expo-permissions";
import * as Notifications from "expo-notifications";
import * as Expo from "expo";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function loading() {
  return (
    <View style={{ marginTop: 6 }}>
      <Text style={{ fontSize: 20, textAlign: "center" }}>Loading...</Text>
      <ActivityIndicator size="large" style={{ marginTop: 10 }} />
    </View>
  );
}

export class Homepage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: null,
      nextNotification: null,
      todaySchedule: null,
      fetchingData: false,
    };
    this.getTodayEvents = this.getTodayEvents.bind(this);
  }

  getTodayEvents(username) {
    return fetch(
      "https://scheduler-heroku-api.herokuapp.com/todaySchedule/" + username
    )
      .then((response) => response.json())
      .then((json) => {
        this.setState({ fetchingData: true });
        if (json.message.length > 0) {
          this.setState({ nextNotification: [json.message[0]] });
          this.setState({ todaySchedule: json.message });
        } else {
          this.setState({ nextNotification: null });
          this.setState({ todaySchedule: null });
        }
      });
  }

  async register() {
    const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    if (status !== "granted") {
      //warningOnce();
      Alert.alert("asdfasdf");
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    } else {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      let { username } = this.props.route.params;
      console.log(username);
      console.log(token);
      return fetch(
        "https://scheduler-heroku-api.herokuapp.com/addToken/" +
          username +
          "/" +
          token
      );
    }
  }

  UNSAFE_componentWillMount() {
    this.register();
  }

  componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener("focus", () => {
      if (this.state.username) {
        this.getTodayEvents(this.state.username);
      } else {
        let { username } = this.props.route.params;
        this.setState({ username: username });
        this.getTodayEvents(username);
      }
    });
  }

  render() {
    let { username } = this.props.route.params;
    let nextNotification = null;
    let todaySchedule = null;

    if (this.state.fetchingData) {
      nextNotification = (
        <View>
          {this.state.nextNotification ? (
            <FlatList
              data={this.state.nextNotification}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={{ flexDirection: "row" }}>
                  <Text style={HomepageStyles.time}>{item.time}</Text>
                  <Text style={HomepageStyles.event}>{item.event}</Text>
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          ) : (
            <Text style={HomepageStyles.none}>
              No next notification for today.
            </Text>
          )}
        </View>
      );
      todaySchedule = (
        <View>
          {this.state.todaySchedule ? (
            <FlatList
              style={{ height: 250 }}
              data={this.state.todaySchedule}
              renderItem={({ item }) => (
                <View style={{ flexDirection: "row" }}>
                  <Text style={HomepageStyles.time}>{item.time}</Text>
                  <Text style={HomepageStyles.event}>{item.event}</Text>
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          ) : (
            <Text style={HomepageStyles.none}>
              You have no events scheduled today.
            </Text>
          )}
        </View>
      );
    } else {
      nextNotification = loading();
      todaySchedule = loading();
    }

    return (
      <View style={HomepageStyles.container}>
        <View style={{ marginTop: 20, marginHorizontal: 20 }}>
          <Text style={HomepageStyles.header}>Next Notification:</Text>
          {nextNotification}
        </View>
        <View style={{ marginTop: 20, marginHorizontal: 20 }}>
          <Text style={HomepageStyles.header}>Today's Schedule:</Text>
          {todaySchedule}
        </View>
        <TouchableOpacity
          style={HomepageStyles.button}
          onPress={() =>
            this.props.navigation.navigate("New Event", {
              username: username,
            })
          }
        >
          <Text style={{ color: "white", fontSize: 17 }}>
            Schedule a New Event
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={HomepageStyles.fullSchedule}
          onPress={() =>
            this.props.navigation.navigate("Schedule", {
              username: username,
            })
          }
        >
          <Text style={{ color: "white", fontSize: 17 }}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={HomepageStyles.logout}
          onPress={() => this.props.navigation.replace("Login")}
        >
          <Text style={{ color: "white", fontSize: 17 }}>Log Out</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const HomepageStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 5,
    marginLeft: 10,
  },
  time: {
    fontSize: 20,
    marginBottom: 8,
    marginLeft: 10,
    marginRight: 15,
    color: "blue",
    width: 90,
  },
  event: {
    fontSize: 20,
    marginBottom: 8,
    marginLeft: 10,
    marginRight: 15,
    width: 210,
  },
  button: {
    width: 285,
    height: 40,
    backgroundColor: "#3498DB",
    fontSize: 35,
    justifyContent: "center",
    alignSelf: "center",
    alignItems: "center",
    marginTop: 45,
  },
  fullSchedule: {
    width: 150,
    height: 40,
    backgroundColor: "#8FBC8F",
    fontSize: 40,
    justifyContent: "center",
    alignSelf: "flex-start",
    alignItems: "center",
    marginTop: 40,
    bottom: 20,
    position: "absolute",
    marginLeft: 26,
  },
  logout: {
    width: 150,
    height: 40,
    backgroundColor: "#ff726f",
    fontSize: 40,
    justifyContent: "center",
    alignSelf: "flex-start",
    alignItems: "center",
    marginTop: 40,
    bottom: 20,
    position: "absolute",
    marginLeft: 199,
  },
  none: {
    textAlign: "center",
    fontSize: 18,
    marginTop: 5,
  },
});
