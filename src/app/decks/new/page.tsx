import type { Metadata } from "next";
import { DeckEditor } from "@/components/deck-builder/deck-editor";

export const metadata: Metadata = {
  title: "Build a Deck",
  description:
    "Create a new deck for the Cyberpunk 2077 Trading Card Game.",
};

export default function NewDeckPage() {
  return <DeckEditor />;
}
