import { describe, expect, it } from "vitest";

import { createClient } from "./create-client.js";
import type { ClientRepository } from "./ports/client-repository.js";

describe("createClient", () => {
  it("normalizes the client name before saving", async () => {
    const repository = new FakeClientRepository();

    await createClient({ clients: repository })({
      name: "  Ana   López ",
      phone: "555-0100",
    });

    expect(repository.createdName).toBe("Ana López");
  });
});

class FakeClientRepository implements ClientRepository {
  createdName: string | null = null;

  async create(input: Parameters<ClientRepository["create"]>[0]) {
    this.createdName = input.name;
    return { id: "client-1", ...input };
  }
}
