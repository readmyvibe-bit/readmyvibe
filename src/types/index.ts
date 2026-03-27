export type ToolId =
  | "profile-personality"
  | "crush-compatibility"
  | "facebook-prediction"
  | "profile-impression"
  | "decode-message"
  | "friendship-roast"
  | "instagram-type";

export type InputFieldType = "text" | "textarea" | "select" | "radio";

export type ToolInputField = {
  id: string;
  label: string;
  type: InputFieldType;
  placeholder?: string;
  required?: boolean;
  options?: string[];
};

export type ToolConfig = {
  id: ToolId;
  name: string;
  price: number;
  emoji: string;
  tagline: string;
  description: string;
  fields: ToolInputField[];
};

export type GenerateRequest = {
  toolId: ToolId;
  inputs: Record<string, string>;
  sessionId: string;
};

export type GenerateResponse = {
  freePreview: string;
  fullResult: string | null;
  generationId: string | null;
  unlocked: boolean;
};
