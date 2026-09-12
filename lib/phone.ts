/**
 * Digit-only phone keys so +880 17XX and 017XX count as the same number
 * when matching a student account to a lead.
 */
export function phoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function phoneDigitVariants(phone: string): string[] {
  const digits = phoneDigits(phone);

  if (digits.length < 8) {
    return digits.length > 0 ? [digits] : [];
  }

  const variants = new Set<string>([digits]);

  if (digits.startsWith("880") && digits.length >= 11) {
    const rest = digits.slice(3);
    variants.add(rest);
    if (!rest.startsWith("0")) {
      variants.add(`0${rest}`);
    }
  } else if (digits.startsWith("0") && digits.length >= 10) {
    variants.add(digits.slice(1));
    variants.add(`880${digits.slice(1)}`);
  } else if (digits.length === 10) {
    variants.add(`0${digits}`);
    variants.add(`880${digits}`);
  }

  return [...variants];
}

export function phonesMatch(a: string, b: string): boolean {
  const keys = new Set(phoneDigitVariants(a));
  return phoneDigitVariants(b).some((key) => keys.has(key));
}
