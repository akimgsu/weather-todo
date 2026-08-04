import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function Weather() {
  const [weather, setWeather] = useState<any>(null);
  const [city, setCity] = useState("Locating...");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCelsius, setIsCelsius] = useState(true);

  useEffect(() => {
    getLocationAndWeather();
  }, []);

  const getLocationAndWeather = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission required.');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const latitude = location.coords.latitude;
      const longitude = location.coords.longitude;

      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocode.length > 0) {
        setCity(geocode[0].city || geocode[0].district || geocode[0].region || "Current Location");
      }

      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
      
      if (!response.ok) throw new Error('API Error');
      
      const data = await response.json();
      setWeather(data.current_weather);
    } catch (error) {
      console.log('Error:', error);
      setErrorMsg('Unable to fetch weather.');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayTemperature = () => {
    if (!weather) return '';
    const tempCelsius = weather.temperature;
    if (isCelsius) {
      return `${Math.round(tempCelsius)}°`;
    } else {
      const tempFahrenheit = (tempCelsius * 1.8 + 32);
      return `${Math.round(tempFahrenheit)}°`;
    }
  };

  // Basic weather code mapping to Ionicons
  const getWeatherIcon = (code: number) => {
    if (code === 0 || code === 1) return 'sunny';
    if (code === 2 || code === 3) return 'partly-sunny';
    if (code >= 45 && code <= 48) return 'cloudy';
    if (code >= 51 && code <= 67) return 'rainy';
    if (code >= 71 && code <= 77) return 'snow';
    if (code >= 80 && code <= 82) return 'rainy';
    if (code >= 95 && code <= 99) return 'thunderstorm';
    return 'sunny';
  };

  if (loading) {
    return (
      <View style={[styles.card, styles.centerContent]}>
        <ActivityIndicator color="#4F46E5" size="small" />
        <Text style={styles.loadingText}>Fetching weather...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={[styles.card, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={24} color="#EF4444" />
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {weather ? (
        <View style={styles.content}>
          <View style={styles.leftSection}>
            <View style={styles.locationContainer}>
              <Ionicons name="location-sharp" size={16} color="#E0E7FF" style={styles.locationIcon} />
              <Text style={styles.cityText} numberOfLines={1}>{city}</Text>
            </View>
            <View style={styles.tempContainer}>
              <Text style={styles.tempText}>{getDisplayTemperature()}</Text>
              <Text style={styles.unitText}>{isCelsius ? 'C' : 'F'}</Text>
            </View>
          </View>

          <View style={styles.rightSection}>
            <Ionicons name={getWeatherIcon(weather.weathercode)} size={64} color="#FFFFFF" style={styles.weatherIcon} />
            <TouchableOpacity 
              style={styles.toggleButton} 
              onPress={() => setIsCelsius(!isCelsius)}
              activeOpacity={0.7}
            >
              <Text style={styles.toggleText}>
                Switch to {isCelsius ? '°F' : '°C'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text style={styles.errorText}>No data available</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#4F46E5', // Indigo-600
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    width: '100%',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    minHeight: 140,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flex: 1,
    justifyContent: 'center',
  },
  rightSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  locationIcon: {
    marginRight: 4,
  },
  cityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E0E7FF',
    maxWidth: width * 0.4,
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tempText: {
    fontSize: 64,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 72,
    letterSpacing: -2,
  },
  unitText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E0E7FF',
    marginTop: 8,
  },
  weatherIcon: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    marginBottom: 12,
  },
  toggleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  toggleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 14,
    color: '#FEE2E2',
    marginTop: 8,
    fontWeight: '500',
  },
  loadingText: {
    marginTop: 12,
    color: '#E0E7FF',
    fontSize: 14,
    fontWeight: '500',
  }
});
