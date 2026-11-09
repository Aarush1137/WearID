-- ==============================================================================
-- Fit / WearID — Master Database Schema (Supabase PostgreSQL DDL)
-- All measurements internally stored in canonical units (canonical integer millimeters _mm and grams weight_g)
-- Row Level Security (RLS) enabled on all user-owned tables
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. USERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE NOT NULL,
  full_name       TEXT,
  avatar_color    TEXT,          -- hex color code for initials avatar display
  preferred_unit  TEXT DEFAULT 'cm' CHECK (preferred_unit IN ('cm', 'in')),
  role            TEXT DEFAULT 'customer'
                  CHECK (role IN ('customer', 'contributor', 'verifier', 'brand_rep', 'admin', 'developer')),
  onboarding_complete BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own user record"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own user record"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own user record"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 2. PROFILES TABLE (One user -> Many profiles: self, partner, parent, etc.)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  gender              TEXT CHECK (gender IN ('male', 'female', 'nonbinary', 'prefer_not_to_say')),
  shopping_categories TEXT[] DEFAULT ARRAY['mens'],
  relationship        TEXT DEFAULT 'self'
                      CHECK (relationship IN ('self', 'partner', 'spouse', 'parent', 'sibling', 'friend', 'other')),
  is_primary          BOOLEAN DEFAULT false,
  consent_given       BOOLEAN DEFAULT false, -- Required for any non-self profile
  consent_given_at    TIMESTAMPTZ,
  is_archived         BOOLEAN DEFAULT false,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own profiles"
  ON profiles FOR ALL
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 3. BODY MEASUREMENTS TABLE (Layer 1 — Append-only history)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS body_measurements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recorded_at     TIMESTAMPTZ DEFAULT now(),
  is_current           BOOLEAN DEFAULT true,

  -- Core measurements (stored in canonical integer millimeters mm / grams g - Invariant 4)
  height_mm       INTEGER CHECK (height_mm > 0),
  weight_g        INTEGER CHECK (weight_g > 0),          -- Optional; never sole sizing input
  chest_mm        INTEGER CHECK (chest_mm > 0),
  bust_mm         INTEGER,          -- For women's profiles
  waist_mm        INTEGER,
  hips_mm         INTEGER,
  shoulder_width_mm INTEGER,
  inseam_mm       INTEGER,
  foot_length_mm  INTEGER,

  -- Extended measurements
  neck_mm             INTEGER,
  sleeve_length_mm    INTEGER,
  body_length_mm      INTEGER,      -- HPS to waist
  arm_circumference_mm INTEGER,
  thigh_mm            INTEGER,
  knee_mm             INTEGER,
  ankle_mm            INTEGER,
  wrist_mm            INTEGER,
  head_circumference_mm INTEGER,
  torso_length_mm     INTEGER,      -- Neckline to waist, for kurtas

  -- Accessories (canonical integer mm)
  ring_index_mm    INTEGER,
  ring_middle_mm   INTEGER,
  ring_ring_mm     INTEGER,
  ring_pinky_mm    INTEGER,
  bangle_diameter_mm INTEGER,

  -- Provenance per field
  measurement_method JSONB DEFAULT '{}'::jsonb,
  notes TEXT
);

ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access measurements for their profiles"
  ON body_measurements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = body_measurements.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- 4. FIT PREFERENCES TABLE (Layer 4 — Category-specific fit intent)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fit_preferences (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category    TEXT NOT NULL,
  fit_type    TEXT NOT NULL CHECK (fit_type IN ('slim', 'regular', 'relaxed', 'oversized')),
  notes       TEXT,
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (profile_id, category)
);

