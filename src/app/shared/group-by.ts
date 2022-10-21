export function gropupBy<T, K>(arr: Array<T>, key: (t: T) => K): Map<K, T[]> {
  const extractedKeys: [K, T][] = arr.map(t => [key(t), t]);
  const keys: K[] = Array.from(new Set(extractedKeys.map(e => e[0])));
  const keysWithTs: [K, T[]][] = keys.map(k => [
    k,
    extractedKeys.filter(element => element[0] === k).map(element => element[1])
  ]);
  return new Map(keysWithTs);
}
