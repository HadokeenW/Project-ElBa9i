// Wilayas d'Algérie principales pour le MVP Baraka Food
export interface Wilaya {
  code: string;
  name: string;
  latitude: number;
  longitude: number;
}

export const WILAYAS: Wilaya[] = [
  { code: '16', name: 'Alger', latitude: 36.7538, longitude: 3.0588 },
  { code: '31', name: 'Oran', latitude: 35.6987, longitude: -0.6349 },
  { code: '25', name: 'Constantine', latitude: 36.3650, longitude: 6.6147 },
  { code: '09', name: 'Blida', latitude: 36.4700, longitude: 2.8277 },
  { code: '19', name: 'Sétif', latitude: 36.1911, longitude: 5.4137 },
  { code: '23', name: 'Annaba', latitude: 36.9000, longitude: 7.7667 },
  { code: '15', name: 'Tizi Ouzou', latitude: 36.7118, longitude: 4.0459 },
  { code: '06', name: 'Béjaïa', latitude: 36.7558, longitude: 5.0843 },
  { code: '35', name: 'Boumerdès', latitude: 36.7664, longitude: 3.4772 },
  { code: '42', name: 'Tipaza', latitude: 36.5925, longitude: 2.4475 },
];

export const DEFAULT_WILAYA = WILAYAS[0]; // Alger
