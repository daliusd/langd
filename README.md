# langd

Wanna collect language strings fast? Welcome to langd!

This is built on top of [core_d.js](https://github.com/mantoni/core_d.js).

## Installation guide

```
$ npm install -g @daliusd/langd
```

**NOTE**: `npm` comes builtin to [`node`](https://nodejs.org).

Install [`fd`](https://github.com/sharkdp/fd) as this is
requirement to find `messages_en.json` files.

## Using in the command line with node.js

The langd script always takes the file in the standard input and
the optional positional parameter with the root folder:

```
$ cat file.ts | langd /path/to/root
```

## Editor integration

Here is how it can be integrated with
[null-ls.nvim](https://github.com/jose-elias-alvarez/null-ls.nvim).

```lua
local langd = {
  method = null_ls.methods.DIAGNOSTICS,
  filetypes = { "javascript", "javascriptreact", "typescript", "typescriptreact" },
  generator = null_ls.generator({
    command = "langd",
    args = { vim.fn.getcwd() },
    to_stdin = true,
    format = "line",
    on_output = helpers.diagnostics.from_patterns({
      {
        pattern = [[(%d+):(%d+):(%d+) (.*)]],
        groups = { "row", "col", "end_col", "message" },
        overrides = {
          diagnostic = {
            severity = helpers.diagnostics.severities.information,
          },
        },
      },
    }),
  }),
}

null_ls.register(langd)
```

This should show strings for corresponding keys in Neovim:

![screenshot](screenshot.png)
