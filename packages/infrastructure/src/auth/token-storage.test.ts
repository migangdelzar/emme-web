import { describe, expect, it } from "vitest";

import { createTokenStorage } from "./token-storage.js";

describe("createTokenStorage", () => {
  it("stores and retrieves access and refresh tokens", () => {
    const storage = new FakeStorage();
    const tokens = createTokenStorage(storage);

    tokens.set({ accessToken: "access-1", refreshToken: "refresh-1" });

    expect(tokens.get()).toEqual({ accessToken: "access-1", refreshToken: "refresh-1" });
  });

  it("clears all token keys", () => {
    const storage = new FakeStorage();
    const tokens = createTokenStorage(storage);
    tokens.set({ accessToken: "access-1", refreshToken: "refresh-1" });

    tokens.clear();

    expect(tokens.get()).toEqual({ accessToken: null, refreshToken: null });
  });
});

class FakeStorage implements Pick<Storage, "getItem" | "setItem" | "removeItem"> {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}
