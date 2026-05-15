type CacheEntry<T> = {
  value: T;
  updatedAt: number;
};

export class MemoryCache<T> {
  private entries = new Map<string, CacheEntry<T>>();

  constructor(
    private ttlMs = 1000 * 60 * 5,
  ) {}

  get(
    key: string,
  ) {
    const entry =
      this.entries.get(key);

    if (!entry) return null;

    const isExpired =
      Date.now() - entry.updatedAt > this.ttlMs;

    if (isExpired) {
      this.entries.delete(key);
      return null;
    }

    return entry;
  }

  set(
    key: string,
    value: T,
  ) {
    this.entries.set(
      key,
      {
        value,
        updatedAt: Date.now(),
      },
    );
  }

  delete(
    key: string,
  ) {
    this.entries.delete(key);
  }

  clear() {
    this.entries.clear();
  }
}
