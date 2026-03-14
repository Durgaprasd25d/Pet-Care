import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text, TouchableOpacity, FlatList } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Header } from '../../components/layout/Header';
import { AdoptionCard } from '../../components/cards/AdoptionCard';
import { Input } from '../../components/ui/Input';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { useAdoptionStore } from '../../store/useAdoptionStore';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';

export const AdoptionListScreen = ({ route, navigation }: any) => {
  const initialFilter = route.params?.filter || '';
  const { adoptions, loading, fetchAdoptions } = useAdoptionStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState(initialFilter);

  useEffect(() => {
    fetchAdoptions({ type: selectedType });
  }, [selectedType]);

  const filteredPets = adoptions.filter((p: any) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.breed.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const types = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Other'];

  return (
    <ScreenContainer>
      <Header title="Find a Pet" onBackPress={() => navigation.goBack()} />
      
      <View style={styles.filterContainer}>
        <Input 
          placeholder="Search by name or breed..." 
          value={searchQuery} 
          onChangeText={setSearchQuery} 
          leftIcon="magnify"
          containerStyle={styles.searchInput}
        />
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.typeFilterList}
        >
          <TouchableOpacity 
            style={[styles.typeChip, !selectedType && styles.activeChip]}
            onPress={() => setSelectedType('')}
          >
            <Text style={[styles.typeText, !selectedType && styles.activeChipText]}>All</Text>
          </TouchableOpacity>
          {types.map(type => (
            <TouchableOpacity 
              key={type}
              style={[styles.typeChip, selectedType === type && styles.activeChip]}
              onPress={() => setSelectedType(type)}
            >
              <Text style={[styles.typeText, selectedType === type && styles.activeChipText]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => fetchAdoptions({ type: selectedType })} />}
      >
        {filteredPets.length === 0 && !loading ? (
          <View style={styles.emptyState}>
            <MaterialDesignIcons name="paw-off" size={64} color={COLORS.border} />
            <Text style={styles.emptyTitle}>No Pets Found</Text>
            <Text style={styles.emptyDesc}>Try adjusting your filters or search terms.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredPets.map((pet: any, index: number) => (
              <View key={pet.id} style={styles.gridItem}>
                <AdoptionCard 
                  adoption={pet} 
                  index={index}
                  onPress={() => navigation.navigate('AdoptionDetails', { adoptionId: pet.id })} 
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    backgroundColor: COLORS.surface,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInput: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  typeFilterList: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  typeChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  activeChipText: {
    color: '#fff',
  },
  scrollContent: {
    padding: SPACING.sm,
    flexGrow: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  gridItem: {
    width: '49%',
    marginBottom: SPACING.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
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
  },
});