ALTER TABLE fit_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage fit preferences for their profiles"
  ON fit_preferences FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = fit_preferences.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- 5. BRANDS DIRECTORY TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS brands (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT UNIQUE NOT NULL,
  name             TEXT NOT NULL,
  logo_url         TEXT,
  website_url      TEXT,
  india_website_url TEXT,
  country_of_origin TEXT DEFAULT 'IN',
  india_primary    BOOLEAN DEFAULT true,
  is_verified      BOOLEAN DEFAULT false,
  is_community_added BOOLEAN DEFAULT false,
  verified_by_brand  BOOLEAN DEFAULT false,
  status           TEXT DEFAULT 'planned'
                   CHECK (status IN ('planned', 'collecting', 'available', 'suspended')),
  partnership_status TEXT DEFAULT 'none'
                   CHECK (partnership_status IN ('none', 'approached', 'partner', 'api')),
  data_access_status TEXT DEFAULT 'unknown'
                   CHECK (data_access_status IN ('unknown', 'permitted', 'permission_required', 'not_permitted', 'api_available')),
  crawl_status     TEXT DEFAULT 'not_started'
                   CHECK (crawl_status IN ('not_started', 'in_progress', 'complete', 'failed', 'blocked')),
  size_chart_url   TEXT,
  supported_size_systems TEXT[] DEFAULT ARRAY['IN'],
  reliability_score NUMERIC(3,2),              -- 0.00–1.00
  data_quality     TEXT CHECK (data_quality IN ('low', 'medium', 'high', 'verified')),
  latest_verified_at TIMESTAMPTZ,
  product_categories TEXT[],
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to brands"
  ON brands FOR SELECT
  USING (true);

CREATE POLICY "Admin write access to brands"
  ON brands FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ------------------------------------------------------------------------------
-- 6. BRAND SIZE CHARTS TABLE (Layer 2 — Brand Body-Fit Ranges)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS brand_size_charts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id        UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  gender          TEXT CHECK (gender IN ('male', 'female', 'unisex')),
  category        TEXT NOT NULL,
  subcategory     TEXT,
  fit_type        TEXT CHECK (fit_type IN ('slim', 'regular', 'relaxed', 'oversized')),
  size_label      TEXT NOT NULL,
  size_system     TEXT DEFAULT 'IN' CHECK (size_system IN ('IN', 'UK', 'EU', 'US', 'numeric')),
  sort_order      INT DEFAULT 0,

  -- Body fit ranges in canonical integer mm (Invariant 4)
  chest_min_mm    INTEGER, chest_max_mm    INTEGER,
  waist_min_mm    INTEGER, waist_max_mm    INTEGER,
  hips_min_mm     INTEGER, hips_max_mm     INTEGER,
  shoulder_min_mm INTEGER, shoulder_max_mm INTEGER,
  height_min_mm   INTEGER, height_max_mm   INTEGER,
  inseam_min_mm   INTEGER, inseam_max_mm   INTEGER,
  neck_min_mm     INTEGER, neck_max_mm     INTEGER,
  sleeve_min_mm   INTEGER, sleeve_max_mm   INTEGER,
  thigh_min_mm    INTEGER, thigh_max_mm    INTEGER,

  -- Provenance metadata (Invariant 2)
  source_type          TEXT CHECK (source_type IN ('brand_official', 'retailer_api', 'curated_dataset', 'user_measured_physical', 'contributor_verified')),
  source_uri           TEXT,
  retrieved_at         TIMESTAMPTZ DEFAULT now(),
  verification_hash    TEXT,
  license_or_permission TEXT,
  collection_method    TEXT CHECK (collection_method IN ('scraped', 'manual', 'brand_submitted', 'community_contributed')),
  original_unit        TEXT DEFAULT 'mm',
  verified_by          UUID REFERENCES users(id),
  verified_at          TIMESTAMPTZ,
  last_checked_at      TIMESTAMPTZ,
  confidence           NUMERIC(3,2),
  community_correction_factor NUMERIC(3,2) DEFAULT 0,
  notes                TEXT,
  is_active            BOOLEAN DEFAULT true
);

ALTER TABLE brand_size_charts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to active brand size charts"
  ON brand_size_charts FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin write access to brand size charts"
  ON brand_size_charts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ------------------------------------------------------------------------------
