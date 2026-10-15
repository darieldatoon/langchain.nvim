-- lualine theme: `theme = "langchain"`. Follows 'background' like the colorscheme.
local c = require("langchain").palette()

local function mode(accent)
  return {
    a = { fg = c.on_brand, bg = accent, gui = "bold" },
    b = { fg = c.fg_strong, bg = c.bg_raised },
    c = { fg = c.fg_ui, bg = c.bg_sidebar },
  }
end

return {
  normal = mode(c.brand_fill),
  insert = mode(c.git_add),
  visual = mode(c.terminal[6]),
  replace = mode(c.git_delete),
  command = mode(c.terminal[4]),
  terminal = mode(c.terminal[7]),
  inactive = {
    a = { fg = c.fg_subtle, bg = c.bg_sidebar },
    b = { fg = c.fg_subtle, bg = c.bg_sidebar },
    c = { fg = c.fg_subtle, bg = c.bg_sidebar },
  },
}
