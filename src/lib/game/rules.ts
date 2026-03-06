import {
  DECK_MIN_CARDS,
  DECK_MAX_CARDS,
  MAX_COPIES,
  MAX_LEGENDS,
} from "../utils";

// ---------------------------------------------------------------------------
// Win Conditions
// ---------------------------------------------------------------------------

export const WIN_CONDITIONS = {
  GIG_DICE_VICTORY: {
    id: "gig_dice",
    label: "Gig Dice Victory",
    description:
      "Start your turn with 6 or more Gig Dice in your Gig Area to win.",
    requiredGigs: 6,
  },
  OVERTIME: {
    id: "overtime",
    label: "Overtime",
    description:
      "If both players complete a turn without taking a new Gig from the Fixer Area, the game enters Overtime. The moment you have the majority of Gig Dice, you win.",
    requiredGigs: 7,
  },
  DECK_OUT: {
    id: "deck_out",
    label: "Deck Out",
    description:
      "The moment you have 0 cards left in your deck, your rival automatically wins.",
    isLossCondition: true,
  },
} as const;

// ---------------------------------------------------------------------------
// Gig Dice
// ---------------------------------------------------------------------------

export const GIG_DICE = {
  dice: [
    { sides: 4, label: "d4", mustPickLast: false },
    { sides: 6, label: "d6", mustPickLast: false },
    { sides: 8, label: "d8", mustPickLast: false },
    { sides: 10, label: "d10", mustPickLast: false },
    { sides: 12, label: "d12", mustPickLast: false },
    { sides: 20, label: "d20", mustPickLast: true },
  ],
  TOTAL_DICE: 6,
  VICTORY_THRESHOLD: 6,
  START_AREA: "fixer",
} as const;

// ---------------------------------------------------------------------------
// Turn Phases
// ---------------------------------------------------------------------------

export const TURN_PHASES = [
  {
    id: "ready",
    label: "Ready Phase",
    order: 1,
    steps: [
      {
        id: "draw",
        label: "Draw a Card",
        description:
          "Draw the top card from your deck and add it to your hand. There is no maximum hand size.",
      },
      {
        id: "gain_gig",
        label: "Gain a Gig",
        description:
          "Take a die from your Fixer Area, roll it to set its value, then place it in your Gig Area. You can choose any die except the d20, which must always be taken last.",
      },
      {
        id: "ready_cards",
        label: "Ready Spent Cards",
        description:
          "Turn all your spent (sideways) cards to ready (upright).",
      },
    ],
  },
  {
    id: "play",
    label: "Play Phase",
    order: 2,
    steps: [
      {
        id: "sell",
        label: "Sell for Eddies",
        description:
          "Once per turn, sell any card in your hand with a Sell Tag. Reveal it to your opponent, then place it face-down in the Eddies area. Each sold card is worth 1 Eddie per turn when spent.",
      },
      {
        id: "call_legend",
        label: "Call a Legend",
        description:
          "Once per turn, spend 2 Eddies to flip one of your face-down Legends face-up. Don't peek — the randomness is part of the game. FLIP triggers resolve immediately.",
      },
      {
        id: "play_cards",
        label: "Play Cards",
        description:
          "Spend Eddies equal to a card's cost (top-left corner) to play it from your hand. You can also spend a Legend (face-up or face-down) to pay 1 Eddie. PLAY triggers resolve immediately. Units can't attack the turn they're played.",
      },
    ],
  },
  {
    id: "attack",
    label: "Attack Phase",
    order: 3,
    steps: [
      {
        id: "declare",
        label: "Declare Attacker",
        description:
          "Choose a ready Unit to attack. Spend it (turn sideways). If it has an ATTACK trigger, resolve that effect now.",
      },
      {
        id: "choose_target",
        label: "Choose Target",
        description:
          "Attack a spent rival Unit (leads to a Fight) or attack your rival directly (leads to a Steal).",
      },
      {
        id: "defensive_step",
        label: "Defensive Step",
        description:
          "Your rival may Call a Legend (once per turn) or use a BLOCKER Unit to redirect the attack.",
      },
      {
        id: "resolve",
        label: "Resolve",
        description:
          "Fight: compare total power — higher wins, tie means both are defeated. Steal: take any die from rival's Gig Area. Units with 10+ power steal additional Gigs (1 extra per 10 power).",
      },
    ],
  },
] as const;

