# langchain.nvim

LangChain Light and Dark for Neovim, generated from [Macaw](https://github.com/langchain-ai/macaw-design-system), LangChain's design system.

One colorscheme, both variants: it picks light or dark from `'background'`, which Neovim sets from your terminal, so it switches with Ghostty or your OS.

## Install

[lazy.nvim](https://github.com/folke/lazy.nvim):

```lua
{ "darieldatoon/langchain.nvim", lazy = false, priority = 1000 }
```

Then `:colorscheme langchain`. In LazyVim, set `colorscheme = "langchain"` in the `LazyVim/LazyVim` opts. For lualine, use `theme = "langchain"`.

Force a variant with `:set background=light` or `:set background=dark`.

## What it covers

Editor UI, classic syntax groups, treesitter, LSP semantic tokens, diagnostics, `:terminal` colors, and LazyVim's defaults: snacks (dashboard, picker, explorer, indent, notifier), blink.cmp, gitsigns, which-key, lazy, mason, noice, trouble, flash, bufferline, mini.icons and lualine.

## How it works

`src/generate.ts` reads `tokens.json` from the installed `@langchain/macaw-tokens`, resolves each `var()` chain, layers the `html.dark` overrides, and writes `lua/langchain/palettes/{light,dark}.lua`: one table of roles (`bg`, `fg`, `keyword`, `git_add`, …) per variant. `lua/langchain/highlights.lua` maps those roles to highlight groups. Macaw's dark mode flips its token scales, so one mapping serves both variants.

Tests check that text and syntax colors meet WCAG contrast on the surfaces they sit on, then load the colorscheme in headless Neovim in both variants.

## Updating Macaw

Dependabot opens a PR when `@langchain/macaw-tokens` releases. CI fails until the palettes are regenerated:

```sh
gh pr checkout <number>
mise run generate
git commit -am "chore: regenerate palettes" && git push
```

## Tasks

| Task                      | What it does                                                         |
| ------------------------- | -------------------------------------------------------------------- |
| `mise run setup`          | Install dependencies through Socket Firewall, then git hooks         |
| `mise run generate`       | Rewrite `lua/langchain/palettes/*.lua` from the installed tokens     |
| `mise run check`          | Format (TS and Lua), lint, type check, and fail on stale palettes    |
| `mise run test`           | Contrast tests, then the colorscheme in headless Neovim              |
| `mise run release <bump>` | Bump the version, commit and tag; the tag publishes a GitHub release |
