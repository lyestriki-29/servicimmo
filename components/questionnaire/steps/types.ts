import type { ProjectType } from "@/lib/core/diagnostics/types";
import type { QuestionnaireData } from "@/lib/stores/questionnaire";

/** Props communes des composants d'étape du flux linéaire. */
export type StepProps = {
  data: QuestionnaireData;
  updateData: (patch: QuestionnaireData) => void;
  branch: ProjectType;
};
