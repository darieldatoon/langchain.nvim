// Writes lua/langchain/palettes/{light,dark}.lua from the installed
// @langchain/macaw-tokens. `--check` writes nothing and exits 1 if one is stale.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { renderLua, roles } from './palette.ts';
import { type Variant, palette, parseTokenFile, tokenTable } from './tokens.ts';

const check = process.argv.includes('--check');
const tokensPath = fileURLToPath(
  import.meta.resolve('@langchain/macaw-tokens/tokens.json')
);
const file = parseTokenFile(JSON.parse(await readFile(tokensPath, 'utf8')));

const stale: string[] = [];
for (const variant of ['light', 'dark'] as const satisfies Variant[]) {
  const target = new URL(
    `../lua/langchain/palettes/${variant}.lua`,
    import.meta.url
  );
  const text = renderLua(
    roles(palette(tokenTable(file, variant)), variant),
    variant
  );
  if (!check) {
    await writeFile(target, text);
    console.log(`wrote lua/langchain/palettes/${variant}.lua`);
  } else if ((await readFile(target, 'utf8').catch(() => '')) !== text) {
    stale.push(variant);
  }
}

if (stale.length > 0) {
  console.error(`stale: ${stale.join(', ')}. Run \`mise run generate\`.`);
  process.exit(1);
}
