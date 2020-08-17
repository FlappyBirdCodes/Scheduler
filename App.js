import React from "react";
import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Index } from "./index";
import { Login, SignUp } from "./UserAuthorization";
import { Homepage } from "./Homepage";
import { newEvent } from "./newEvent";
import { Schedule } from "./Schedule";
import { View } from "react-native";

const Stack = createStackNavigator();

export default function App() {
  if (2 + 2 == 4) {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Welcome" component={Index} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Sign Up" component={SignUp} />
          <Stack.Screen name="Homepage" component={Homepage} />
          <Stack.Screen name="New Event" component={newEvent} />
          <Stack.Screen name="Schedule" component={Schedule} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  } else {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Homepage" component={Homepage} />
          <Stack.Screen name="New Event" component={newEvent} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}
