// Palette de couleurs et constantes UI pour Baraka Food
export const Colors = {
  // Couleur primaire: vert anti-gaspillage et fraîcheur
  primary: '#10B981', // Emerald 500
  primaryDark: '#047857', // Emerald 700
  primaryLight: '#D1FAE5', // Emerald 100

  // Couleur secondaire: ambre / orange chaleureux (pain chaud, gourmandise)
  secondary: '#F59E0B',
  secondaryLight: '#FEF3C7',

  // Alertes de disponibilité (critère clé du MVP)
  available: '#10B981', // 🟢 Disponible
  lowStock: '#F59E0B',  // 🟡 Peu disponible (< 3)
  soldOut: '#EF4444',   // 🔴 Épuisé

  // Arrière-plans et cartes
  background: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceSubtle: '#F3F4F6',

  // Typographie & Bordures
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  borderFocus: '#10B981',

  // Neutres
  white: '#FFFFFF',
  black: '#000000',
  cardShadow: 'rgba(0, 0, 0, 0.05)',
};

export const Format = {
  // Formatage standard Dinar Algérien
  currency: (amount: number): string => {
    return `${Math.round(amount).toLocaleString('fr-DZ')} DA`;
  },
  
  // Formatage d'heure HH:MM
  time: (isoString: string): string => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  },

  // Calcul du pourcentage d'économie
  savingsPercent: (price: number, estimatedValue: number): number => {
    if (estimatedValue <= 0 || price >= estimatedValue) return 0;
    return Math.round(((estimatedValue - price) / estimatedValue) * 100);
  }
};