-- 7. PRODUCTS TABLE (Master Product Catalog)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id        UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  external_id     TEXT,          -- SKU or product code
  name            TEXT NOT NULL,
  description     TEXT,
  gender          TEXT CHECK (gender IN ('male', 'female', 'unisex')),
  category        TEXT NOT NULL,
  subcategory     TEXT,
  fit_type        TEXT,
  fabric_composition TEXT,
  stretch_level   TEXT CHECK (stretch_level IN ('none', 'low', 'medium', 'high')),
  product_url     TEXT,
  image_url       TEXT,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to active products"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin write access to products"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ------------------------------------------------------------------------------
-- 8. GARMENT MEASUREMENTS TABLE (Layer 3 — Physical Garment Dimensions Flat)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS garment_measurements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size_label      TEXT NOT NULL,
  size_system     TEXT DEFAULT 'IN',

  -- Garment dimensions (flat / half-circumference in canonical integer mm - Invariant 3 & 4)
  chest_flat_mm           INTEGER CHECK (chest_flat_mm > 0),  -- multiply x 2 for full circumference
  shoulder_mm             INTEGER,  -- seam to seam
  length_mm               INTEGER,  -- HPS to hem
  waist_flat_mm           INTEGER,
  hips_flat_mm            INTEGER,
  sleeve_length_mm        INTEGER,
  bicep_flat_mm           INTEGER,
  cuff_flat_mm            INTEGER,
  collar_circumference_mm INTEGER,
  inseam_mm               INTEGER,
  outseam_mm              INTEGER,
  rise_mm                 INTEGER,  -- waistband to crotch seam
  thigh_flat_mm           INTEGER,
  leg_opening_flat_mm     INTEGER,

  -- Provenance metadata (Invariant 2)
  source_type             TEXT CHECK (source_type IN ('brand_official', 'retailer_api', 'curated_dataset', 'user_measured_physical', 'contributor_verified')),
  source_uri              TEXT,
  retrieved_at            TIMESTAMPTZ DEFAULT now(),
  verification_hash       TEXT,
  license_or_permission   TEXT,
  measurement_method      TEXT CHECK (measurement_method IN ('laid_flat', 'hanging', 'on_form')),
  measured_by             TEXT CHECK (measured_by IN ('brand', 'admin', 'contributor')),
  contributor_id          UUID REFERENCES users(id),
  original_unit           TEXT DEFAULT 'mm',
  verified_at             TIMESTAMPTZ,
  verified_by             UUID REFERENCES users(id),
  confidence              NUMERIC(3,2),
  notes                   TEXT
);

ALTER TABLE garment_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to verified garment measurements"
  ON garment_measurements FOR SELECT
  USING (verified_at IS NOT NULL);

CREATE POLICY "Admin write access to garment measurements"
  ON garment_measurements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ------------------------------------------------------------------------------
-- 9. REFERENCE GARMENTS TABLE (User's Owned Clothing Calibration Anchors)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reference_garments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  brand_id        UUID REFERENCES brands(id),
  brand_name_raw  TEXT,
  category        TEXT NOT NULL,
  size_label      TEXT NOT NULL,
  fit_type        TEXT,
  fit_quality     TEXT NOT NULL
                  CHECK (fit_quality IN ('perfect', 'slightly_loose', 'slightly_tight', 'too_loose', 'too_tight')),
  chest_flat_mm   INTEGER,
  shoulder_mm     INTEGER,
  length_mm       INTEGER,
  notes           TEXT,
  photo_url       TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE reference_garments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their reference garments"
  ON reference_garments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = reference_garments.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- 10. COMMUNITY CONTRIBUTIONS TABLE (Staging & Moderation Queue)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS community_contributions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id  UUID NOT NULL REFERENCES users(id),
  contribution_type TEXT NOT NULL
                  CHECK (contribution_type IN ('new_brand', 'new_product', 'size_chart', 'garment_measurement', 'correction', 'product_url', 'brand_url')),
  brand_id        UUID REFERENCES brands(id),
  product_id      UUID REFERENCES products(id),
  data            JSONB NOT NULL,
  source_url      TEXT,
  evidence_url    TEXT,
  status          TEXT DEFAULT 'pending'
                  CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'duplicate')),
  reviewed_by     UUID REFERENCES users(id),
  reviewed_at     TIMESTAMPTZ,
  reviewer_notes  TEXT,
  duplicate_of    UUID REFERENCES community_contributions(id),
  reputation_points_awarded INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT cannot_verify_own_submission CHECK (contributor_id <> reviewed_by)
);

