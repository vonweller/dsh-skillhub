# Changelog

## Unreleased

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
