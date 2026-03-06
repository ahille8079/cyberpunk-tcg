-- Profiles table with human-readable usernames
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: profiles readable by everyone, only owner can update
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      -- Regular users cannot change their own role
      role = (SELECT role FROM profiles WHERE id = auth.uid())
      -- Unless they are already an admin
      OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    )
  );

-- Add short slug to decks for shareable URLs (e.g. /decks/xK9mQ2)
ALTER TABLE decks ADD COLUMN slug TEXT UNIQUE;

-- Generate a short random slug (8 chars, alphanumeric)
CREATE OR REPLACE FUNCTION generate_slug()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate slug for new decks
CREATE OR REPLACE FUNCTION set_deck_slug()
RETURNS TRIGGER AS $$
DECLARE
  new_slug TEXT;
BEGIN
  IF NEW.slug IS NULL THEN
    LOOP
      new_slug := generate_slug();
      EXIT WHEN NOT EXISTS (SELECT 1 FROM decks WHERE slug = new_slug);
    END LOOP;
    NEW.slug := new_slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_deck_insert_set_slug
  BEFORE INSERT ON decks
  FOR EACH ROW EXECUTE FUNCTION set_deck_slug();

-- Auto-create profile on signup, using Discord metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  suffix INT := 0;
BEGIN
  -- Pull username from Discord metadata
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'preferred_username',
    NEW.raw_user_meta_data->>'user_name',
    NEW.raw_user_meta_data->>'name',
    split_part(COALESCE(NEW.email, ''), '@', 1),
    'runner'
  );
  -- Lowercase, strip non-alphanumeric (keep hyphens/underscores)
  base_username := lower(regexp_replace(base_username, '[^a-zA-Z0-9_-]', '', 'g'));
  IF base_username = '' THEN base_username := 'runner'; END IF;

  -- Ensure uniqueness by appending a number if needed
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  END LOOP;

  INSERT INTO profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Backfill slugs for any existing decks
UPDATE decks SET slug = generate_slug() WHERE slug IS NULL;

-- Index for slug lookups
CREATE INDEX idx_decks_slug ON decks(slug);
CREATE INDEX idx_profiles_username ON profiles(username);
