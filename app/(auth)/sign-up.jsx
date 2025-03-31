import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FormField from '../../components/FormField';
import { auth } from '../../services/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

const SignUp = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (!form.name || !form.email || !form.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      // Update user profile with name
      await updateProfile(userCredential.user, {
        displayName: form.name
      });

      console.log('User created successfully:', userCredential.user);
      router.replace('/sign-in');
    } catch (error) {
      console.error('Error creating user:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to create account. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started with CricVerse</Text>

        <FormField
          title="Name"
          value={form.name}
          placeholder="Enter your name"
          handleChangeText={(val) => setForm({ ...form, name: val })}
        />
        <FormField
          title="Email"
          value={form.email}
          placeholder="Enter your email"
          handleChangeText={(val) => setForm({ ...form, email: val })}
        />
        <FormField
          title="Password"
          value={form.password}
          placeholder="Create a password"
          handleChangeText={(val) => setForm({ ...form, password: val })}
        />

        <TouchableOpacity
          style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
          onPress={submit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <View style={styles.linkWrapper}>
          <Text style={styles.linkText}>
            Already have an account?{' '}
            <Text style={styles.link} onPress={() => router.replace('/sign-in')}>
              Sign in
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;

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
});
