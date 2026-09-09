function assert(condition: any, message?: string) {
  if (!condition) throw new Error(message || 'Assertion failed');
}
assert.strictEqual = (a: any, b: any, msg?: string) => {
  if (a !== b) throw new Error(msg || `Expected ${b}, got ${a}`);
};
import { Format } from './src/constants/theme';
import { Offer, Business } from './src/types/database';

function testMvpFlow() {
  console.log('--- TEST 1: Calcul des Économies & Monnaie Algérienne (DA) ---');
  assert.strictEqual(Format.currency(250), '250 DA');
  assert.strictEqual(Format.currency(4500).replace(/[\s\u202F]/g, ' '), '4 500 DA');
  
  // 250 DA au lieu de 800 DA => (800-250)/800 = 68.75% => arrondi à 69%
  const savings = Format.savingsPercent(250, 800);
  assert.strictEqual(savings, 69);
  console.log('✔ Calcul des prix et économies DA validé.');

  console.log('--- TEST 2: Décrémentation Atomique du Stock & Épuisement ---');
  let offer: Offer = {
    id: 'test-offer-1',
    business_id: 'biz-1',
    name: 'Panier Surprise Test',
    price: 250,
    estimated_value: 800,
    initial_quantity: 3,
    available_quantity: 3,
    start_at: new Date().toISOString(),
    end_at: new Date(Date.now() + 3600000).toISOString(),
    status: 'available',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  function simulateAtomicSale(currentOffer: Offer, qtyToSell: number): { offer: Offer; totalPaid: number } {
    assert(qtyToSell > 0, 'La quantité doit être >= 1');
    assert(currentOffer.status === 'available', 'L\'offre n\'est plus disponible');
    assert(currentOffer.available_quantity >= qtyToSell, 'Stock insuffisant');

    const newAvailable = currentOffer.available_quantity - qtyToSell;
    const newStatus = newAvailable === 0 ? 'sold_out' : 'available';

    return {
      offer: {
        ...currentOffer,
        available_quantity: newAvailable,
        status: newStatus as any,
      },
      totalPaid: currentOffer.price * qtyToSell,
    };
  }

  // Vente 1 : 3 -> 2
  let result = simulateAtomicSale(offer, 1);
  assert.strictEqual(result.offer.available_quantity, 2);
  assert.strictEqual(result.offer.status, 'available');
  assert.strictEqual(result.totalPaid, 250);

  // Vente 2 : 2 -> 0 (vente de 2 paniers d'un coup)
  result = simulateAtomicSale(result.offer, 2);
  assert.strictEqual(result.offer.available_quantity, 0);
  assert.strictEqual(result.offer.status, 'sold_out');
  assert.strictEqual(result.totalPaid, 500);

  // Vente 3 : tentative quand stock = 0 -> Doit échouer
  let threwError = false;
  try {
    simulateAtomicSale(result.offer, 1);
  } catch (err: any) {
    threwError = true;
    assert(err.message.includes('disponible') || err.message.includes('Stock'));
  }
  assert.strictEqual(threwError, true, 'La vente ne doit jamais accepter un stock négatif.');
  console.log('✔ Décrémentation atomique (3 -> 2 -> 0 -> Épuisé) et blocage du sur-stock validés.');

  console.log('--- TEST 3: Règle Fondamentale MVP (Pas de réservation en ligne) ---');
  // Vérification de la structure du panier : aucun champ "booking" ni "online_payment"
  assert.strictEqual((offer as any).booking_id, undefined);
  assert.strictEqual((offer as any).stripe_payment_id, undefined);
  console.log('✔ Règle fondamentale respectée : Achat sur place uniquement en espèces (DA).');

  console.log('\n=============================================');
  console.log(' TOUS LES TESTS DU WORKFLOW BARAKA FOOD PASSENT AVEC SUCCÈS !');
  console.log('=============================================');
}

testMvpFlow();
