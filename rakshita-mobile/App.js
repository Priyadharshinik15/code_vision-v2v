import React from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { colors } from "./src/theme/colors";

import LandingScreen from "./src/screens/LandingScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import LoginScreen from "./src/screens/LoginScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import ContactsScreen from "./src/screens/ContactsScreen";
import MapScreen from "./src/screens/MapScreen";
import ReportScreen from "./src/screens/ReportScreen";
import AdminScreen from "./src/screens/AdminScreen";
import KYCScreen from "./src/screens/KYCScreen";

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.cream }, headerShadowVisible: false, headerTintColor: colors.purple900 }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Contacts" component={ContactsScreen} options={{ title: "Emergency Contacts" }} />
      <Stack.Screen name="Map" component={MapScreen} options={{ title: "Safety Map" }} />
      <Stack.Screen name="Report" component={ReportScreen} options={{ title: "Report an Incident" }} />
      <Stack.Screen name="Admin" component={AdminScreen} options={{ title: "Admin Dashboard" }} />
      <Stack.Screen name="KYC" component={KYCScreen} options={{ title: "Aadhaar Verification" }} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.cream }}>
        <ActivityIndicator size="large" color={colors.purple500} />
      </View>
    );
  }

  return <NavigationContainer>{user ? <AppStack /> : <AuthStack />}</NavigationContainer>;
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </AuthProvider>
  );
}
