import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Header } from '../../components/layout/Header';
import { Avatar } from '../../components/ui/Avatar';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { useAppStore } from '../../store/useAppStore';
import { dataService } from '../../services/dataService';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import LinearGradient from 'react-native-linear-gradient';

export const EditProfileScreen = ({ navigation }: any) => {
  const { user, setUser, token } = useAppStore();
  
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [avatar, setAvatar] = useState<any>(user?.avatar ? { uri: user.avatar } : null);
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.assets && result.assets[0]) {
      setAvatar(result.assets[0]);
    }
  };

  const handleSave = async () => {
    if (!user || !token) return;

    setLoading(true);
    try {
      const updateData: any = {
        name,
        phone,
        location,
      };

      if (avatar && avatar.uri && avatar.uri !== user.avatar) {
        updateData.avatar = avatar;
      }

      const updatedUser = await dataService.updateUserProfile(updateData, token);
      setUser(updatedUser);
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Header title="Edit Profile" onBackPress={() => navigation.goBack()} transparent />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[COLORS.primary, '#10b981']}
          style={styles.gradientHeader}
        />
        
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarWrapper} onPress={handlePickImage}>
            <Avatar source={avatar?.uri ? { uri: avatar.uri } : (typeof avatar === 'number' ? avatar : undefined)} size={110} />
            <TouchableOpacity style={styles.cameraButton} onPress={handlePickImage}>
              <MaterialDesignIcons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </TouchableOpacity>
          <Text style={styles.infoText}>Tap to update photo</Text>
        </View>

        <View style={styles.formContainer}>
          <Input
            label="Full Name"
            value={name}
            onChangeText={setName}
            leftIcon="account-outline"
          />
          <Input
            label="Email Address"
            value={user?.email || ''}
            editable={false}
            leftIcon="email-outline"
          />
          <Input
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            leftIcon="phone-outline"
            keyboardType="phone-pad"
          />
          <Input
            label="Location"
            value={location}
            onChangeText={setLocation}
            leftIcon="map-marker-outline"
          />

          <Button 
            title="Save Changes" 
            onPress={handleSave} 
            style={styles.saveButton}
            loading={loading}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xl,
  },
  gradientHeader: {
    height: 120,
    width: '100%',
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: -55,
    marginBottom: SPACING.xl,
  },
  avatarWrapper: {
    position: 'relative',
    ...SHADOWS.large,
    backgroundColor: '#fff',
    borderRadius: RADIUS.round,
    padding: 6,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: COLORS.secondary,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 10,
    fontWeight: '600',
  },
  formContainer: {
    paddingHorizontal: SPACING.lg,
    width: '100%',
  },
  saveButton: {
    marginTop: SPACING.xl,
  },
});
