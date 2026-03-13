import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Header } from '../../components/layout/Header';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { useHealthStore } from '../../store/useHealthStore';
import { useAppStore } from '../../store/useAppStore';

export const ReminderCenterScreen = ({ navigation }: any) => {
  const { token } = useAppStore();
  const { upcomingVaccinations, fetchUpcomingVaccinations, loading } = useHealthStore();

  useEffect(() => {
    if (token) {
      fetchUpcomingVaccinations(token);
    }
  }, [token]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <ScreenContainer>
      <Header title="Reminders" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
        ) : upcomingVaccinations.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialDesignIcons name="calendar-check-outline" size={64} color={COLORS.textLight + '40'} />
            <Text style={styles.emptyText}>No upcoming reminders found.</Text>
          </View>
        ) : (
          upcomingVaccinations.map((rem: any) => (
            <View key={rem.id} style={styles.reminderCard}>
              <View style={[styles.iconBox, { backgroundColor: COLORS.primary + '15' }]}>
                <MaterialDesignIcons name="needle" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.reminderInfo}>
                <Text style={styles.reminderTitle}>{rem.vaccineType}</Text>
                <Text style={styles.reminderSub}>
                  For: {rem.petId?.name || 'Pet'} • {formatDate(rem.nextDueDate)}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.actionBtn}
                onPress={() => navigation.navigate('VaccinationReminder')}
              >
                <MaterialDesignIcons name="chevron-right" size={24} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>
          ))
        )}

        <TouchableOpacity 
          style={styles.createBanner}
          onPress={() => navigation.navigate('VaccinationReminder')}
        >
          <MaterialDesignIcons name="bell-ring-outline" size={32} color={COLORS.surface} />
          <View style={{ marginLeft: SPACING.md }}>
            <Text style={styles.bannerTitle}>Vaccination Schedule</Text>
            <Text style={styles.bannerSub}>View full protection timeline</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: SPACING.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  emptyText: {
    marginTop: SPACING.md,
    color: COLORS.textLight,
    fontSize: 16,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  reminderSub: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  actionBtn: {
    padding: SPACING.xs,
  },
  createBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    marginTop: SPACING.lg,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
  bannerSub: {
    fontSize: 14,
    color: COLORS.surface + 'dd',
    marginTop: 2,
  },
});
