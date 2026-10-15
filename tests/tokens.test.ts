import { describe, expect, it } from 'vitest';

import { palette, parseTokenFile, resolve, tokenTable } from '../src/tokens.ts';

const file = parseTokenFile({
  schemaVersion: 1,
  rules: [
    {
      selector: ':root',
      tokens: {
        '--gray-100': '#eeeeee',
        '--gray-900': '#111111',
        '--text': 'var(--gray-900)',
        '--alias': 'var(--text)',
        '--loop-a': 'var(--loop-b)',
        '--loop-b': 'var(--loop-a)',
      },
    },
    {
      selector: 'html.dark,\n.dark[data-theme-scope]',
      tokens: { '--gray-900': '#fafafa' },
    },
  ],
});

describe('parseTokenFile', () => {
  it.each([null, {}, { schemaVersion: 2, rules: [] }])('rejects %j', (json) => {
    expect(() => parseTokenFile(json)).toThrow(/schemaVersion/);
  });

  it('rejects non-string token values', () => {
    expect(() =>
      parseTokenFile({
        schemaVersion: 1,
        rules: [{ selector: ':root', tokens: { '--x': 1 } }],
      })
    ).toThrow(/malformed/);
  });
});

describe('resolve', () => {
  it('follows var() chains', () => {
    expect(resolve(tokenTable(file, 'light'), '--alias')).toBe('#111111');
  });

  it('layers dark overrides under unchanged semantic references', () => {
    expect(resolve(tokenTable(file, 'dark'), '--alias')).toBe('#fafafa');
    expect(resolve(tokenTable(file, 'dark'), '--gray-100')).toBe('#eeeeee');
  });

  it('throws on unknown tokens and cycles', () => {
    const table = tokenTable(file, 'light');
    expect(() => resolve(table, '--missing')).toThrow(/Unknown token/);
    expect(() => resolve(table, '--loop-a')).toThrow(/cycle/);
  });
});

it('palette applies alpha to resolved colors', () => {
  expect(palette(tokenTable(file, 'light')).alpha('--text', 0.5)).toBe(
    '#11111180'
  );
});
