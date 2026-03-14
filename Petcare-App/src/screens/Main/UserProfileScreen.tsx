import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Platform,
  ImageBackground
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Avatar } from '../../components/ui/Avatar';
import { dataService } from '../../services/dataService';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, RADIUS, SHADOWS, SIZES } from '../../theme/theme';
import { useAppStore } from '../../store/useAppStore';
import { usePetStore } from '../../store/usePetStore';
import { useAppointmentStore } from '../../store/useAppointmentStore';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';

export const UserProfileScreen = ({ navigation }: any) => {
  const { user, logout, theme, setTheme, setUser, token } = useAppStore();
  const { pets } = usePetStore();
  const { appointments } = useAppointmentStore();

  const [isPushEnabled, setIsPushEnabled] = useState(true);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);

  const handleUpdateAvatar = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.assets && result.assets[0] && user && token) {
      setUpdatingAvatar(true);
      try {
        const updatedUser = await dataService.updateUserProfile(
          { avatar: result.assets[0] },
          token
        );
        setUser(updatedUser);
        Alert.alert('Success', 'Profile picture updated!');
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to update avatar');
      } finally {
        setUpdatingAvatar(false);
      }
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of PetCare?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: logout }
      ]
    );
  };

  const renderStat = (value: number | string, label: string, icon: string, color: string) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
        <MaterialDesignIcons name={icon as any} size={22} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const renderMenuItem = (
    icon: any,
    title: string,
    onPress: () => void,
    color = COLORS.text,
    rightElement?: React.ReactNode
  ) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIconContainer, { backgroundColor: color + '10' }]}>
        <MaterialDesignIcons name={icon as any} size={22} color={color} />
      </View>
      <Text style={[styles.menuText, { color: color === COLORS.error ? COLORS.error : COLORS.text }]}>{title}</Text>
      {rightElement ? rightElement : (
        <MaterialDesignIcons name="chevron-right" size={24} color={COLORS.textLight} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScreenContainer withSafeArea={false}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header with Backdrop */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={[COLORS.primary, '#10b981']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerBackdrop}
          >
            {/* Background Decorations */}
            <View style={styles.decorationCircle1} />
            <View style={styles.decorationCircle2} />

            <TouchableOpacity
              style={styles.editProfileGlassBtn}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <MaterialDesignIcons name="pencil" size={20} color="#fff" />
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <View style={styles.profileMeta}>
                <View style={styles.avatarWrapper}>
                  <Avatar
                    source={user?.avatar ? { uri: user.avatar } : undefined}
                    size={100}
                  />
                  <TouchableOpacity style={styles.cameraBtn} onPress={handleUpdateAvatar}>
                    <MaterialDesignIcons name="camera" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.name}>{user?.name || 'Pet Owner'}</Text>
                <Text style={styles.email}>{user?.email || 'owner@example.com'}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {renderStat(pets.length, 'Pets', 'paw', '#6366f1')}
          <View style={styles.statDivider} />
          {renderStat(appointments.filter(a => a.status === 'scheduled').length, 'Visits', 'calendar-check', '#f59e0b')}
        </View>

        <View style={styles.mainContent}>
          {/* Pet Quick Access */}
          {pets.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>My Family</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petsScroll}>
                {pets.map((pet) => (
                  <TouchableOpacity
                    key={pet.id}
                    style={styles.petChip}
                    onPress={() => navigation.navigate('PetProfile', { petId: pet.id })}
                  >
                    <Avatar
                      source={pet.image ? { uri: pet.image } : undefined}
                      size={44}
                    />
                    <Text style={styles.petChipName} numberOfLines={1}>{pet.name}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[styles.petChip, styles.addPetChip]}
                  onPress={() => navigation.navigate('AddPet')}
                >
                  <View style={styles.addPetIcon}>
                    <MaterialDesignIcons name="plus" size={24} color={COLORS.primary} />
                  </View>
                  <Text style={[styles.petChipName, { color: COLORS.primary }]}>Add</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Settings</Text>
            <View style={styles.card}>
              {renderMenuItem('account-outline', 'Personal Information', () => navigation.navigate('EditProfile'), COLORS.primary)}
              <View style={styles.divider} />
              {/* {renderMenuItem(
                'bell-outline',
                'Push Notifications',
                () => { },
                '#3b82f6',
                <Switch
                  value={isPushEnabled}
                  onValueChange={setIsPushEnabled}
                  trackColor={{ false: '#cbd5e1', true: COLORS.primary }}
                  thumbColor={Platform.OS === 'ios' ? '#fff' : (isPushEnabled ? '#fff' : '#f4f3f4')}
                />
              )}
              <View style={styles.divider} /> */}
              {renderMenuItem('shield-lock-outline', 'Privacy & Security', () => navigation.navigate('PrivacySecurity'), '#10b981')}
              <View style={styles.divider} />
              {renderMenuItem('package-variant-closed', 'My Orders', () => navigation.navigate('StoreTab', { screen: 'MyOrders' }), '#f43f5e')}
              {/* <View style={styles.divider} />
              {renderMenuItem('wallet-outline', 'Payments & Subscriptions', () => { }, '#3b82f6')} */}
            </View>
          </View>

          {/* Support Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support & Info</Text>
            <View style={styles.card}>
              {renderMenuItem('help-circle-outline', 'Help Center', () => navigation.navigate('HelpSupport'), '#8b5cf6')}
              <View style={styles.divider} />
              {/* {renderMenuItem('star-outline', 'Rate the App', () => { }, '#f59e0b')}
              <View style={styles.divider} /> */}
              {renderMenuItem('information-outline', 'About PetCare', () => navigation.navigate('AboutApp'), COLORS.textLight)}
            </View>
          </View>

          {/* Danger Zone */}
          <View style={[styles.section, { marginBottom: SPACING.xxl }]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLogout}
              style={styles.logoutButtonWrapper}
            >
              <LinearGradient
                colors={[COLORS.error, '#ff5252']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.logoutGradient}
              >
                <MaterialDesignIcons name="logout" size={22} color="#fff" />
                <Text style={styles.logoutBtnText}>Log Out</Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.versionText}>Version 1.2.0 (Build 42)</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  headerContainer: {
    height: 310,
    width: SIZES.width,
    overflow: 'hidden',
  },
  headerBackdrop: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  decorationCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decorationCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: 60,
    width: '100%',
  },
  profileMeta: {
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    ...SHADOWS.large,
    backgroundColor: '#fff',
    borderRadius: RADIUS.round,
    padding: 6,
    marginBottom: SPACING.md,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: COLORS.secondary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  name: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: SPACING.md,
    fontWeight: '500',
  },
  editProfileGlassBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    width: 44,
    height: 44,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    zIndex: 10,
    ...SHADOWS.small,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.lg,
    ...SHADOWS.medium,
    borderWidth: 1,
    borderColor: COLORS.border + '30',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: COLORS.border + '50',
    alignSelf: 'center',
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mainContent: {
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
    letterSpacing: -0.3,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    ...SHADOWS.small,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border + '30',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  menuIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border + '30',
    marginLeft: 66,
  },
  petsScroll: {
    marginHorizontal: -SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  petChip: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  petChipName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 6,
  },
  addPetChip: {
    justifyContent: 'center',
  },
  addPetIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    borderStyle: 'dashed',
  },
  versionText: {
    textAlign: 'center',
    color: COLORS.textLight,
    fontSize: 12,
    marginTop: SPACING.xl,
    fontWeight: '500',
  },
  logoutButtonWrapper: {
    ...SHADOWS.medium,
    shadowColor: COLORS.error,
    borderRadius: RADIUS.round,
    overflow: 'hidden',
    alignSelf: 'center',
    width: '70%',
    marginTop: SPACING.md,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm + 4,
    borderRadius: RADIUS.round,
    gap: 10,
  },
  logoutBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
