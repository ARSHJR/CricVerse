import { View, Text, TouchableOpacity, StyleSheet, Image, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';

export default function LandingPage() {
  const router = useRouter();

  return (
    <ImageBackground 
      source={require('../assets/cricket-bg.jpg')} 
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Image
            source={require('../assets/Logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/(auth)/sign-in')}
            >
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonOutline}
              onPress={() => router.push('/(auth)/sign-up')}
            >
              <Text style={styles.buttonOutlineText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 40,
    paddingTop: 100,
    paddingBottom: 80,
  },
  logo: {
    width: 320,
    height: 100,
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    ...SHADOWS.medium,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonOutline: {
    backgroundColor: '#FC9905',
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    ...SHADOWS.medium,
  },
  buttonOutlineText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
