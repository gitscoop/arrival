export interface WaitlistEntryData {
  id: string;
  email_address: string;
  status: "pending" | "invited" | "completed" | "rejected";
  created_at: number;
  updated_at: number;
  invitation?: {
    id: string;
    url: string;
    expires_at: number;
  };
}

export interface WaitlistWorkflowPayload {
  type: "waitlistEntry.created" | "waitlistEntry.updated";
  eventId: string;
  email: string;
  data: WaitlistEntryData;
}
