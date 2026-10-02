window.__ModuleLoader__.load({
  id: 'dsh-skillhub',
  factory: (require) => {
    const module = { exports: {} }
    const exports = module.exports
    const react = require('react')
    const h = react.createElement
    const { useCallback, useEffect, useMemo, useState } = react

    const name = 'dsh-skillhub/client'
    const inject = ['slots', 'locale', 'layout']
    const NS = 'dsh-skillhub'
    const STYLE_ID = 'dsh-skillhub-style'
    const API = '/dsh-skillhub/api'
    const PANEL_ID = 'skillhub'

    const ZH = {
      nav: '技能与 MCP',
      title: 'SkillHub & MCP 中心',
      subtitle: '浏览 skillhub.cn 技能库与管理外部 MCP 工具服务',
      browse: '技能市场',
      installed: '已安装技能',
      mcp: 'MCP 服务器',
      mcpSubtitle: '管理已配置与自建的 MCP 服务器，独立开关工具',
      mcpEmpty: '当前没有已加载的 MCP 服务器，点击右上角「添加 MCP 服务器」新建',
      mcpAdd: '添加 MCP 服务器',
      mcpRefresh: '刷新',
      mcpSourceProfile: '系统预置',
      mcpSourceUser: '用户添加',
      mcpToolCount: '{n} 个工具',
      mcpToolCountShort: '工具',
      mcpNoTools: '暂无注册工具',
      mcpToolsTitle: '包含的工具清单',
      mcpDelete: '删除',
      mcpConfirmDelete: '确定删除 MCP 服务器 "{name}" 吗？',
      mcpEnable: '已启用',
      mcpDisable: '已停用',
      mcpModalTitle: '添加 MCP 服务器',
      mcpServerName: '服务名称 (serverName)',
      mcpServerNamePlaceholder: '如 filesystem, github, my-mcp...',
      mcpTransport: '通信协议',
      mcpTransportStdio: '命令行进程 (stdio)',
      mcpTransportHttp: '远程端点 (streamable-http / SSE)',
      mcpCommand: '执行命令 (command)',
      mcpCommandPlaceholder: '如 npx, node, python, uvx...',
      mcpArgs: '启动参数 (args, 空格分隔)',
      mcpArgsPlaceholder: '如 -y @modelcontextprotocol/server-filesystem C:\\work',
      mcpEnv: '环境变量 (KEY=VALUE, 每行一个)',
      mcpEnvPlaceholder: 'GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxx',
      mcpUrl: '端点 URL',
      mcpUrlPlaceholder: 'http://127.0.0.1:8000/sse',
      mcpCancel: '取消',
      mcpSubmit: '确认添加',
      mcpAdding: '正在添加...',
      mcpAddSuccess: 'MCP 服务器已成功添加并自动挂载！',
      mcpDeleteSuccess: 'MCP 服务器已移除',
      mcpToggleSuccess: 'MCP 服务器状态已更新',
      search: '搜索技能，例如 PDF、周报、浏览器…',
      allCategories: '全部分类',
      allSources: '全部来源',
      sourceCommunity: '社区',
      sourceClawhub: 'ClawHub',
      sourceEnterprise: '企业',
      sortDownloads: '下载最多',
      sortScore: '相关度',
      sortUpdated: '最近更新',
      sortStars: '收藏',
      loading: '加载中…',
      empty: '没有找到技能',
      error: '加载失败',
      retry: '重试',
      prev: '上一页',
      next: '下一页',
      page: '第 {n} 页 · 共 {total} 个',
      install: '安装',
      installing: '安装中…',
      uninstall: '卸载',
      uninstalling: '卸载中…',
      installedBadge: '已安装',
      preview: '预览 SKILL.md',
      previewing: '正在拉取正文…',
      openSite: '在 SkillHub 打开',
      close: '关闭',
      noneInstalled: '还没有从 SkillHub 安装技能',
      security: '安全扫描',
      paid: '付费',
      needsKey: '需要 API Key',
      installOk: '已安装，当前会话的技能目录会自动刷新',
      uninstallOk: '已卸载',
      confirmUninstall: '卸载这个技能？会从 ~/.dsh/skills 删除对应目录。',
      statsInstalls: '{n} 次安装',
    }

    const EN = {
      nav: 'Skills & MCPs',
      title: 'SkillHub & MCP Center',
      subtitle: 'Browse skillhub.cn skills and manage MCP tool servers',
      browse: 'Skill Market',
      installed: 'Installed Skills',
      mcp: 'MCP Servers',
      mcpSubtitle: 'Manage built-in and custom MCP servers, toggle tool availability',
      mcpEmpty: 'No MCP servers configured currently. Click "Add MCP Server" to create one.',
      mcpAdd: 'Add MCP Server',
      mcpRefresh: 'Refresh',
      mcpSourceProfile: 'System',
      mcpSourceUser: 'Custom',
      mcpToolCount: '{n} tools',
      mcpToolCountShort: 'tools',
      mcpNoTools: 'No tools registered',
      mcpToolsTitle: 'Registered Tools',
      mcpDelete: 'Delete',
      mcpConfirmDelete: 'Are you sure you want to delete MCP server "{name}"?',
      mcpEnable: 'Enabled',
      mcpDisable: 'Disabled',
      mcpModalTitle: 'Add MCP Server',
      mcpServerName: 'Server Name',
      mcpServerNamePlaceholder: 'e.g. filesystem, github, my-mcp...',
      mcpTransport: 'Transport Protocol',
      mcpTransportStdio: 'Command process (stdio)',
      mcpTransportHttp: 'Remote endpoint (streamable-http / SSE)',
      mcpCommand: 'Executable Command',
      mcpCommandPlaceholder: 'e.g. npx, node, python, uvx...',
      mcpArgs: 'Arguments (space-separated)',
      mcpArgsPlaceholder: 'e.g. -y @modelcontextprotocol/server-filesystem C:\\work',
      mcpEnv: 'Environment Variables (KEY=VALUE per line)',
      mcpEnvPlaceholder: 'GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxx',
      mcpUrl: 'Endpoint URL',
      mcpUrlPlaceholder: 'http://127.0.0.1:8000/sse',
      mcpCancel: 'Cancel',
      mcpSubmit: 'Add Server',
      mcpAdding: 'Adding...',
      mcpAddSuccess: 'MCP server added and mounted successfully!',
      mcpDeleteSuccess: 'MCP server removed',
      mcpToggleSuccess: 'MCP server status updated',
      search: 'Search skills, e.g. PDF, weekly report, browser…',
      allCategories: 'All categories',
      allSources: 'All sources',
      sourceCommunity: 'Community',
      sourceClawhub: 'ClawHub',
      sourceEnterprise: 'Enterprise',
      sortDownloads: 'Most downloads',
      sortScore: 'Relevance',
      sortUpdated: 'Recently updated',
      sortStars: 'Stars',
      loading: 'Loading…',
      empty: 'No skills found',
      error: 'Failed to load',
      retry: 'Retry',
      prev: 'Prev',
      next: 'Next',
      page: 'Page {n} · {total} skills',
      install: 'Install',
      installing: 'Installing…',
      uninstall: 'Uninstall',
      uninstalling: 'Uninstalling…',
      installedBadge: 'Installed',
      preview: 'Preview SKILL.md',
      previewing: 'Fetching body…',
      openSite: 'Open on SkillHub',
      close: 'Close',
      noneInstalled: 'No SkillHub skills installed yet',
      security: 'Security scan',
      paid: 'Paid',
      needsKey: 'Needs API key',
      installOk: 'Installed. The current session skill catalog will refresh automatically.',
      uninstallOk: 'Uninstalled',
      confirmUninstall: 'Uninstall this skill? This deletes its folder under ~/.dsh/skills.',
      statsInstalls: '{n} installs',
    }

    const CSS = `
.dsh-sh{display:flex;flex-direction:column;gap:16px;min-height:0;height:100%;max-width:1200px;width:100%;margin:0 auto;padding:24px 32px 48px;box-sizing:border-box;color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}
.dsh-sh *{box-sizing:border-box}
.dsh-sh__head{display:flex;flex-direction:column;gap:4px}
.dsh-sh__title{margin:0;font-size:22px;line-height:30px;font-weight:600}
.dsh-sh__sub{margin:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}
.dsh-sh__sub a{color:var(--dsw-alias-link);font-weight:500;text-decoration:none}
.dsh-sh__sub a:hover,.dsh-sh__sub a:focus-visible{text-decoration:underline;text-decoration-style:dotted;text-underline-offset:3px}
.dsh-sh__tabs{display:flex;gap:22px;border-bottom:0.5px solid var(--dsw-alias-border-l2)}
.dsh-sh__tab{position:relative;border:0;background:none;font:inherit;padding:7px 1px 9px;cursor:pointer;color:var(--dsw-alias-label-tertiary)}
.dsh-sh__tab:hover,.dsh-sh__tab.on{color:var(--dsw-alias-label-primary)}
.dsh-sh__tab.on::after,.dsh-sh__tab:focus-visible::after{position:absolute;right:0;bottom:-1px;left:0;height:2px;border-radius:2px 2px 0 0;background:var(--dsw-alias-label-primary);content:''}
.dsh-sh__tab:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px;border-radius:2px}
.dsh-sh__filters{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.dsh-sh__search{flex:1;min-width:180px;height:32px;border:0.5px solid var(--dsw-alias-border-l3);border-radius:8px;padding:0 10px;background:var(--dsw-alias-bg-layer-1);color:inherit;font:inherit}
.dsh-sh__select{height:32px;border:0.5px solid var(--dsw-alias-border-l3);border-radius:8px;padding:0 8px;background:var(--dsw-alias-bg-layer-1);color:inherit;font:inherit}
.dsh-sh__body{flex:1;overflow:auto;padding:4px 0 16px;min-height:240px}
.dsh-sh__grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px}
.dsh-sh__card{border:0.5px solid var(--dsw-alias-border-l2);border-radius:10px;padding:12px;background:var(--dsw-alias-bg-layer-1);display:flex;flex-direction:column;gap:8px;cursor:pointer;text-align:left;min-width:0;color:inherit}
.dsh-sh__card:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsh-sh__card:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}
.dsh-sh__card-top{display:flex;gap:8px;align-items:flex-start}
.dsh-sh__icon{width:36px;height:36px;border-radius:8px;object-fit:cover;background:var(--dsw-alias-bg-layer-2);flex:0 0 auto}
.dsh-sh__icon--ph{display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:var(--dsw-alias-brand-primary)}
.dsh-sh__name{font-weight:600;line-height:18px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.dsh-sh__desc{margin:0;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical}
.dsh-sh__meta{display:flex;flex-wrap:wrap;gap:6px;font-size:11px;color:var(--dsw-alias-label-tertiary)}
.dsh-sh__pill{border:0.5px solid var(--dsw-alias-border-l3);border-radius:999px;padding:0 7px;line-height:18px}
.dsh-sh__pill.on{background:var(--dsw-alias-state-business-tertiary);color:var(--dsw-alias-state-business-primary);border-color:transparent}
.dsh-sh__pill.purple{background:#ede9fe;color:#6d28d9;border-color:transparent}
.dsh-sh__pill.warn{background:var(--dsw-alias-state-warn-tertiary);color:var(--dsw-alias-state-warn-label);border-color:transparent}
.dsh-sh__pill.ok{background:var(--dsw-alias-state-success-tertiary);color:var(--dsw-alias-state-success-primary);border-color:transparent}
.dsh-sh__pill.tool-btn{cursor:pointer;border-style:dashed}
.dsh-sh__pill.tool-btn:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsh-sh__pill.tool-btn.active{background:var(--dsw-alias-state-business-primary);color:#fff;border-color:transparent}
.dsh-sh__pager{display:flex;gap:8px;align-items:center;justify-content:center;padding:8px 0 0;font-size:12px;color:var(--dsw-alias-label-secondary)}
.dsh-sh__btn{height:30px;border-radius:8px;border:0.5px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-layer-1);color:inherit;font:inherit;padding:0 10px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center}
.dsh-sh__btn:disabled{opacity:.5;cursor:not-allowed}
.dsh-sh__btn:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}
.dsh-sh__btn.primary{background:var(--dsw-alias-button-primary-fill);border-color:transparent;color:var(--dsw-alias-label-primary-inverted)}
.dsh-sh__btn.danger{color:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-state-error-secondary);background:var(--dsw-alias-interactive-bg-hover-danger)}
.dsh-sh__btn.icon-btn{padding:0 8px}
.dsh-sh__status{padding:24px;text-align:center;color:var(--dsw-alias-label-secondary)}
.dsh-sh__toast{border-radius:8px;padding:8px 10px;font-size:12px}
.dsh-sh__toast.ok{background:var(--dsw-alias-state-success-tertiary);color:var(--dsw-alias-state-success-primary)}
.dsh-sh__toast.err{background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary)}
.dsh-sh__drawer{position:fixed;inset:0;z-index:80;background:var(--dsw-alias-bg-mask-1);display:flex;justify-content:flex-end}
.dsh-sh__panel{width:min(520px,100%);height:100%;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);border:0;box-shadow:var(--dsw-elevation-panel);display:flex;flex-direction:column}
.dsh-sh__panel-h{display:flex;justify-content:space-between;gap:8px;align-items:flex-start;padding:16px 16px 8px}
.dsh-sh__panel-b{flex:1;overflow:auto;padding:0 16px 16px;display:flex;flex-direction:column;gap:10px}
.dsh-sh__pre{white-space:pre-wrap;word-break:break-word;font:12px/18px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;background:var(--dsw-alias-markdown-code-block);border-radius:8px;padding:10px;max-height:360px;overflow:auto;margin:0}
.dsh-sh__actions{display:flex;flex-wrap:wrap;gap:8px}

/* MCP specific styles */
.dsh-sh__mcp-bar{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:8px}
.dsh-sh__mcp-count{color:var(--dsw-alias-label-tertiary);font-size:12px}
.dsh-sh__mcp-list{display:flex;flex-direction:column;gap:10px}
.dsh-sh__mcp-card{border:0.5px solid var(--dsw-alias-border-l2);border-radius:10px;padding:14px;background:var(--dsw-alias-bg-layer-1);display:flex;flex-direction:column;gap:10px}
.dsh-sh__mcp-card.disabled{opacity:0.72}
.dsh-sh__mcp-card-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
.dsh-sh__mcp-info{display:flex;flex-direction:column;gap:6px;flex:1;min-width:0}
.dsh-sh__mcp-title-row{display:flex;align-items:center;flex-wrap:wrap;gap:8px}
.dsh-sh__mcp-name{font-size:14px;font-weight:600;color:var(--dsw-alias-label-primary)}
.dsh-sh__mcp-cmd{display:inline-flex;align-items:center;gap:6px;font-size:11px;background:var(--dsw-alias-markdown-code-block);padding:3px 8px;border-radius:6px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-sh__cmd-tag{font-size:10px;font-weight:700;color:var(--dsw-alias-label-tertiary)}
.dsh-sh__mcp-actions{display:flex;align-items:center;gap:10px;flex:0 0 auto}
.dsh-sh__dot{width:8px;height:8px;border-radius:50%;display:inline-block}
.dsh-sh__dot.online{background:#10b981}
.dsh-sh__dot.connecting{background:#f59e0b}
.dsh-sh__dot.offline{background:#9ca3af}

/* Switch toggle */
.dsh-sh__switch{position:relative;display:inline-block;width:38px;height:20px}
.dsh-sh__switch input{opacity:0;width:0;height:0}
.dsh-sh__slider{position:absolute;cursor:pointer;inset:0;background:var(--dsw-alias-border-l3);border-radius:20px;transition:.2s}
.dsh-sh__slider:before{position:absolute;content:"";height:14px;width:14px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:.2s}
.dsh-sh__switch input:checked + .dsh-sh__slider{background:var(--dsw-alias-state-business-primary,#2563eb)}
.dsh-sh__switch input:checked + .dsh-sh__slider:before{transform:translateX(18px)}

/* MCP Tools expansion */
.dsh-sh__mcp-tools{border-top:0.5px solid var(--dsw-alias-border-l2);padding-top:10px;display:flex;flex-direction:column;gap:8px}
.dsh-sh__mcp-tools-title{font-size:11px;font-weight:600;color:var(--dsw-alias-label-secondary)}
.dsh-sh__mcp-tools-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:6px}
.dsh-sh__tool-chip{background:var(--dsw-alias-bg-layer-2);padding:6px 8px;border-radius:6px;font-size:11px;display:flex;flex-direction:column;gap:2px}
.dsh-sh__tool-name{font-family:ui-monospace,Menlo,monospace;font-weight:600;color:var(--dsw-alias-state-business-primary)}
.dsh-sh__tool-desc{font-size:11px;color:var(--dsw-alias-label-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

/* Modal Dialog */
.dsh-sh__modal-overlay{position:fixed;inset:0;z-index:100;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(2px)}
.dsh-sh__modal{width:min(500px,94vw);background:var(--dsw-alias-bg-layer-1);border-radius:12px;box-shadow:var(--dsw-elevation-panel);display:flex;flex-direction:column;overflow:hidden;border:0.5px solid var(--dsw-alias-border-l2)}
.dsh-sh__modal-h{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:0.5px solid var(--dsw-alias-border-l2)}
.dsh-sh__modal-title{margin:0;font-size:16px;font-weight:600}
.dsh-sh__modal-b{padding:20px;display:flex;flex-direction:column;gap:12px}
.dsh-sh__modal-f{display:flex;justify-content:flex-end;gap:10px;margin-top:10px}
.dsh-sh__form-row{display:flex;flex-direction:column;gap:5px}
.dsh-sh__form-label{font-size:12px;font-weight:500;color:var(--dsw-alias-label-secondary)}
.dsh-sh__input,.dsh-sh__textarea{border:0.5px solid var(--dsw-alias-border-l3);border-radius:8px;padding:8px 10px;background:var(--dsw-alias-bg-layer-1);color:inherit;font:inherit}
.dsh-sh__textarea{resize:vertical}
.dsh-sh__input:focus,.dsh-sh__textarea:focus{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}
`

    async function apiGet(path) {
      const response = await fetch(path, { headers: { accept: 'application/json' } })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.ok === false) throw new Error(data.error || `HTTP ${response.status}`)
      return data
    }

    async function apiPost(path, body) {
      const response = await fetch(path, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.ok === false) throw new Error(data.error || `HTTP ${response.status}`)
      return data
    }

    function formatCount(n) {
      const value = Number(n) || 0
      if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
      if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
      return String(value)
    }

    function categoryLabel(key, categories, fallback) {
      const hit = (categories || []).find((item) => item.key === key)
      return hit?.name || fallback || key || ''
    }

    function sourceLabel(source, t) {
      if (source === 'community') return t('sourceCommunity')
      if (source === 'clawhub') return t('sourceClawhub')
      if (source === 'enterprise') return t('sourceEnterprise')
      return source || ''
    }

    function SkillHubIcon({ size }) {
      const s = size || 18
      return h('svg', {
        width: s,
        height: s,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
        style: { display: 'block' }
      },
        h('path', { d: 'M12 2L2 7l10 5 10-5-10-5z' }),
        h('path', { d: 'M2 17l10 5 10-5' }),
        h('path', { d: 'M2 12l10 5 10-5' })
      )
    }

    function Icon({ name: skillName }) {
      const letter = (skillName || '?').trim().charAt(0).toUpperCase()
      return h('div', { className: 'dsh-sh__icon dsh-sh__icon--ph', 'aria-hidden': true }, letter)
    }

    function SkillCard({ skill, categories, t, onOpen }) {
      return h('button', { type: 'button', className: 'dsh-sh__card', onClick: () => onOpen(skill) },
        h('div', { className: 'dsh-sh__card-top' },
          skill.iconUrl
            ? h('img', { className: 'dsh-sh__icon', src: skill.iconUrl, alt: '', referrerPolicy: 'no-referrer' })
            : h(Icon, { name: skill.name }),
          h('div', { className: 'dsh-sh__name' }, skill.name),
        ),
        h('p', { className: 'dsh-sh__desc' }, skill.description || skill.slug),
        h('div', { className: 'dsh-sh__meta' },
          skill.installed ? h('span', { className: 'dsh-sh__pill on' }, t('installedBadge')) : null,
          skill.source ? h('span', { className: 'dsh-sh__pill' }, sourceLabel(skill.source, t)) : null,
          skill.category ? h('span', { className: 'dsh-sh__pill' }, categoryLabel(skill.category, categories, skill.category)) : null,
          h('span', { className: 'dsh-sh__pill' }, `${formatCount(skill.downloads)} ↓`),
        ),
      )
    }

    function McpServerCard({ server, t, onToggle, onRemove }) {
      const [expanded, setExpanded] = useState(false)
      const [toggling, setToggling] = useState(false)

      const handleToggle = async () => {
        setToggling(true)
        try {
          await onToggle(server.serverName, !server.enabled)
        } finally {
          setToggling(false)
        }
      }

      const isUser = server.source === 'user'
      const tools = server.tools || []

      return h('div', { className: `dsh-sh__mcp-card${server.enabled ? '' : ' disabled'}` },
        h('div', { className: 'dsh-sh__mcp-card-top' },
          h('div', { className: 'dsh-sh__mcp-info' },
            h('div', { className: 'dsh-sh__mcp-title-row' },
              h('span', { className: `dsh-sh__dot ${server.live && server.enabled ? 'online' : (server.enabled ? 'connecting' : 'offline')}` }),
              h('span', { className: 'dsh-sh__mcp-name' }, server.serverName),
              h('span', { className: `dsh-sh__pill ${server.transport === 'stdio' ? 'on' : 'purple'}` }, server.transport),
              h('span', { className: 'dsh-sh__pill' }, isUser ? t('mcpSourceUser') : t('mcpSourceProfile')),
              tools.length > 0
                ? h('button', {
                    type: 'button',
                    className: `dsh-sh__pill tool-btn ${expanded ? 'active' : ''}`,
                    onClick: () => setExpanded(!expanded),
                  }, `${tools.length} ${t('mcpToolCountShort')} ${expanded ? '▲' : '▼'}`)
                : h('span', { className: 'dsh-sh__pill' }, t('mcpNoTools')),
            ),
            server.command
              ? h('div', { className: 'dsh-sh__mcp-cmd' },
                  h('span', { className: 'dsh-sh__cmd-tag' }, 'CMD'),
                  h('code', null, `${server.command} ${(server.args || []).join(' ')}`),
                )
              : (server.url
                  ? h('div', { className: 'dsh-sh__mcp-cmd' },
                      h('span', { className: 'dsh-sh__cmd-tag' }, 'URL'),
                      h('code', null, server.url),
                    )
                  : null),
          ),
          h('div', { className: 'dsh-sh__mcp-actions' },
            h('label', { className: 'dsh-sh__switch' },
              h('input', {
                type: 'checkbox',
                checked: server.enabled,
                disabled: toggling,
                onChange: handleToggle,
              }),
              h('span', { className: 'dsh-sh__slider' }),
            ),
            isUser
              ? h('button', {
                  type: 'button',
                  className: 'dsh-sh__btn danger icon-btn',
                  title: t('mcpDelete'),
                  onClick: () => {
                    if (window.confirm(t('mcpConfirmDelete', { name: server.serverName }))) {
                      onRemove(server.serverName)
                    }
                  },
                }, '🗑')
              : null,
          ),
        ),
        expanded && tools.length > 0
          ? h('div', { className: 'dsh-sh__mcp-tools' },
              h('div', { className: 'dsh-sh__mcp-tools-title' }, t('mcpToolsTitle')),
              h('div', { className: 'dsh-sh__mcp-tools-grid' },
                ...tools.map((tool) => h('div', { key: tool.name, className: 'dsh-sh__tool-chip' },
                  h('div', { className: 'dsh-sh__tool-name' }, tool.rawName || tool.name),
                  tool.description ? h('div', { className: 'dsh-sh__tool-desc' }, tool.description) : null,
                )),
              ),
            )
          : null,
      )
    }

    function AddMcpModal({ t, onClose, onAdded }) {
      const [serverName, setServerName] = useState('')
      const [transport, setTransport] = useState('stdio')
      const [command, setCommand] = useState('npx')
      const [args, setArgs] = useState('')
      const [envText, setEnvText] = useState('')
      const [url, setUrl] = useState('')
      const [busy, setBusy] = useState(false)
      const [error, setError] = useState('')

      const submit = async (e) => {
        if (e && e.preventDefault) e.preventDefault()
        if (!serverName.trim()) {
          setError('请输入服务名称 (serverName)')
          return
        }
        setBusy(true)
        setError('')
        try {
          const parsedArgs = args.trim() ? args.trim().split(/\s+/) : []
          const env = {}
          if (envText.trim()) {
            for (const line of envText.split('\n')) {
              const trimmed = line.trim()
              if (!trimmed || trimmed.startsWith('#')) continue
              const eq = trimmed.indexOf('=')
              if (eq > 0) {
                env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
              }
            }
          }

          await apiPost(`${API}/mcp/add`, {
            serverName: serverName.trim(),
            transport,
            ...(transport === 'stdio'
              ? { command: command.trim(), args: parsedArgs, env }
              : { url: url.trim() }),
          })
          onAdded()
          onClose()
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err))
        } finally {
          setBusy(false)
        }
      }

      return h('div', { className: 'dsh-sh__modal-overlay', onClick: onClose },
        h('div', { className: 'dsh-sh__modal', onClick: (e) => e.stopPropagation() },
          h('div', { className: 'dsh-sh__modal-h' },
            h('h3', { className: 'dsh-sh__modal-title' }, t('mcpModalTitle')),
            h('button', { type: 'button', className: 'dsh-sh__btn', onClick: onClose }, '✕'),
          ),
          h('form', { className: 'dsh-sh__modal-b', onSubmit: submit },
            error ? h('div', { className: 'dsh-sh__toast err' }, error) : null,
            h('div', { className: 'dsh-sh__form-row' },
              h('label', { className: 'dsh-sh__form-label' }, t('mcpServerName')),
              h('input', {
                className: 'dsh-sh__input',
                value: serverName,
                placeholder: t('mcpServerNamePlaceholder'),
                onChange: (e) => setServerName(e.target.value),
                required: true,
              }),
            ),
            h('div', { className: 'dsh-sh__form-row' },
              h('label', { className: 'dsh-sh__form-label' }, t('mcpTransport')),
              h('select', {
                className: 'dsh-sh__select',
                value: transport,
                onChange: (e) => setTransport(e.target.value),
              },
                h('option', { value: 'stdio' }, t('mcpTransportStdio')),
                h('option', { value: 'streamable-http' }, t('mcpTransportHttp')),
              ),
            ),
            transport === 'stdio' ? h(react.Fragment, null,
              h('div', { className: 'dsh-sh__form-row' },
                h('label', { className: 'dsh-sh__form-label' }, t('mcpCommand')),
                h('input', {
                  className: 'dsh-sh__input',
                  value: command,
                  placeholder: t('mcpCommandPlaceholder'),
                  onChange: (e) => setCommand(e.target.value),
                  required: true,
                }),
              ),
              h('div', { className: 'dsh-sh__form-row' },
                h('label', { className: 'dsh-sh__form-label' }, t('mcpArgs')),
                h('input', {
                  className: 'dsh-sh__input',
                  value: args,
                  placeholder: t('mcpArgsPlaceholder'),
                  onChange: (e) => setArgs(e.target.value),
                }),
              ),
              h('div', { className: 'dsh-sh__form-row' },
                h('label', { className: 'dsh-sh__form-label' }, t('mcpEnv')),
                h('textarea', {
                  className: 'dsh-sh__textarea',
                  value: envText,
                  rows: 2,
                  placeholder: t('mcpEnvPlaceholder'),
                  onChange: (e) => setEnvText(e.target.value),
                }),
              ),
            ) : h('div', { className: 'dsh-sh__form-row' },
              h('label', { className: 'dsh-sh__form-label' }, t('mcpUrl')),
              h('input', {
                className: 'dsh-sh__input',
                value: url,
                placeholder: t('mcpUrlPlaceholder'),
                onChange: (e) => setUrl(e.target.value),
                required: true,
              }),
            ),
            h('div', { className: 'dsh-sh__modal-f' },
              h('button', { type: 'button', className: 'dsh-sh__btn', onClick: onClose }, t('mcpCancel')),
              h('button', { type: 'submit', className: 'dsh-sh__btn primary', disabled: busy },
                busy ? t('mcpAdding') : t('mcpSubmit')
              ),
            ),
          ),
        ),
      )
    }

    function Detail({ slug, t, categories, onClose, onChanged }) {
      const [detail, setDetail] = useState(null)
      const [preview, setPreview] = useState(null)
      const [busy, setBusy] = useState('')
      const [error, setError] = useState('')
      const [installed, setInstalled] = useState(false)

      useEffect(() => {
        let alive = true
        setDetail(null)
        setPreview(null)
        setError('')
        apiGet(`${API}/skill?slug=${encodeURIComponent(slug)}`).then((data) => {
          if (!alive) return
          setDetail(data.detail)
          setInstalled(Boolean(data.installed))
        }).catch((err) => { if (alive) setError(err.message) })
        return () => { alive = false }
      }, [slug])

      const skill = detail?.skill
      const reports = detail?.securityReports || {}

      const act = async (kind) => {
        setBusy(kind)
        setError('')
        try {
          if (kind === 'uninstall' && !window.confirm(t('confirmUninstall'))) return
          if (kind === 'install') await apiPost(`${API}/install`, { slug })
          else if (kind === 'uninstall') await apiPost(`${API}/uninstall`, { slug })
          else if (kind === 'preview') {
            const data = await apiGet(`${API}/preview?slug=${encodeURIComponent(slug)}`)
            setPreview(data)
            return
          }
          setInstalled(kind === 'install')
          onChanged(kind === 'install' ? t('installOk') : t('uninstallOk'), 'ok')
          if (kind === 'uninstall') onClose()
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err))
        } finally {
          setBusy('')
        }
      }

      return h('div', { className: 'dsh-sh__drawer', onClick: onClose },
        h('aside', { className: 'dsh-sh__panel', onClick: (event) => event.stopPropagation() },
          h('div', { className: 'dsh-sh__panel-h' },
            h('div', null,
              h('div', { className: 'dsh-sh__title' }, skill?.displayName || slug),
              h('div', { className: 'dsh-sh__sub' }, slug),
            ),
            h('button', { type: 'button', className: 'dsh-sh__btn', onClick: onClose }, t('close')),
          ),
          h('div', { className: 'dsh-sh__panel-b' },
            error ? h('div', { className: 'dsh-sh__toast err' }, error) : null,
            !skill && !error ? h('div', { className: 'dsh-sh__status' }, t('loading')) : null,
            skill ? h(react.Fragment, null,
              h('p', { className: 'dsh-sh__desc', style: { WebkitLineClamp: 8 } }, skill.summary_zh || skill.summary || ''),
              h('div', { className: 'dsh-sh__meta' },
                installed ? h('span', { className: 'dsh-sh__pill on' }, t('installedBadge')) : null,
                skill.source ? h('span', { className: 'dsh-sh__pill' }, sourceLabel(skill.source, t)) : null,
                skill.category ? h('span', { className: 'dsh-sh__pill' }, categoryLabel(skill.category, categories, skill.category)) : null,
                skill.labels?.pricing_type === 'paid' ? h('span', { className: 'dsh-sh__pill warn' }, t('paid')) : null,
                skill.labels?.requires_api_key === 'true' ? h('span', { className: 'dsh-sh__pill warn' }, t('needsKey')) : null,
              ),
              h('div', { className: 'dsh-sh__meta' },
                h('span', null, `${formatCount(skill.stats?.downloads)} ↓`),
                h('span', null, t('statsInstalls', { n: formatCount(skill.stats?.installs) })),
              ),
              reports.labels && reports.labels.length ? h('div', { className: 'dsh-sh__meta' },
                h('strong', null, `${t('security')}:`),
                ...reports.labels.map((lbl) => h('span', { key: lbl, className: 'dsh-sh__pill ok' }, lbl)),
              ) : null,
              h('div', { className: 'dsh-sh__actions' },
                installed
                  ? h('button', { type: 'button', className: 'dsh-sh__btn danger', disabled: busy === 'uninstall', onClick: () => act('uninstall') }, busy === 'uninstall' ? t('uninstalling') : t('uninstall'))
                  : h('button', { type: 'button', className: 'dsh-sh__btn primary', disabled: busy === 'install', onClick: () => act('install') }, busy === 'install' ? t('installing') : t('install')),
                h('button', { type: 'button', className: 'dsh-sh__btn', disabled: busy === 'preview', onClick: () => act('preview') }, busy === 'preview' ? t('previewing') : t('preview')),
                h('a', { className: 'dsh-sh__btn', href: `${detail?.page || 'https://skillhub.cn'}`, target: '_blank', rel: 'noreferrer' }, t('openSite')),
              ),
              preview ? h('div', null,
                h('h4', null, 'SKILL.md'),
                h('pre', { className: 'dsh-sh__pre' }, preview.text),
              ) : null,
            ) : null,
          ),
        ),
      )
    }

    function Market({ t }) {
      const [tab, setTab] = useState('browse')
      const [categories, setCategories] = useState([])
      const [keyword, setKeyword] = useState('')
      const [category, setCategory] = useState('')
      const [source, setSource] = useState('')
      const [sortBy, setSortBy] = useState('downloads')
      const [page, setPage] = useState(1)
      const [list, setList] = useState({ skills: [], total: 0 })
      const [mine, setMine] = useState([])
      const [mcpServers, setMcpServers] = useState([])
      const [loading, setLoading] = useState(false)
      const [error, setError] = useState('')
      const [toast, setToast] = useState(null)
      const [openSlug, setOpenSlug] = useState(null)
      const [showAddMcp, setShowAddMcp] = useState(false)

      useEffect(() => {
        apiGet(`${API}/categories`).then((data) => setCategories(data.categories || [])).catch(() => {})
      }, [])

      const query = useMemo(() => {
        const params = new URLSearchParams()
        if (keyword) params.set('keyword', keyword)
        if (category) params.set('category', category)
        if (source) params.set('source', source)
        if (sortBy) params.set('sortBy', sortBy)
        params.set('page', String(page))
        return params.toString()
      }, [keyword, category, source, sortBy, page])

      const loadBrowse = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
          setList(await apiGet(`${API}/skills?${query}`))
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err))
        } finally {
          setLoading(false)
        }
      }, [query])

      const loadMine = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
          const data = await apiGet(`${API}/installed`)
          setMine(data.skills || [])
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err))
        } finally {
          setLoading(false)
        }
      }, [])

      const loadMcp = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
          const data = await apiGet(`${API}/mcp/list`)
          setMcpServers(data.servers || [])
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err))
        } finally {
          setLoading(false)
        }
      }, [])

      useEffect(() => {
        if (tab === 'browse') void loadBrowse()
        else if (tab === 'installed') void loadMine()
        else if (tab === 'mcp') void loadMcp()
      }, [tab, loadBrowse, loadMine, loadMcp])

      useEffect(() => {
        if (!toast) return undefined
        const timer = setTimeout(() => setToast(null), 3200)
        return () => clearTimeout(timer)
      }, [toast])

      const pages = Math.max(1, Math.ceil((list.total || 0) / (list.pageSize || 20)))
      const showToast = (text, kind) => { setToast({ text, kind }) }

      const handleMcpToggle = async (serverName, enabled) => {
        try {
          await apiPost(`${API}/mcp/toggle`, { serverName, enabled })
          showToast(t('mcpToggleSuccess'), 'ok')
          void loadMcp()
        } catch (err) {
          showToast(err instanceof Error ? err.message : String(err), 'err')
        }
      }

      const handleMcpRemove = async (serverName) => {
        try {
          await apiPost(`${API}/mcp/remove`, { serverName })
          showToast(t('mcpDeleteSuccess'), 'ok')
          void loadMcp()
        } catch (err) {
          showToast(err instanceof Error ? err.message : String(err), 'err')
        }
      }

      return h('div', { className: 'dsh-sh' },
        h('div', { className: 'dsh-sh__head' },
          h('h2', { className: 'dsh-sh__title' }, t('title')),
          h('p', { className: 'dsh-sh__sub' },
            tab === 'mcp' ? t('mcpSubtitle') : `${t('subtitle')} · `,
            tab === 'mcp' ? null : h('a', { href: 'https://skillhub.cn/', target: '_blank', rel: 'noreferrer' }, 'skillhub.cn'),
          ),
        ),
        h('div', { className: 'dsh-sh__tabs', role: 'tablist' },
          h('button', { type: 'button', role: 'tab', 'aria-selected': tab === 'browse', className: `dsh-sh__tab${tab === 'browse' ? ' on' : ''}`, onClick: () => setTab('browse') }, t('browse')),
          h('button', { type: 'button', role: 'tab', 'aria-selected': tab === 'installed', className: `dsh-sh__tab${tab === 'installed' ? ' on' : ''}`, onClick: () => setTab('installed') }, `${t('installed')}${mine.length ? ` (${mine.length})` : ''}`),
          h('button', { type: 'button', role: 'tab', 'aria-selected': tab === 'mcp', className: `dsh-sh__tab${tab === 'mcp' ? ' on' : ''}`, onClick: () => setTab('mcp') }, `${t('mcp')}${mcpServers.length ? ` (${mcpServers.length})` : ''}`),
        ),
        tab === 'browse' ? h('div', { className: 'dsh-sh__filters' },
          h('input', { className: 'dsh-sh__search', value: keyword, placeholder: t('search'), onChange: (event) => setKeyword(event.target.value) }),
          h('select', { className: 'dsh-sh__select', value: category, onChange: (event) => setCategory(event.target.value) },
            h('option', { value: '' }, t('allCategories')),
            ...categories.map((item) => h('option', { key: item.key, value: item.key }, item.name || item.key)),
          ),
          h('select', { className: 'dsh-sh__select', value: source, onChange: (event) => setSource(event.target.value) },
            h('option', { value: '' }, t('allSources')),
            h('option', { value: 'community' }, t('sourceCommunity')),
            h('option', { value: 'clawhub' }, t('sourceClawhub')),
            h('option', { value: 'enterprise' }, t('sourceEnterprise')),
          ),
          h('select', { className: 'dsh-sh__select', value: sortBy, onChange: (event) => setSortBy(event.target.value) },
            h('option', { value: 'downloads' }, t('sortDownloads')),
            h('option', { value: 'score' }, t('sortScore')),
            h('option', { value: 'updated_at' }, t('sortUpdated')),
            h('option', { value: 'stars' }, t('sortStars')),
          ),
        ) : null,
        tab === 'mcp' ? h('div', { className: 'dsh-sh__mcp-bar' },
          h('div', { className: 'dsh-sh__mcp-count' },
            t('mcpCount', { count: String(mcpServers.length) }) || `共 ${mcpServers.length} 个 MCP 服务`,
          ),
          h('div', { className: 'dsh-sh__actions' },
            h('button', { type: 'button', className: 'dsh-sh__btn', onClick: () => void loadMcp() }, `🔄 ${t('mcpRefresh')}`),
            h('button', { type: 'button', className: 'dsh-sh__btn primary', onClick: () => setShowAddMcp(true) }, `+ ${t('mcpAdd')}`),
          ),
        ) : null,
        toast ? h('div', { className: `dsh-sh__toast ${toast.kind}` }, toast.text) : null,
        h('div', { className: 'dsh-sh__body' },
          loading ? h('div', { className: 'dsh-sh__status' }, t('loading')) : null,
          error ? h('div', { className: 'dsh-sh__status' },
            t('error'), '：', error, ' ',
            h('button', { type: 'button', className: 'dsh-sh__btn', onClick: () => tab === 'browse' ? void loadBrowse() : (tab === 'installed' ? void loadMine() : void loadMcp()) }, t('retry')),
          ) : null,
          !loading && !error && tab === 'browse' && list.skills.length === 0 ? h('div', { className: 'dsh-sh__status' }, t('empty')) : null,
          !loading && !error && tab === 'installed' && mine.length === 0 ? h('div', { className: 'dsh-sh__status' }, t('noneInstalled')) : null,
          !loading && !error && tab === 'mcp' && mcpServers.length === 0 ? h('div', { className: 'dsh-sh__status' }, t('mcpEmpty')) : null,
          !loading && !error && tab === 'browse' ? h('div', { className: 'dsh-sh__grid' },
            ...list.skills.map((skill) => h(SkillCard, { key: skill.slug, skill, categories, t, onOpen: (item) => setOpenSlug(item.slug) })),
          ) : null,
          !loading && !error && tab === 'installed' ? h('div', { className: 'dsh-sh__grid' },
            ...mine.map((skill) => h(SkillCard, {
              key: skill.slug,
              skill: { ...skill, installed: true, downloads: 0 },
              categories,
              t,
              onOpen: (item) => setOpenSlug(item.slug),
            })),
          ) : null,
          !loading && !error && tab === 'mcp' ? h('div', { className: 'dsh-sh__mcp-list' },
            ...mcpServers.map((server) => h(McpServerCard, {
              key: server.serverName,
              server,
              t,
              onToggle: handleMcpToggle,
              onRemove: handleMcpRemove,
              showToast,
            })),
          ) : null,
        ),
        tab === 'browse' && !error ? h('div', { className: 'dsh-sh__pager' },
          h('button', { type: 'button', className: 'dsh-sh__btn', disabled: page <= 1 || loading, onClick: () => setPage((n) => Math.max(1, n - 1)) }, t('prev')),
          h('span', null, t('page', { n: String(page), total: formatCount(list.total) })),
          h('button', { type: 'button', className: 'dsh-sh__btn', disabled: page >= pages || loading, onClick: () => setPage((n) => n + 1) }, t('next')),
        ) : null,
        openSlug ? h(Detail, {
          slug: openSlug,
          t,
          categories,
          onClose: () => setOpenSlug(null),
          onChanged: (text, kind) => {
            showToast(text, kind)
            void loadBrowse()
            void loadMine()
          },
        }) : null,
        showAddMcp ? h(AddMcpModal, {
          t,
          onClose: () => setShowAddMcp(false),
          onAdded: () => {
            showToast(t('mcpAddSuccess'), 'ok')
            void loadMcp()
          },
        }) : null,
      )
    }

    function apply(ctx) {
      ctx.effect(() => {
        const style = document.createElement('style')
        style.id = STYLE_ID
        style.textContent = CSS
        document.head.appendChild(style)
        return () => style.remove()
      }, 'dsh-skillhub: styles')

      ctx.effect(() => ctx.locale.register(NS, { zh: ZH, en: EN }), 'dsh-skillhub: dictionaries')

      const nav = ctx.locale.bind(NS)

      // Register main global panel
      ctx.slots.inject('main', () => ctx.slots.register({
        name: 'main',
        key: PANEL_ID,
        locale: NS,
      }, (props) => h(Market, { ...props, t: nav })))

      // Register in sidebar panellist, positioned directly below Plugins (order 10)
      ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
        name: 'sidebar.panellist',
        id: PANEL_ID,
        order: 10,
        label: () => nav('nav'),
        locale: NS,
      }, SkillHubIcon))

      // Also keep Settings section registration for convenience
      ctx.slots.inject('settings.section', () => ctx.slots.register({
        name: 'settings.section',
        id: 'dsh-skillhub',
        order: 45,
        label: () => nav('nav'),
        locale: NS,
      }, Market))
    }

    exports.name = name
    exports.inject = inject
    exports.apply = apply
    return module.exports
  },
})
