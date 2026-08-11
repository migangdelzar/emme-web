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

  it("clears only its own state", () => {
    const first = createMemoryStorage();
    const second = createMemoryStorage();

    first.setItem("key", "first");
    second.setItem("key", "second");
    first.clear();

    expect(first.getItem("key")).toBeNull();
    expect(second.getItem("key")).toBe("second");
  });
});
