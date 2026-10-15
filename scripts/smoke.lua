-- Headless smoke test: load the colorscheme in both variants and check that
-- key groups resolve. Run: nvim --headless --clean -l scripts/smoke.lua
local root = vim.fn.fnamemodify(debug.getinfo(1, "S").source:sub(2), ":p:h:h")
vim.opt.rtp:prepend(root)

local function hex(n)
  return n and string.format("#%06x", n) or "none"
end

local failures = 0
for _, variant in ipairs({ "light", "dark" }) do
  vim.o.background = variant
  local ok, err = pcall(vim.cmd.colorscheme, "langchain")
  if not ok then
    print(("FAIL %s: %s"):format(variant, err))
    failures = failures + 1
  else
    local palette = require("langchain").palette(variant)
    local normal = vim.api.nvim_get_hl(0, { name = "Normal", link = false })
    local keyword = vim.api.nvim_get_hl(0, { name = "@keyword", link = false })
    local lualine = dofile(root .. "/lua/lualine/themes/langchain.lua")
    local checks = {
      { "Normal bg", hex(normal.bg), palette.bg },
      { "@keyword fg", hex(keyword.fg), palette.keyword },
      { "terminal_color_4", vim.g.terminal_color_4, palette.terminal[5] },
      { "lualine normal a", lualine.normal.a.bg, palette.brand_fill },
    }
    for _, check in ipairs(checks) do
      local name, got, want = unpack(check)
      if got ~= want then
        print(("FAIL %s %s: got %s, want %s"):format(variant, name, got, want))
        failures = failures + 1
      end
    end
    print(
      ("ok   %s: colors_name=%s Normal=%s/%s"):format(
        variant,
        vim.g.colors_name,
        hex(normal.fg),
        hex(normal.bg)
      )
    )
  end
end

if failures > 0 then
  os.exit(1)
end
