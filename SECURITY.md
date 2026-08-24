# Security

`dsh-skillhub` only installs a skill after you click Install.

A skill is a `SKILL.md` instruction pack (and optional scripts) that the agent may follow. Treat third-party skills as untrusted text. Prefer community listings with a benign security scan, and do not install paid or API-key skills unless you already have that vendor account.

The plugin talks to `https://api.skillhub.cn` and writes under the configured skills directory (default `~/.dsh/skills`).
