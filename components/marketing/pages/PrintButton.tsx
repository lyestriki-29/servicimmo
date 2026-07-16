"use client";

import { PrinterIcon } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-11 items-center gap-2 px-3 font-bold text-[color:var(--color-si-petrole)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-si-petrole)]"
    >
      <PrinterIcon className="h-4 w-4" /> Imprimer le document
    </button>
  );
}
