import * as Keychain from "react-native-keychain";

const SERVICE = "gr.beautician.auth";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Tokens live in the OS keystore (Android Keystore / iOS Keychain), never in plain storage.
export const tokenStorage = {
  save: async (tokens: AuthTokens) => {
    await Keychain.setGenericPassword("tokens", JSON.stringify(tokens), {service: SERVICE});
  },
  load: async (): Promise<AuthTokens | null> => {
    try {
      const creds = await Keychain.getGenericPassword({service: SERVICE});
      return creds ? (JSON.parse(creds.password) as AuthTokens) : null;
    } catch {
      return null;
    }
  },
  clear: async () => {
    await Keychain.resetGenericPassword({service: SERVICE});
  },
};