ALTER TABLE community_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contributors can view their own submissions"
  ON community_contributions FOR SELECT
  USING (auth.uid() = contributor_id);

CREATE POLICY "Contributors can insert submissions"
  ON community_contributions FOR INSERT
  WITH CHECK (auth.uid() = contributor_id);

-- ------------------------------------------------------------------------------
-- 11. COMMUNITY FIT FEEDBACK TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS community_fit_feedback (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id           UUID NOT NULL REFERENCES profiles(id),
  product_id           UUID REFERENCES products(id),
  brand_id             UUID REFERENCES brands(id),
  category             TEXT,
  size_ordered         TEXT NOT NULL,
  fit_result           TEXT NOT NULL CHECK (fit_result IN ('perfect', 'slightly_tight', 'too_tight', 'slightly_loose', 'too_loose', 'returned')),
  problem_areas        TEXT[],
  recommendation_was_accurate BOOLEAN,
  measurement_snapshot_id UUID REFERENCES body_measurements(id),
  created_at           TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE community_fit_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create and view feedback for their profiles"
  ON community_fit_feedback FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = community_fit_feedback.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- 12. SIZE RECOMMENDATIONS TABLE (Audit & Cache History)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS size_recommendations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id          UUID NOT NULL REFERENCES profiles(id),
  product_id          UUID REFERENCES products(id),
  brand_id            UUID NOT NULL REFERENCES brands(id),
  category            TEXT NOT NULL,
  recommended_size    TEXT,
  alternative_size    TEXT,
  confidence          NUMERIC(3,2),
  confidence_label    TEXT CHECK (confidence_label IN ('high', 'medium', 'low', 'insufficient')),
  fit_type_used       TEXT,
  explanation_json    JSONB,
  explanation_text    TEXT,
  data_sources        JSONB,
  measurement_version_id UUID REFERENCES body_measurements(id),
  created_at          TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE size_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recommendations generated for their profiles"
  ON size_recommendations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = size_recommendations.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- 13. INDIASIZE REFERENCE TABLE (Read-Only Anthropometric Baseline)
-- Enforces empty state until formal NIFT licensing is confirmed.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS indiasize_reference (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gender          TEXT CHECK (gender IN ('male', 'female')),
  size_code       TEXT NOT NULL,
  chest_min_cm    NUMERIC(5,1), chest_max_cm    NUMERIC(5,1),
  waist_min_cm    NUMERIC(5,1), waist_max_cm    NUMERIC(5,1),
  hips_min_cm     NUMERIC(5,1), hips_max_cm     NUMERIC(5,1),
  height_min_cm   NUMERIC(5,1), height_max_cm   NUMERIC(5,1),
  source          TEXT DEFAULT 'NIFT INDIAsize January 2026',
  license_status  TEXT DEFAULT 'pending_confirmation',
  license_notes   TEXT,
  CONSTRAINT indiasize_empty CHECK (false)
  -- DO NOT REMOVE THIS CONSTRAINT WITHOUT WRITTEN LICENSING CONFIRMATION FROM NIFT
);

ALTER TABLE indiasize_reference ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to indiasize reference"
  ON indiasize_reference FOR SELECT
  USING (true);
