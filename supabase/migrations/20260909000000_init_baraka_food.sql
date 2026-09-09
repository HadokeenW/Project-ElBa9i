-- ==============================================================================
-- BARAKA FOOD — Migration Initiale Supabase PostgreSQL
-- Marché Algérien | Modèle Anti-Gaspillage Alimentaire (Pas de réservation)
-- ==============================================================================

-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLE PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('client', 'business', 'admin')) DEFAULT 'client',
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 2. TABLE CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    icon TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 3. TABLE BUSINESSES
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    logo_url TEXT,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    wilaya TEXT NOT NULL DEFAULT 'Alger',
    latitude DOUBLE PRECISION NOT NULL DEFAULT 36.7538,
    longitude DOUBLE PRECISION NOT NULL DEFAULT 3.0588,
    status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'suspended')) DEFAULT 'active',
    opening_hours TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 4. TABLE SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('active', 'expiring_soon', 'expired', 'suspended')) DEFAULT 'active',
    start_date TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    end_date TIMESTAMPTZ NOT NULL DEFAULT (TIMEZONE('utc', NOW()) + INTERVAL '30 days'),
    plan TEXT NOT NULL DEFAULT 'standard_2000da',
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 5. TABLE OFFERS
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    estimated_value NUMERIC(10, 2) NOT NULL CHECK (estimated_value >= price),
    initial_quantity INT NOT NULL CHECK (initial_quantity >= 1),
    available_quantity INT NOT NULL CHECK (available_quantity >= 0),
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'scheduled', 'available', 'sold_out', 'expired', 'disabled')) DEFAULT 'available',
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 6. TABLE SALES
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    quantity INT NOT NULL CHECK (quantity >= 1),
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 7. TABLE FAVORITES
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, business_id)
);

-- 8. TABLE REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(sale_id)
);

-- 9. TABLE NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'general',
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 10. TABLE REPORTS
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('business', 'offer', 'user')),
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')) DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    resolved_at TIMESTAMPTZ
);

-- ==============================================================================
-- INDEXES DE PERFORMANCE ET RECHERCHE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON public.businesses(category_id);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON public.businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_location ON public.businesses(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_offers_business ON public.offers(business_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON public.offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_dates ON public.offers(start_at, end_at);
CREATE INDEX IF NOT EXISTS idx_offers_available ON public.offers(available_quantity);

CREATE INDEX IF NOT EXISTS idx_sales_business ON public.sales(business_id);
CREATE INDEX IF NOT EXISTS idx_sales_client ON public.sales(client_id);
CREATE INDEX IF NOT EXISTS idx_reviews_business ON public.reviews(business_id);

-- ==============================================================================
-- FONCTION ATOMIQUE DE VENTE (Diminution du stock sans concurrence)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.record_sale(
    p_offer_id UUID,
    p_quantity INT,
    p_client_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_offer RECORD;
    v_sale_id UUID;
    v_new_available INT;
    v_new_status TEXT;
BEGIN
    IF p_quantity < 1 THEN
        RAISE EXCEPTION 'La quantité doit être supérieure ou égale à 1';
    END IF;

    -- Verrouillage exclusif de la ligne de l'offre (atomicité)
    SELECT * INTO v_offer
    FROM public.offers
    WHERE id = p_offer_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Offre non trouvée';
    END IF;

    IF v_offer.status != 'available' THEN
        RAISE EXCEPTION 'Cette offre n''est plus disponible (statut: %)', v_offer.status;
    END IF;

    IF v_offer.available_quantity < p_quantity THEN
        RAISE EXCEPTION 'Stock insuffisant. Quantité restante: %', v_offer.available_quantity;
    END IF;

    v_new_available := v_offer.available_quantity - p_quantity;
    v_new_status := CASE WHEN v_new_available = 0 THEN 'sold_out' ELSE 'available' END;

    -- Mise à jour de l'offre
    UPDATE public.offers
    SET 
        available_quantity = v_new_available,
        status = v_new_status,
        updated_at = TIMEZONE('utc', NOW())
    WHERE id = p_offer_id;

    -- Enregistrement de la vente
    INSERT INTO public.sales (
        offer_id,
        business_id,
        client_id,
        quantity,
        unit_price,
        total_price
    )
    VALUES (
        p_offer_id,
        v_offer.business_id,
        p_client_id,
        p_quantity,
        v_offer.price,
        v_offer.price * p_quantity
    )
    RETURNING id INTO v_sale_id;

    RETURN jsonb_build_object(
        'success', true,
        'sale_id', v_sale_id,
        'offer_id', p_offer_id,
        'quantity_sold', p_quantity,
        'new_available_quantity', v_new_available,
        'status', v_new_status
    );
END;
$$;

-- ==============================================================================
-- TRIGGER POUR LA CRÉATION AUTOMATIQUE DU PROFIL LORS DE L'INSCRIPTION
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, role, full_name, phone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
        NEW.raw_user_meta_data->>'phone'
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Profiles: lecture par tout utilisateur authentifié, modification uniquement de son propre profil
CREATE POLICY "Profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Categories: consultable par tout le monde
CREATE POLICY "Categories viewable by everyone" 
ON public.categories FOR SELECT USING (true);

-- Businesses: visibles si actives (ou si propriétaire)
CREATE POLICY "Active businesses viewable by all" 
ON public.businesses FOR SELECT USING (status = 'active' OR auth.uid() = owner_id);

CREATE POLICY "Owners can insert business" 
ON public.businesses FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own business" 
ON public.businesses FOR UPDATE TO authenticated USING (auth.uid() = owner_id);

-- Subscriptions: visibles par le propriétaire de l'entreprise
CREATE POLICY "Business owners can view own subscription" 
ON public.subscriptions FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.businesses WHERE businesses.id = subscriptions.business_id AND businesses.owner_id = auth.uid()));

-- Offers: visibles si disponibles (ou si propriétaire de l'entreprise)
CREATE POLICY "Available offers viewable by all" 
ON public.offers FOR SELECT USING (
    status = 'available' 
    OR EXISTS (SELECT 1 FROM public.businesses WHERE businesses.id = offers.business_id AND businesses.owner_id = auth.uid())
);

CREATE POLICY "Owners can insert offers" 
ON public.offers FOR INSERT TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE businesses.id = offers.business_id AND businesses.owner_id = auth.uid()));

