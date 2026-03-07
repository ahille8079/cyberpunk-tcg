-- User Stash (personal card collection)
-- Each user has one implicit stash; user_id on each row is the stash identity.

CREATE TABLE stash_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL REFERENCES cards(id),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, card_id)
);

ALTER TABLE stash_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stash"
  ON stash_cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stash cards"
  ON stash_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stash cards"
  ON stash_cards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stash cards"
  ON stash_cards FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_stash_cards_user_id ON stash_cards(user_id);
CREATE INDEX idx_stash_cards_card_id ON stash_cards(card_id);
