import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

export const Index = ({ navigation }) => {
  return (
    <View
      style={homeStyles.container}
      style={{ flex: 1, backgroundColor: "whitesmoke", alignItems: "center" }}
    >
      <Text style={homeStyles.title}>Scheduler</Text>
      <Text style={homeStyles.description}>
        The #1 Way To Plan and Schedule Your Day
      </Text>
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity
          style={homeStyles.button}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={homeStyles.actionText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={homeStyles.button}
          onPress={() => navigation.navigate("Sign Up")}
        >
          <Text style={homeStyles.actionText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 50,
    marginTop: 120,
  },
  description: {
    fontSize: 20,
    fontFamily: "Times New Roman",
    width: 300,
    textAlign: "center",
  },
  button: {
    width: 120,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3498DB",
    textAlign: "center",
    marginTop: 12,
    marginRight: 3,
    marginLeft: 3,
  },
  actionText: {
    color: "white",
    fontSize: 20,
  },
});
