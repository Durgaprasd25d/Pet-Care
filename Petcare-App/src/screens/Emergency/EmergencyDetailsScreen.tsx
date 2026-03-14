import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  Image, 
  Linking,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Header } from '../../components/layout/Header';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import { usePetStore } from '../../store/usePetStore';
import { Emergency, Pet, Vet } from '../../types';
import { dataService } from '../../services/dataService';

export const EmergencyDetailsScreen = ({ route, navigation }: any) => {
  const { emergencyId } = route.params;
  const { emergencies } = useEmergencyStore();
  const { pets } = usePetStore();
  
  const [emergency, setEmergency] = useState<Emergency | null>(
    emergencies.find(e => e.id === emergencyId) || null
  );
  const [assignedVet, setAssignedVet] = useState<Vet | null>(null);
  const [loading, setLoading] = useState(false);

  const pet = pets.find(p => p.id === emergency?.petId);

  useEffect(() => {
    if (emergency?.assignedVetId && typeof emergency.assignedVetId === 'string') {
        const fetchVet = async () => {
            try {
                const vetData = await dataService.getVetById(emergency.assignedVetId as string);
                setAssignedVet(vetData);
            } catch (err) {
                console.error("Failed to fetch assigned vet", err);
            }
        };
        fetchVet();
    }
  }, [emergency?.assignedVetId]);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const getStatusStep = () => {
    switch (emergency?.status) {
      case 'pending': return 1;
      case 'accepted': return 2;
      case 'resolved': return 3;
      default: return 1;
    }
  };

  const currentStep = getStatusStep();

  return (
    <ScreenContainer>
      <Header title="Active SOS" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Progress Tracker */}
        <View style={styles.trackerCard}>
          <View style={styles.trackerHeader}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE TRACKING</Text>
            </View>
            <Text style={styles.timeText}>Triggered at {new Date(emergency?.createdAt || "").toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>

          <View style={styles.stepsRow}>
            <View style={styles.stepItem}>
              <View style={[styles.stepDot, currentStep >= 1 && styles.activeStepDot]}>
                <MaterialDesignIcons name="broadcast" size={16} color={currentStep >= 1 ? "#fff" : COLORS.textLight} />
              </View>
              <Text style={[styles.stepLabel, currentStep >= 1 && styles.activeStepLabel]}>SOS Sent</Text>
            </View>
            <View style={[styles.stepLine, currentStep >= 2 && styles.activeStepLine]} />
            <View style={styles.stepItem}>
              <View style={[styles.stepDot, currentStep >= 2 && styles.activeStepDot]}>
                <MaterialDesignIcons name="account-clock" size={16} color={currentStep >= 2 ? "#fff" : COLORS.textLight} />
              </View>
              <Text style={[styles.stepLabel, currentStep >= 2 && styles.activeStepLabel]}>Responding</Text>
            </View>
            <View style={[styles.stepLine, currentStep >= 3 && styles.activeStepLine]} />
            <View style={styles.stepItem}>
              <View style={[styles.stepDot, currentStep >= 3 && styles.activeStepDot]}>
                <MaterialDesignIcons name="check-bold" size={16} color={currentStep >= 3 ? "#fff" : COLORS.textLight} />
              </View>
              <Text style={[styles.stepLabel, currentStep >= 3 && styles.activeStepLabel]}>Help Arrived</Text>
            </View>
          </View>
        </View>

        {/* Live Map Tracking */}
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: emergency?.location?.latitude || emergency?.latitude || 19.0760,
              longitude: emergency?.location?.longitude || emergency?.longitude || 72.8777,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {/* User Marker */}
            {(emergency?.location?.latitude || emergency?.latitude) && 
             (emergency?.location?.longitude || emergency?.longitude) && (
              <Marker
                coordinate={{ 
                  latitude: emergency?.location?.latitude || emergency!.latitude!, 
                  longitude: emergency?.location?.longitude || emergency!.longitude! 
                }}
                title="Your Location"
                description="Emergency SOS Location"
                pinColor={COLORS.error}
              >
                <View style={styles.userMarkerContainer}>
                   <MaterialDesignIcons name="account-alert" size={24} color={COLORS.error} />
                </View>
              </Marker>
            )}

            {/* Vet Marker & Routing */}
            {emergency?.status === 'accepted' && assignedVet?.latitude && assignedVet?.longitude && (
              <>
                <Marker
                  coordinate={{ 
                    latitude: parseFloat(assignedVet.latitude as any), 
                    longitude: parseFloat(assignedVet.longitude as any) 
                  }}
                  title={assignedVet.name}
                  description={assignedVet.clinicName}
                >
                  <View style={styles.vetMarkerContainer}>
                     <MaterialDesignIcons name="hospital-marker" size={24} color={COLORS.primary} />
                  </View>
                </Marker>

                <MapViewDirections
                  origin={{ 
                    latitude: emergency?.location?.latitude || emergency!.latitude!, 
                    longitude: emergency?.location?.longitude || emergency!.longitude! 
                  }}
                  destination={{ 
                    latitude: parseFloat(assignedVet.latitude as any), 
                    longitude: parseFloat(assignedVet.longitude as any) 
                  }}
                  apikey="AIzaSyAt_3PK6WrDpx97Bw9QswjglLVWLZTVHhk"
                  strokeWidth={4}
                  strokeColor={COLORS.primary}
                  optimizeWaypoints={true}
                />
              </>
            )}
          </MapView>
        </View>

        {/* Assigned Responder Section */}
        {emergency?.status === 'accepted' && assignedVet ? (
          <View style={styles.vetCard}>
            <View style={styles.shieldIconContainer}>
               <MaterialDesignIcons name="shield-check" size={24} color={COLORS.success} />
            </View>
            <Text style={styles.sectionTitle}>Your Responder</Text>
            <View style={styles.vetInfo}>
              <View style={styles.vetAvatarContainer}>
                <Image source={{ uri: assignedVet.image }} style={styles.vetAvatar} />
              </View>
              <View style={styles.vetDetails}>
                <Text style={styles.vetName}>Dr. {assignedVet.name}</Text>
                <Text style={styles.clinicName}>{assignedVet.clinicName}</Text>
                <View style={styles.ratingRow}>
                   <MaterialDesignIcons name="star" size={14} color="#f59e0b" />
                   <Text style={styles.ratingText}>{assignedVet.rating} (Verified)</Text>
                </View>
              </View>
            </View>
            <View style={styles.vetActions}>
              <TouchableOpacity 
                style={styles.callHeroBtn}
                onPress={() => assignedVet.contactNumber && handleCall(assignedVet.contactNumber)}
              >
                <MaterialDesignIcons name="phone" size={24} color="#fff" />
                <Text style={styles.callHeroText}>Call Doctor Now</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.messageBtn}>
                <MaterialDesignIcons name="message-text" size={22} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.waitingCard}>
             <ActivityIndicator color={COLORS.error} size="large" />
             <Text style={styles.waitingTitle}>Broadcasting to nearby clinics...</Text>
             <Text style={styles.waitingDesc}>We've notified 8 veterinarians within 5km. Please stay where you are.</Text>
          </View>
        )}

        {/* Pet & Location Detail Cards */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailCard}>
             <View style={[styles.iconBox, { backgroundColor: '#fdf2f8' }]}>
               <MaterialDesignIcons name="paw" size={20} color="#db2777" />
             </View>
             <Text style={styles.detailLabel}>Patient</Text>
             <Text style={styles.detailValue}>{pet?.name || 'My Pet'}</Text>
          </View>
          <View style={styles.detailCard}>
             <View style={[styles.iconBox, { backgroundColor: '#f0f9ff' }]}>
               <MaterialDesignIcons name="map-marker" size={20} color="#0284c7" />
             </View>
             <Text style={styles.detailLabel}>Location</Text>
             <Text style={styles.detailValue} numberOfLines={1}>Active SOS Zone</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.hospitalListBtn}
          onPress={() => navigation.navigate('NearbyVetClinics')}
        >
          <MaterialDesignIcons name="hospital-building" size={22} color={COLORS.text} />
          <Text style={styles.hospitalListText}>View Other Nearby Clinics</Text>
          <MaterialDesignIcons name="chevron-right" size={24} color={COLORS.textLight} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cancelBtn}
          onLongPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>Hold to Cancel SOS</Text>
        </TouchableOpacity>

      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  trackerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  trackerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  liveBadge: {
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
  timeText: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
  },
  stepItem: {
    alignItems: 'center',
    width: 70,
  },
  stepDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeStepDot: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
    ...SHADOWS.small,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.border,
    marginBottom: 24,
    marginHorizontal: -10,
  },
  activeStepLine: {
    backgroundColor: COLORS.error,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  activeStepLabel: {
    color: COLORS.text,
  },
  vetCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xxl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.large,
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  shieldIconContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: SPACING.md,
  },
  vetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  vetAvatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: COLORS.success + '20',
    padding: 2,
  },
  vetAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  vetDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  vetName: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
  },
  clinicName: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '600',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#d97706',
    fontWeight: 'bold',
  },
  vetActions: {
    flexDirection: 'row',
    gap: 12,
  },
  callHeroBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    ...SHADOWS.medium,
  },
  callHeroText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageBtn: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  waitingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xxl,
    padding: 40,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  waitingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
  waitingDesc: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  detailCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 2,
  },
  hospitalListBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  hospitalListText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '600',
  },
  cancelBtn: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  mapContainer: {
    height: 250,
    width: '100%',
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  userMarkerContainer: {
    padding: 4,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.error,
  },
  vetMarkerContainer: {
    padding: 4,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
});
