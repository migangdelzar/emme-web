import { describe, expect, it } from "vitest";

import { createClientRepository } from "./client-repository.adapter.js";
import type { HttpClient } from "@emme/api";

describe("createClientRepository", () => {
  it("adapts the application create port to the typed API capability", async () => {
    const repository = createClientRepository(new FakeHttpClient());

    await expect(
      repository.create({ name: "Ana López", phone: "555-0100" }),
    ).resolves.toMatchObject({ id: "client-1", name: "Ana López" });
  });
});

class FakeHttpClient implements HttpClient {
  async get<T>(): Promise<T> {
    throw new Error("Not used");
  }

  async post<T>(): Promise<T> {
    return {
      id: "client-1",
      name: "Ana López",
      phone: "555-0100",
    } as T;
  }

  async put<T>(): Promise<T> {
    throw new Error("Not used");
  }

  async patch<T>(): Promise<T> {
    throw new Error("Not used");
  }

  async delete<T>(): Promise<T> {
    throw new Error("Not used");
  }
}
