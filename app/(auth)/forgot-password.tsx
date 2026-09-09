import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../src/lib/supabase';
import { Colors } from '../../src/constants/theme';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleReset = async () => {
    if (!email.trim()) {
      setErrorMsg('Veuillez saisir votre adresse email.');
      return;
    }

    setErrorMsg(null);
    setMessage(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Erreur lors de la réinitialisation.');
    } else {
      setMessage('Un lien de réinitialisation a été envoyé à votre adresse email.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.brandTitle}>Mot de passe oublié</Text>
          <Text style={styles.subtitle}>
            Saisissez votre adresse email pour recevoir un lien de réinitialisation.
          </Text>
        </View>

        <View style={styles.form}>
          {errorMsg && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text style={styles.errorBannerText}>{errorMsg}</Text>
            </View>
          )}

          {message && (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={styles.successBannerText}>{message}</Text>
            </View>
          )}

          <Input
            label="Adresse Email"
            placeholder="exemple@email.dz"
            value={email}
            onChangeText={(t) => { setEmail(t); setErrorMsg(null); setMessage(null); }}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Button
            title="Envoyer le lien"
            onPress={handleReset}
            loading={loading}
            size="lg"
            style={{ marginTop: 8 }}
          />

          <TouchableOpacity style={styles.backToLogin} onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.backToLoginText}>Retour à la connexion</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 48,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    marginBottom: 24,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
  form: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    gap: 6,
  },
  errorBannerText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    gap: 6,
  },
  successBannerText: {
    color: '#065F46',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  backToLogin: {
    alignItems: 'center',
    marginTop: 18,
  },
  backToLoginText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
