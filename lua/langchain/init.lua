local M = {}

---@alias langchain.Variant "light"|"dark"

--- Palette roles for a variant; defaults to the one matching 'background'.
---@param variant? langchain.Variant
---@return table
function M.palette(variant)
  variant = variant or (vim.o.background == "light" and "light" or "dark")
  return require("langchain.palettes." .. variant)
end

--- Applies the colorscheme. Neovim reloads it when 'background' changes, and
--- sets 'background' from the terminal, so it follows Ghostty's light/dark.
function M.load()
  if vim.g.colors_name then
    vim.cmd("highlight clear")
  end
  vim.o.termguicolors = true
  vim.g.colors_name = "langchain"

  local c = M.palette()
  for group, spec in pairs(require("langchain.highlights")(c)) do
    vim.api.nvim_set_hl(0, group, spec)
  end
  for i, color in ipairs(c.terminal) do
    vim.g["terminal_color_" .. (i - 1)] = color
  end
end

return M
