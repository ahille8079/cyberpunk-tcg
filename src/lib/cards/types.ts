export type CardType = "legend" | "unit" | "gear" | "program";

export type CardPrinting = "standard" | "foil";

export type CardRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "secret"
  | "iconic"
  | "nova";

export interface Card {
  id: string;
  name: string;
  card_type: CardType;
  color: string;
  ram_cost: number | null;
  ram_provided: number | null;
  eddie_cost: number;
  power: number | null;
  has_sell_tag: boolean;
  street_cred_requirement: number | null;
  classification: string[];
  keywords: string[];
  ability_text: string | null;
  flavor_text: string | null;
  image_url: string | null;
  set_code: string;
  set_name: string;
  card_number: string | null;
  rarity: CardRarity;
  printing: CardPrinting;
  artist: string | null;
  created_at: string;
  updated_at: string;
}

export interface Deck {
  id: string;
  user_id?: string;
  name: string;
  description: string | null;
  legend_1_id: string | null;
  legend_2_id: string | null;
  legend_3_id: string | null;
  cards: DeckCard[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeckCard {
  card_id: string;
  quantity: number;
}

export interface StashCard {
  card_id: string;
  quantity: number;
}

export interface DeckValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: DeckStats;
}

export interface DeckStats {
  totalCards: number;
  ramBudgetByColor: Record<string, { provided: number; used: number }>;
  eddieCostCurve: Record<number, number>;
  cardTypeDistribution: Record<string, number>;
  sellTagRatio: number;
  blockerCount: number;
  powerBreakpoints: { below5: number; from5to9: number; from10plus: number };
}

export interface CardFilters {
  search?: string;
  card_type?: CardType | null;
  color?: string | null;
  rarity?: CardRarity | null;
  minCost?: number;
  maxCost?: number;
  classification?: string[];
  keywords?: string[];
  sortBy?: "name" | "eddie_cost" | "power" | "rarity";
  sortDir?: "asc" | "desc";
}
