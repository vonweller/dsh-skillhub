window.__ModuleLoader__.load({
  id: 'dsh-skillhub',
  factory: (require) => {
    const module = { exports: {} }
    const exports = module.exports
    const react = require('react')
    const h = react.createElement
    const { useCallback, useEffect, useMemo, useState } = react

    const name = 'dsh-skillhub/client'
    const inject = ['slots', 'locale']
    const NS = 'dsh-skillhub'
    const STYLE_ID = 'dsh-skillhub-style'
    const API = '/dsh-skillhub/api'

    const ZH = {
      nav: '技能市场',
      title: 'SkillHub 技能市场',
      subtitle: '浏览 skillhub.cn 的技能库，安装到本机 ~/.dsh/skills（不是插件）',
      browse: '浏览',
      installed: '已安装',
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
      nav: 'Skill Market',
      title: 'SkillHub market',
      subtitle: 'Browse skillhub.cn and install skills into ~/.dsh/skills (not plugins)',
      browse: 'Browse',
      installed: 'Installed',
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
.dsh-sh{display:flex;flex-direction:column;gap:12px;min-height:0;height:100%;color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}
.dsh-sh *{box-sizing:border-box}
.dsh-sh__head{display:flex;flex-direction:column;gap:4px}
.dsh-sh__title{margin:0;font-size:16px;line-height:24px;font-weight:600}
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
.dsh-sh__pill.warn{background:var(--dsw-alias-state-warn-tertiary);color:var(--dsw-alias-state-warn-label);border-color:transparent}
.dsh-sh__pill.ok{background:var(--dsw-alias-state-success-tertiary);color:var(--dsw-alias-state-success-primary);border-color:transparent}
.dsh-sh__pager{display:flex;gap:8px;align-items:center;justify-content:center;padding:8px 0 0;font-size:12px;color:var(--dsw-alias-label-secondary)}
.dsh-sh__btn{height:30px;border-radius:8px;border:0.5px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-layer-1);color:inherit;font:inherit;padding:0 10px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center}
.dsh-sh__btn:disabled{opacity:.5;cursor:not-allowed}
.dsh-sh__btn:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}
.dsh-sh__btn.primary{background:var(--dsw-alias-button-primary-fill);border-color:transparent;color:var(--dsw-alias-label-primary-inverted)}
.dsh-sh__btn.danger{color:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-state-error-secondary);background:var(--dsw-alias-interactive-bg-hover-danger)}
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
                h('span', null, `★ ${formatCount(skill.stats?.stars)}`),
                skill.tags?.latest ? h('span', null, `v${skill.tags.latest}`) : null,
              ),
              h('div', null,
                h('div', { className: 'dsh-sh__sub' }, t('security')),
                h('div', { className: 'dsh-sh__meta' },
                  reports.keen ? h('span', { className: `dsh-sh__pill ${reports.keen.status === 'benign' ? 'ok' : 'warn'}` }, `keen · ${reports.keen.statusText || reports.keen.status}`) : null,
                  reports.sanbu ? h('span', { className: `dsh-sh__pill ${reports.sanbu.status === 'benign' ? 'ok' : 'warn'}` }, `sanbu · ${reports.sanbu.statusText || reports.sanbu.status}`) : null,
                ),
              ),
              h('div', { className: 'dsh-sh__actions' },
                installed
                  ? h('button', { type: 'button', className: 'dsh-sh__btn danger', disabled: Boolean(busy), onClick: () => void act('uninstall') }, busy === 'uninstall' ? t('uninstalling') : t('uninstall'))
                  : h('button', { type: 'button', className: 'dsh-sh__btn primary', disabled: Boolean(busy), onClick: () => void act('install') }, busy === 'install' ? t('installing') : t('install')),
                h('button', { type: 'button', className: 'dsh-sh__btn', disabled: Boolean(busy), onClick: () => void act('preview') }, busy === 'preview' ? t('previewing') : t('preview')),
                h('a', { className: 'dsh-sh__btn', href: `https://skillhub.cn/skills/${encodeURIComponent(slug)}`, target: '_blank', rel: 'noreferrer' }, t('openSite')),
              ),
              preview ? h('pre', { className: 'dsh-sh__pre' }, preview.text) : null,
            ) : null,
          ),
        ),
      )
    }

    function Market({ t }) {
      const [tab, setTab] = useState('browse')
      const [keyword, setKeyword] = useState('')
      const [debounced, setDebounced] = useState('')
      const [category, setCategory] = useState('')
      const [source, setSource] = useState('')
      const [sortBy, setSortBy] = useState('downloads')
      const [page, setPage] = useState(1)
      const [categories, setCategories] = useState([])
      const [list, setList] = useState({ skills: [], total: 0, page: 1, pageSize: 20 })
      const [mine, setMine] = useState([])
      const [loading, setLoading] = useState(false)
      const [error, setError] = useState('')
      const [toast, setToast] = useState(null)
      const [openSlug, setOpenSlug] = useState(null)

      useEffect(() => {
        const timer = setTimeout(() => setDebounced(keyword.trim()), 320)
        return () => clearTimeout(timer)
      }, [keyword])

      useEffect(() => { setPage(1) }, [debounced, category, source, sortBy])

      useEffect(() => {
        apiGet(`${API}/categories`).then((data) => {
          const items = Array.isArray(data.categories) ? data.categories : data.categories?.items
          setCategories(Array.isArray(items) ? items.filter((item) => item && item.active !== false) : [])
        }).catch(() => undefined)
        apiGet(`${API}/installed`).then((data) => setMine(data.skills || [])).catch(() => undefined)
      }, [])

      const query = useMemo(() => {
        const params = new URLSearchParams()
        if (debounced) params.set('keyword', debounced)
        if (category) params.set('category', category)
        if (source) params.set('source', source)
        params.set('sortBy', debounced && sortBy === 'downloads' ? 'score' : sortBy)
        params.set('page', String(page))
        params.set('pageSize', '20')
        return params.toString()
      }, [debounced, category, source, sortBy, page])

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

      useEffect(() => {
        if (tab === 'browse') void loadBrowse()
        else void loadMine()
      }, [tab, loadBrowse, loadMine])

      useEffect(() => {
        if (!toast) return undefined
        const timer = setTimeout(() => setToast(null), 3200)
        return () => clearTimeout(timer)
      }, [toast])

      const pages = Math.max(1, Math.ceil((list.total || 0) / (list.pageSize || 20)))
      const showToast = (text, kind) => { setToast({ text, kind }) }

      return h('div', { className: 'dsh-sh' },
        h('div', { className: 'dsh-sh__head' },
          h('h2', { className: 'dsh-sh__title' }, t('title')),
          h('p', { className: 'dsh-sh__sub' }, t('subtitle'), ' · ', h('a', { href: 'https://skillhub.cn/', target: '_blank', rel: 'noreferrer' }, 'skillhub.cn')),
        ),
        h('div', { className: 'dsh-sh__tabs', role: 'tablist' },
          h('button', { type: 'button', role: 'tab', 'aria-selected': tab === 'browse', className: `dsh-sh__tab${tab === 'browse' ? ' on' : ''}`, onClick: () => setTab('browse') }, t('browse')),
          h('button', { type: 'button', role: 'tab', 'aria-selected': tab === 'installed', className: `dsh-sh__tab${tab === 'installed' ? ' on' : ''}`, onClick: () => setTab('installed') }, `${t('installed')}${mine.length ? ` (${mine.length})` : ''}`),
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
        toast ? h('div', { className: `dsh-sh__toast ${toast.kind}` }, toast.text) : null,
        h('div', { className: 'dsh-sh__body' },
          loading ? h('div', { className: 'dsh-sh__status' }, t('loading')) : null,
          error ? h('div', { className: 'dsh-sh__status' },
            t('error'), '：', error, ' ',
            h('button', { type: 'button', className: 'dsh-sh__btn', onClick: () => tab === 'browse' ? void loadBrowse() : void loadMine() }, t('retry')),
          ) : null,
          !loading && !error && tab === 'browse' && list.skills.length === 0 ? h('div', { className: 'dsh-sh__status' }, t('empty')) : null,
          !loading && !error && tab === 'installed' && mine.length === 0 ? h('div', { className: 'dsh-sh__status' }, t('noneInstalled')) : null,
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
