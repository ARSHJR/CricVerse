import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS, FONTS } from '../../constants/theme';
import { auth, db } from '../../services/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { getTeams, DEFAULT_TEAMS, updateTeamNamesInDatabase, initializeTeams } from '../../services/teamService';

const LeagueScreen = () => {
  const router = useRouter();
  const { refresh } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const setup = async () => {
      try {
        await initializeTeams(); // Add missing teams
        await checkAdminStatus();
        await loadTeams();
      } catch (error) {
        console.error('Error in setup:', error);
      }
    };
    setup();
  }, [refresh]);

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

  const loadTeams = async () => {
    try {
      setLoading(true);
      const teamsRef = collection(db, 'teams');
      const querySnapshot = await getDocs(teamsRef);
      
      const teamsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Get the team data from DEFAULT_TEAMS if available
        const defaultTeam = DEFAULT_TEAMS[doc.id];
        return {
          id: doc.id,
          name: data.name || defaultTeam?.name || doc.id, // Use default team name if available
          matchesPlayed: data.stats?.matchesPlayed || 0,
          wins: data.stats?.wins || 0,
          losses: data.stats?.losses || 0,
          draws: data.stats?.draws || 0,
          points: data.stats?.points || 0,
          nrr: data.stats?.nrr || 0
        };
      });

      // Sort teams by points and NRR
      const sortedTeams = teamsData.sort((a, b) => {
        if (b.points !== a.points) {
          return b.points - a.points;
        }
        return b.nrr - a.nrr;
      });

      // Add position to each team
      const teamsWithPosition = sortedTeams.map((team, index) => ({
        ...team,
        position: index + 1
      }));

      setTeams(teamsWithPosition);
    } catch (error) {
      console.error('Error loading teams:', error);
      Alert.alert('Error', 'Failed to load teams. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTeamNames = async () => {
    try {
      setLoading(true);
      await updateTeamNamesInDatabase();
      await loadTeams(); // Reload teams after update
      Alert.alert('Success', 'Team names have been updated successfully in the database!');
    } catch (error) {
      console.error('Error updating team names:', error);
      Alert.alert('Error', 'Failed to update team names. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTeamLogo = (teamName) => {
    try {
      const teamLogos = {
        'Golden Eagles': require('../../assets/team-logos/golden-eagles.png'),
        'Lion Kings': require('../../assets/team-logos/lion-kings.png'),
        'Royal Tigers': require('../../assets/team-logos/royal-tigers.png'),
        'Blazing Rhinos': require('../../assets/team-logos/blazing-rhinos.png'),
        'Giant Sharks': require('../../assets/team-logos/giant-sharks.png'),
        'Panthers': require('../../assets/team-logos/panthers.png'),
      };
      return teamLogos[teamName];
    } catch (error) {
      console.error('Error loading team logo:', error);
      return null;
    }
  };

  const renderTeamCell = (team) => (
    <View style={styles.teamCell}>
      {getTeamLogo(team.name) ? (
        <Image
          source={getTeamLogo(team.name)}
          style={styles.teamLogo}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.teamLogoPlaceholder}>
          <MaterialCommunityIcons name="cricket" size={24} color={COLORS.primary} />
        </View>
      )}
      <Text style={styles.teamName}>{team.name}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>League Table</Text>
        {isAdmin && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push('/edit-league')}
          >
            <MaterialCommunityIcons name="pencil" size={24} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />
        ) : teams.length === 0 ? (
          <Text style={styles.noTeamsText}>No teams found</Text>
        ) : (
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.positionCell]}>#</Text>
              <Text style={[styles.headerCell, styles.teamCell]}>Team</Text>
              <Text style={[styles.headerCell, styles.statsCell]}>MP</Text>
              <Text style={[styles.headerCell, styles.statsCell]}>W</Text>
              <Text style={[styles.headerCell, styles.statsCell]}>L</Text>
              <Text style={[styles.headerCell, styles.statsCell]}>D</Text>
              <Text style={[styles.headerCell, styles.statsCell]}>Pts</Text>
              <Text style={[styles.headerCell, styles.statsCell]}>NRR</Text>
            </View>
            {teams.slice(0, 6).map((team) => (
              <TouchableOpacity 
                key={team.id} 
                style={styles.tableRow}
                onPress={() => router.push(`/team-details?id=${team.id}`)}
              >
                <Text style={[styles.cell, styles.positionCell]}>{team.position}</Text>
                {renderTeamCell(team)}
                <Text style={[styles.cell, styles.statsCell]}>{team.matchesPlayed}</Text>
                <Text style={[styles.cell, styles.statsCell]}>{team.wins}</Text>
                <Text style={[styles.cell, styles.statsCell]}>{team.losses}</Text>
                <Text style={[styles.cell, styles.statsCell]}>{team.draws}</Text>
                <Text style={[styles.cell, styles.statsCell]}>{team.points}</Text>
                <Text style={[styles.cell, styles.statsCell]}>{(team.nrr || 0).toFixed(2)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    ...SHADOWS.small,
    position: 'relative',
  },
  headerTitle: {
    ...FONTS.h2,
    color: COLORS.primary,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  editButton: {
    position: 'absolute',
    right: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 8,
    ...SHADOWS.small,
  },
  scrollView: {
    flex: 1,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noTeamsText: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tableContainer: {
    margin: 16,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    ...SHADOWS.medium,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  headerCell: {
    ...FONTS.body,
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
  },
  positionCell: {
    flex: 0.6,
  },
  teamCell: {
    flex: 2.5,
    textAlign: 'left',
    paddingLeft: 10,
  },
  statsCell: {
    flex: 0.8,
  },
  tableBody: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  cell: {
    ...FONTS.body,
    color: COLORS.text,
    textAlign: 'center',
    fontSize: 14,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  evenRow: {
    backgroundColor: COLORS.lightGray,
  },
  teamLogo: {
    width: 32,
    height: 32,
    marginRight: 8,
    borderRadius: 16,
    ...SHADOWS.small,
  },
  teamName: {
    ...FONTS.body,
    color: COLORS.text,
    flex: 1,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.primary,
    marginBottom: 8,
  },
  teamLogoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LeagueScreen; 