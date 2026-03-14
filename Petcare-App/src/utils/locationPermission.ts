import { PermissionsAndroid, Platform, Alert } from 'react-native';

export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    // For iOS, the geolocation library handles this via requestAuthorization
    // which we will still call in the component for compatibility
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'Pet Care App needs access to your location for SOS alerts and finding nearby clinics.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );
    
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    } else {
      Alert.alert(
        'Permission Denied',
        'Location permission is required for this feature. Please enable it in settings.',
        [{ text: 'OK' }]
      );
      return false;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
};

export const checkLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    return true; // Simplified for this implementation
  }

  try {
    return await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
  } catch (err) {
    console.warn(err);
    return false;
  }
};
