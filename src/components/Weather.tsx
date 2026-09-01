import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { Feather } from '@expo/vector-icons';
import { colors } from '../constants/colors';

const { width } = Dimensions.get('window');

export default function Weather() {
  const [weather, setWeather] = useState<any>(null);
  const [city, setCity] = useState('Locating...');
  const [loading, setLoading] = useState(Platform.OS !== 'web');
  const [errorMsg, setErrorMsg] = useState<string | null>(
    Platform.OS === 'web' ? 'Tap to allow location for local weather.' : null
  );
  const [isCelsius, setIsCelsius] = useState(true);

  useEffect(() => {
    // Native: request on mount. Web: wait for a user tap (browsers often block silent prompts).
    if (Platform.OS !== 'web') {
      getLocationAndWeather();
    }
  }, []);

  const getLocationAndWeather = async () => {
    setLoading(true);
    setErrorMsg(null);
    setWeather(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg(
          Platform.OS === 'web'
            ? 'Location blocked. Click the lock/ⓘ next to the URL → allow Location, then retry.'
            : 'Location permission required.'
        );
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const latitude = location.coords.latitude;
      const longitude = location.coords.longitude;

      try {
        const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geocode.length > 0) {
          setCity(
            geocode[0].city || geocode[0].district || geocode[0].region || 'Current Location'
          );
        } else {
          setCity('Current Location');
        }
      } catch {
        setCity('Current Location');
      }

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      setWeather(data.current_weather);
      setErrorMsg(null);
    } catch (error) {
      console.log('Error:', error);
      setErrorMsg('Unable to fetch weather. Check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayTemperature = () => {
    if (!weather) return '';
    const tempCelsius = weather.temperature;
    if (isCelsius) return `${Math.round(tempCelsius)}`;
    return `${Math.round(tempCelsius * 1.8 + 32)}`;
  };

  const getWeatherIcon = (code: number): keyof typeof Feather.glyphMap => {
    if (code === 0 || code === 1) return 'sun';
    if (code === 2 || code === 3) return 'cloud';
    if (code >= 45 && code <= 48) return 'cloud';
    if (code >= 51 && code <= 67) return 'cloud-rain';
    if (code >= 71 && code <= 77) return 'cloud-snow';
    if (code >= 80 && code <= 82) return 'cloud-rain';
    if (code >= 95 && code <= 99) return 'cloud-lightning';
    return 'sun';
  };

  if (loading) {
    return (
      <View style={[styles.panel, styles.centerContent]}>
        <ActivityIndicator color={colors.weatherText} size="small" />
        <Text style={styles.loadingText}>Fetching weather…</Text>
      </View>
    );
  }

  if (errorMsg || !weather) {
    return (
      <View style={[styles.panel, styles.centerContent]}>
        <Feather name="map-pin" size={22} color={colors.weatherText} />
        <Text style={styles.errorText}>{errorMsg || 'No weather data'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={getLocationAndWeather} activeOpacity={0.85}>
          <Text style={styles.retryText}>Allow location</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={13} color={colors.weatherText} />
            <Text style={styles.cityText} numberOfLines={1}>
              {city}
            </Text>
          </View>
          <View style={styles.tempRow}>
            <Text style={styles.tempText}>{getDisplayTemperature()}</Text>
            <Text style={styles.degree}>°</Text>
            <Text style={styles.unitLabel}>{isCelsius ? 'C' : 'F'}</Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <Feather
            name={getWeatherIcon(weather.weathercode)}
            size={48}
            color={colors.white}
            style={styles.weatherIcon}
          />
          <View style={styles.unitToggle}>
            <TouchableOpacity
              style={[styles.unitChip, isCelsius && styles.unitChipActive]}
              onPress={() => setIsCelsius(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.unitChipText, isCelsius && styles.unitChipTextActive]}>°C</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitChip, !isCelsius && styles.unitChipActive]}
              onPress={() => setIsCelsius(false)}
              activeOpacity={0.8}
            >
              <Text style={[styles.unitChipText, !isCelsius && styles.unitChipTextActive]}>°F</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.weather,
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 22,
    marginBottom: 28,
    width: '100%',
    minHeight: 132,
    overflow: 'hidden',
    borderBottomWidth: 4,
    borderBottomColor: colors.weatherDeep,
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
    gap: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  cityText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.weatherText,
    maxWidth: width * 0.42,
    opacity: 0.9,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tempText: {
    fontSize: 64,
    fontWeight: '700',
    color: colors.white,
    lineHeight: 68,
    letterSpacing: -2.5,
  },
  degree: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.weatherText,
    marginTop: 6,
  },
  unitLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.weatherText,
    marginTop: 14,
    marginLeft: 2,
  },
  weatherIcon: {
    marginBottom: 2,
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: colors.weatherMist,
    borderRadius: 8,
    padding: 2,
  },
  unitChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  unitChipActive: {
    backgroundColor: colors.white,
  },
  unitChipText: {
    color: colors.weatherText,
    fontSize: 12,
    fontWeight: '700',
  },
  unitChipTextActive: {
    color: colors.weather,
  },
  errorText: {
    fontSize: 14,
    color: colors.weatherText,
    marginTop: 8,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 12,
    lineHeight: 20,
  },
  loadingText: {
    marginTop: 10,
    color: colors.weatherText,
    fontSize: 14,
    fontWeight: '500',
  },
  retryButton: {
    marginTop: 14,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: colors.weather,
    fontWeight: '700',
    fontSize: 14,
  },
});
