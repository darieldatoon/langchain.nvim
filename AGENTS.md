# Agent guide

Neovim colorscheme generated from `@langchain/macaw-tokens`. See README.md for tasks.

- `lua/langchain/palettes/*.lua` is generated. Never edit it by hand: change `src/palette.ts` and run `mise run generate`.
- Highlight groups live in `lua/langchain/highlights.lua` and reference palette roles only, never hex values. Add a role in `src/palette.ts` when a group needs a new color.
- Neovim needs opaque colors: translucent Macaw tints go through `over()` onto the background.
- Macaw's dark mode inverts its primitive scales, and `--white`/`--black` swap. Check both variants after any mapping change.
- `src/generate.ts` is the only TypeScript file with I/O. Everything else is pure; keep it that way.
- Install packages with `sfw pnpm ...`, never bare `pnpm add`.
- Before finishing: `mise run check && mise run test`.
