/**
 * The browser half of a passkey (proposed D-068): turns the JSON options from our server action into the browser's
 * WebAuthn call (Face ID, Touch ID, Windows Hello or a security key), and the result back into JSON for the server.
 * Uses the browser's own JSON helpers where they exist (WebAuthn Level 3) and converts by hand where they don't.
 */
import { fromBase64Url, toBase64Url } from "@/lib/staff-auth";

type Json = Record<string, unknown>;
type CredRef = { id: string; [k: string]: unknown };
type PKC = typeof PublicKeyCredential & {
  parseCreationOptionsFromJSON?: (o: Json) => PublicKeyCredentialCreationOptions;
  parseRequestOptionsFromJSON?: (o: Json) => PublicKeyCredentialRequestOptions;
};

export const passkeysSupported = () => typeof window !== "undefined" && typeof window.PublicKeyCredential === "function" && !!navigator.credentials;

function decodeOptions(kind: "create" | "request", o: Json): PublicKeyCredentialCreationOptions | PublicKeyCredentialRequestOptions {
  const P = window.PublicKeyCredential as PKC;
  if (kind === "create" && P.parseCreationOptionsFromJSON) return P.parseCreationOptionsFromJSON(o);
  if (kind === "request" && P.parseRequestOptionsFromJSON) return P.parseRequestOptionsFromJSON(o);
  const out: Json = { ...o, challenge: fromBase64Url(o.challenge as string) };
  if (o.user) out.user = { ...(o.user as Json), id: fromBase64Url((o.user as Json).id as string) };
  for (const k of ["excludeCredentials", "allowCredentials"] as const) {
    if (Array.isArray(o[k])) out[k] = (o[k] as CredRef[]).map((c) => ({ ...c, id: fromBase64Url(c.id) }));
  }
  return out as unknown as PublicKeyCredentialCreationOptions;
}

function encodeCredential(c: PublicKeyCredential): Json {
  const withJson = c as PublicKeyCredential & { toJSON?: () => Json };
  if (typeof withJson.toJSON === "function") return withJson.toJSON();
  const r = c.response as AuthenticatorAttestationResponse & AuthenticatorAssertionResponse;
  const response: Json = { clientDataJSON: toBase64Url(r.clientDataJSON) };
  if ("attestationObject" in r && r.attestationObject) response.attestationObject = toBase64Url(r.attestationObject);
  if ("authenticatorData" in r && r.authenticatorData) {
    response.authenticatorData = toBase64Url(r.authenticatorData);
    response.signature = toBase64Url(r.signature);
    if (r.userHandle) response.userHandle = toBase64Url(r.userHandle);
  }
  return {
    id: c.id, rawId: c.id, type: "public-key", response,
    clientExtensionResults: c.getClientExtensionResults(),
    authenticatorAttachment: (c as PublicKeyCredential & { authenticatorAttachment?: string | null }).authenticatorAttachment ?? undefined,
  };
}

/** Runs the passkey prompt. Returns the credential as JSON, or a plain-language error ("cancelled" if the person backed out). */
export async function runPasskey(kind: "create" | "request", options: Json): Promise<{ credential: Json } | { error: string }> {
  if (!passkeysSupported()) return { error: "This browser can’t use passkeys. Use the 6-digit code instead." };
  try {
    const publicKey = decodeOptions(kind, options);
    const c = (kind === "create"
      ? await navigator.credentials.create({ publicKey: publicKey as PublicKeyCredentialCreationOptions })
      : await navigator.credentials.get({ publicKey: publicKey as PublicKeyCredentialRequestOptions })) as PublicKeyCredential | null;
    if (!c) return { error: "cancelled" };
    return { credential: encodeCredential(c) };
  } catch (e) {
    const name = e instanceof Error ? e.name : "";
    if (name === "NotAllowedError" || name === "AbortError") return { error: "cancelled" };
    if (name === "InvalidStateError") return { error: "This device already has a passkey for your account." };
    return { error: "The passkey didn’t work on this device. Use the 6-digit code instead." };
  }
}
