import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS, FONTS } from '../constants/theme';
import { auth, db } from '../services/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { DEFAULT_TEAMS } from '../services/teamService';

const EditLeague = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teams, setTeams] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    loadTeams();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'You must be logged in to access this page');
        router.back();
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const isAdmin = userDoc.data()?.isAdmin || false;
      setIsAdmin(isAdmin);

      if (!isAdmin) {
        Alert.alert('Error', 'You do not have permission to access this page');
        router.back();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      Alert.alert('Error', 'Failed to verify admin status');
      router.back();
    }
  };

  const loadTeams = async () => {
    try {
      setLoading(true);
      const teamsData = [];
      
      for (const [teamId, defaultTeam] of Object.entries(DEFAULT_TEAMS)) {
        const teamDoc = await getDoc(doc(db, 'teams', teamId));
        const data = teamDoc.exists() ? teamDoc.data() : {};
        
        teamsData.push({
          id: teamId,
          name: data.name || defaultTeam.name,
          matchesPlayed: data.stats?.matchesPlayed || 0,
          wins: data.stats?.wins || 0,
          losses: data.stats?.losses || 0,
          draws: data.stats?.draws || 0,
          points: data.stats?.points || 0,
          nrr: data.stats?.nrr || 0,
        });
      }

      setTeams(teamsData);
    } catch (error) {
      console.error('Error loading teams:', error);
      Alert.alert('Error', 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const updateTeam = (index, field, value) => {
    const newTeams = [...teams];
    newTeams[index] = {
      ...newTeams[index],
      [field]: field === 'nrr' ? parseFloat(value) || 0 : parseInt(value) || 0,
    };

    // Automatically calculate points (2 for win, 1 for draw, 0 for loss)
    if (['wins', 'draws', 'losses'].includes(field)) {
      newTeams[index].points = (newTeams[index].wins * 2) + newTeams[index].draws;
      newTeams[index].matchesPlayed = newTeams[index].wins + newTeams[index].draws + newTeams[index].losses;
    }

    setTeams(newTeams);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Update each team's stats in Firestore
      await Promise.all(teams.map(async (team) => {
        const teamRef = doc(db, 'teams', team.id);
        await updateDoc(teamRef, {
          stats: {
            matchesPlayed: team.matchesPlayed,
            wins: team.wins,
            losses: team.losses,
            draws: team.draws,
            points: team.points,
            nrr: team.nrr,
          }
        });
      }));

      Alert.alert('Success', 'Team statistics updated successfully!', [
        { 
          text: 'OK', 
          onPress: () => router.push({
            pathname: '/(tabs)/league',
            params: { refresh: true }
          })
        }
      ]);
    } catch (error) {
      console.error('Error saving team stats:', error);
      Alert.alert('Error', 'Failed to save team statistics');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTeamName = async (teamId, newName) => {
    try {
      setLoading(true);
      const teamRef = doc(db, 'teams', teamId);
      await updateDoc(teamRef, {
        name: newName,
        updatedAt: serverTimestamp()
      });
      
      // Update the local state
      setTeams(prevTeams => 
        prevTeams.map(team => 
          team.id === teamId 
            ? { ...team, name: newName }
            : team
        )
      );
      
      Alert.alert('Success', 'Team name updated successfully!');
    } catch (error) {
      console.error('Error updating team name:', error);
      Alert.alert('Error', 'Failed to update team name. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit League Table</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <MaterialCommunityIcons name="content-save" size={24} color={COLORS.white} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.teamCell]}>Team</Text>
            <Text style={[styles.headerCell, styles.statsCell]}>MP</Text>
            <Text style={[styles.headerCell, styles.statsCell]}>W</Text>
            <Text style={[styles.headerCell, styles.statsCell]}>L</Text>
            <Text style={[styles.headerCell, styles.statsCell]}>D</Text>
            <Text style={[styles.headerCell, styles.statsCell]}>Pts</Text>
            <Text style={[styles.headerCell, styles.statsCell]}>NRR</Text>
          </View>
          {teams.map((team, index) => (
            <View key={team.id} style={styles.tableRow}>
              <Text style={[styles.cell, styles.teamCell]}>{team.name}</Text>
              <TextInput
                style={[styles.cell, styles.statsCell, styles.input]}
                value={team.matchesPlayed.toString()}
                keyboardType="numeric"
                editable={false}
              />
              <TextInput
                style={[styles.cell, styles.statsCell, styles.input]}
                value={team.wins.toString()}
                onChangeText={(value) => updateTeam(index, 'wins', value)}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.cell, styles.statsCell, styles.input]}
                value={team.losses.toString()}
                onChangeText={(value) => updateTeam(index, 'losses', value)}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.cell, styles.statsCell, styles.input]}
                value={team.draws.toString()}
                onChangeText={(value) => updateTeam(index, 'draws', value)}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.cell, styles.statsCell, styles.input]}
                value={team.points.toString()}
                keyboardType="numeric"
                editable={false}
              />
              <TextInput
                style={[styles.cell, styles.statsCell, styles.input]}
                value={team.nrr.toFixed(2)}
                onChangeText={(value) => updateTeam(index, 'nrr', value)}
                keyboardType="numeric"
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
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
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.primary,
    ...SHADOWS.small,
  },
  headerTitle: {
    ...FONTS.title,
    color: COLORS.white,
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
  },
  saveButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  tableContainer: {
    margin: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    ...SHADOWS.medium,
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  headerCell: {
    ...FONTS.body,
    color: COLORS.white,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  cell: {
    ...FONTS.body,
    textAlign: 'center',
  },
  teamCell: {
    flex: 2,
    textAlign: 'left',
  },
  statsCell: {
    flex: 1,
  },
  input: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    padding: 4,
  },
});

export default EditLeague; 