export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

export class FakeStorage implements StoragePort {
  public error: Error | null = null;

  private readonly values = new Map<string, string>();

  public getItem(key: string): string | null {
    this.raiseIfConfigured();
    return this.values.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    this.raiseIfConfigured();
    this.values.set(key, value);
  }

  public removeItem(key: string): void {
    this.raiseIfConfigured();
    this.values.delete(key);
  }

  public clear(): void {
    this.raiseIfConfigured();
    this.values.clear();
  }

  private raiseIfConfigured(): void {
    if (this.error !== null) {
      throw this.error;
    }
  }
}
