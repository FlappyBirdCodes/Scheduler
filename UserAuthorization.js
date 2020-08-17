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

function tooShort(name, nameLength) {
  Alert.alert(
    "Error!",
    "Your " +
      name +
      " must be at least 8 characters. It is currently " +
      nameLength +
      " letters long."
  );
}

function LoadingScreen() {
  return (
    <View style={{ marginTop: 20 }}>
      <Text style={{ fontSize: 20 }}>Loading...</Text>
      <ActivityIndicator size="large" style={{ marginTop: 10 }} />
    </View>
  );
}

export class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      loading: false,
      buttonDisabled: false,
    };
    this.sendMessage = this.sendMessage.bind(this);
  }

  sendMessage = () => {
    this.setState({ buttonDisabled: true });
    let username = this.state.username.replace(/\s+/g, "");
    let password = this.state.password.replace(/\s+/g, "");

    if (username.length < 8) {
      tooShort("username", username.length);
    } else if (password.length < 8) {
      tooShort("password", password.length);
    } else {
      this.setState({ loading: true });
      return fetch(
        "https://scheduler-heroku-api.herokuapp.com/login/" +
          username +
          "/" +
          password
      )
        .then((response) => response.text())
        .then((message) => {
          if (message == "Exists") {
            this.props.navigation.reset({
              index: 0,
              routes: [
                {
                  name: "Homepage",
                  params: {
                    username: this.state.username,
                  },
                },
              ],
            });
          } else {
            Alert.alert(
              "Error!",
              "Your username or password was incorrect. Please try again."
            );
          }
          this.setState({ loading: false });
          setTimeout(() => {
            this.setState({ buttonDisabled: false });
          }, 50);
        });
    }
    this.setState({ buttonDisabled: false });
  };

  render() {
    return (
      <View style={userAuthenStyles.container}>
        <Text style={userAuthenStyles.title}>Login</Text>
        <View>
          <TextInput
            style={userAuthenStyles.input}
            placeholderTextColor="grey"
            placeholder="Username"
            onChangeText={(value) => this.setState({ username: value })}
          />
          <TextInput
            style={userAuthenStyles.input}
            placeholderTextColor="grey"
            placeholder="Password"
            secureTextEntry={true}
            onChangeText={(value) => this.setState({ password: value })}
          />
        </View>

        {this.state.buttonDisabled ? (
          <TouchableOpacity style={userAuthenStyles.submit}>
            <Text style={userAuthenStyles.actionText}>Login</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={userAuthenStyles.submit}
            onPress={this.sendMessage}
          >
            <Text style={userAuthenStyles.actionText}>Login</Text>
          </TouchableOpacity>
        )}

        <Text style={{ marginTop: 12 }}>
          New to Scheduler? Sign up{" "}
          <Text
            style={{ color: "blue" }}
            onPress={() => this.props.navigation.replace("Sign Up")}
          >
            here
          </Text>
          .
        </Text>
        {this.state.loading ? <LoadingScreen /> : null}
        <StatusBar style="auto" />
      </View>
    );
  }
}

export class SignUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      confirmPassword: "",
      loading: false,
      buttonDisabled: false,
    };
    this.sendMessage = this.sendMessage.bind(this);
  }

  sendMessage() {
    this.setState({ buttonDisabled: true });
    let username = this.state.username.replace(/\s+/g, "");
    let password = this.state.password.replace(/\s+/g, "");
    let confirmPassword = this.state.confirmPassword.replace(/\s+/g, "");
    if (username.length < 8) {
      tooShort("username", username.length);
    } else if (password.length < 8) {
      tooShort("password", password.length);
    } else if (password != confirmPassword) {
      Alert.alert("Error!", "Your password was not confirmed properly.");
    } else {
      this.setState({ loading: true });
      return fetch(
        "https://scheduler-heroku-api.herokuapp.com/signup/" +
          username +
          "/" +
          password
      )
        .then((response) => response.text())
        .then((message) => {
          if (message == "success") {
            this.props.navigation.navigate("Login");
          } else {
            Alert.alert("Error!", message);
          }
          this.setState({ loading: false });
          setTimeout(() => {
            this.setState({ buttonDisabled: false });
          }, 50);
        });
    }
    this.setState({ buttonDisabled: false });
  }

  render() {
    return (
      <View
        style={userAuthenStyles.container}
        style={{ flex: 1, backgroundColor: "whitesmoke", alignItems: "center" }}
      >
        <Text style={userAuthenStyles.title}>Sign Up</Text>
        <TextInput
          style={userAuthenStyles.input}
          placeholderTextColor="grey"
          placeholder="Username"
          onChangeText={(value) => this.setState({ username: value })}
        />
        <TextInput
          style={userAuthenStyles.input}
          placeholderTextColor="grey"
          placeholder="Password"
          secureTextEntry={true}
          onChangeText={(value) => this.setState({ password: value })}
        />
        <TextInput
          style={userAuthenStyles.input}
          placeholderTextColor="grey"
          placeholder="Confirm Password"
          secureTextEntry={true}
          onChangeText={(value) => this.setState({ confirmPassword: value })}
        />

        {this.state.buttonDisabled ? (
          <TouchableOpacity style={userAuthenStyles.submit}>
            <Text style={userAuthenStyles.actionText}>Sign Up</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={userAuthenStyles.submit}
            onPress={this.sendMessage}
          >
            <Text style={userAuthenStyles.actionText}>Sign Up</Text>
          </TouchableOpacity>
        )}

        <Text style={{ marginTop: 12 }}>
          Have an account already? Login{" "}
          <Text
            style={{ color: "blue" }}
            onPress={() => this.props.navigation.replace("Login")}
          >
            here
          </Text>
          .
        </Text>
        {this.state.loading ? <LoadingScreen /> : null}
        <StatusBar style="auto" />
      </View>
    );
  }
}

const userAuthenStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    textAlign: "center",
  },
  title: {
    fontSize: 40,
    fontFamily: "Times New Roman",
    marginTop: 100,
  },
  input: {
    height: 40,
    backgroundColor: "white",
    width: 285,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#8A8F9E",
    marginBottom: 10,
  },
  submit: {
    width: 285,
    height: 40,
    backgroundColor: "#3498DB",
    alignItems: "center",
    fontSize: 30,
    justifyContent: "center",
  },
  actionText: {
    color: "white",
    fontSize: 17,
  },
});
