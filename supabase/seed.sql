-- ==============================================================================
-- BARAKA FOOD — Seed Data pour l'Algérie (Alger, Oran, etc.)
-- ==============================================================================

-- Profils de test (exemples pour le développement)
-- Note: Dans un environnement réel Supabase, ces IDs viennent de auth.users
DO $$
DECLARE
    v_boulangerie_cat UUID;
    v_patisserie_cat UUID;
    v_fastfood_cat UUID;
    v_restaurant_cat UUID;
    v_supermarche_cat UUID;
    
    v_biz_owner1 UUID := '11111111-1111-1111-1111-111111111111';
    v_biz_owner2 UUID := '22222222-2222-2222-2222-222222222222';
    v_biz_owner3 UUID := '33333333-3333-3333-3333-333333333333';
    
    v_biz1_id UUID := 'a1111111-1111-1111-1111-111111111111';
    v_biz2_id UUID := 'a2222222-2222-2222-2222-222222222222';
    v_biz3_id UUID := 'a3333333-3333-3333-3333-333333333333';
BEGIN
    SELECT id INTO v_boulangerie_cat FROM public.categories WHERE name = 'Boulangeries' LIMIT 1;
    SELECT id INTO v_patisserie_cat FROM public.categories WHERE name = 'Pâtisseries' LIMIT 1;
    SELECT id INTO v_fastfood_cat FROM public.categories WHERE name = 'Fast-food' LIMIT 1;
    SELECT id INTO v_restaurant_cat FROM public.categories WHERE name = 'Restaurants' LIMIT 1;
    SELECT id INTO v_supermarche_cat FROM public.categories WHERE name = 'Supermarchés' LIMIT 1;

    -- Création d'entreprises partenaires d'exemple à Alger
    INSERT INTO public.businesses (id, owner_id, name, description, category_id, phone, address, wilaya, latitude, longitude, status, opening_hours)
    VALUES
    (
        v_biz1_id,
        v_biz_owner1,
        'Boulangerie L''Artisan d''Alger',
        'Pains traditionnels, baguettes de campagne et viennoiseries fraîches cuites au feu de bois.',
        v_boulangerie_cat,
        '0550123456',
        '14 Rue Didouche Mourad, Alger Centre',
        'Alger',
        36.7725,
        3.0586,
        'active',
        '07:00 - 21:00'
    ),
    (
        v_biz2_id,
        v_biz_owner2,
        'Pâtisserie La Rose de Bab Ezzouar',
        'Gâteaux traditionnels algériens, mille-feuilles, tartes aux fruits et douceurs du jour.',
        v_patisserie_cat,
        '0661987654',
        'Cité 5 Juillet, Bab Ezzouar',
        'Alger',
        36.7196,
        3.1833,
        'active',
        '08:00 - 22:00'
    ),
    (
        v_biz3_id,
        v_biz_owner3,
        'Burger & Co Sidi Yahia',
        'Burgers gourmets, paninis et tenders préparés chaque jour avec des ingrédients locaux.',
        v_fastfood_cat,
        '0770334455',
        'Boulevard Sidi Yahia, Hydra',
        'Alger',
        36.7389,
        3.0334,
        'active',
        '11:30 - 23:30'
    )
    ON CONFLICT (id) DO NOTHING;

    -- Offres de paniers surprise d'exemple
    INSERT INTO public.offers (
        business_id,
        name,
        description,
        price,
        estimated_value,
        initial_quantity,
        available_quantity,
        start_at,
        end_at,
        status
    )
    VALUES
    (
        v_biz1_id,
        'Panier Pains & Viennoiseries',
        'Assortiment de 2 baguettes tradition, 3 croissants au beurre et 2 pains au chocolat du jour.',
        250.00,
        800.00,
        5,
        4,
        NOW() - INTERVAL '1 hour',
        NOW() + INTERVAL '3 hours',
        'available'
    ),
    (
        v_biz2_id,
        'Panier Pâtisseries & Douceurs',
        'Sélection de 4 parts de gâteaux variés (mille-feuille, éclair café, tarte citron) encore ultra frais.',
        350.00,
        1200.00,
        3,
        2,
        NOW() - INTERVAL '30 minutes',
        NOW() + INTERVAL '4 hours',
        'available'
    ),
    (
        v_biz3_id,
        'Panier Fast-Food du Soir',
        '1 burger gourmet + portions de frites + sauces maison préparés pour le service.',
        400.00,
        1100.00,
        4,
        3,
        NOW() + INTERVAL '1 hour',
        NOW() + INTERVAL '5 hours',
        'available'
    );
END $$;
