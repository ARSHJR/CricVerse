import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function AuctionScreen() {
  const colorScheme = useColorScheme();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <ScrollView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
          Player Auction
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colorScheme === 'dark' ? '#fff' : '#000'} />
        <TextInput
          style={[styles.searchInput, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}
          placeholder="Search players..."
          placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5' }]}>
          <Text style={[styles.filterText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
            All Players
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5' }]}>
          <Text style={[styles.filterText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
            Unsold
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5' }]}>
          <Text style={[styles.filterText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
            Sold
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.playersList}>
        <View style={[styles.playerCard, { backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5' }]}>
          <View style={styles.playerHeader}>
            <View style={styles.playerInfo}>
              <Text style={[styles.playerName, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                John Doe
              </Text>
              <Text style={[styles.playerRole, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                All-Rounder
              </Text>
            </View>
            <View style={styles.basePrice}>
              <Text style={[styles.priceLabel, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                Base Price
              </Text>
              <Text style={[styles.priceValue, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                ₹20 L
              </Text>
            </View>
          </View>
          <View style={styles.playerStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                15
              </Text>
              <Text style={[styles.statLabel, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                Matches
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                250
              </Text>
              <Text style={[styles.statLabel, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                Runs
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                12
              </Text>
              <Text style={[styles.statLabel, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                Wickets
              </Text>
            </View>
          </View>
          <View style={styles.bidSection}>
            <View style={styles.currentBid}>
              <Text style={[styles.bidLabel, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                Current Bid
              </Text>
              <Text style={[styles.bidValue, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                ₹25 L
              </Text>
            </View>
            <TouchableOpacity style={styles.bidButton}>
              <Text style={styles.bidButtonText}>Place Bid</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    margin: 15,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    justifyContent: 'space-around',
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
  },
  playersList: {
    padding: 15,
  },
  playerCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  playerRole: {
    fontSize: 14,
  },
  basePrice: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
  },
  bidSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  currentBid: {
    flex: 1,
  },
  bidLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  bidValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bidButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bidButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 