import { readFileSync } from "node:fs";
import path from "node:path";

import { ImageResponse } from "next/og";

/**
 * Image de partage (Open Graph) France Carottage — direction « signature centrée »
 * (noir/rouge, logo en vedette + bande de réassurance), typographie Sora (la
 * police des titres du site). Générée côté serveur ; `metadataBase` (layout FC)
 * la résout en absolu sur le domaine France Carottage.
 *
 * Les WOFF Sora (700/800) sont co-localisés dans `_fonts/` (dossier privé, hors
 * routage) et lus via `node:fs` — satori ne gère pas le woff2 variable, et le
 * fetch `file://` n'est pas implémenté au build.
 */
export const alt =
  "France Carottage — carottage routier & repérage amiante/HAP sur enrobés, réseau national";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NOIR = "#111113";
const ROUGE = "#b32024";
const ROUGE_CLAIR = "#e5555a";

const FONTS_DIR = path.join(process.cwd(), "app", "carottage", "_fonts");
const sora700 = readFileSync(path.join(FONTS_DIR, "sora-latin-700-normal.woff"));
const sora800 = readFileSync(path.join(FONTS_DIR, "sora-latin-800-normal.woff"));

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: NOIR,
          color: "#fff",
          fontFamily: "Sora",
          position: "relative",
        }}
      >
        {/* Filet rouge de signature en haut */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 12, background: ROUGE }} />

        {/* Logo lockup (wordmark + bande ROUTIER) */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 62, fontWeight: 800, letterSpacing: -1, textTransform: "uppercase" }}>
            <span>France&nbsp;C</span>
            <span style={{ color: ROUGE_CLAIR }}>a</span>
            <span>rottage</span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 10,
              background: ROUGE,
              color: "#fff",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 9,
              padding: "5px 16px",
            }}
          >
            ROUTIER
          </div>
        </div>

        {/* Accroche */}
        <div
          style={{
            display: "flex",
            textAlign: "center",
            fontSize: 46,
            fontWeight: 700,
            letterSpacing: -1,
            lineHeight: 1.12,
            maxWidth: 920,
            marginTop: 52,
          }}
        >
          {"Carottage routier & repérage amiante / HAP sur enrobés"}
        </div>

        {/* Bande de réassurance en pied */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            background: ROUGE,
            color: "#fff",
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: "uppercase",
            padding: "22px 0",
          }}
        >
          {"Réseau national · Laboratoire accrédité · Devis 24 h"}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Sora", data: sora700, weight: 700, style: "normal" },
        { name: "Sora", data: sora800, weight: 800, style: "normal" },
      ],
    },
  );
}
