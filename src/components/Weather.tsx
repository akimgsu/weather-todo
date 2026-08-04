import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';

export default function Weather() {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState("Locating...");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isCelsius, setIsCelsius] = useState(true); // State to track temperature unit

  useEffect(() => {
    getLocationAndWeather();
  }, []);

  const getLocationAndWeather = async () => {
    try {
      // 1. Request user's location permission
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

  // Convert Celsius to Fahrenheit
  const getDisplayTemperature = () => {
    if (!weather) return '';
    const tempCelsius = weather.temperature;
    if (isCelsius) {
      return `${tempCelsius}℃`;
    } else {
      const tempFahrenheit = (tempCelsius * 1.8 + 32).toFixed(1);
      return `${tempFahrenheit}℉`;
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
        <View style={styles.weatherRow}>
          <Text style={styles.weatherText}>
            📍 {city} Temp: {getDisplayTemperature()}
          </Text>
          <TouchableOpacity 
            style={styles.toggleButton} 
            onPress={() => setIsCelsius(!isCelsius)}
          >
            <Text style={styles.toggleText}>
              Switch to {isCelsius ? '℉' : '℃'}
            </Text>
          </TouchableOpacity>
        </View>
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
    width: '100%',
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  weatherText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1565C0',
    flex: 1,
  },
  toggleButton: {
    backgroundColor: '#1565C0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 10,
  },
  toggleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
