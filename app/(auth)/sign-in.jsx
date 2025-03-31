import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '../../components/FormField';
import { useRouter } from 'expo-router';
import { auth, checkIsAdmin } from '../../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const SignIn = () => {
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (!form.email || !form.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const user = userCredential.user;
      
      // Check if user is admin
      const isAdmin = await checkIsAdmin(user.uid);
      console.log('Is user admin?', isAdmin); // This will show in your console
      
      if (isAdmin) {
        Alert.alert('Admin Access', 'Logged in as Administrator');
      }
      
      router.replace('/(tabs)'); // Navigate to the main app tabs after successful sign in
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', error.message || 'Failed to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue to CricVerse</Text>

        <FormField
          title="Email"
          value={form.email}
          placeholder="Enter your email"
          handleChangeText={(e) => setForm({ ...form, email: e })}
        />
        <FormField
          title="Password"
          value={form.password}
          placeholder="Enter your password"
          handleChangeText={(e) => setForm({ ...form, password: e })}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
          onPress={submit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Sign in</Text>
          )}
        </TouchableOpacity>

        <View style={styles.linkWrapper}>
          <Text style={styles.linkText}>
            Don't have an account?{' '}
            <Text style={styles.link} onPress={() => router.push('/sign-up')}>
              Create one!
            </Text>
          </Text>
        </View>

        {/* Temporary Admin Creation Link */}
        <TouchableOpacity 
          style={styles.adminLink} 
          onPress={() => router.push('/create-admin')}
        >
          <Text style={styles.adminLinkText}>Create Admin Account</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
    color: '#1e90ff',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: '#555',
  },
  primaryButton: {
    backgroundColor: '#1e90ff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkWrapper: {
    marginTop: 20,
    alignItems: 'center',
  },
  
  linkText: {
    fontSize: 14,
    color: '#333',
  },
  
  link: {
    color: '#1e90ff',
    fontWeight: '600',
  },  
  
  adminLink: {
    marginTop: 20,
    padding: 10,
    alignItems: 'center',
  },
  adminLinkText: {
    color: '#666',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
