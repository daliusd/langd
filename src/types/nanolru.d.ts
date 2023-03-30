declare module 'nanolru' {
  export = LRU;

  declare class LRU<K, V> {
    constructor(options: { max: number; maxAge: number });

    length: number;

    keys: string[];

    get(key: K): V | undefined;

    set(key: K, value: V): void;

    clear(): void;
  }
}