// ---------------------------------------------------------------------------
// Combat
// ---------------------------------------------------------------------------

export const COMBAT = {
  POWER_STEAL_THRESHOLD: 10,
  BASE_GIGS_STOLEN: 1,
  FIGHT_TIE_RESULT: "both_defeated",
  SUMMONING_SICKNESS: true,
  CALL_LEGEND_COST: 2,
  CALL_LEGEND_LIMIT_PER_TURN: 1,
  SELL_LIMIT_PER_TURN: 1,
  LEGEND_EDDIE_VALUE: 1,
} as const;

// ---------------------------------------------------------------------------
// Card Types
// ---------------------------------------------------------------------------

export const CARD_TYPE_RULES = {
  legend: {
    label: "Legend",
    description:
      "Leaders of your crew. Start face-down in the Legends area. Can be spent for 1 Eddie or Called (flipped face-up) for 2 Eddies. Some can Go Solo to enter the Field as a Unit.",
    maxPerDeck: MAX_LEGENDS,
    startsInDeck: false,
    canAttack: false,
    goesToTrashOnPlay: false,
  },
  unit: {
    label: "Unit",
    description:
      "Crew members placed on the Field. They attack rival Units (Fights) or the rival directly (Steals). Can't attack the turn they're played.",
    maxPerDeck: null,
    startsInDeck: true,
    canAttack: true,
    goesToTrashOnPlay: false,
  },
  program: {
    label: "Program",
    description:
      "Instantaneous effects that resolve once and are immediately discarded. Can be played any time during your Play Phase.",
    maxPerDeck: null,
    startsInDeck: true,
    canAttack: false,
    goesToTrashOnPlay: true,
  },
  gear: {
    label: "Gear",
    description:
      "Equipment that attaches to a friendly Unit, granting power bonuses and special effects. When the equipped Unit leaves the Field, its Gear follows it.",
    maxPerDeck: null,
    startsInDeck: true,
    canAttack: false,
    goesToTrashOnPlay: false,
  },
} as const;

// ---------------------------------------------------------------------------
// Keywords
// ---------------------------------------------------------------------------

export const KEYWORDS = {
  BLOCKER: {
    id: "blocker",
    label: "Blocker",
    description:
      "When a rival Unit attacks, you may spend this Unit to redirect the attack to it. If the BLOCKER intercepts a direct rival attack, no Gig is stolen even if the BLOCKER is defeated.",
    triggerType: "defensive",
    appliesTo: ["unit", "legend"] as const,
  },
  GO_SOLO: {
    id: "go_solo",
    label: "Go Solo",
    description:
      "Pay this card's cost to play it as a ready Unit. It can attack this turn, bypassing summoning sickness.",
    triggerType: "play",
    appliesTo: ["legend"] as const,
  },
} as const;

// ---------------------------------------------------------------------------
// Timing Triggers
// ---------------------------------------------------------------------------

export const TIMING_TRIGGERS = {
  PLAY: {
    id: "play",
    label: "Play",
    description:
      "As soon as you pay this card's cost, the effect happens.",
  },
  ATTACK: {
    id: "attack",
    label: "Attack",
    description:
      "When this Unit attacks, before the fight resolves, the effect happens.",
  },
  FLIP: {
    id: "flip",
    label: "Flip",
    description:
      "As soon as this card is flipped face-up (Called), the effect happens.",
  },
} as const;

// ---------------------------------------------------------------------------
// Resources
// ---------------------------------------------------------------------------

export const RESOURCES = {
  EDDIES: {
    id: "eddies",
    label: "Eddies",
    description:
      "Eurodollars — the currency of Night City. Every card has an Eddie cost in the top-left corner. Generated by selling cards with the Sell Tag or by spending Legends.",
    icon: "€$",
  },
  RAM: {
    id: "ram",
    label: "RAM",
    description:
      "Colored resource provided by Legends. Each card in your deck requires a certain amount of colored RAM. Your Legends' total RAM per color sets the maximum RAM value for cards of that color.",
    icon: "◆",
  },
  STREET_CRED: {
    id: "street_cred",
    label: "Street Cred",
    description:
      "The sum of all your Gig Dice values. Some card effects require a minimum Street Cred (☆) to activate.",
    icon: "☆",
  },
} as const;

