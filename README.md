# Cohen Coolidge

Student at the University of Georgia. I build small, fast, private desktop tools — and websites for local businesses.

Most of what I ship follows one rule: **it should do exactly what it says, and nothing else.** No accounts, no telemetry, no background processes, no 200 MB binary for a 5 MB job.

---

## Spiral

A collection of small tools that respect the machine they run on. Wallpaper, Slim, and Resume live in [`cococool13/spiral`](https://github.com/cococool13/spiral).

### [Spiral Wallpaper](https://github.com/cococool13/spiral/tree/main/apps/wallpaper) · `v1.0.3`

Desktop wallpaper app for macOS and Windows. Click a wallpaper, it applies.

- **4.6 MB** binary, ~95 MB idle RAM, window on screen in 0.23 s
- Built on Tauri 2 — Rust core, not Electron
- Zero network requests until you search; all networking lives in the Rust core, never the webview
- No account, no telemetry, quits when you close the window

`Rust` · `Tauri 2` · `React` · MIT

### [Spiral Slim](https://github.com/cococool13/spiral/tree/main/apps/slim) · `v1.0.0`

Debloat and harden Brave, Chrome, Edge, and Firefox using enterprise managed policies — the mechanism the browsers already respect natively. No extensions, no patching binaries.

- Linux, macOS, and Windows; Chromium and Mozilla policy dialects handled separately
- Python **standard library only** — zero dependencies
- Ships source-first. The only binary is a signed, notarized macOS `.dmg`, with four verification steps documented in `SECURITY.md`
- GPL-3.0, forked from [SlimBrave Neo](https://github.com/ChaoticSi1ence/SlimBrave-Neo); the multi-browser engine and preset system were built here and offered upstream
- The v1.0.0 macOS release archive is in the archived [Spiral-Slim](https://github.com/cococool13/Spiral-Slim) repo

`Python` · `PowerShell` · GPL-3.0

### [Spiral Resume](https://github.com/cococool13/spiral/tree/main/apps/Resume) · `v0.1.1`

A resume goes in; a typeset PDF or Word file comes out. It can tighten wording. It is never allowed to change a fact.

- macOS and Windows
- Twelve layouts; preview and PDF share one Typst engine so they cannot disagree
- Built on Tauri 2 — Rust core, not Electron

`Rust` · `Tauri 2` · `React` · MIT

---

## Also

**[Win11 Gaming Toolkit](https://github.com/cococool13/win11-gaming-toolkit)** — PowerShell system-tuning toolkit. Every one of the 66 mutators declares its anti-cheat, reboot, and disk impact in its header, cites a Microsoft Learn or vendor source, and ships a paired restore script. 1100+ Pester tests, gate-enforced. Built because most "Windows optimizers" advertise their upside and hide their trade-offs.

**Client work** — Coastal Hardware, JCC, and a pharmacy: marketing and product sites. New sites ship on Cloudflare, with real Lighthouse budgets and no template smell. Private product work includes the QCC-1 workspace in agentic-account. Repos are private; happy to walk through any of them.

**[Portfolio →](https://spiralcc.tech)**

---

## Stack

`Astro` · `Next.js` · `TypeScript` · `Tailwind` · `Rust` · `Python` · `PowerShell` · `Supabase`

Reach me at **spiralcoco@gmail.com**.
