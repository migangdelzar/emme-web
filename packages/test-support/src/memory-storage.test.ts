import { describe, expect, it } from "vitest";

import { createMemoryStorage } from "./memory-storage.js";

describe("createMemoryStorage", () => {
  it("implements the storage behavior used by browser adapter tests", () => {
    const storage = createMemoryStorage();

    storage.setItem("key", "value");

    expect(storage.getItem("key")).toBe("value");
    storage.removeItem("key");
    expect(storage.getItem("key")).toBeNull();
  });
});
