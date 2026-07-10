import React from "react";
import { View, ActivityIndicator, Platform, StyleSheet } from "react-native";
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
import SplashScreen from "./src/screens/SplashScreen";

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
    return <SplashScreen />;
  }

  return <NavigationContainer>{user ? <AppStack /> : <AuthStack />}</NavigationContainer>;
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      {Platform.OS === "web" ? (
        // The UI (backgrounds, spacing, image assets) is designed for a
        // phone-shaped screen. On web, the browser window is much wider
        // and taller than a phone, which stretches/crops those assets
        // into hard edges instead of their intended curved, full-bleed
        // look. Constraining to a centered phone-shaped frame on web
        // makes every screen render at the aspect ratio it was actually
        // designed for, instead of patching each background individually.
        <View style={webStyles.page}>
          <View style={webStyles.phoneFrame}>
            <RootNavigator />
          </View>
        </View>
      ) : (
        <RootNavigator />
      )}
    </AuthProvider>
  );
}

const webStyles = StyleSheet.create({
  page: {
    flex: 1,
    minHeight: "100vh",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e9e3f5",
  },
  phoneFrame: {
    width: 430,
    height: "90vh",
    maxHeight: 900,
    borderRadius: 32,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
});