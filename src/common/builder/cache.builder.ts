import { CacheStore } from '@nestjs/common';

interface Builder {
  setCacheStore(cache: CacheStore): void;
  setCacheKey(key: string): void;
  setCallback<T = any>(func: () => Promise<T> | T): void;
  ttl?(ttl: number): void;
  build<T = any>(): Promise<T>;
}

export class CacheBuilder implements Builder {
  private cacheStore: CacheStore;
  private cacheKey: string;
  private callback: () => any;
  private timeRefresh: any; //- Default bằng 3
  private response: any;

  constructor() {
    this.reset();
  }

  public setCacheStore(cacheStore: CacheStore) {
    this.cacheStore = cacheStore;
    return this;
  }

  public setCacheKey(cacheKey: string) {
    this.cacheKey = cacheKey;
    return this;
  }

  public ttl(ttl: number): CacheBuilder {
    this.timeRefresh = ttl;
    return this;
  }

  public setCallback(callback: () => any) {
    // if (typeof func != 'function') throw new Error('Callback not is function');
    this.callback = callback;
    return this;
  }

  public async build<T>(): Promise<T> {
    if (!this.cacheStore) throw new Error('Cache store not found');
    if (!this.cacheKey) throw new Error('Cache key not found');
    if (!this.callback) throw new Error('Callback not found');

    const cache = await this.cacheStore.get(this.cacheKey);
    if (cache) {
      this.response = cache;
    } else {
      this.response = await this.callback();
      await this.cacheStore.set(this.cacheKey, this.response, {
        ttl: this.timeRefresh,
      });
    }
    return this.response;
  }

  public reset() {
    this.cacheStore = null;
    this.callback = null;
    this.timeRefresh = 3;
    this.response = null;
    this.cacheKey = null;
  }
}
