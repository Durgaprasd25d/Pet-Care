import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Image, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { COLORS, SPACING, RADIUS, SHADOWS, wp, hp } from '../../theme/theme';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { dataService } from '../../services/dataService';

export const AdoptionDetailsScreen = ({ route, navigation }: any) => {
  const { adoptionId } = route.params;
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await dataService.getAdoptionPetById(adoptionId);
        setPet(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [adoptionId]);

  if (loading) {
    return (
      <ScreenContainer>
        <Header title="Loading..." onBackPress={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (!pet) {
    return (
      <ScreenContainer>
        <Header title="Error" onBackPress={() => navigation.goBack()} />
        <View style={styles.center}>
          <Text>Pet details not found.</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Header 
        title={pet.name} 
        onBackPress={() => navigation.goBack()} 
        transparent 
      />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Image source={{ uri: pet.image }} style={styles.headerImg} />
        
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.name}>{pet.name}</Text>
              <Text style={styles.breed}>{pet.breed} • {pet.age}</Text>
            </View>
            <View style={styles.genderBadge}>
              <MaterialDesignIcons 
                name={pet.gender === 'Male' ? 'gender-male' : 'gender-female'} 
                size={20} 
                color={pet.gender === 'Male' ? '#3b82f6' : '#ec4899'} 
              />
              <Text style={[styles.genderText, { color: pet.gender === 'Male' ? '#3b82f6' : '#ec4899' }]}>{pet.gender}</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>{pet.age}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Weight</Text>
              <Text style={styles.infoValue}>Healthy</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Type</Text>
              <Text style={styles.infoValue}>{pet.type}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>About {pet.name}</Text>
          <Text style={styles.description}>{pet.description}</Text>

          <Text style={styles.sectionTitle}>Health & Personality</Text>
          <View style={styles.specRow}>
            <MaterialDesignIcons name="heart-pulse" size={20} color={COLORS.primary} />
            <Text style={styles.specText}>{pet.healthStatus}</Text>
          </View>
          <View style={styles.specRow}>
            <MaterialDesignIcons name="shield-check" size={20} color={COLORS.primary} />
            <Text style={styles.specText}>{pet.vaccinationStatus}</Text>
          </View>
          {pet.personality && (
            <View style={styles.specRow}>
              <MaterialDesignIcons name="star" size={20} color={COLORS.primary} />
              <Text style={styles.specText}>{pet.personality}</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Shelter Information</Text>
          <View style={styles.shelterCard}>
            <Image source={{ uri: pet.shelter?.avatar || 'https://via.placeholder.com/150' }} style={styles.shelterImg} />
            <View style={{ flex: 1 }}>
              <Text style={styles.shelterName}>{pet.shelter?.clinicName || pet.shelter?.name}</Text>
              <Text style={styles.shelterLocation}>{pet.location || 'Bhubaneswar, India'}</Text>
            </View>
            <TouchableOpacity 
              style={styles.callBtn}
              onPress={() => pet.shelter?.phone && Linking.openURL(`tel:${pet.shelter.phone}`)}
            >
              <MaterialDesignIcons name="phone" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Apply for Adoption" 
          onPress={() => navigation.navigate('AdoptionApplication', { petId: pet.id, petName: pet.name })} 
          style={styles.applyBtn}
          textStyle={{ fontWeight: 'bold' }}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImg: {
    width: '100%',
    height: hp(45),
    backgroundColor: COLORS.background,
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    padding: SPACING.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  name: {
    fontSize: 28,
    fontFamily: 'Outfit-Bold',
    color: COLORS.text,
  },
  breed: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 2,
  },
  genderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    gap: 4,
  },
  genderText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  infoCard: {
    width: '30%',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Outfit-Bold',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textLight,
    marginBottom: SPACING.lg,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  specText: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  shelterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: RADIUS.xl,
    gap: 12,
    marginTop: SPACING.xs,
  },
  shelterImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.surface,
  },
  shelterName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  shelterLocation: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  applyBtn: {
    height: 54,
    borderRadius: RADIUS.xl,
    ...SHADOWS.medium,
  },
});
