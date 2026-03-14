import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Image, TouchableOpacity, Linking, Alert, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { useLostPetStore } from '../../store/useLostPetStore';
import { dataService } from '../../services/dataService';

export const LostPetDetailsScreen = ({ route, navigation }: any) => {
  const { itemId } = route.params;
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const details = await dataService.getLostPetById(itemId);
        setItem(details);
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to load report details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [itemId]);

  const handleCall = () => {
    const phone = item.contactInfo?.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('Not Available', 'No contact number provided.');
    }
  };

  if (loading) {
    return (
      <ScreenContainer>
        <Header title="Lost Pet Details" onBackPress={() => navigation.goBack()} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (!item) {
    return (
      <ScreenContainer>
        <Header title="Details" onBackPress={() => navigation.goBack()} />
        <View style={styles.centered}>
          <Text>Report not found.</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.image} />
          <View style={styles.headerControls}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <MaterialDesignIcons name="arrow-left" size={24} color={COLORS.surface} />
            </TouchableOpacity>
          </View>
          <View style={styles.badgeContainer}>
            <Badge label="LOST PET" variant="error" />
          </View>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.name}>{item.petName || 'Missing Pet'}</Text>
          <Text style={styles.subtext}>{item.breed} • {item.color}</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialDesignIcons name="map-marker" size={20} color={COLORS.error} style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>Last Seen Location</Text>
                <Text style={styles.infoValue}>{item.lastSeenLocation}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <MaterialDesignIcons name="calendar-clock" size={20} color={COLORS.error} style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>Date Lost</Text>
                <Text style={styles.infoValue}>{new Date(item.lastSeenDate).toLocaleDateString()}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Distinctive Features</Text>
          <Text style={styles.description}>{item.description}</Text>

          <Text style={styles.sectionTitle}>Reported By</Text>
          <View style={styles.contactCard}>
            <View style={styles.avatar}>
              <MaterialDesignIcons name="account" size={24} color={COLORS.surface} />
            </View>
            <View style={styles.contactDetails}>
              <Text style={styles.contactName}>{item.reportedBy?.name || 'Anonymous'}</Text>
              <Text style={styles.contactSub}>Pet Owner / Reporter</Text>
            </View>
            <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
              <MaterialDesignIcons name="phone" size={20} color={COLORS.surface} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="I Have Found This Pet" 
          onPress={handleCall} 
          color={COLORS.success}
          icon="heart"
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    width: '100%',
    height: 350,
    backgroundColor: COLORS.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  headerControls: {
    position: 'absolute',
    top: 40,
    left: SPACING.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    bottom: 20,
    left: SPACING.md,
  },
  contentContainer: {
    backgroundColor: COLORS.background,
    marginTop: -30,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
  },
  name: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  subtext: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 4,
    marginBottom: SPACING.xl,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border + '50',
    marginBottom: SPACING.xl,
    ...SHADOWS.small,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.error + '10',
    textAlign: 'center',
    lineHeight: 40,
    marginRight: SPACING.md,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border + '50',
    marginVertical: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: 15,
    color: COLORS.textLight,
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border + '50',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },
  contactSub: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  callBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  footer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
