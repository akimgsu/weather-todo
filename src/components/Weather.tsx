import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';

export default function Weather() {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState("Locating...");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    getLocationAndWeather();
  }, []);

  const getLocationAndWeather = async () => {
    try {
      // 1. Request user's location permission (shows popup on first launch)
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission is required to view weather!');
        setLoading(false);
        return;
      }

      // 2. Get current location (latitude, longitude)
      let location = await Location.getCurrentPositionAsync({});
      const latitude = location.coords.latitude;
      const longitude = location.coords.longitude;

      // 3. Reverse geocode latitude and longitude to get region name
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocode.length > 0) {
        // Extract region name (e.g., city or district). Default to "Current Location"
        setCity(geocode[0].city || geocode[0].district || geocode[0].region || "Current Location");
      }

      // 4. Fetch weather based on current location (Open-Meteo)
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
      
      if (!response.ok) throw new Error('Weather API communication error');
      
      const data = await response.json();
      setWeather(data.current_weather);
    } catch (error) {
      console.log('Error:', error);
      setErrorMsg('Unable to fetch location or weather data.');
    } finally {
      setLoading(false);
    }
  };

  // --- Render Screen ---
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#007BFF" />
        <Text style={styles.loadingText}>Fetching location and weather info...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {weather ? (
        <Text style={styles.weatherText}>
          📍 {city} Temp: {weather.temperature}℃
        </Text>
      ) : (
        <Text style={styles.errorText}>
          Unable to load weather information 😢
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#E3F2FD', // Cool light blue background
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  weatherText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1565C0',
  },
  errorText: {
    fontSize: 14,
    color: '#D32F2F',
  },
  loadingText: {
    marginTop: 10,
    color: '#1565C0',
    fontSize: 12,
  }
});
