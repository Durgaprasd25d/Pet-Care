import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Header } from '../../components/layout/Header';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { COLORS, SPACING, RADIUS } from '../../theme/theme';
import { useAdoptionStore } from '../../store/useAdoptionStore';
import { useAppStore } from '../../store/useAppStore';

export const AdoptionApplicationScreen = ({ route, navigation }: any) => {
  const { petId, petName } = route.params;
  const { submitRequest } = useAdoptionStore();
  const { user, token } = useAppStore();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    experience: '',
    reason: '',
  });

  const handleSubmit = async () => {
    if (!formData.phone || !formData.address || !formData.experience || !formData.reason) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await submitRequest({ petId, ...formData }, token!);
      navigation.navigate('ApplicationSuccess', { petName });
    } catch (error) {
       Alert.alert('Error', 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Header title="Adoption Application" onBackPress={() => navigation.goBack()} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.petInfoCard}>
            <Text style={styles.petName}>Applying for: {petName}</Text>
            <Text style={styles.petHint}>Please provide accurate information to help the shelter review your request.</Text>
          </View>

          <Input 
            label="Full Name" 
            placeholder="Your full name" 
            value={formData.fullName} 
            onChangeText={(v) => setFormData({...formData, fullName: v})}
          />
          <Input 
            label="Phone Number" 
            placeholder="Mobile number" 
            keyboardType="phone-pad"
            value={formData.phone} 
            onChangeText={(v) => setFormData({...formData, phone: v})}
          />
          <Input 
            label="Home Address" 
            placeholder="Complete address" 
            multiline
            numberOfLines={3}
            value={formData.address} 
            onChangeText={(v) => setFormData({...formData, address: v})}
          />
          <Input 
            label="Pet Experience" 
            placeholder="Have you had pets before? Tell us briefly." 
            multiline
            numberOfLines={4}
            value={formData.experience} 
            onChangeText={(v) => setFormData({...formData, experience: v})}
          />
          <Input 
            label="Why do you want to adopt?" 
            placeholder="Your reason for adoption" 
            multiline
            numberOfLines={4}
            value={formData.reason} 
            onChangeText={(v) => setFormData({...formData, reason: v})}
          />

          <Button 
            title="Submit Application" 
            onPress={handleSubmit} 
            loading={loading}
            style={styles.submitBtn}
          />
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: SPACING.md,
  },
  petInfoCard: {
    backgroundColor: COLORS.primary + '10',
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  petHint: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  submitBtn: {
    marginTop: SPACING.lg,
    borderRadius: RADIUS.lg,
  },
});
