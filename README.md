# Cohen Coolidge

Student at the University of Georgia. I build small, fast, private desktop tools — and websites for local businesses.

Most of what I ship follows one rule: **it should do exactly what it says, and nothing else.** No accounts, no telemetry, no background processes, no 200 MB binary for a 5 MB job.

---

## Spiral

A collection of small tools that respect the machine they run on.

### [Spiral Wallpaper](https://github.com/cococool13/spiral-wallpaper) · `v1.0.1`

Desktop wallpaper app for macOS and Windows. Click a wallpaper, it applies.

- **4.6 MB** binary, ~95 MB idle RAM, window on screen in 0.23 s
- Built on Tauri 2 — Rust core, not Electron
- Zero network requests until you search; all networking lives in the Rust core, never the webview
- No account, no telemetry, quits when you close the window

`Rust` · `Tauri 2` · `React` · MIT

### [Spiral Slim](https://github.com/cococool13/Spiral-Slim) · `v1.0.0`

Debloat and harden Brave, Chrome, Edge, and Firefox using enterprise managed policies — the mechanism the browsers already respect natively. No extensions, no patching binaries.

- Linux, macOS, and Windows; Chromium and Mozilla policy dialects handled separately
- Python **standard library only** — zero dependencies
- Ships source-first. The only binary is a signed, notarized macOS `.dmg`, with four verification steps documented in `SECURITY.md`
- GPL-3.0, forked from [SlimBrave Neo](https://github.com/ChaoticSi1ence/SlimBrave-Neo); the multi-browser engine and preset system were built here and offered upstream

`Python` · `PowerShell` · GPL-3.0

---

## Also

**[Win11 Gaming Toolkit](https://github.com/cococool13/TweakEazy)** — PowerShell system-tuning toolkit. Every one of the 66 mutators declares its anti-cheat, reboot, and disk impact in its header, cites a Microsoft Learn or vendor source, and ships a paired restore script. 1100+ Pester tests, gate-enforced. Built because most "Windows optimizers" advertise their upside and hide their trade-offs.

**Client work** — marketing and product sites for local businesses: a hardware store, a pharmacy, a retirement-plan evaluator. Mostly Astro and Next.js on Vercel and Cloudflare, with real Lighthouse budgets and no template smell. Repos are private; happy to walk through any of them.

**[Portfolio →](https://spiraldemo.netlify.app)**

---

## Stack

`Astro` · `Next.js` · `TypeScript` · `Tailwind` · `Rust` · `Python` · `PowerShell` · `Supabase`

Reach me at **spiralcoco@gmail.com**.
