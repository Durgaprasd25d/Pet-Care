import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Button } from '../../components/ui/Button';
import { COLORS, SPACING, RADIUS } from '../../theme/theme';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';

export const ApplicationSuccessScreen = ({ route, navigation }: any) => {
  const { petName } = route.params;

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.iconBox}>
          <MaterialDesignIcons name="heart-circle" size={80} color={COLORS.primary} />
        </View>
        
        <Text style={styles.title}>Application Sent!</Text>
        <Text style={styles.message}>
          Your request to adopt <Text style={{fontWeight: 'bold', color: COLORS.text}}>{petName}</Text> has been submitted to the shelter.
        </Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What's Next?</Text>
          <View style={styles.step}>
            <MaterialDesignIcons name="eye-outline" size={20} color={COLORS.primary} />
            <Text style={styles.stepText}>The shelter will review your application.</Text>
          </View>
          <View style={styles.step}>
            <MaterialDesignIcons name="bell-outline" size={20} color={COLORS.primary} />
            <Text style={styles.stepText}>You will receive a notification of their decision.</Text>
          </View>
          <View style={styles.step}>
            <MaterialDesignIcons name="calendar-check" size={20} color={COLORS.primary} />
            <Text style={styles.stepText}>If approved, you can schedule a meeting.</Text>
          </View>
        </View>

        <Button 
          title="Track Application" 
          onPress={() => navigation.navigate('AdoptionStatus')} 
          style={styles.btn}
        />
        <Button 
          title="Back to Home" 
          onPress={() => navigation.navigate('AdoptionHome')} 
          variant="outline"
          style={styles.outlineBtn}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBox: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Outfit-Bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 40,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  stepText: {
    fontSize: 14,
    color: COLORS.textLight,
    flex: 1,
  },
  btn: {
    width: '100%',
    borderRadius: RADIUS.lg,
    marginBottom: 12,
  },
  outlineBtn: {
    width: '100%',
    borderRadius: RADIUS.lg,
    borderColor: COLORS.primary,
  }
});
