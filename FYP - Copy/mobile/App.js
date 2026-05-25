import React, { useMemo, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import DashboardScreen from "./screens/DashboardScreen";
import AlertsScreen from "./screens/AlertsScreen";
import PlansScreen from "./screens/PlansScreen";

const Stack = createNativeStackNavigator();
export const AuthContext = React.createContext();

export default function App() {
  const [authState, setAuthState] = useState({ token: null, user: null });

  const authContext = useMemo(
    () => ({
      signIn: (data) => setAuthState(data),
      signOut: () => setAuthState({ token: null, user: null }),
      authState,
    }),
    [authState]
  );

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {authState.token ? (
            <>
              <Stack.Screen name="Dashboard" component={DashboardScreen} />
              <Stack.Screen name="Alerts" component={AlertsScreen} />
              <Stack.Screen name="Plans" component={PlansScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Plans" component={PlansScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
