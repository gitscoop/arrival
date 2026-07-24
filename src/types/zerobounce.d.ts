declare module "@zerobounce/zero-bounce-sdk" {
  export interface ZeroBounceValidationResult {
    address: string;
    status: string;
    sub_status: string;
    free_email: boolean;
    did_you_mean: string | null;
    account: string;
    domain: string;
    domain_age_days: string | null;
    active_in_days: string | null;
    smtp_provider: string | null;
    mx_record: string | null;
    mx_found: string;
    firstname: string | null;
    lastname: string | null;
    gender: string | null;
    country: string | null;
    region: string | null;
    city: string | null;
    zipcode: string | null;
    processed_at: string;
  }

  export interface ZeroBounceApiError {
    error: string;
  }

  class ZeroBounceSDK {
    init(apiKey: string): void;

    validateEmail(
      email: string,
      ipAddress?: string,
    ): Promise<ZeroBounceValidationResult | ZeroBounceApiError>;
  }

  export default ZeroBounceSDK;
}
