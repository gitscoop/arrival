export interface ClerkEmailEventData {
  id: string;
  slug: string;
  to_email_address: string;
  subject: string;
  body: string;
  data: {
    otp_code?: string;
    requested_from?: string;
    requested_at?: string;
    primary_email_address?: string;
  };
}

export interface AuthWorkflowPayload {
  type: "email.created";
  eventId: string;
  email: string;
  data: ClerkEmailEventData;
}
