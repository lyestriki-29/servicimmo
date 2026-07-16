"use client";

import Link from "next/link";
import { Fragment, useState, type FormEvent } from "react";
import { CheckCircle2Icon, SearchIcon } from "lucide-react";

type SearchCity = { slug: string; ville: string; codePostal: string };

/**
 * Communes correspondant à une saisie (nom ou code postal).
 *
 * Renvoie TOUTES les correspondances, jamais la première seule : plusieurs
 * communes partagent un même code postal (37230 = Fondettes ET Luynes), et une
 * version précédente renvoyait donc systématiquement un habitant de Luynes vers
 * la page de Fondettes. Fonction pure — filet dans `__tests__/zone-search.test.ts`.
 */
export function chercherCommunes(villes: SearchCity[], query: string): SearchCity[] {
  const term = normalize(query);
  if (!term) return [];
  return villes.filter(
    (ville) => normalize(ville.ville).includes(term) || ville.codePostal.startsWith(term)
  );
}

export function ZoneSearch({ villes }: { villes: SearchCity[] }) {
  const [query, setQuery] = useState("");
  /** `undefined` = pas encore cherché ; `[]` = aucune commune trouvée. */
  const [results, setResults] = useState<SearchCity[] | undefined>(undefined);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!normalize(query)) {
      setResults(undefined);
      return;
    }
    setResults(chercherCommunes(villes, query));
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
          className="min-h-11 min-w-0 flex-1 bg-transparent px-3 text-[14px] outline-none focus-visible:outline-2 focus-visible:outline-[color:var(--color-si-petrole)] placeholder:text-[color:var(--color-home-muted-2)]"
        />
        <button
          type="submit"
          className="min-h-11 bg-[color:var(--color-home-saf)] px-4 font-[family-name:var(--font-sora)] text-[12px] font-bold transition-colors hover:bg-[color:var(--color-home-saf-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-home-ink)]"
        >
          Vérifier
        </button>
      </form>
      <div aria-live="polite" className="min-h-8 pt-3 text-[12.5px] font-semibold text-white/86">
        {results && results.length > 0 && (
          <p className="flex flex-wrap items-start gap-2">
            <CheckCircle2Icon
              className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-home-saf)]"
              aria-hidden
            />
            <span>
              Nous intervenons à{" "}
              {results.map((ville, index) => (
                <Fragment key={ville.slug}>
                  {index > 0 && (index === results.length - 1 ? " et " : ", ")}
                  <Link
                    href={`/zones/${ville.slug}`}
                    className="font-bold text-[color:var(--color-home-saf-on-petrole)] underline underline-offset-4"
                  >
                    {ville.ville}
                  </Link>
                </Fragment>
              ))}
              .
            </span>
          </p>
        )}
        {results?.length === 0 && (
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
