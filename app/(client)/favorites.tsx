import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/theme';
import { MOCK_BUSINESSES } from '../../src/lib/mockData';
import { Business } from '../../src/types/database';

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Business[]>(MOCK_BUSINESSES.slice(0, 2));

  const removeFavorite = (bizId: string) => {
    setFavorites(favorites.filter(b => b.id !== bizId));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes commerces favoris</Text>
        <Text style={styles.headerSubtitle}>
          Soyez averti dès qu'une nouvelle offre est publiée
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {favorites.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="heart-dislike-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Aucun commerce en favori</Text>
            <Text style={styles.emptySubtitle}>
              Ajoutez des commerces à vos favoris en cliquant sur le cœur pour ne rien rater.
            </Text>
          </View>
        ) : (
          favorites.map((biz) => (
            <TouchableOpacity
              key={biz.id}
              style={styles.bizCard}
              activeOpacity={0.85}
              onPress={() => router.push({
                pathname: '/(client)/business/[id]',
                params: { id: biz.id },
              })}
            >
              <View style={styles.bizAvatar}>
                <Ionicons name="storefront" size={28} color={Colors.primary} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.bizName}>{biz.name}</Text>
                <Text style={styles.bizAddress}>{biz.address}</Text>
                <View style={styles.hoursRow}>
                  <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
                  <Text style={styles.hoursText}>{biz.opening_hours || '08:00 - 21:00'}</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.heartBtn} 
                onPress={() => removeFavorite(biz.id)}
              >
                <Ionicons name="heart" size={22} color="#EF4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 30,
  },
  bizCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    gap: 12,
  },
  bizAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bizName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  bizAddress: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  hoursText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  heartBtn: {
    padding: 6,
  },
});
