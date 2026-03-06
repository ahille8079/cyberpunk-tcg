import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export { colors } from "@/lib/design-tokens";
import { colors } from "@/lib/design-tokens";
export const COLOR_HEX = colors.faction;

export const DECK_MIN_CARDS = 40;
export const DECK_MAX_CARDS = 50;
export const MAX_COPIES = 3;
export const MAX_LEGENDS = 3;
export const MAX_DECKS = 30;
