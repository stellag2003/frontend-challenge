import type { EthAmount } from "./cart";

/**
 * Compara duas strings decimais pelo valor ("0.5" === "0.50"), sem converter para
 * número de ponto flutuante e sem nenhuma conta: só normaliza a forma escrita.
 */
export function sameEthAmount(a: EthAmount, b: EthAmount): boolean {
  return canonical(a) === canonical(b);
}

function canonical(value: string): string {
  const trimmed = value.trim();
  const negative = trimmed.startsWith("-");
  const [rawInteger = "0", rawFraction = ""] = trimmed.replace(/^[-+]/, "").split(".");
  const integer = rawInteger.replace(/^0+(?=\d)/, "") || "0";
  const fraction = rawFraction.replace(/0+$/, "");
  const body = fraction ? `${integer}.${fraction}` : integer;
  return negative && body !== "0" ? `-${body}` : body;
}
