/**
 * Google Vertex AI virtual-try-on-001 parameters and safe error descriptions.
 * Keep enum strings aligned with Google's current VirtualTryOnModelParams schema.
 * Docs: https://docs.cloud.google.com/gemini-enterprise-agent-platform/reference/rest/Shared.Types/VirtualTryOnModelParams
 */
export const VIRTUAL_TRYON_PARAMETERS = {
  sampleCount: 1,
} as const;

export function providerErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return "Google rejected the try-on request (HTTP 400). Check the model input and photos.";
    case 401:
      return "Google could not authenticate the service account (HTTP 401). Check the credentials.";
    case 403:
      return "Google denied try-on access (HTTP 403). Check project billing, Vertex AI API access and service-account permissions.";
    case 404:
      return "The try-on model was not found (HTTP 404). Check the selected Vertex AI region and model availability.";
    case 429:
      return "Google has reached a quota or rate limit (HTTP 429). Try again later.";
    case 503:
      return "Google's try-on service is temporarily unavailable (HTTP 503). Try again later.";
    default:
      return `Google could not generate a try-on preview (HTTP ${status}). Check the deployment logs.`;
  }
}
