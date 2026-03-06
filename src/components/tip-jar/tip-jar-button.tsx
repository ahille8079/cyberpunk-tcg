"use client";

import { useState } from "react";
import { TipJarModal } from "./tip-jar-modal";

export function TipJarButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-3 py-2 text-sm font-mono uppercase tracking-wider text-cyber-yellow hover:text-cyber-black hover:bg-cyber-yellow transition-colors border border-cyber-yellow/40 hover:border-cyber-yellow rounded min-h-[44px] flex items-center cursor-pointer"
      >
        <span className="hidden lg:inline">Slide Me Some Eddies</span>
        <span className="lg:hidden">Eddies</span>
      </button>
      <TipJarModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
