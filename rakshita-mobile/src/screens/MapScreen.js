import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { tokenStore, API_BASE_URL } from "../api/client";
import { colors } from "../theme/colors";

/**
 * Reuses Leaflet + OpenStreetMap inside a WebView rather than pulling in
 * react-native-maps + a Google/Apple Maps API key — this keeps the same
 * hotspot-map behavior as the web app with zero extra map-provider setup,
 * at the cost of it being a web view instead of a fully native map.
 * Swap to react-native-maps later if you want native map performance.
 */
export default function MapScreen() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    tokenStore.get().then(setToken);
  }, []);

  if (!token) return <View style={{ flex: 1, backgroundColor: colors.cream }} />;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css">
      <style>html,body,#map{height:100%;margin:0;padding:0;}</style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
      <script>
        const map = L.map('map').setView([20.5937, 78.9629], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        const colors = { harassment:'#f0888e', stalking:'#8b7bd8', unsafe_area:'#e7b96b', theft:'#6bb0e7', assault:'#d9534f', other:'#a78bfa' };

        fetch('${API_BASE_URL}/api/mobile/incidents', { headers: { Authorization: 'Bearer ${token}' } })
          .then(r => r.json())
          .then(data => {
            let centered = false;
            data.incidents.forEach(inc => {
              const marker = L.circleMarker([inc.latitude, inc.longitude], {
                radius: 8, color: colors[inc.category] || '#a78bfa',
                fillColor: colors[inc.category] || '#a78bfa', fillOpacity: 0.75, weight: 1
              }).addTo(map);
              marker.bindPopup(inc.category + '<br>' + new Date(inc.created_at).toLocaleString());
              if (!centered) { map.setView([inc.latitude, inc.longitude], 12); centered = true; }
            });
          });

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(pos => {
            map.setView([pos.coords.latitude, pos.coords.longitude], 13);
            L.marker([pos.coords.latitude, pos.coords.longitude]).addTo(map).bindPopup('You are here').openPopup();
          });
        }
      </script>
    </body>
    </html>
  `;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WebView originWhitelist={["*"]} source={{ html }} geolocationEnabled style={{ flex: 1 }} />
    </SafeAreaView>
  );
}
