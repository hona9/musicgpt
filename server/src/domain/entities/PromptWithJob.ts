import { PromptEntity } from "./Prompt";
import { GenerationJobEntity } from "./GenerationJob";

export interface PromptWithJobEntity extends PromptEntity {
  job: GenerationJobEntity | null;
}
