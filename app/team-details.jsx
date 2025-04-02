import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS, FONTS } from '../constants/theme';
import { auth, db } from '../services/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { DEFAULT_TEAMS } from '../services/teamService';

const TeamDetails = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [team, setTeam] = useState(null);
  const [matches, setMatches] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    loadTeamDetails();
    loadTeamMatches();
  }, [id]);

  const checkAdminStatus = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setIsAdmin(userDoc.data()?.isAdmin || false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const loadTeamDetails = async () => {
    try {
      setLoading(true);
      const teamDoc = await getDoc(doc(db, 'teams', id));
      
      if (teamDoc.exists()) {
        const data = teamDoc.data();
        const defaultTeam = DEFAULT_TEAMS[id];
        
        // Process player stats
        const players = (data.players || defaultTeam?.players || []).map(player => ({
          ...player,
          matches: player.stats?.batting?.balls || 0,
          runs: player.stats?.batting?.runs || 0,
          wickets: player.stats?.bowling?.wickets || 0
        }));
        
        setTeam({
          id: teamDoc.id,
          name: data.name || defaultTeam?.name || teamDoc.id,
          players: players,
          stats: {
            matchesPlayed: data.stats?.matchesPlayed || 0,
            wins: data.stats?.wins || 0,
            losses: data.stats?.losses || 0,
            draws: data.stats?.draws || 0,
            points: data.stats?.points || 0,
            nrr: data.stats?.nrr || 0,
          }
        });
      } else {
        Alert.alert('Error', 'Team not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading team details:', error);
      Alert.alert('Error', 'Failed to load team details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadTeamMatches = async () => {
    try {
      const matchesRef = collection(db, 'matches');
      const q = query(
        matchesRef,
        where('team1Id', '==', id)
      );
      const q2 = query(
        matchesRef,
        where('team2Id', '==', id)
      );

      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(q),
        getDocs(q2)
      ]);

      const allMatches = [
        ...snapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        ...snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      ];

      // Sort matches by date and time
      allMatches.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateB - dateA;
      });

      setMatches(allMatches);
    } catch (error) {
      console.error('Error loading team matches:', error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadTeamDetails(),
        loadTeamMatches(),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!team) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{team.name}</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{team.stats.matchesPlayed}</Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{team.stats.wins}</Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{team.stats.losses}</Text>
              <Text style={styles.statLabel}>Losses</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{team.stats.draws}</Text>
              <Text style={styles.statLabel}>Draws</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{team.stats.points}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{team.stats.nrr.toFixed(2)}</Text>
              <Text style={styles.statLabel}>NRR</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Players</Text>
          <View style={styles.playersList}>
            {team.players.map((player, index) => (
              <View key={index} style={styles.playerCard}>
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerRole}>{player.role}</Text>
                </View>
                <View style={styles.playerStats}>
                  <Text style={styles.playerStat}>Matches: {player.matches}</Text>
                  <Text style={styles.playerStat}>Runs: {player.runs}</Text>
                  <Text style={styles.playerStat}>Wickets: {player.wickets}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Matches</Text>
          {matches.length === 0 ? (
            <Text style={styles.noMatchesText}>No matches found</Text>
          ) : (
            matches.map((match) => (
              <TouchableOpacity
                key={match.id}
                style={styles.matchCard}
                onPress={() => router.push(`/match-details?id=${match.id}`)}
              >
                <View style={styles.matchHeader}>
                  <Text style={styles.matchDate}>{match.date}</Text>
                  <Text style={styles.matchTime}>{match.time}</Text>
                </View>
                <View style={styles.matchTeams}>
                  <Text style={styles.matchTeam}>{match.team1}</Text>
                  <Text style={styles.matchVs}>vs</Text>
                  <Text style={styles.matchTeam}>{match.team2}</Text>
                </View>
                <Text style={styles.matchStatus}>{match.status}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.primary,
    ...SHADOWS.small,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    ...FONTS.title,
    color: COLORS.white,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    backgroundColor: COLORS.white,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    ...SHADOWS.medium,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...FONTS.title,
    color: COLORS.primary,
  },
  statLabel: {
    ...FONTS.body,
    color: COLORS.text,
    marginTop: 4,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    ...FONTS.subtitle,
    marginBottom: 12,
  },
  playersList: {
    gap: 12,
  },
  playerCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    ...SHADOWS.small,
  },
  playerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  playerName: {
    ...FONTS.body,
    fontWeight: 'bold',
  },
  playerRole: {
    ...FONTS.body,
    color: COLORS.primary,
  },
  playerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  playerStat: {
    ...FONTS.body,
    color: COLORS.text,
  },
  matchCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  matchDate: {
    ...FONTS.body,
    color: COLORS.primary,
  },
  matchTime: {
    ...FONTS.body,
    color: COLORS.text,
  },
  matchTeams: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchTeam: {
    ...FONTS.body,
    fontWeight: 'bold',
  },
  matchVs: {
    ...FONTS.body,
    color: COLORS.text,
  },
  matchStatus: {
    ...FONTS.body,
    color: COLORS.primary,
    textAlign: 'center',
  },
  noMatchesText: {
    ...FONTS.body,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default TeamDetails; 