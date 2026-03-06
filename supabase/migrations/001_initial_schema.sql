-- Cyberpunk TCG Database Schema

-- Cards table
CREATE TABLE cards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  card_type TEXT NOT NULL CHECK (card_type IN ('legend', 'unit', 'gear', 'program')),
  color TEXT NOT NULL,
  ram_cost INTEGER,
  ram_provided INTEGER,
  eddie_cost INTEGER NOT NULL DEFAULT 0,
  power INTEGER,
  has_sell_tag BOOLEAN NOT NULL DEFAULT false,
  street_cred_requirement INTEGER,
  classification TEXT[] NOT NULL DEFAULT '{}',
  keywords TEXT[] NOT NULL DEFAULT '{}',
  ability_text TEXT,
  flavor_text TEXT,
  image_url TEXT,
  set_code TEXT NOT NULL DEFAULT 'ALPHA',
  set_name TEXT NOT NULL DEFAULT 'Alpha Kit Set',
  card_number TEXT,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'secret', 'iconic', 'nova')),
  printing TEXT NOT NULL DEFAULT 'standard' CHECK (printing IN ('standard', 'foil')),
  artist TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Decks table
CREATE TABLE decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  legend_1_id TEXT REFERENCES cards(id),
  legend_2_id TEXT REFERENCES cards(id),
  legend_3_id TEXT REFERENCES cards(id),
  is_public BOOLEAN NOT NULL DEFAULT true,
  upvotes INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Deck cards junction table
CREATE TABLE deck_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL REFERENCES cards(id),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity BETWEEN 1 AND 3),
  UNIQUE(deck_id, card_id)
);

-- Row Level Security

-- Cards: readable by everyone
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cards are viewable by everyone"
  ON cards FOR SELECT
  USING (true);

-- Decks: public decks readable by anyone, only owner can modify
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public decks are viewable by everyone"
  ON decks FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert own decks"
  ON decks FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own decks"
  ON decks FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own decks"
  ON decks FOR DELETE
  USING (auth.uid() = user_id);

-- Deck cards: follow deck ownership
ALTER TABLE deck_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Deck cards viewable with deck"
  ON deck_cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = deck_cards.deck_id
      AND (decks.is_public = true OR decks.user_id = auth.uid())
    )
  );
CREATE POLICY "Users can manage own deck cards"
  ON deck_cards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = deck_cards.deck_id
      AND decks.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_cards_type ON cards(card_type);
CREATE INDEX idx_cards_color ON cards(color);
CREATE INDEX idx_cards_rarity ON cards(rarity);
CREATE INDEX idx_cards_set_code ON cards(set_code);
CREATE INDEX idx_cards_name ON cards(name);
CREATE INDEX idx_decks_user_id ON decks(user_id);
CREATE INDEX idx_decks_is_public ON decks(is_public);
CREATE INDEX idx_deck_cards_deck_id ON deck_cards(deck_id);
CREATE INDEX idx_deck_cards_card_id ON deck_cards(card_id);
