import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "react-native-modal-datetime-picker";
import moment from "moment";

let warningOnce = function warningOnce() {
  if (warningOnce.done) return;
  warningOnce.done = true;
  Alert.alert(
    "IMPORTANT!",
    "The following message will ask for your permission to send notifications to your device. Without this enabled, we will be unable to notify you when you have an event planned."
  );
};

function LoadingScreen() {
  return (
    <View style={{ marginTop: 10, alignItems: "center" }}>
      <Text style={{ fontSize: 20 }}>Loading...</Text>
      <ActivityIndicator size="large" style={{ marginTop: 10 }} />
    </View>
  );
}

export class newEvent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      event: "",
      date: null,
      time: null,
      notConfirmedDate: false,
      notConfirmedTime: false,
      loading: false,
      buttonDisabled: false,
    };
    this.createNewEvent = this.createNewEvent.bind(this);
  }

  createNewEvent() {
    this.setState({ buttonDisabled: true });
    let event = this.state.event.replace(/\s+/g, "");
    let { username } = this.props.route.params;
    if (
      this.state.date == null ||
      this.state.time == null ||
      event.length == 0
    ) {
      Alert.alert("Error!", "All fields must be filled out appropriately.");
    } else {
      this.setState({ loading: true });
      return fetch(
        "https://scheduler-heroku-api.herokuapp.com/newEvent/" +
          username +
          "/" +
          this.state.event +
          "/" +
          this.state.date +
          "/" +
          this.state.time
      )
        .then((response) => response.text())
        .then((message) => {
          if (message == "success") {
            this.setState({ event: "" });
            this.setState({ date: null });
            this.setState({ time: null });
            Alert.alert(
              "Success!",
              "Your event has been added to the schedule.",
              [
                {
                  text: "Cancel",
                  onPress: () =>
                    this.props.navigation.replace("Schedule", {
                      username: username,
                    }),
                },
              ]
            );
          } else {
            Alert.alert("Error!", message);
          }

          setTimeout(() => {
            this.setState({ buttonDisabled: false });
          }, 50);
          this.setState({ loading: false });
        });
    }
    this.setState({ loading: false });
    this.setState({ buttonDisabled: false });
  }

  render() {
    return (
      <View style={userAuthenStyles.container}>
        <Text style={userAuthenStyles.title}>Schedule an Event</Text>

        <Text style={userAuthenStyles.dateTime}>Event: </Text>
        <TextInput
          style={userAuthenStyles.input}
          placeholderTextColor="grey"
          placeholder="Your event"
          value={this.state.event}
          onChangeText={(value) => this.setState({ event: value })}
          ref={(ref) => {
            this.textInput = ref;
          }}
        />

        <Text style={userAuthenStyles.dateTime}>Date: {this.state.date}</Text>
        <TouchableOpacity
          style={userAuthenStyles.date}
          onPress={() =>
            this.setState({
              notConfirmedDate: true,
            })
          }
        >
          <Text style={userAuthenStyles.actionText}>Assign a Date</Text>
        </TouchableOpacity>

        <Text style={userAuthenStyles.dateTime}>Time: {this.state.time}</Text>
        <TouchableOpacity
          style={userAuthenStyles.time}
          onPress={() => this.setState({ notConfirmedTime: true })}
        >
          <Text style={userAuthenStyles.actionText}>Assign a Time</Text>
        </TouchableOpacity>

        {this.state.buttonDisabled ? (
          <View style={{ alignItems: "center", marginTop: 16 }}>
            <TouchableOpacity style={userAuthenStyles.submit}>
              <Text style={userAuthenStyles.actionText}>Create new event</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ alignItems: "center", marginTop: 16 }}>
            <TouchableOpacity
              style={userAuthenStyles.submit}
              onPress={this.createNewEvent}
            >
              <Text style={userAuthenStyles.actionText}>Create new event</Text>
            </TouchableOpacity>
          </View>
        )}

        {this.state.loading ? <LoadingScreen /> : null}

        <DateTimePicker
          isVisible={this.state.notConfirmedDate}
          onConfirm={(date) =>
            this.setState({
              notConfirmedDate: false,
              date: moment(date).format("MMMM Do YYYY"),
            })
          }
          onCancel={() => this.setState({ notConfirmedDate: false })}
          mode={"date"}
        />

        <DateTimePicker
          isVisible={this.state.notConfirmedTime}
          onConfirm={(time) =>
            this.setState({
              notConfirmedTime: false,
              time: moment(time).format("hh:mm A"),
            })
          }
          onCancel={() => this.setState({ notConfirmedTime: false })}
          mode={"time"}
        />

        <StatusBar style="auto" />
      </View>
    );
  }
}

const userAuthenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "whitesmoke",
  },
  title: {
    fontSize: 40,
    fontFamily: "Times New Roman",
    marginTop: 45,
    textAlign: "center",
    marginBottom: 20,
  },
  dateTime: {
    fontSize: 25,
    marginBottom: 5,
    marginLeft: 40,
    fontFamily: "Times New Roman",
  },
  input: {
    height: 40,
    backgroundColor: "white",
    width: 285,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#8A8F9E",
    marginBottom: 10,
    alignSelf: "center",
  },
  date: {
    width: 285,
    height: 40,
    backgroundColor: "#8FBC8F",
    alignItems: "center",
    fontSize: 30,
    justifyContent: "center",
    marginBottom: 16,
    marginTop: 4,
    alignSelf: "center",
  },
  time: {
    width: 285,
    height: 40,
    backgroundColor: "#ff726f",
    alignItems: "center",
    fontSize: 30,
    justifyContent: "center",
    marginBottom: 16,
    marginTop: 4,
    alignSelf: "center",
  },
  submit: {
    width: 285,
    height: 40,
    backgroundColor: "#3498DB",
    alignItems: "center",
    fontSize: 30,
    justifyContent: "center",
    marginBottom: 16,
    marginTop: 4,
    alignSelf: "center",
  },
  actionText: {
    color: "white",
    fontSize: 17,
  },
});
