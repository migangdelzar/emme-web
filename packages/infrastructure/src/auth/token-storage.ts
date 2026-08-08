export interface Tokens {
  accessToken: string | null;
  refreshToken: string | null;
}

export interface TokenStorage {
  get(): Tokens;
  set(tokens: { accessToken: string; refreshToken?: string }): void;
  clear(): void;
}

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export function createTokenStorage(storage: Pick<Storage, "getItem" | "setItem" | "removeItem">): TokenStorage {
  return {
    get: () => ({
      accessToken: storage.getItem(ACCESS_TOKEN_KEY),
      refreshToken: storage.getItem(REFRESH_TOKEN_KEY),
    }),
    set: ({ accessToken, refreshToken }) => {
      storage.setItem(ACCESS_TOKEN_KEY, accessToken);
      if (refreshToken) {
        storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }
    },
    clear: () => {
      storage.removeItem(ACCESS_TOKEN_KEY);
      storage.removeItem(REFRESH_TOKEN_KEY);
    },
  };
}

export function createBrowserTokenStorage(): TokenStorage {
  return createTokenStorage(window.localStorage);
}
