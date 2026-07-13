import { ImageResponse } from "next/og";

/**
 * Favicon France Carottage — « FC » blanc sur carré rouge arrondi.
 * Générée côté serveur ; s'applique à toutes les pages du segment /carottage
 * (les pages Servicimmo gardent le favicon racine).
 */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#b32024",
          color: "#fff",
          fontSize: 17,
          fontWeight: 800,
          letterSpacing: -0.5,
          borderRadius: 6,
          fontFamily: "sans-serif",
        }}
      >
        FC
      </div>
    ),
    { ...size },
  );
}
