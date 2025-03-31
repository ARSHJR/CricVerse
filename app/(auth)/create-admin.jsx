import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FormField from '../../components/FormField';
import { createAdminAccount } from '../../services/firebase';

export default function CreateAdmin() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    displayName: '',
    secretKey: ''
  });

  const submit = async () => {
    const ADMIN_SECRET_KEY = 'ewpl_admin_2024';
    
    if (form.secretKey !== ADMIN_SECRET_KEY) {
      Alert.alert('Error', 'Invalid secret key');
      return;
    }

    if (!form.email || !form.password || !form.displayName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await createAdminAccount(form.email, form.password, form.displayName);
      setIsSubmitting(false);
      
      Alert.alert(
        'Success',
        'Admin account created successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/sign-in');
            }
          }
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', error.message || 'Failed to create admin account');
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Create Admin Account</Text>
      <Text style={styles.subtitle}>Create a new administrator account</Text>

      <FormField
        title="Display Name"
        value={form.displayName}
        placeholder="Enter admin name"
        handleChangeText={(val) => setForm({ ...form, displayName: val })}
      />
      <FormField
        title="Email"
        value={form.email}
        placeholder="Enter admin email"
        handleChangeText={(val) => setForm({ ...form, email: val })}
      />
      <FormField
        title="Password"
        value={form.password}
        placeholder="Create a password"
        handleChangeText={(val) => setForm({ ...form, password: val })}
        secureTextEntry
      />
      <FormField
        title="Secret Key"
        value={form.secretKey}
        placeholder="Enter admin secret key"
        handleChangeText={(val) => setForm({ ...form, secretKey: val })}
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
          <Text style={styles.primaryButtonText}>Create Admin Account</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        disabled={isSubmitting}
      >
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
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
  backButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#1e90ff',
    fontSize: 16,
  },
}); 