// ---------------------------------------------------------------------------
// Playmat Areas
// ---------------------------------------------------------------------------

export const PLAY_AREAS = {
  FIXER: {
    id: "fixer",
    label: "Fixer Area",
    description:
      "All Gig Dice start here. Each turn, pick one die, roll it, and move it to your Gig Area. The d20 must always be taken last.",
  },
  GIG: {
    id: "gig",
    label: "Gig Area",
    description:
      "Holds your claimed Gig Dice — including any stolen from your rival. Their sum is your Street Cred. Start your turn with 6+ dice here to win.",
  },
  FIELD: {
    id: "field",
    label: "Field",
    description:
      "Where Units are placed. Units on the Field can attack rival Units or the rival directly. Ready Units can't be attacked.",
  },
  EDDIES: {
    id: "eddies",
    label: "Eddies Area",
    description:
      "Face-down cards used as currency. Created by selling cards with the Sell Tag. Spend (turn sideways) to pay 1 Eddie each.",
  },
  LEGENDS: {
    id: "legends",
    label: "Legends Area",
    description:
      "Holds your 3 Legends face-down in a random order. Can be spent for 1 Eddie or Called (flipped face-up) for 2 Eddies.",
  },
  DECK: {
    id: "deck",
    label: "Deck",
    description:
      "Your draw pile. Draw 1 card at the start of each turn. If it reaches 0 cards, you lose.",
  },
  TRASH: {
    id: "trash",
    label: "Trash",
    description: "Discard pile for defeated, discarded, or resolved cards.",
  },
} as const;

// ---------------------------------------------------------------------------
// Deck Building
// ---------------------------------------------------------------------------

export const DECK_BUILDING = {
  MIN_CARDS: DECK_MIN_CARDS,
  MAX_CARDS: DECK_MAX_CARDS,
  MAX_COPIES,
  MAX_LEGENDS,
  LEGENDS_ARE_SEPARATE: true,
  UNIQUE_LEGEND_NAMES: true,
  RECOMMENDED_SELL_TAG_RATIO: 0.3,
  RECOMMENDED_MIN_BLOCKERS: 4,
} as const;

// ---------------------------------------------------------------------------
// Game Setup
// ---------------------------------------------------------------------------

export const SETUP = {
  STARTING_HAND_SIZE: 6,
  FIRST_PLAYER_SPENT_LEGENDS: 2,
  MULLIGAN_ALLOWED: true,
  MULLIGAN_DESCRIPTION:
    "You may shuffle your hand back into your deck and draw 6 new cards, but only once.",
} as const;

// ---------------------------------------------------------------------------
// Derived Types
// ---------------------------------------------------------------------------

export type KeywordId = (typeof KEYWORDS)[keyof typeof KEYWORDS]["id"];
export type TimingTriggerId =
  (typeof TIMING_TRIGGERS)[keyof typeof TIMING_TRIGGERS]["id"];
export type TurnPhaseId = (typeof TURN_PHASES)[number]["id"];
export type PlayAreaId =
  (typeof PLAY_AREAS)[keyof typeof PLAY_AREAS]["id"];
export type ResourceId =
  (typeof RESOURCES)[keyof typeof RESOURCES]["id"];

// ---------------------------------------------------------------------------
// Lookup Maps
// ---------------------------------------------------------------------------

export const KEYWORD_BY_ID = Object.fromEntries(
  Object.values(KEYWORDS).map((k) => [k.id, k])
) as Record<KeywordId, (typeof KEYWORDS)[keyof typeof KEYWORDS]>;

export const TRIGGER_BY_ID = Object.fromEntries(
  Object.values(TIMING_TRIGGERS).map((t) => [t.id, t])
) as Record<
  TimingTriggerId,
  (typeof TIMING_TRIGGERS)[keyof typeof TIMING_TRIGGERS]
>;
