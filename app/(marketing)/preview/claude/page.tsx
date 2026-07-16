import type { Metadata } from "next";

import { ClaudeDirectionsLab } from "@/components/preview/claude/ClaudeDirectionsLab";

export const metadata: Metadata = {
  title: "Contre-projet Claude — trois directions",
  robots: { index: false, follow: false },
};

export default function ClaudePreviewPage() {
  return <ClaudeDirectionsLab />;
}
