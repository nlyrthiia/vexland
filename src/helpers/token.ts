export interface BigDecimal {
  value: bigint
  decimals: number
}

export const parseUnits = (value: string, decimals: number): BigDecimal => {
  let [integer, fraction = ""] = value.split(".")
  const negative = integer.startsWith("-")
  if (negative) integer = integer.slice(1)
  if (fraction.length > decimals) {
    const unit = Number(fraction[decimals])
    if (unit >= 5) {
      const fractionBigInt = BigInt(fraction.slice(0, decimals)) + BigInt(1)
      fraction = fractionBigInt.toString().padStart(decimals, "0")
    } else {
      fraction = fraction.slice(0, decimals)
    }
  } else {
    fraction = fraction.padEnd(decimals, "0")
  }
  return { value: BigInt(`${negative ? "-" : ""}${integer}${fraction}`), decimals }
}

/** Convert a human-readable AVAX amount to wei (18 decimals) */
export const avaxToWei = (avax: string): bigint => parseUnits(avax, 18).value

/** Convert wei to a human-readable AVAX string */
export const weiToAvax = (wei: bigint): string => {
  const str = wei.toString().padStart(19, "0")
  const integer = str.slice(0, -18) || "0"
  const fraction = str.slice(-18).replace(/0+$/, "")
  return fraction ? `${integer}.${fraction}` : integer
}