CREATE POLICY "Owners can update offers" 
ON public.offers FOR UPDATE TO authenticated 
USING (EXISTS (SELECT 1 FROM public.businesses WHERE businesses.id = offers.business_id AND businesses.owner_id = auth.uid()));

CREATE POLICY "Owners can delete offers" 
ON public.offers FOR DELETE TO authenticated 
USING (EXISTS (SELECT 1 FROM public.businesses WHERE businesses.id = offers.business_id AND businesses.owner_id = auth.uid()));

-- Sales: visibles par le client ou le commerçant concerné
CREATE POLICY "Sales viewable by parties" 
ON public.sales FOR SELECT TO authenticated 
USING (
    client_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM public.businesses WHERE businesses.id = sales.business_id AND businesses.owner_id = auth.uid())
);

CREATE POLICY "Business owners can insert sales" 
ON public.sales FOR INSERT TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE businesses.id = sales.business_id AND businesses.owner_id = auth.uid()));

-- Favorites: chaque client gère ses favoris
CREATE POLICY "Users can view own favorites" 
ON public.favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" 
ON public.favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" 
ON public.favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Reviews: lecture publique, insertion si client
CREATE POLICY "Reviews viewable by everyone" 
ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Users can write reviews" 
ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Notifications: lecture de ses propres notifications
CREATE POLICY "Users can view own notifications" 
ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Reports: insertion par tout utilisateur
CREATE POLICY "Users can insert reports" 
ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

-- ==============================================================================
-- DONNÉES INITIALES (Catégories Algérie)
-- ==============================================================================
INSERT INTO public.categories (name, icon, sort_order) VALUES
('Boulangeries', 'bread-slice', 1),
('Pâtisseries', 'cake', 2),
('Fast-food', 'hamburger', 3),
('Restaurants', 'utensils', 4),
('Cafés', 'coffee', 5),
('Supermarchés', 'shopping-cart', 6),
('Épiceries', 'store', 7),
('Hôtels', 'hotel', 8),
('Traiteurs', 'concierge-bell', 9),
('Autres', 'box', 10)
ON CONFLICT (name) DO NOTHING;
