export type FormData = { name: string; email: string; message: string };

export type HistoryItem =
  | { type: "prompt"; label: string }
  | { type: "value"; value: string }
  | { type: "error"; text: string }
  | { type: "success"; text: string }
  | { type: "info"; text: string };

export const PROMPTS = [
  { key: "name" as keyof FormData,    label: "Enter your name",    textarea: false },
  { key: "email" as keyof FormData,   label: "Enter your email",   textarea: false },
  { key: "message" as keyof FormData, label: "Enter your message", textarea: true  },
];