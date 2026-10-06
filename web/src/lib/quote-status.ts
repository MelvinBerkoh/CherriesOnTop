export const quoteStatuses = [
  "NEW",
  "CONTACTED",
  "QUOTED",
  "BOOKED",
  "CLOSED",
] as const;

export type QuoteStatus = (typeof quoteStatuses)[number];

export const quoteStatusLabels: Record<QuoteStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUOTED: "Quoted",
  BOOKED: "Booked",
  CLOSED: "Closed",
};

export type QuoteStatusState = {
  status: "idle" | "success" | "error";
  message: string;
  updatedAt?: string;
};