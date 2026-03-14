import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Image, Platform, Alert, KeyboardAvoidingView } from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Header } from '../../components/layout/Header';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { COLORS, SPACING, RADIUS, SHADOWS, SIZES } from '../../theme/theme';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';

import { useLostPetStore } from '../../store/useLostPetStore';
import { useAppStore } from '../../store/useAppStore';

export const ReportFoundPetScreen = ({ navigation }: any) => {
  const { reportPet } = useLostPetStore();
  const { token } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    type: 'Dog',
    breed: '',
    color: '',
    location: '',
    date: new Date(),
    phone: '',
    description: '',
  });

  // Error State
  const [errors, setErrors] = useState<any>({});
  const [selectedImage, setSelectedImage] = useState<any>(null);

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.location.trim()) newErrors.location = 'Found location is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Contact phone is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleChange('date', selectedDate);
    }
  };

  const handleReport = async () => {
    if (!token) return;
    
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please correct the issues in the form.');
      return;
    }

    if (!selectedImage) {
      Alert.alert('Photo Required', 'Please upload a photo of the pet you found. It greatly helps owners identify their pet.');
      return;
    }

    setLoading(true);
    try {
      await reportPet({
        type: 'found',
        breed: formData.breed,
        color: formData.color,
        lastSeenLocation: formData.location,
        lastSeenDate: formData.date.toISOString(),
        description: formData.description,
        contactInfo: {
          phone: formData.phone,
          email: ''
        },
        image: selectedImage
      }, token);
      
      Alert.alert(
        'Thank You!', 
        'Your report has been submitted and shared with the community. You are doing a great thing!',
        [{ text: 'Back to Home', onPress: () => navigation.popToTop() }]
      );
    } catch (error: any) {
      Alert.alert('Submission Failed', error.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  const selectImage = async () => {
    const options: ImagePicker.ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: false,
      quality: 0.8,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Unknown error');
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        setSelectedImage({
          uri: Platform.OS === 'android' ? asset.uri : asset.uri?.replace('file://', ''),
          type: asset.type,
          name: asset.fileName || `found_pet_${Date.now()}.jpg`,
        });
      }
    });
  };

  const removeImage = () => setSelectedImage(null);

  const renderTypeSelector = (label: string, icon: string) => (
    <TouchableOpacity 
      style={[styles.typeSelector, formData.type === label && styles.typeSelectorActive]}
      onPress={() => handleChange('type', label)}
      activeOpacity={0.7}
    >
      <View style={[styles.typeIconContainer, formData.type === label && { backgroundColor: COLORS.success + '15' }]}>
        <MaterialDesignIcons 
          name={icon as any} 
          size={24} 
          color={formData.type === label ? COLORS.success : COLORS.textLight} 
        />
      </View>
      <Text style={[styles.typeText, formData.type === label && { color: COLORS.success, fontWeight: '800' }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
      <Header title="Report Found Pet" onBackPress={() => navigation.goBack()} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Media Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pet Photo</Text>
            <Text style={styles.sectionRequired}>*Required</Text>
          </View>
          
          <View style={styles.mediaContainer}>
            {selectedImage ? (
              <View style={styles.imageWrapper}>
                <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
                <TouchableOpacity style={styles.removeImageBtn} onPress={removeImage}>
                  <MaterialDesignIcons name="close" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadBox} onPress={selectImage} activeOpacity={0.6}>
                <View style={styles.uploadCircle}>
                  <MaterialDesignIcons name="camera-plus" size={32} color={COLORS.success} />
                </View>
                <Text style={styles.uploadTitle}>Snap a photo</Text>
                <Text style={styles.uploadSub}>Helps the owner find their pet</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Type Content */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pet Category</Text>
          </View>
          <View style={styles.typeRow}>
            {renderTypeSelector('Dog', 'dog')}
            {renderTypeSelector('Cat', 'cat')}
            {renderTypeSelector('Bird', 'bird')}
            {renderTypeSelector('Other', 'paw')}
          </View>

          {/* Details Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pet Appearance</Text>
          </View>
          <View style={styles.formContainer}>
            <Input 
              label="Apparent Breed" 
              value={formData.breed} 
              onChangeText={(v) => handleChange('breed', v)} 
              placeholder="e.g. Beagle, Persian, etc." 
              error={errors.breed}
              leftIcon="paw-outline"
            />
            <Input 
              label="Primary Color" 
              value={formData.color} 
              onChangeText={(v) => handleChange('color', v)} 
              placeholder="e.g. Golden, White & Black" 
              leftIcon="palette-outline"
            />
          </View>

          {/* Incident Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Discovery Info</Text>
          </View>
          <View style={styles.formContainer}>
            <Input 
              label="Where did you find it?" 
              value={formData.location} 
              onChangeText={(v) => handleChange('location', v)} 
              placeholder="Area, Street or Landmark" 
              leftIcon="map-marker-radius-outline" 
              error={errors.location}
            />
            
            <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={1}>
              <View pointerEvents="none">
                <Input 
                  label="Date Found" 
                  value={formData.date.toLocaleDateString()} 
                  editable={false}
                  placeholder="Select Date" 
                  leftIcon="calendar-clock-outline" 
                />
              </View>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={formData.date}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}

            <Input 
              label="Your Contact Phone" 
              value={formData.phone} 
              onChangeText={(v) => handleChange('phone', v)} 
              placeholder="Where can the owner reach you?" 
              leftIcon="phone-outline" 
              keyboardType="phone-pad"
              maxLength={15}
              error={errors.phone}
            />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Condition / Notes</Text>
          </View>
          <Input 
            label="Detailed Description"
            placeholder="Unique collar, health status, where exactly found..." 
            value={formData.description} 
            onChangeText={(v) => handleChange('description', v)} 
            multiline
            numberOfLines={4}
            containerStyle={styles.textAreaContainer}
            style={styles.textArea}
          />

          <Button 
            title="Submit Found Report" 
            onPress={handleReport} 
            style={styles.submitBtn}
            color={COLORS.success}
            loading={loading}
          />
          <Text style={styles.footerNote}>
            This report will be shared with the community. Thank you for helping out!
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  sectionRequired: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '600',
  },
  mediaContainer: {
    marginBottom: SPACING.lg,
  },
  uploadBox: {
    height: 160,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  uploadCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.success + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  uploadSub: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  imageWrapper: {
    height: 220,
    width: '100%',
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: SPACING.lg,
  },
  typeSelector: {
    flex: 1,
    alignItems: 'center',
  },
  typeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeSelectorActive: {
    borderColor: COLORS.success,
  },
  typeText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  textAreaContainer: {
    marginBottom: SPACING.xl,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitBtn: {
    marginTop: SPACING.xxl,
    height: 60,
    borderRadius: RADIUS.xl,
    ...SHADOWS.medium,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: SPACING.md,
    lineHeight: 18,
    paddingHorizontal: SPACING.xl,
  },
});
