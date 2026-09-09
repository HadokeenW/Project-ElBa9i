import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../src/context/auth';
import { Colors } from '../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';

function RootNavigation() {
  const { user, role, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inClientGroup = segments[0] === '(client)';
    const inBusinessGroup = segments[0] === '(business)';
    const inAdminGroup = segments[0] === '(admin)';

    if (!user) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      // Utilisateur connecté
      if (inAuthGroup) {
        if (role === 'business') {
          router.replace('/(business)');
        } else if (role === 'admin') {
          router.replace('/(admin)');
        } else {
          router.replace('/(client)');
        }
      }
    }
  }, [user, role, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.logoCircle}>
          <Ionicons name="basket" size={48} color={Colors.white} />
        </View>
        <Text style={styles.appName}>BARAKA FOOD</Text>
        <Text style={styles.tagline}>L'anti-gaspillage solidaire en Algérie</Text>
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Slot />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  appName: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
  },
});
