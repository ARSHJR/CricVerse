import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FormField from '../../components/FormField';
import { auth } from '../../services/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { COLORS, FONTS, SHADOWS } from '../../constants/theme';

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
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/CV_LOGO.jpg')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.formContainer}>
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flexGrow: 1,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
  },
  logo: {
    width: 240,
    height: 80,
  },
  formContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    ...SHADOWS.medium,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
    color: COLORS.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: COLORS.gray,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#FC9905',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    ...SHADOWS.small,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  linkWrapper: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  link: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
