import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getTeamPlayers, updatePlayerStats } from '../services/teamService';
import { auth, db } from '../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { COLORS, SHADOWS, FONTS, COMMON_STYLES } from '../constants/theme';

const defaultPlayerStats = {
  batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false },
  bowling: { overs: 0, wickets: 0, runs: 0, economy: 0 }
};

const MatchDetails = () => {
  const router = useRouter();
  const { matchId, team1Id, team2Id, team1Name, team2Name } = useLocalSearchParams();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [activeTeam, setActiveTeam] = useState('team1');
  const [battingTeam, setBattingTeam] = useState('team1');
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      // Check admin status
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setIsAdmin(userDoc.data().isAdmin === true);
        }
      }

      // Load team players
      const [team1Data, team2Data] = await Promise.all([
        getTeamPlayers(team1Id),
        getTeamPlayers(team2Id),
      ]);

      // Ensure each player has the required stats structure
      const processPlayers = (players) => players.map(player => ({
        ...player,
        stats: {
          batting: { ...defaultPlayerStats.batting, ...(player.stats?.batting || {}) },
          bowling: { ...defaultPlayerStats.bowling, ...(player.stats?.bowling || {}) }
        }
      }));

      setTeam1Players(processPlayers(team1Data || []));
      setTeam2Players(processPlayers(team2Data || []));
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load match details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [team1Id, team2Id]);

  const handleScoreUpdate = async (teamId, player, type, action) => {
    if (!isAdmin) return;

    const stats = { ...player.stats[type] };
    
    if (type === 'batting') {
      switch (action) {
        case 'run':
          stats.runs += 1;
          stats.balls += 1;
          break;
        case 'four':
          stats.runs += 4;
          stats.balls += 1;
          stats.fours += 1;
          break;
        case 'six':
          stats.runs += 6;
          stats.balls += 1;
          stats.sixes += 1;
          break;
        case 'dot':
          stats.balls += 1;
          break;
        case 'out':
          stats.isOut = true;
          break;
      }
    } else if (type === 'bowling') {
      switch (action) {
        case 'wicket':
          stats.wickets += 1;
          break;
        case 'over':
          stats.overs += 1;
          break;
        case 'runs':
          stats.runs += 1;
          break;
      }
      stats.economy = stats.runs / (stats.overs || 1);
    }

    try {
      await updatePlayerStats(teamId, player.id, stats, type);
      // Refresh the data after updating
      await loadData();
    } catch (error) {
      console.error('Error updating player stats:', error);
      Alert.alert('Error', 'Failed to update player stats. Please try again.');
    }
  };

  const handleMarkWinner = async (winnerId) => {
    if (!isAdmin) return;

    const isDraw = winnerId === 'draw';
    const message = isDraw 
      ? 'Are you sure you want to mark this match as a draw?'
      : `Are you sure you want to mark ${winnerId === team1Id ? team1Name : team2Name} as the winner?`;

    Alert.alert(
      isDraw ? 'Mark as Draw' : 'Mark Winner',
      message,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              // Update match status
              const matchRef = doc(db, 'matches', matchId);
              await updateDoc(matchRef, {
                status: 'completed',
                winner: isDraw ? 'draw' : winnerId,
                completedAt: new Date().toISOString()
              });

              if (isDraw) {
                // Update both teams for draw
                await Promise.all([
                  updateTeamStats(team1Id, { matchesPlayed: 1, matchesDrawn: 1, points: 1 }),
                  updateTeamStats(team2Id, { matchesPlayed: 1, matchesDrawn: 1, points: 1 })
                ]);
              } else {
                // Update winner's stats
                await updateTeamStats(winnerId, { 
                  matchesPlayed: 1, 
                  matchesWon: 1, 
                  points: 3 
                });

                // Update loser's stats
                const loserId = winnerId === team1Id ? team2Id : team1Id;
                await updateTeamStats(loserId, { 
                  matchesPlayed: 1, 
                  matchesLost: 1 
                });
              }

              Alert.alert('Success', isDraw ? 'Match marked as draw' : 'Match marked as completed and winner updated');
              router.push({
                pathname: '/',
                params: { refresh: 'true' }
              });
            } catch (error) {
              console.error('Error marking winner:', error);
              Alert.alert('Error', 'Failed to update match result. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const updateTeamStats = async (teamId, stats) => {
    const teamRef = doc(db, 'teams', teamId);
    const teamDoc = await getDoc(teamRef);
    if (teamDoc.exists()) {
      const teamData = teamDoc.data();
      await updateDoc(teamRef, {
        matchesPlayed: (teamData.matchesPlayed || 0) + stats.matchesPlayed,
        matchesWon: (teamData.matchesWon || 0) + (stats.matchesWon || 0),
        matchesLost: (teamData.matchesLost || 0) + (stats.matchesLost || 0),
        matchesDrawn: (teamData.matchesDrawn || 0) + (stats.matchesDrawn || 0),
        points: (teamData.points || 0) + (stats.points || 0)
      });
    }
  };

  const renderPlayerStats = (player, teamId) => {
    const isBatting = (teamId === team1Id && battingTeam === 'team1') ||
                     (teamId === team2Id && battingTeam === 'team2');
    const type = isBatting ? 'batting' : 'bowling';
    const stats = player.stats[type];

    return (
      <View key={player.id} style={styles.playerCard}>
        <View style={styles.playerHeader}>
          <Text style={styles.playerName}>{player.name}</Text>
          {isBatting && stats.isOut && (
            <View style={styles.outIndicator}>
              <MaterialCommunityIcons name="close-circle" size={20} color={COLORS.error} />
              <Text style={styles.outText}>Out</Text>
            </View>
          )}
        </View>
        {isBatting ? (
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Runs</Text>
                <Text style={styles.statValue}>{stats.runs}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Balls</Text>
                <Text style={styles.statValue}>{stats.balls}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>4s</Text>
                <Text style={styles.statValue}>{stats.fours}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>6s</Text>
                <Text style={styles.statValue}>{stats.sixes}</Text>
              </View>
              {stats.balls > 0 && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>S/R</Text>
                  <Text style={styles.statValue}>
                    {((stats.runs / stats.balls) * 100).toFixed(1)}
                  </Text>
                </View>
              )}
            </View>
            {isAdmin && !stats.isOut && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.runButton]}
                  onPress={() => handleScoreUpdate(teamId, player, 'batting', 'run')}
                >
                  <Text style={styles.actionButtonText}>+1</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.boundaryButton]}
                  onPress={() => handleScoreUpdate(teamId, player, 'batting', 'four')}
                >
                  <Text style={styles.actionButtonText}>4</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.boundaryButton]}
                  onPress={() => handleScoreUpdate(teamId, player, 'batting', 'six')}
                >
                  <Text style={styles.actionButtonText}>6</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.dotButton]}
                  onPress={() => handleScoreUpdate(teamId, player, 'batting', 'dot')}
                >
                  <Text style={styles.actionButtonText}>Dot</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.outButton]}
                  onPress={() => handleScoreUpdate(teamId, player, 'batting', 'out')}
                >
                  <MaterialCommunityIcons name="close-circle" size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Overs</Text>
                <Text style={styles.statValue}>{stats.overs}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Wickets</Text>
                <Text style={styles.statValue}>{stats.wickets}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Runs</Text>
                <Text style={styles.statValue}>{stats.runs}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Economy</Text>
                <Text style={styles.statValue}>{stats.economy.toFixed(2)}</Text>
              </View>
            </View>
            {isAdmin && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.wicketButton]}
                  onPress={() => handleScoreUpdate(teamId, player, 'bowling', 'wicket')}
                >
                  <MaterialCommunityIcons name="cricket" size={20} color={COLORS.white} />
                  <Text style={styles.actionButtonText}>Wicket</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.overButton]}
                  onPress={() => handleScoreUpdate(teamId, player, 'bowling', 'over')}
                >
                  <Text style={styles.actionButtonText}>Over</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.runButton]}
                  onPress={() => handleScoreUpdate(teamId, player, 'bowling', 'runs')}
                >
                  <Text style={styles.actionButtonText}>+Run</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={48} color={COLORS.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isAdmin && (
        <View style={styles.controls}>
          <Text style={styles.controlLabel}>Batting Team:</Text>
          <TouchableOpacity
            style={[styles.teamButton, battingTeam === 'team1' && styles.activeTeam]}
            onPress={() => setBattingTeam('team1')}
          >
            <Text style={[styles.teamButtonText, battingTeam === 'team1' && styles.activeTeamText]}>
              {team1Name}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.teamButton, battingTeam === 'team2' && styles.activeTeam]}
            onPress={() => setBattingTeam('team2')}
          >
            <Text style={[styles.teamButtonText, battingTeam === 'team2' && styles.activeTeamText]}>
              {team2Name}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.teamToggle}>
        <TouchableOpacity
          style={[styles.teamTab, activeTeam === 'team1' && styles.activeTab]}
          onPress={() => setActiveTeam('team1')}
        >
          <Text style={[styles.teamTabText, activeTeam === 'team1' && styles.activeTabText]}>
            {team1Name}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.teamTab, activeTeam === 'team2' && styles.activeTab]}
          onPress={() => setActiveTeam('team2')}
        >
          <Text style={[styles.teamTabText, activeTeam === 'team2' && styles.activeTabText]}>
            {team2Name}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {activeTeam === 'team1' ? 
          team1Players.map(player => renderPlayerStats(player, team1Id)) :
          team2Players.map(player => renderPlayerStats(player, team2Id))
        }
      </ScrollView>

      {isAdmin && (
        <View style={styles.winnerButtons}>
          <TouchableOpacity
            style={[styles.winnerButton, styles.team1Button]}
            onPress={() => handleMarkWinner(team1Id)}
          >
            <Text style={styles.winnerButtonText}>Mark {team1Name} as Winner</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.winnerButton, styles.drawButton]}
            onPress={() => handleMarkWinner('draw')}
          >
            <Text style={styles.winnerButtonText}>Mark as Draw</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.winnerButton, styles.team2Button]}
            onPress={() => handleMarkWinner(team2Id)}
          >
            <Text style={styles.winnerButtonText}>Mark {team2Name} as Winner</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...COMMON_STYLES.container,
  },
  loadingContainer: {
    ...COMMON_STYLES.container,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    ...COMMON_STYLES.container,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  controls: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  controlLabel: {
    ...FONTS.subtitle,
    marginRight: 10,
  },
  teamButton: {
    padding: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    ...SHADOWS.small,
  },
  activeTeam: {
    backgroundColor: COLORS.primary,
  },
  teamButtonText: {
    ...FONTS.body,
    color: COLORS.primary,
  },
  activeTeamText: {
    color: COLORS.white,
  },
  teamToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  teamTab: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.secondary,
  },
  teamTabText: {
    ...FONTS.subtitle,
    color: COLORS.gray,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  playerCard: {
    ...COMMON_STYLES.card,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  playerName: {
    ...FONTS.subtitle,
  },
  outIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  outText: {
    ...FONTS.caption,
    color: COLORS.error,
    marginLeft: 4,
  },
  statsContainer: {
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    ...FONTS.caption,
    marginBottom: 4,
  },
  statValue: {
    ...FONTS.subtitle,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    minWidth: 48,
    ...SHADOWS.small,
  },
  actionButtonText: {
    ...FONTS.button,
    marginLeft: 4,
  },
  runButton: {
    backgroundColor: COLORS.primary,
  },
  boundaryButton: {
    backgroundColor: COLORS.secondary,
  },
  dotButton: {
    backgroundColor: COLORS.gray,
  },
  outButton: {
    backgroundColor: COLORS.error,
  },
  wicketButton: {
    backgroundColor: COLORS.success,
  },
  overButton: {
    backgroundColor: COLORS.primary,
  },
  errorText: {
    ...FONTS.subtitle,
    color: COLORS.error,
    textAlign: 'center',
    marginVertical: 16,
  },
  backButton: {
    ...COMMON_STYLES.button,
    paddingHorizontal: 32,
  },
  backButtonText: {
    ...FONTS.button,
  },
  winnerButtons: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  winnerButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  team1Button: {
    backgroundColor: COLORS.primary,
  },
  team2Button: {
    backgroundColor: COLORS.secondary,
  },
  drawButton: {
    backgroundColor: COLORS.gray,
  },
  winnerButtonText: {
    ...FONTS.button,
    color: COLORS.white,
  },
});

export default MatchDetails; 