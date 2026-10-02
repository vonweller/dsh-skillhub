# dsh-skillhub

English | [中文](#中文)

A DeepSeek Harness plugin that adds **Settings → Skill Market**. It browses the public [skillhub.cn](https://skillhub.cn/) catalog and installs only the skills you pick into `~/.dsh/skills`.

This is a **skill** store, not a Cordis plugin store. Installed skills are ordinary `SKILL.md` bundles. The official filesystem skill provider picks them up without a restart.

Requires DeepSeek Harness **0.1.2 or later** (verified on 0.1.3).

![Settings → Skill Market browsing the skillhub.cn catalog](docs/skill-market.png)

## Install

```sh
dsh plugin --profile web add github:vonweller/dsh-skillhub
```

Restart `dsh web`, then open **Settings → Skill Market**.

Install from a commit SHA if you want a pinned review copy:

```sh
dsh plugin --profile web add github:vonweller/dsh-skillhub#<sha>
```

## What it does

- **Skill Market**: Pages the public skillhub.cn catalog (search, category, source, sort), preview SKILL.md, and one-click install/uninstall into `~/.dsh/skills`
- **MCP Server Management**:
  - Enumerate profile-configured and user-added MCP (Model Context Protocol) servers
  - View live tools provided by each MCP server (`mcp__<serverName>__*`)
  - One-click toggle switch to enable/disable individual MCP servers dynamically (restricts model access to disabled tools in real time)
  - Add new stdio (`npx`, `python`, `node`, `uvx`) or remote streamable-http/SSE MCP servers without restarting the harness
  - In-conversation Agent tools: `mcp_list`, `mcp_toggle`, `mcp_add`, `mcp_remove`

## Optional config

Override the row in the profile `cordis.patch.yml`. Invalid values fail plugin load:

```yaml
- insert:
    - id: dsh-skillhub
      name: dsh-skillhub
      config:
        apiBase: https://api.skillhub.cn
        installDir: ~/.dsh/skills
```

`apiBase` must be an absolute `http(s)` URL without credentials. `installDir` defaults to `$DSH_HOME/skills` (or `~/.dsh/skills`).

## License

MIT

---

## 中文

DeepSeek Harness 插件：在 **侧边栏 / 设置 → 技能与 MCP** 浏览 [skillhub.cn](https://skillhub.cn/) 的技能库并管理外部 MCP (Model Context Protocol) 服务器。

- **技能市场**：浏览公共技能库，一键安装/卸载到 `~/.dsh/skills/<name>/SKILL.md`，由官方 `ctx.skills` 自动发现。
- **MCP 服务管理**：
  - 自动发现 Profile 系统配置与用户自建的全部 MCP 服务器，直观展示连接状态和注册工具列表
  - 独立开关：一键启停任意 MCP 服务器，禁用时实时向模型屏蔽对应工具，无需重启
  - 动态挂载：支持一键添加 stdio 进程（`npx`、`node`、`python`、`uvx`）或远程 streamable-http/SSE 服务，动态即时连接生效并持久化
  - 对话管理工具：内置 `mcp_list`、`mcp_toggle`、`mcp_add`、`mcp_remove`，支持通过对话让 Agent 查看或管理 MCP 服务。

需要 DeepSeek Harness **0.1.2 或更高版本**（已在 0.1.3 上验证）。

![设置 → 技能市场，浏览 skillhub.cn 技能库](docs/skill-market.png)

```sh
dsh plugin --profile web add github:vonweller/dsh-skillhub
```

重启 `dsh web`，打开设置左侧的 **技能市场**。
