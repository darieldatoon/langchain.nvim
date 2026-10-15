/** A color VS Code accepts, normalized to lowercase `#rrggbb` or `#rrggbbaa`. */
export type Hex = string & { readonly __brand: 'Hex' };

const HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB =
  /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*([\d.]+)\s*)?\)$/i;
const EMBEDDED = /rgba?\([^)]*\)|#[0-9a-f]{3,8}\b/i;

const byte = (n: number): string =>
  Math.round(Math.min(255, Math.max(0, n)))
    .toString(16)
    .padStart(2, '0');

const fromChannels = (r: number, g: number, b: number, alpha = 1): Hex =>
  `#${byte(r)}${byte(g)}${byte(b)}${alpha < 1 ? byte(alpha * 255) : ''}` as Hex;

/** Parses a CSS hex or `rgb()`/`rgba()` value; throws on anything else. */
export function toHex(value: string): Hex {
  const v = value.trim();
  if (HEX.test(v)) {
    const digits = v.slice(1).toLowerCase();
    const full =
      digits.length <= 4 ? [...digits].map((d) => d + d).join('') : digits;
    return (
      full.endsWith('ff') && full.length === 8
        ? `#${full.slice(0, 6)}`
        : `#${full}`
    ) as Hex;
  }
  const m = RGB.exec(v);
  if (m) {
    const [r, g, b] = [m[1], m[2], m[3]].map(Number) as [
      number,
      number,
      number,
    ];
    return fromChannels(r, g, b, m[4] === undefined ? 1 : Number(m[4]));
  }
  throw new Error(`Not a hex or rgb() color: ${value}`);
}

/** The first color inside a compound value such as a box-shadow. */
export function firstColorIn(value: string): Hex {
  const m = EMBEDDED.exec(value);
  if (!m) throw new Error(`No color in: ${value}`);
  return toHex(m[0]);
}

const channels = (hex: Hex) => {
  const n = (i: number) => parseInt(hex.slice(i, i + 2), 16);
  return {
    r: n(1),
    g: n(3),
    b: n(5),
    a: hex.length === 9 ? n(7) / 255 : 1,
  };
};

/** Scales the color's opacity, so an already translucent token stays proportional. */
export function withAlpha(hex: Hex, alpha: number): Hex {
  const { r, g, b, a } = channels(hex);
  return fromChannels(r, g, b, a * alpha);
}

const luminance = (hex: Hex): number => {
  const { r, g, b } = channels(hex);
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

/** WCAG 2 contrast ratio between two opaque colors (alpha is ignored). */
export function contrast(a: Hex, b: Hex): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (hi + 0.05) / (lo + 0.05);
}

/** Composites a translucent color over an opaque one; Neovim needs `#rrggbb`. */
export function over(top: Hex, base: Hex): Hex {
  const t = channels(top);
  const b = channels(base);
  const mix = (x: number, y: number) => x * t.a + y * (1 - t.a);
  return fromChannels(mix(t.r, b.r), mix(t.g, b.g), mix(t.b, b.b));
}
