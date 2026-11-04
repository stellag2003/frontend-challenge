/**
 * Aritmética decimal do "servidor" simulado. Só a camada de mocks calcula valores:
 * o cliente apenas exibe as strings que a API devolve.
 * Usa BigInt com 18 casas (precisão de wei) para não perder precisão.
 */
const SCALE = 18;
const FACTOR = 10n ** BigInt(SCALE);

export function toUnits(value: string): bigint {
  const negative = value.startsWith("-");
  const [integer = "0", fraction = ""] = value.replace("-", "").split(".");
  const units = BigInt(integer || "0") * FACTOR + BigInt((fraction + "0".repeat(SCALE)).slice(0, SCALE));
  return negative ? -units : units;
}

export function fromUnits(units: bigint): string {
  const negative = units < 0n;
  const abs = negative ? -units : units;
  const integer = abs / FACTOR;
  let fraction = (abs % FACTOR).toString().padStart(SCALE, "0").replace(/0+$/, "");
  if (fraction.length < 2) fraction = fraction.padEnd(2, "0");
  return `${negative ? "-" : ""}${integer}.${fraction}`;
}

export function multiply(value: string, quantity: number): string {
  return fromUnits(toUnits(value) * BigInt(quantity));
}

export function sum(values: string[]): string {
  return fromUnits(values.reduce((acc, v) => acc + toUnits(v), 0n));
}

export function subtract(a: string, b: string): string {
  return fromUnits(toUnits(a) - toUnits(b));
}

export function normalize(value: string): string {
  return fromUnits(toUnits(value));
}
