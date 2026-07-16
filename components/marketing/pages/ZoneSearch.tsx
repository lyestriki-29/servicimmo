"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { CheckCircle2Icon, SearchIcon } from "lucide-react";

type SearchCity = { slug: string; ville: string; codePostal: string };

export function ZoneSearch({ villes }: { villes: SearchCity[] }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchCity | null | undefined>(undefined);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = normalize(query);
    if (!term) {
      setResult(undefined);
      return;
    }
    setResult(
      villes.find(
        (ville) => normalize(ville.ville).includes(term) || ville.codePostal.startsWith(term)
      ) ?? null
    );
  }

  return (
    <div className="mt-8 max-w-[520px]">
      <form
        onSubmit={handleSubmit}
        role="search"
        className="flex bg-white p-1.5 text-[color:var(--color-home-ink)]"
      >
        <label htmlFor="zone-search" className="sr-only">
          Rechercher une commune ou un code postal
        </label>
        <SearchIcon
          className="ml-3 h-5 w-5 shrink-0 self-center text-[color:var(--color-si-petrole)]"
          aria-hidden
        />
        <input
          id="zone-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Commune ou code postal"
          className="min-h-11 min-w-0 flex-1 bg-transparent px-3 text-[14px] outline-none placeholder:text-[color:var(--color-home-muted-2)]"
        />
        <button
          type="submit"
          className="min-h-11 bg-[color:var(--color-home-saf)] px-4 font-[family-name:var(--font-sora)] text-[12px] font-bold transition-colors hover:bg-[color:var(--color-home-saf-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-home-ink)]"
        >
          Vérifier
        </button>
      </form>
      <div aria-live="polite" className="min-h-8 pt-3 text-[12.5px] font-semibold text-white/86">
        {result && (
          <p className="flex flex-wrap items-center gap-2">
            <CheckCircle2Icon className="h-4 w-4 text-[color:var(--color-home-saf)]" /> Nous
            intervenons à {result.ville}.{" "}
            <Link
              href={`/zones/${result.slug}`}
              className="font-bold text-[color:var(--color-home-saf)] underline underline-offset-4"
            >
              Voir la page locale
            </Link>
          </p>
        )}
        {result === null && (
          <p>
            Votre commune n’apparaît pas encore ? Appelez-nous au 02 47 47 01 23 pour confirmer
            l’intervention.
          </p>
        )}
      </div>
    </div>
  );
}

function normalize(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
