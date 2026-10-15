import { describe, expect, it } from 'vitest';

import { contrast, firstColorIn, toHex, withAlpha } from '../src/color.ts';

describe('toHex', () => {
  it.each([
    ['#ABC', '#aabbcc'],
    ['#aabbcc', '#aabbcc'],
    ['#aabbccff', '#aabbcc'],
    ['#aabbcc80', '#aabbcc80'],
    ['rgb(255, 0, 16)', '#ff0010'],
    ['rgba(0, 0, 0, 0.5)', '#00000080'],
    ['rgba(255, 255, 255, 1)', '#ffffff'],
  ])('%s -> %s', (input, expected) => {
    expect(toHex(input)).toBe(expected);
  });

  it.each(['0 0% 100%', 'linear-gradient(red, blue)', 'var(--x)', 'red'])(
    'rejects %s',
    (input) => {
      expect(() => toHex(input)).toThrow(/Not a hex or rgb\(\) color/);
    }
  );
});

it('firstColorIn takes the first color of a shadow', () => {
  expect(
    firstColorIn('0 4px 6px -1px rgba(16, 24, 40, 0.1), 0 2px 4px #000')
  ).toBe('#1018281a');
});

it('withAlpha scales existing opacity', () => {
  expect(withAlpha(toHex('#000000'), 0.5)).toBe('#00000080');
  expect(withAlpha(toHex('#00000080'), 0.5)).toBe('#00000040');
});

it('contrast matches WCAG reference values', () => {
  expect(contrast(toHex('#000000'), toHex('#ffffff'))).toBeCloseTo(21);
  expect(contrast(toHex('#777777'), toHex('#ffffff'))).toBeCloseTo(4.48, 2);
});
