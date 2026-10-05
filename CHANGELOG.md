# Changelog

## 0.2.1

- Display and manage global skills located in `~/.agents/skills` alongside DSH skills (`~/.dsh/skills`)
- Add location badges (`Agents 全局` / `DSH 本地`) for installed skills
- Add search filter box for installed skills tab
- Improve multiline YAML description parsing for skills
- Support local viewing, previewing, and uninstallation of global agent skills

## 0.2.0

- Integrated full MCP (Model Context Protocol) Server Management:
  - Added "MCP Servers" tab in the unified SkillHub panel
  - Discover and display both profile-configured and user-added MCP servers
  - One-click toggle switch to enable/disable servers with real-time tool restriction for active agents
  - Add and dynamically mount new stdio or streamable-http/SSE MCP servers without restarting
  - Delete user-added MCP servers with automatic unmounting and state cleanup
  - Atomic persistence in `~/.dsh/skillhub/mcp-servers.json`
  - Added in-conversation Agent tools: `mcp_list`, `mcp_toggle`, `mcp_add`, `mcp_remove`

## 0.1.2

- Support standard metadata localization (`locale/en.json`, `locale/zh.json`) for DSH Plugin Inventory and Plugin Manager display
- Robust zip path normalization handling backslashes and directory traversal checks
- Improve YAML frontmatter extraction and skill folder naming normalization for downloaded skills
- Validate `apiBase` and `installDir` with a Standard Schema `Config` export so invalid rows fail plugin load
- Register the Settings page with the current `settings.section` locale `t` seat
- Use `--dsw-alias-*` tokens only (no hardcoded colors) so light and dark themes follow the web shell
- Declare `dsh.client.inject` against `ui-settings` and ship `screenshots.json` for storefronts

## 0.1.1

- Drop the removed `@deepseek-ai/dsh-client-runtime` client inject so the plugin composes on dsh 0.1.2

## 0.1.0

- Browse the public skillhub.cn catalog from Settings → Skill Market
- Filter by keyword, category, and source
- Preview `SKILL.md` before install
- Install or uninstall a selected skill into `~/.dsh/skills`
