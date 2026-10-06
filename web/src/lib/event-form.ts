export const eventStatuses = [
  "DRAFT",
  "PUBLISHED",
  "CANCELLED",
] as const;

export const eventStatusLabels = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  CANCELLED: "Cancelled",
};

export const eventFields = [
  "title",
  "description",
  "location",
  "address",
  "startsAt",
  "endsAt",
  "status",
] as const;

export type EventField = (typeof eventFields)[number];
export type EventFormValues = Record<EventField, string>;

export type EventActionState = {
  status: "idle" | "error";
  message: string;
  fieldErrors?: Partial<Record<EventField, string[]>>;
};

export const initialEventState: EventActionState = {
  status: "idle",
  message: "",
};