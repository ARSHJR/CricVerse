import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS, FONTS } from '../../constants/theme';
import { auth, db } from '../../services/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const ProfileScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      
      if (!user) {
        router.replace('/login');
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({
          email: user.email,
          name: data.name || 'User',
          isAdmin: data.isAdmin || false,
          joinedDate: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date(),
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userData?.name?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userData?.name}</Text>
            <Text style={styles.userEmail}>{userData?.email}</Text>
            {userData?.isAdmin && (
              <View style={styles.adminBadge}>
                <MaterialCommunityIcons name="shield-crown" size={16} color={COLORS.white} />
                <Text style={styles.adminText}>Admin</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="email-outline" size={20} color={COLORS.primary} />
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{userData?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar" size={20} color={COLORS.primary} />
            <Text style={styles.infoLabel}>Joined:</Text>
            <Text style={styles.infoValue}>
              {userData?.joinedDate.toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="shield-account" size={20} color={COLORS.primary} />
            <Text style={styles.infoLabel}>Role:</Text>
            <Text style={styles.infoValue}>
              {userData?.isAdmin ? 'Administrator' : 'User'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <MaterialCommunityIcons name="logout" size={24} color={COLORS.white} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    backgroundColor: COLORS.primary,
    padding: 20,
    ...SHADOWS.medium,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  avatarText: {
    ...FONTS.title,
    color: COLORS.primary,
    fontSize: 32,
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    ...FONTS.title,
    color: COLORS.white,
    marginBottom: 4,
  },
  userEmail: {
    ...FONTS.body,
    color: COLORS.white,
    opacity: 0.8,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  adminText: {
    ...FONTS.button,
    color: COLORS.white,
    marginLeft: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    ...FONTS.subtitle,
    color: COLORS.primary,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    ...SHADOWS.small,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  infoLabel: {
    ...FONTS.body,
    color: COLORS.gray,
    marginLeft: 8,
    width: 80,
  },
  infoValue: {
    ...FONTS.body,
    color: COLORS.text,
    flex: 1,
    marginLeft: 8,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
    padding: 16,
    borderRadius: 12,
    ...SHADOWS.small,
  },
  signOutText: {
    ...FONTS.button,
    color: COLORS.white,
    marginLeft: 8,
  },
});

export default ProfileScreen; 