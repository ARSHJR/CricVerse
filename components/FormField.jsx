import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

const FormField = ({ title, value, placeholder, handleChangeText, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = title.toLowerCase() === 'password';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{title}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, isPassword && { paddingRight: 40 }]}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#999"
          onChangeText={handleChangeText}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.iconWrapper}
            onPress={() => setShowPassword(prev => !prev)}
          >
            <Text style={styles.iconText}>
              {showPassword ? '👁️' : '🔒'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormField;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 6,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#1e90ff',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#000',
  },
  iconWrapper: {
    position: 'absolute',
    right: 10,
    top: 12,
  },
  iconText: {
    fontSize: 20,
  },
});
