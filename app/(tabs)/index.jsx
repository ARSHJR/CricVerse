import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { auth, db } from '../../services/firebase';
import { collection, query, where, getDocs, orderBy, doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { COLORS, SHADOWS, FONTS, COMMON_STYLES } from '../../constants/theme';
import { DEFAULT_TEAMS } from '../../services/teamService';

const MatchCard = ({ team1, team2, time, date }) => (
  <TouchableOpacity style={styles.matchCard}>
    <View style={styles.matchInfo}>
      <View style={styles.teamsContainer}>
        <Text style={styles.teamName}>{team1}</Text>
        <Text style={styles.teamName}>{team2}</Text>
      </View>
      <Text style={styles.matchTime}>{time}</Text>
    </View>
    <Text style={styles.matchDate}>{date}</Text>
  </TouchableOpacity>
);

const Home = () => {
  const router = useRouter();
  const { refresh } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isAdmin, setIsAdmin] = useState(false);
  const [matches, setMatches] = useState({
    upcoming: [],
    previous: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAdminStatus();
    loadMatches();
  }, [refresh]);

  const checkAdminStatus = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setIsAdmin(userDoc.data().isAdmin === true);
        }
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const getTeamName = (teamId) => {
    const team = DEFAULT_TEAMS[teamId];
    return team ? team.name : teamId;
  };

  const loadMatches = async () => {
    try {
      setLoading(true);
      const matchesRef = collection(db, 'matches');
      const q = query(matchesRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const matchesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setMatches({
        upcoming: matchesData
          .filter(match => match.status === 'upcoming')
          .sort((a, b) => a.timestamp - b.timestamp),
        previous: matchesData
          .filter(match => match.status === 'completed')
          .sort((a, b) => b.timestamp - a.timestamp),
      });
    } catch (error) {
      console.error('Error loading matches:', error);
      setError('Failed to load matches. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const moveToCompleted = async (matchId) => {
    try {
      const matchRef = doc(db, 'matches', matchId);
      await updateDoc(matchRef, {
        status: 'completed'
      });
      await loadMatches(); // Refresh the matches list
      Alert.alert('Success', 'Match marked as completed');
    } catch (error) {
      console.error('Error updating match status:', error);
      Alert.alert('Error', 'Failed to update match status. Please try again.');
    }
  };

  const handleMoveToCompleted = (matchId) => {
    Alert.alert(
      'Mark as Completed',
      'Are you sure you want to mark this match as completed?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => moveToCompleted(matchId),
        },
      ],
      { cancelable: true }
    );
  };

  const getTeamLogo = (teamName) => {
    try {
      const teamLogos = {
        [DEFAULT_TEAMS['golden-eagles'].name]: require('../../assets/team-logos/golden-eagles.png'),
        [DEFAULT_TEAMS['lion-kings'].name]: require('../../assets/team-logos/lion-kings.png'),
        [DEFAULT_TEAMS['royal-tigers'].name]: require('../../assets/team-logos/royal-tigers.png'),
        [DEFAULT_TEAMS['blazing-rhinos'].name]: require('../../assets/team-logos/blazing-rhinos.png'),
        [DEFAULT_TEAMS['giant-sharks'].name]: require('../../assets/team-logos/giant-sharks.png'),
        [DEFAULT_TEAMS['panthers'].name]: require('../../assets/team-logos/panthers.png'),
      };
      return teamLogos[teamName];
    } catch (error) {
      console.error('Error loading team logo:', error);
      return null;
    }
  };

  const deleteMatch = async (matchId) => {
    try {
      await deleteDoc(doc(db, 'matches', matchId));
      // Refresh matches list after deletion
      await loadMatches();
      Alert.alert('Success', 'Match deleted successfully');
    } catch (error) {
      console.error('Error deleting match:', error);
      Alert.alert('Error', 'Failed to delete match. Please try again.');
    }
  };

  const handleDeleteMatch = (matchId) => {
    Alert.alert(
      'Delete Match',
      'Are you sure you want to delete this match?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => deleteMatch(matchId),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const renderMatchCard = (match) => (
    <TouchableOpacity
      key={match.id}
      style={styles.matchCard}
      onPress={() => router.push({
        pathname: '/match-details',
        params: { 
          matchId: match.id,
          team1Id: match.team1Id,
          team2Id: match.team2Id,
          team1Name: match.team1,
          team2Name: match.team2
        }
      })}
    >
      <View style={styles.matchHeader}>
        <View>
          <Text style={styles.matchDate}>{match.date}</Text>
          <Text style={styles.matchTime}>{match.time}</Text>
        </View>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => router.push({
            pathname: '/match-details',
            params: { 
              matchId: match.id,
              team1Id: match.team1Id,
              team2Id: match.team2Id,
              team1Name: match.team1,
              team2Name: match.team2
            }
          })}
        >
          <Text style={styles.detailsButtonText}>Match Details</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.matchContent}>
        <View style={styles.teamContainer}>
          {getTeamLogo(match.team1) ? (
            <Image
              source={getTeamLogo(match.team1)}
              style={styles.teamLogo}
            />
          ) : (
            <View style={styles.teamLogoPlaceholder}>
              <MaterialCommunityIcons name="cricket" size={32} color={COLORS.primary} />
            </View>
          )}
          <Text style={styles.teamName}>{match.team1}</Text>
        </View>
        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>
        <View style={styles.teamContainer}>
          {getTeamLogo(match.team2) ? (
            <Image
              source={getTeamLogo(match.team2)}
              style={styles.teamLogo}
            />
          ) : (
            <View style={styles.teamLogoPlaceholder}>
              <MaterialCommunityIcons name="cricket" size={32} color={COLORS.primary} />
            </View>
          )}
          <Text style={styles.teamName}>{match.team2}</Text>
        </View>
      </View>
      {match.status === 'completed' && (
        <View style={styles.winnerContainer}>
          <Text style={styles.winnerText}>
            {match.winner === 'draw' 
              ? 'Match Drawn'
              : `Winner: ${match.winner === match.team1Id ? match.team1 : match.team2}`
            }
          </Text>
        </View>
      )}
      {isAdmin && match.status === 'upcoming' && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteMatch(match.id)}
        >
          <MaterialCommunityIcons name="delete" size={20} color={COLORS.error} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/CV_LOGO.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {auth.currentUser?.displayName?.[0] || 'U'}
              </Text>
            </View>
            <View>
              <Text style={styles.userName}>{auth.currentUser?.displayName || 'User'}</Text>
              <Text style={styles.userLocation}>Mumbai, India</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* EWPL Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={require('../../assets/ewpl-banner.jpg')}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </View>

        {/* Toggle Buttons */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              activeTab === 'upcoming' && styles.activeToggle,
            ]}
            onPress={() => setActiveTab('upcoming')}
          >
            <Text style={[
              styles.toggleText,
              activeTab === 'upcoming' && styles.activeToggleText,
            ]}>Upcoming</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              activeTab === 'previous' && styles.activeToggle,
            ]}
            onPress={() => setActiveTab('previous')}
          >
            <Text style={[
              styles.toggleText,
              activeTab === 'previous' && styles.activeToggleText,
            ]}>Previous</Text>
          </TouchableOpacity>
        </View>

        {/* Matches Section */}
        <View style={styles.matchesContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : matches[activeTab].length === 0 ? (
            <Text style={styles.noMatchesText}>
              No {activeTab} matches found
            </Text>
          ) : (
            matches[activeTab].map(renderMatchCard)
          )}
        </View>
      </ScrollView>

      {isAdmin && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-match')}
        >
          <MaterialCommunityIcons name="plus" size={24} color={COLORS.white} />
          <Text style={styles.addButtonText}>Add Match</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...COMMON_STYLES.container,
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.secondary,
    ...SHADOWS.small,
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 40,
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    ...SHADOWS.small,
  },
  avatarText: {
    ...FONTS.subtitle,
    color: COLORS.white,
  },
  userName: {
    ...FONTS.subtitle,
  },
  userLocation: {
    ...FONTS.caption,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    ...SHADOWS.small,
  },
  bannerContainer: {
    height: 150,
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    ...SHADOWS.medium,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 25,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 8,
    ...SHADOWS.small,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    ...FONTS.body,
    color: COLORS.gray,
  },
  activeToggleText: {
    color: COLORS.white,
  },
  matchesContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  noMatchesText: {
    ...FONTS.body,
    textAlign: 'center',
    color: COLORS.gray,
    marginTop: 20,
  },
  matchCard: {
    ...COMMON_STYLES.card,
    marginBottom: 16,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  matchDate: {
    ...FONTS.caption,
  },
  matchTime: {
    ...FONTS.subtitle,
    color: COLORS.secondary,
  },
  matchContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  teamContainer: {
    alignItems: 'center',
    flex: 1,
  },
  teamLogo: {
    width: 64,
    height: 64,
    marginBottom: 8,
    ...SHADOWS.small,
  },
  teamName: {
    ...FONTS.body,
    textAlign: 'center',
  },
  vsContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  vsText: {
    ...FONTS.subtitle,
    color: COLORS.secondary,
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    ...SHADOWS.medium,
  },
  addButtonText: {
    ...FONTS.button,
    marginLeft: 8,
  },
  teamLogoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...SHADOWS.small,
  },
  detailsButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    ...SHADOWS.small,
  },
  detailsButtonText: {
    ...FONTS.button,
    color: COLORS.white,
    fontSize: 12,
  },
  adminButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
  completeButton: {
    backgroundColor: COLORS.lightSuccess,
  },
  deleteButton: {
    backgroundColor: COLORS.lightError,
  },
  matchTeams: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchVs: {
    ...FONTS.subtitle,
    color: COLORS.secondary,
    marginHorizontal: 8,
  },
  matchTeam: {
    ...FONTS.body,
  },
  winnerContainer: {
    backgroundColor: COLORS.lightSuccess,
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  winnerText: {
    ...FONTS.body,
    color: COLORS.success,
    textAlign: 'center',
  },
});

export default Home; 