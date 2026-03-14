import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Image, RefreshControl, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Header } from '../../components/layout/Header';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { useAdoptionStore } from '../../store/useAdoptionStore';
import { useAppStore } from '../../store/useAppStore';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';

export const AdoptionStatusScreen = ({ navigation }: any) => {
  const { myRequests, fetchMyRequests, loading } = useAdoptionStore();
  const { token } = useAppStore();

  useEffect(() => {
    if (token) fetchMyRequests(token);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#059669';
      case 'rejected': return '#dc2626';
      default: return '#d97706';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'approved': return '#ecfdf5';
      case 'rejected': return '#fef2f2';
      default: return '#fffbeb';
    }
  };

  return (
    <ScreenContainer>
      <Header title="My Applications" onBackPress={() => navigation.goBack()} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => token && fetchMyRequests(token)} />}
      >
        {myRequests.length === 0 && !loading ? (
          <View style={styles.emptyState}>
             <MaterialDesignIcons name="file-search-outline" size={64} color={COLORS.border} />
             <Text style={styles.emptyTitle}>No Applications Yet</Text>
             <Text style={styles.emptyDesc}>Your adoption requests will appear here once you submit them.</Text>
             <TouchableOpacity 
               style={styles.browseBtn}
               onPress={() => navigation.navigate('AdoptionList')}
             >
               <Text style={styles.browseBtnText}>Browse Pets</Text>
             </TouchableOpacity>
          </View>
        ) : (
          myRequests.map((req) => (
            <View key={req.id} style={styles.requestCard}>
              <View style={styles.cardHeader}>
                <View style={styles.petBox}>
                  <Image source={{ uri: req.pet?.image }} style={styles.petImg} />
                  <View>
                    <Text style={styles.petName}>{req.pet?.name}</Text>
                    <Text style={styles.petBreed}>{req.pet?.breed}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusBg(req.status) }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(req.status) }]}>{req.status.toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <MaterialDesignIcons name="calendar" size={16} color={COLORS.textLight} />
                <Text style={styles.infoText}>Applied on {new Date(req.createdAt).toLocaleDateString()}</Text>
              </View>

              {req.shelterMessage && (
                <View style={styles.messageBox}>
                   <Text style={styles.messageTitle}>Message from Shelter:</Text>
                   <Text style={styles.messageText}>{req.shelterMessage}</Text>
                </View>
              )}

              {req.status === 'approved' && (
                <View style={styles.approvedAction}>
                   <MaterialDesignIcons name="star-circle" size={20} color="#059669" />
                   <Text style={styles.approvedText}>Congratulations! The shelter will contact you soon.</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  requestCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 16,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  petBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  petImg: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.background,
  },
  petName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  petBreed: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  messageBox: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: RADIUS.md,
    marginTop: 8,
  },
  messageTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: COLORS.text,
    fontStyle: 'italic',
  },
  approvedAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ecfdf5',
    padding: 12,
    borderRadius: RADIUS.md,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#10b98130',
  },
  approvedText: {
    fontSize: 13,
    color: '#059669',
    fontWeight: 'bold',
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  browseBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: RADIUS.xl,
  },
  browseBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
