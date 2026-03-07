"use client";

import { useState } from "react";
import { TipJarModal } from "./tip-jar-modal";

export function TipJarButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-cyber-yellow/70 hover:text-cyber-yellow transition-colors rounded flex items-center gap-1.5 cursor-pointer"
      >
        <span className="hidden lg:inline">Slide Me Some Eddies</span>
        <span className="lg:hidden">Eddies</span>
      </button>
      <TipJarModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
