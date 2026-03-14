import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withDelay,
  Easing 
} from 'react-native-reanimated';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Header } from '../../components/layout/Header';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { useAppStore } from '../../store/useAppStore';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import { usePetStore } from '../../store/usePetStore';
import { CustomModal } from '../../components/ui/CustomModal';
import { requestLocationPermission } from '../../utils/locationPermission';
import Geolocation from '@react-native-community/geolocation';
import { Pet, Emergency } from '../../types';

export const EmergencySOSScreen = ({ navigation }: any) => {
  const { token } = useAppStore();
  const { pets, fetchPets } = usePetStore();
  const { triggerSOS, loading } = useEmergencyStore();
  
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [lastEmergency, setLastEmergency] = useState<Emergency | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  
  // Premium Animation Values
  const pulse1 = useSharedValue(1);
  const opacity1 = useSharedValue(0.6);
  const pulse2 = useSharedValue(1);
  const opacity2 = useSharedValue(0.6);
  const pulse3 = useSharedValue(1);
  const opacity3 = useSharedValue(0.6);

  useEffect(() => {
    // Request location permissions on mount safely
    if (Geolocation && typeof Geolocation.requestAuthorization === 'function') {
      Geolocation.requestAuthorization();
    }

    if (token) {
      fetchPets(token);
    }
    
    const duration = 2500;
    
    pulse1.value = withRepeat(
      withTiming(2.2, { duration, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
      -1,
      false
    );
    opacity1.value = withRepeat(
      withTiming(0, { duration, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
      -1,
      false
    );

    pulse2.value = withDelay(800, withRepeat(
      withTiming(2.2, { duration, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
      -1,
      false
    ));
    opacity2.value = withDelay(800, withRepeat(
      withTiming(0, { duration, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
      -1,
      false
    ));

    pulse3.value = withDelay(1600, withRepeat(
      withTiming(2.2, { duration, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
      -1,
      false
    ));
    opacity3.value = withDelay(1600, withRepeat(
      withTiming(0, { duration, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
      -1,
      false
    ));
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: pulse1.value }],
    opacity: opacity1.value,
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: pulse2.value }],
    opacity: opacity2.value,
  }));

  const animatedStyle3 = useAnimatedStyle(() => ({
    transform: [{ scale: pulse3.value }],
    opacity: opacity3.value,
  }));
  
  const handleSOSPress = () => {
    if (!token) return;
    if (!selectedPet && pets.length > 0) {
      Alert.alert("Select a Pet", "Please select which pet needs immediate assistance.");
      return;
    }
    setModalVisible(true);
  };

  const confirmSOS = async () => {
    setModalVisible(false);
    
    // Check/Request permission before getting location
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;
    
    if (!Geolocation || typeof Geolocation.getCurrentPosition !== 'function') {
      Alert.alert(
        "Location Error",
        "Geolocation service is not available. Please ensure the app has necessary permissions.",
        [{ text: "OK" }]
      );
      return;
    }

    setIsLocating(true);

    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        const sosData = {
          latitude,
          longitude,
          address: "Detected via GPS Location",
          petId: selectedPet?.id,
          description: `EMERGENCY ALERT: ${selectedPet?.name || 'A pet'} requires immediate medical attention.`,
          emergencyType: "Critical"
        };

        const result = await triggerSOS(sosData, token as string);
        setIsLocating(false);
        if (result) {
          setLastEmergency(result);
          setSuccessModalVisible(true);
        }
      },
      (error) => {
        console.warn('High accuracy location failed, retrying with lower accuracy...', error);
        
        // Retry with lower accuracy if high accuracy fails (common on emulators/indoor)
        Geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const sosData = {
              latitude,
              longitude,
              address: "Detected via Network Location",
              petId: selectedPet?.id,
              description: `EMERGENCY ALERT: ${selectedPet?.name || 'A pet'} requires medical attention (approx location).`,
              emergencyType: "Critical"
            };

            const result = await triggerSOS(sosData, token as string);
            setIsLocating(false);
            if (result) {
              setLastEmergency(result);
              setSuccessModalVisible(true);
            }
          },
          (err) => {
            setIsLocating(false);
            let message = "Failed to get your location.";
            if (err.code === 1) message = "Location permission denied.";
            else if (err.code === 2) message = "Position unavailable. Please ensure GPS/Location is ON.";
            else if (err.code === 3) message = "Location request timed out. Try moving to an open area.";
            
            Alert.alert("Location Error", message, [{ text: "OK" }]);
            console.error(err);
          },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
        );
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 }
    );
  };

  return (
    <ScreenContainer>
      <Header title="Emergency SOS" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerInfo}>
          <Text style={styles.title}>Are you in an emergency?</Text>
          <Text style={styles.subtitle}>Help is just a tap away. Select your pet and trigger the SOS.</Text>
        </View>

        {/* Pet Selection */}
        {pets.length > 0 && (
          <View style={styles.petSelectorContainer}>
            <Text style={styles.selectorTitle}>Who needs help?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petList}>
              {pets.map(pet => (
                <TouchableOpacity 
                  key={pet.id} 
                  style={[
                    styles.petItem, 
                    selectedPet?.id === pet.id && styles.selectedPetItem
                  ]}
                  onPress={() => setSelectedPet(pet)}
                >
                  <View style={styles.avatarContainer}>
                    {pet.image ? (
                      <Image source={{ uri: pet.image }} style={styles.petAvatar} />
                    ) : (
                      <View style={styles.placeholderAvatar}>
                         <MaterialDesignIcons name="paw" size={24} color={COLORS.textLight} />
                      </View>
                    )}
                    {selectedPet?.id === pet.id && (
                      <View style={styles.checkBadge}>
                        <MaterialDesignIcons name="check" size={12} color="#fff" />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.petName, selectedPet?.id === pet.id && styles.selectedPetName]}>{pet.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.sosContainer}>
          <Animated.View style={[styles.pulseRing, animatedStyle1]} />
          <Animated.View style={[styles.pulseRing, animatedStyle2]} />
          <Animated.View style={[styles.pulseRing, animatedStyle3]} />
          
          <View style={styles.buttonShadow} />
          
          <TouchableOpacity 
            style={[styles.sosButton, (loading || isLocating) && { opacity: 0.7 }]} 
            onPress={handleSOSPress} 
            activeOpacity={0.8}
            disabled={loading || isLocating}
          >
            {(loading || isLocating) ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : (
              <View style={styles.innerButton}>
                <Text style={styles.sosText}>SOS</Text>
                <Text style={styles.tapText}>TRIGGER ALERT</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.warningBox}>
           <MaterialDesignIcons name="alert-decagram" size={24} color={COLORS.error} />
           <Text style={styles.warningText}>
             Triggering this alert will broadcast your location to nearest emergency clinics.
           </Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionCard} 
            onPress={() => navigation.navigate('NearbyVetClinics')}
          >
            <View style={[styles.iconBox, { backgroundColor: COLORS.error + '20' }]}>
              <MaterialDesignIcons name="hospital-marker" size={32} color={COLORS.error} />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Nearby Clinics</Text>
              <Text style={styles.actionDesc}>Locate 24/7 veterinary hospitals.</Text>
            </View>
            <MaterialDesignIcons name="chevron-right" size={24} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard} 
            onPress={() => navigation.navigate('EmergencyContact')}
          >
            <View style={[styles.iconBox, { backgroundColor: COLORS.primary + '20' }]}>
              <MaterialDesignIcons name="phone-plus" size={32} color={COLORS.primary} />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Emergency Contacts</Text>
              <Text style={styles.actionDesc}>Primary vet & poison control.</Text>
            </View>
            <MaterialDesignIcons name="chevron-right" size={24} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>

      </ScrollView>

      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={confirmSOS}
        title="Trigger Emergency Alert?"
        message={`This will notify all clinics near your location about the emergency for ${selectedPet?.name || 'your pet'}.`}
        confirmLabel="Confirm SOS"
        type="error"
        loading={loading}
      />

      <CustomModal
        visible={successModalVisible}
        onClose={() => {
          setSuccessModalVisible(false);
          if (lastEmergency?.id) {
            navigation.navigate('EmergencyDetails', { emergencyId: lastEmergency.id });
          } else {
            navigation.navigate('NearbyVetClinics');
          }
        }}
        title="SOS Broadcasted"
        message="Local emergency clinics have been alerted. We are fetching the fastest routes for you now."
        confirmLabel="Track Help"
        type="success"
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: SPACING.md,
    alignItems: 'center',
    paddingBottom: SPACING.xxl,
  },
  headerInfo: {
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.error,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
    lineHeight: 22,
  },
  petSelectorContainer: {
    width: '100%',
    marginVertical: SPACING.md,
  },
  selectorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: SPACING.xs,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  petList: {
    paddingHorizontal: SPACING.xs,
    gap: SPACING.md,
  },
  petItem: {
    alignItems: 'center',
    width: 80,
  },
  selectedPetItem: {
    transform: [{ scale: 1.05 }],
  },
  avatarContainer: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 2,
    marginBottom: 6,
  },
  petAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  placeholderAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  petName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  selectedPetName: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  sosContainer: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  pulseRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.error + '40',
  },
  buttonShadow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.error,
    opacity: 0.2,
    ...SHADOWS.large,
    shadowColor: COLORS.error,
    shadowRadius: 30,
    shadowOpacity: 0.8,
  },
  sosButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    elevation: 20,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  innerButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
    marginBottom: -4,
  },
  tapText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    opacity: 0.9,
    letterSpacing: 1,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '10',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginVertical: SPACING.lg,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.error + '20',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.error,
    fontWeight: '600',
    marginLeft: SPACING.sm,
    lineHeight: 18,
  },
  quickActions: {
    width: '100%',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 13,
    color: COLORS.textLight,
  },
});
