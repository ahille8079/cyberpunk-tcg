import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const COLOR_HEX: Record<string, string> = {
  red: "#ff2a6d",
  blue: "#05d9e8",
  green: "#00f0ff",
  yellow: "#fcee09",
  neutral: "#d1d5db",
};

export const DECK_MIN_CARDS = 40;
export const DECK_MAX_CARDS = 50;
export const MAX_COPIES = 3;
export const MAX_LEGENDS = 3;
