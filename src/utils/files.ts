// True only for real picked/captured files — filters out demo placeholders like "sample" / "demo_valid".
export const isLocalFile = (uri?: string | null): boolean =>
  !!uri && /^(file:|content:|ph:|\/)/.test(uri);

const PLACEHOLDERS = ["demo", "sample", "demo_valid", "demo_blurry", "demo_passbook", "demo_certificate"];

// A displayable image: a real local capture or a remote URL — never a legacy placeholder string.
export const isRealImage = (uri?: string | null): boolean =>
  !!uri && !PLACEHOLDERS.includes(uri) && (isLocalFile(uri) || /^https?:/.test(uri));
