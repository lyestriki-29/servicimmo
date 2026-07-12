import {
  BugIcon, FileTextIcon, FlameIcon, GaugeIcon, HardHatIcon, HouseIcon,
  MapPinnedIcon, RulerIcon, ShieldAlertIcon, ZapIcon, type LucideIcon,
} from "lucide-react";

/** Icônes autorisées dans le frontmatter `icone:` des services. */
export const ICONES: Record<string, LucideIcon> = {
  gauge: GaugeIcon,          // DPE
  "shield-alert": ShieldAlertIcon, // amiante
  bug: BugIcon,              // termites / parasites
  flame: FlameIcon,          // gaz
  zap: ZapIcon,              // électricité
  ruler: RulerIcon,          // Carrez / Boutin
  "hard-hat": HardHatIcon,   // avant travaux / démolition
  "map-pinned": MapPinnedIcon, // ERP
  house: HouseIcon,          // plomb / habitat
  "file-text": FileTextIcon, // défaut
};

export function iconeOuDefaut(nom: string): LucideIcon {
  return ICONES[nom] ?? FileTextIcon;
}
