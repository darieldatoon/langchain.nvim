import { type Hex, firstColorIn, toHex, withAlpha } from './color.ts';

export type Variant = 'light' | 'dark';
export type TokenName = `--${string}`;

type Rule = {
  readonly selector: string;
  readonly tokens: Readonly<Record<string, string>>;
};

/** The shape of `@langchain/macaw-tokens/tokens.json`. */
export type TokenFile = {
  readonly schemaVersion: 1;
  readonly rules: readonly Rule[];
};

/** Every token's raw CSS value for one variant, `var()` references intact. */
export type TokenTable = ReadonlyMap<string, string>;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const isRule = (v: unknown): v is Rule =>
  isRecord(v) &&
  typeof v['selector'] === 'string' &&
  isRecord(v['tokens']) &&
  Object.values(v['tokens']).every((t) => typeof t === 'string');

export function parseTokenFile(json: unknown): TokenFile {
  if (!isRecord(json) || json['schemaVersion'] !== 1) {
    throw new Error('Unsupported tokens.json: expected schemaVersion 1');
  }
  const rules = json['rules'];
  if (!Array.isArray(rules) || !rules.every(isRule)) {
    throw new Error('Unsupported tokens.json: malformed rules');
  }
  return { schemaVersion: 1, rules };
}

const ruleFor = (file: TokenFile, match: (selector: string) => boolean) => {
  const rule = file.rules.find((r) => match(r.selector));
  if (!rule)
    throw new Error('tokens.json is missing a :root or html.dark rule');
  return rule.tokens;
};

/** Dark rules only hold overrides, so they are layered over `:root`. */
export function tokenTable(file: TokenFile, variant: Variant): TokenTable {
  const root = ruleFor(file, (s) => s === ':root');
  const merged =
    variant === 'light'
      ? root
      : { ...root, ...ruleFor(file, (s) => s.includes('html.dark')) };
  return new Map(Object.entries(merged));
}

const VAR = /^var\((--[\w-]+)\)$/;

/** Follows `var()` references to the token's final CSS value. */
export function resolve(
  table: TokenTable,
  name: TokenName,
  seen: readonly string[] = []
): string {
  if (seen.includes(name)) {
    throw new Error(`Token cycle: ${[...seen, name].join(' -> ')}`);
  }
  const raw = table.get(name);
  if (raw === undefined) throw new Error(`Unknown token: ${name}`);
  const ref = VAR.exec(raw.trim())?.[1] as TokenName | undefined;
  return ref ? resolve(table, ref, [...seen, name]) : raw.trim();
}

export type Palette = {
  readonly color: (name: TokenName) => Hex;
  readonly alpha: (name: TokenName, alpha: number) => Hex;
  /** The first color in a compound token such as a shadow. */
  readonly colorIn: (name: TokenName) => Hex;
};

export function palette(table: TokenTable): Palette {
  const color = (name: TokenName) => toHex(resolve(table, name));
  return {
    color,
    alpha: (name, alpha) => withAlpha(color(name), alpha),
    colorIn: (name) => firstColorIn(resolve(table, name)),
  };
}
