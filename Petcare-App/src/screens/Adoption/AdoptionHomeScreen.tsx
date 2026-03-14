import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, ImageBackground, TouchableOpacity, Image, FlatList } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { COLORS, SPACING, RADIUS, SHADOWS, wp, hp } from '../../theme/theme';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { useAppStore } from '../../store/useAppStore';
import { useAdoptionStore } from '../../store/useAdoptionStore';

export const AdoptionHomeScreen = ({ navigation }: any) => {
  const { adoptions, fetchAdoptions, myRequests, fetchMyRequests } = useAdoptionStore();
  const { user, token } = useAppStore();

  useEffect(() => {
    fetchAdoptions();
    if (token) fetchMyRequests(token);
  }, []);

  const renderRecentPet = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.recentPetCard} 
      onPress={() => navigation.navigate('AdoptionDetails', { adoptionId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.recentPetImg} />
      <View style={styles.recentPetInfo}>
        <Text style={styles.recentPetName}>{item.name}</Text>
        <Text style={styles.recentPetBreed}>{item.breed}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
      <Header 
        title="Pet Adoption" 
        onBackPress={() => navigation.goBack()} 
        rightIcon="heart-outline"
        onRightPress={() => navigation.navigate('AdoptionStatus')}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <ImageBackground 
          source={{ uri: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800' }} 
          style={styles.heroBanner}
          imageStyle={{ borderRadius: RADIUS.xl }}
        >
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Find Your New Best Friend</Text>
            <Text style={styles.heroSubtitle}>Give a rescue pet a forever home today.</Text>
            {/* <Button 
              title="Browse All" 
              onPress={() => navigation.navigate('AdoptionList')} 
              style={styles.heroBtn}
              textStyle={{ color: COLORS.primary, fontWeight: 'bold' }}
            /> */}
          </View>
        </ImageBackground>

        {/* <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
        </View>
        <View style={styles.categoryRow}>
          {[
            { id: 'Dog', icon: 'dog', bg: '#fef3c7', color: '#d97706' },
            { id: 'Cat', icon: 'cat', bg: '#f3e8ff', color: '#9333ea' },
            { id: 'Bird', icon: 'bird', bg: '#dcfce7', color: '#16a34a' },
            { id: 'Other', icon: 'paw', bg: '#e0f2fe', color: '#0284c7' }
          ].map((cat) => (
            <TouchableOpacity 
              key={cat.id} 
              style={styles.categoryCard} 
              onPress={() => navigation.navigate('AdoptionList', { filter: cat.id })}
            >
              <View style={[styles.catIconBox, { backgroundColor: cat.bg }]}>
                <MaterialDesignIcons name={cat.icon as any} size={28} color={cat.color} />
              </View>
              <Text style={styles.catText}>{cat.id}</Text>
            </TouchableOpacity>
          ))}
        </View> */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recently Added</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AdoptionList')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList 
          data={adoptions.slice(0, 5)}
          renderItem={renderRecentPet}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.recentList}
        />

        {myRequests.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Applications</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AdoptionStatus')}>
                <Text style={styles.seeAll}>View Status</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={styles.statusBanner}
              onPress={() => navigation.navigate('AdoptionStatus')}
            >
              <View style={styles.statusIcon}>
                <MaterialDesignIcons name="file-document-outline" size={24} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.statusTitle}>Check your application status</Text>
                <Text style={styles.statusSubtitle}>You have {myRequests.length} active application{myRequests.length > 1 ? 's' : ''}</Text>
              </View>
              <MaterialDesignIcons name="chevron-right" size={24} color={COLORS.textLight} />
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: SPACING.md,
  },
  heroBanner: {
    width: '100%',
    height: 180,
    marginBottom: SPACING.lg,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  heroOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: SPACING.lg,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#eee',
    marginBottom: SPACING.md,
  },
  heroBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    paddingHorizontal: SPACING.lg,
    height: 38,
    borderRadius: RADIUS.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Outfit-Bold',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    marginTop: SPACING.xs,
  },
  categoryCard: {
    alignItems: 'center',
    width: '23%',
  },
  catIconBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...SHADOWS.small,
  },
  catText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  recentList: {
    paddingVertical: SPACING.sm,
  },
  recentPetCard: {
    width: 130,
    marginRight: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    ...SHADOWS.small,
    overflow: 'hidden',
  },
  recentPetImg: {
    width: '100%',
    height: 100,
    backgroundColor: COLORS.background,
  },
  recentPetInfo: {
    padding: 8,
  },
  recentPetName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  recentPetBreed: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    padding: 16,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    marginTop: SPACING.xs,
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    ...SHADOWS.small,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statusSubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
  },
});
