import type { Metadata } from "next";

import { ServicimmoPreviewLab } from "@/components/preview/ServicimmoPreviewLab";

export const metadata: Metadata = {
  title: "Preview des pages Servicimmo",
  robots: { index: false, follow: false },
};

export default function ServicimmoPreviewPage() {
  return <ServicimmoPreviewLab />;
}
