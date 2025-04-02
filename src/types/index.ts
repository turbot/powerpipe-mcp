export enum PromptName {
  LIST_MODS = "list_mods",
}

export interface ModInfo {
  name: string;
  version: string;
  description: string | null;
  path: string;
}

export interface QueryResult {
  content: { type: string; text: string }[];
  isError: boolean;
} 