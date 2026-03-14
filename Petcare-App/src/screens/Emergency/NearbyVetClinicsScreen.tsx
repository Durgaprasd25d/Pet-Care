import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  Linking,
  Platform,
  Dimensions,
  Animated,
  PanResponder
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Header } from '../../components/layout/Header';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { dataService } from '../../services/dataService';
import { requestLocationPermission } from '../../utils/locationPermission';
import Geolocation from '@react-native-community/geolocation';
import { Vet } from '../../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_MIN_HEIGHT = 120;
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.75;
const SNAP_TOP = -(SHEET_MAX_HEIGHT - SHEET_MIN_HEIGHT);
const SNAP_BOTTOM = 0;

export const NearbyVetClinicsScreen = ({ navigation }: any) => {
  const mapRef = useRef<MapView>(null);
  const [vets, setVets] = useState<Vet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedVet, setSelectedVet] = useState<Vet | null>(null);
  const [resolvedCoords, setResolvedCoords] = useState<Record<string, { latitude: number; longitude: number }>>({});
  const [routeInfo, setRouteInfo] = useState<Record<string, { distance: string; duration: string }>>({});

  // Animation State
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dy < -50) {
          // Snap to TOP
          Animated.spring(pan, {
            toValue: { x: 0, y: SNAP_TOP },
            useNativeDriver: false,
          }).start();
        } else {
          // Snap to BOTTOM
          Animated.spring(pan, {
            toValue: { x: 0, y: SNAP_BOTTOM },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;
  
  const activeTargetVet = React.useMemo(() => {
    if (selectedVet) return selectedVet;
    if (!vets.length || !userLocation) return null;
    return vets[0];
  }, [vets, userLocation, selectedVet]);

  const fetchNearbyVets = async () => {
    setLoading(true);
    setError(null);
    
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setError('Location permission is required to find nearby clinics.');
      setLoading(false);
      return;
    }

    const getLocationAndFetch = (options: any) => {
      return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
        Geolocation.getCurrentPosition(
          (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
          (err) => reject(err),
          options
        );
      });
    };

    try {
      let coords;
      try {
        coords = await getLocationAndFetch({ enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 });
      } catch (err) {
        coords = await getLocationAndFetch({ enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 });
      }

      const data = await dataService.getNearbyVets(coords.lat, coords.lng);
      setVets(data);
      setUserLocation({ latitude: coords.lat, longitude: coords.lng });
    } catch (err: any) {
      setError('Unable to determine your location. Please check your GPS settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearbyVets();
  }, []);

  const handleStartNavigation = (vet: Vet) => {
    const lat = typeof vet.latitude === 'string' ? parseFloat(vet.latitude) : vet.latitude;
    const lng = typeof vet.longitude === 'string' ? parseFloat(vet.longitude) : vet.longitude;
    
    // Fallback to resolved coords if needed
    const destLat = lat || resolvedCoords[vet.id]?.latitude;
    const destLng = lng || resolvedCoords[vet.id]?.longitude;

    const url = Platform.select({
      ios: destLat ? `maps:0,0?q=${destLat},${destLng}` : `maps:0,0?q=${vet.address}`,
      android: destLat ? `google.navigation:q=${destLat},${destLng}` : `google.navigation:q=${vet.address}`,
    });

    if (url) {
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // Fallback to address URL if special scheme fails
          const fbUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(vet.address || '')}`;
          Linking.openURL(fbUrl);
        }
      });
    }
  };

  const fitToRoute = (result: any) => {
    if (mapRef.current && userLocation && activeTargetVet) {
      if (!activeTargetVet.latitude || !activeTargetVet.longitude) {
        const dest = result.coordinates[result.coordinates.length - 1];
        setResolvedCoords(prev => ({ ...prev, [activeTargetVet.id]: dest }));
      }

      setRouteInfo(prev => ({
        ...prev,
        [activeTargetVet.id]: {
          distance: `${result.distance.toFixed(1)} km`,
          duration: `${Math.ceil(result.duration)} mins`
        }
      }));

      mapRef.current.fitToCoordinates(result.coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 250, left: 50 },
        animated: true,
      });
    }
  };

  const selectVet = (vet: Vet) => {
    setSelectedVet(vet);
    const lat = typeof vet.latitude === 'string' ? parseFloat(vet.latitude) : vet.latitude;
    const lng = typeof vet.longitude === 'string' ? parseFloat(vet.longitude) : vet.longitude;
    const targetLat = lat || resolvedCoords[vet.id]?.latitude;
    const targetLng = lng || resolvedCoords[vet.id]?.longitude;

    if (targetLat && targetLng && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: targetLat,
        longitude: targetLng,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 1000);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Clinics" onBackPress={() => navigation.goBack()} transparent />
      
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        showsUserLocation={true}
        showsMyLocationButton={true}
        initialRegion={{
          latitude: userLocation?.latitude || 19.0760,
          longitude: userLocation?.longitude || 72.8777,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        mapPadding={{ top: 80, right: 10, bottom: 120, left: 10 }}
      >
        {vets.map(vet => {
          let lat = typeof vet.latitude === 'string' ? parseFloat(vet.latitude) : vet.latitude;
          let lng = typeof vet.longitude === 'string' ? parseFloat(vet.longitude) : vet.longitude;
          
          if ((lat == null || lng == null) && resolvedCoords[vet.id]) {
            lat = resolvedCoords[vet.id].latitude;
            lng = resolvedCoords[vet.id].longitude;
          }

          if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker
              key={`marker-${vet.id}`}
              coordinate={{ latitude: lat, longitude: lng }}
              onPress={() => selectVet(vet)}
            >
              <View style={[
                styles.vetMarker,
                selectedVet?.id === vet.id && styles.selectedMarker
              ]}>
                 <MaterialDesignIcons 
                  name="hospital-marker" 
                  size={20} 
                  color={selectedVet?.id === vet.id ? '#fff' : COLORS.error} 
                 />
              </View>
            </Marker>
          )
        })}

        {userLocation && activeTargetVet && (
          <MapViewDirections
            origin={userLocation}
            destination={(activeTargetVet.latitude && activeTargetVet.longitude) 
              ? { latitude: Number(activeTargetVet.latitude), longitude: Number(activeTargetVet.longitude) } 
              : activeTargetVet.address!}
            apikey="AIzaSyAt_3PK6WrDpx97Bw9QswjglLVWLZTVHhk"
            strokeWidth={4}
            strokeColor={COLORS.primary}
            onReady={fitToRoute}
          />
        )}
      </MapView>

      {/* DRAGGABLE BOTTOM SHEET */}
      <Animated.View 
        style={[
          styles.bottomSheet, 
          { transform: [{ translateY: pan.y }] }
        ]}
      >
        <View {...panResponder.panHandlers} style={styles.sheetHandleContainer}>
          <View style={styles.sheetHandle} />
        </View>

        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Nearby Clinics</Text>
          <View style={styles.liveIndicator}>
             <View style={styles.liveDot} />
             <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={styles.sheetScroll} 
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {loading ? (
             <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
          ) : vets.length > 0 ? (
            vets.map(vet => (
              <TouchableOpacity 
                key={vet.id} 
                style={[
                  styles.vetCard,
                  selectedVet?.id === vet.id && styles.selectedCard
                ]}
                onPress={() => selectVet(vet)}
                activeOpacity={0.9}
              >
                <View style={styles.cardMain}>
                  <View style={styles.clinicInfo}>
                    <Text style={styles.clinicName}>{vet.clinicName}</Text>
                    <View style={styles.metaRow}>
                      <Text style={styles.distanceText}>
                        {routeInfo[vet.id]?.distance || vet.distance || '...'}
                      </Text>
                      {routeInfo[vet.id] && (
                        <>
                          <View style={styles.dot} />
                          <Text style={styles.durationText}>{routeInfo[vet.id].duration}</Text>
                        </>
                      )}
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.startBtn}
                    onPress={() => handleStartNavigation(vet)}
                  >
                    <MaterialDesignIcons name="navigation" size={20} color="#fff" />
                    <Text style={styles.startBtnText}>START</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.addressBox}>
                  <MaterialDesignIcons name="map-marker-outline" size={14} color={COLORS.textLight} />
                  <Text style={styles.addressText} numberOfLines={1}>{vet.address}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>No emergency clinics found in your area.</Text>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  vetMarker: {
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.error,
    ...SHADOWS.small,
  },
  selectedMarker: {
    backgroundColor: COLORS.primary,
    borderColor: '#fff',
    transform: [{ scale: 1.2 }],
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -(SHEET_MAX_HEIGHT - SHEET_MIN_HEIGHT),
    height: SHEET_MAX_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...SHADOWS.large,
    elevation: 20,
  },
  sheetHandleContainer: {
    width: '100%',
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    justifyContent: 'space-between',
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.error,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.error,
  },
  sheetScroll: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  vetCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '05',
    borderWidth: 2,
  },
  cardMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clinicInfo: {
    flex: 1,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distanceText: {
    fontSize: 13,
    color: COLORS.error,
    fontWeight: '700',
  },
  durationText: {
    fontSize: 13,
    color: COLORS.success,
    fontWeight: '700',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#ADB5BD',
  },
  startBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    gap: 6,
    ...SHADOWS.small,
  },
  startBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 4,
  },
  addressText: {
    fontSize: 12,
    color: COLORS.textLight,
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textLight,
    marginTop: 20,
    fontSize: 14,
  }
});
