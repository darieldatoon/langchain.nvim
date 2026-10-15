import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { type Hex, contrast, over, toHex } from '../src/color.ts';
import { type Roles, renderLua, roles } from '../src/palette.ts';
import { palette, parseTokenFile, tokenTable } from '../src/tokens.ts';

const file = parseTokenFile(
  JSON.parse(
    readFileSync(
      fileURLToPath(import.meta.resolve('@langchain/macaw-tokens/tokens.json')),
      'utf8'
    )
  )
);

it('over composites a translucent color onto an opaque one', () => {
  expect(over(toHex('#00000080'), toHex('#ffffff'))).toBe('#7f7f7f');
  expect(over(toHex('#123456'), toHex('#ffffff'))).toBe('#123456');
});

describe.each(['light', 'dark'] as const)('%s', (variant) => {
  const r = roles(palette(tokenTable(file, variant)), variant);
  type Key = Exclude<keyof Roles, 'terminal'>;

  it('emits only opaque colors and 16 terminal colors', () => {
    const { terminal, ...rest } = r;
    expect(terminal).toHaveLength(16);
    for (const value of [...Object.values(rest), ...terminal]) {
      expect(value).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  const below = (pairs: readonly (readonly [Key, Key, number])[]) =>
    pairs
      .map(([fg, bg, min]) => ({
        fg,
        bg,
        ratio: contrast(r[fg] as Hex, r[bg] as Hex),
        min,
      }))
      .filter(({ ratio, min }) => ratio < min);

  it('keeps text readable on every surface it sits on', () => {
    expect(
      below([
        ['fg', 'bg', 7],
        ['fg', 'bg_highlight', 4.5],
        ['fg', 'bg_visual', 4.5],
        ['fg', 'bg_search', 4.5],
        ['fg_strong', 'bg_search_current', 4.5],
        ['fg', 'bg_float', 4.5],
        ['fg', 'bg_selected', 4.5],
        ['fg_ui', 'bg_sidebar', 4.5],
        ['fg_muted', 'bg', 4.5],
        ['fg_subtle', 'bg', 3],
      ])
    ).toEqual([]);
  });

  it('keeps syntax colors readable on the editor background', () => {
    const syntax: Key[] = [
      'keyword',
      'operator',
      'string',
      'number',
      'constant',
      'func',
      'type',
      'property',
      'tag',
      'decorator',
    ];
    // Comments are deliberately muted; Macaw's dark comment measures ~4.2.
    expect(
      below([
        ...syntax.map((k) => [k, 'bg', 4.5] as const),
        ['comment', 'bg', 3],
      ])
    ).toEqual([]);
  });

  it('renders a Lua module that returns every role', () => {
    const lua = renderLua(r, variant);
    expect(lua).toMatch(/^-- LangChain (Light|Dark) palette\./);
    for (const key of Object.keys(r)) expect(lua).toContain(`  ${key} = `);
  });
});
