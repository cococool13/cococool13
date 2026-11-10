// Renders the profile SVGs from GitHub data. Text is outlined to paths because
// GitHub serves README images in a sandbox where embedded fonts do not load.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import opentype from 'opentype.js'

const root = fileURLToPath(new URL('..', import.meta.url))
const font = (n) => opentype.loadSync(`${root}fonts/${n}.ttf`)
const DISPLAY = font('Newsreader-Display-Roman')
const DISPLAY_I = font('Newsreader-Display-Italic')
const TEXT = font('Newsreader-Text-Roman')
const MONO = font('IBMPlexMono-400')
const MONO_M = font('IBMPlexMono-500')

const W = 880
const THEMES = {
  light: {
    paper: '#F2EBDC', ink: '#1C1A16', muted: '#6E6659', rule: '#1C1A16', ruleOp: 0.2,
    pageInk: '#1C1A16', pageMuted: '#6A6F76', blue: '#1F4FD8',
    cells: ['#ECEEF2', '#C7D5FA', '#8EA8F2', '#4A72E6', '#1B45C4'],
  },
  dark: {
    paper: '#E9E1CF', ink: '#1C1A16', muted: '#6E6659', rule: '#ECE5D6', ruleOp: 0.22,
    pageInk: '#ECE5D6', pageMuted: '#8D96A0', blue: '#8AA8FF',
    cells: ['#1A2233', '#243F8F', '#3559C7', '#5B82F0', '#AFC4FF'],
  },
}
const LEVELS = ['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const LONG_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const r = (n) => Math.round(n * 10) / 10
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const width = (s, size, f, track = 0) => f.getAdvanceWidth(s, size, { letterSpacing: track }) - track * size

function text(s, x, y, size, f, fill, { anchor = 'start', track = 0, op } = {}) {
  const w = width(s, size, f, track)
  const x0 = anchor === 'end' ? x - w : anchor === 'middle' ? x - w / 2 : x
  const d = f.getPath(s, x0, y, size, { letterSpacing: track }).toPathData(1)
  return `<path fill="${fill}"${op ? ` fill-opacity="${op}"` : ''} d="${d}"/>`
}

function wrap(s, size, f, max) {
  const lines = ['']
  for (const word of s.split(' ')) {
    const next = lines.at(-1) ? `${lines.at(-1)} ${word}` : word
    if (width(next, size, f) > max && lines.at(-1)) lines.push(word)
    else lines[lines.length - 1] = next
  }
  return lines
}

const svg = (h, label, body, w = W) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(label)}"><title>${esc(label)}</title>${body}</svg>\n`

const hairline = (x1, x2, y, t) => `<path stroke="${t.rule}" stroke-opacity="${t.ruleOp}" d="M${x1} ${y}H${x2}"/>`
const label = (s, x, y, fill, o = {}) => text(s.toUpperCase(), x, y, o.size ?? 13, o.f ?? MONO, fill, { track: 0.12, ...o })

// ── data ────────────────────────────────────────────────────────────────────
export function shape(raw) {
  const user = raw.data.user
  const cal = user.contributionsCollection.contributionCalendar
  const days = cal.weeks.flatMap((w) => w.contributionDays)
  const today = days.at(-1).date
  const utc = (d) => Date.UTC(+d.slice(0, 4), d.slice(5, 7) - 1, +d.slice(8, 10))
  const byMonth = new Map()
  for (const d of days) byMonth.set(d.date.slice(0, 7), (byMonth.get(d.date.slice(0, 7)) ?? 0) + d.contributionCount)
  const bytes = new Map()
  for (const repo of user.repositories.nodes)
    for (const e of repo.languages.edges) bytes.set(e.node.name, (bytes.get(e.node.name) ?? 0) + e.size)
  const allBytes = [...bytes.values()].reduce((a, b) => a + b, 0)
  return {
    weeks: cal.weeks,
    total: cal.totalContributions,
    today,
    weekday: new Date(utc(today)).getUTCDay(),
    issue: (utc(today) - Date.UTC(+today.slice(0, 4), 0, 1)) / 864e5 + 1,
    busiest: days.reduce((a, d) => (d.contributionCount >= a.contributionCount ? d : a)),
    months: [...byMonth].slice(-12).map(([k, n]) => ({ name: MONTHS[k.slice(5) - 1], n })),
    languages: [...bytes].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, n]) => ({ name, share: n / allBytes })),
  }
}

// ── header ──────────────────────────────────────────────────────────────────
function header(p, d, t, portrait) {
  const H = 404, pad = 52
  const date = `${WEEKDAYS[d.weekday]}, ${LONG_MONTHS[d.today.slice(5, 7) - 1]} ${+d.today.slice(8)}, ${d.today.slice(0, 4)}`
  const bio = wrap(p.bio, 22, TEXT, 440)
  const art = portrait
    ? `<svg x="536" y="62" width="344" height="445" viewBox="0 0 252 326" color="${t.ink}">${portrait}</svg>`
    : `<rect x="612" y="96" width="216" height="270" rx="4" fill="none" stroke="${t.muted}" stroke-dasharray="3 5"/>` +
      label('Portrait', 720, 228, t.muted, { anchor: 'middle' }) + label('needs your photo', 720, 248, t.muted, { anchor: 'middle', size: 10 })
  return svg(H, `${p.first} ${p.last}. ${p.kicker}. ${p.bio}`,
    `<defs><clipPath id="c"><rect width="${W}" height="${H}" rx="8"/></clipPath>` +
    `<filter id="g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="7"/>` +
    `<feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 0 0.3  0 0 0 0.11 0"/></filter></defs>` +
    `<g clip-path="url(#c)"><rect width="${W}" height="${H}" fill="${t.paper}"/><rect width="${W}" height="${H}" filter="url(#g)"/>` +
    label(p.kicker, pad, 46, t.muted, { f: MONO_M }) +
    label(`No. ${d.issue} · ${date}`, W - pad, 46, t.muted, { anchor: 'end' }) +
    `<path stroke="${t.ink}" stroke-opacity="0.2" d="M${pad} 64.5H${W - pad}"/>` +
    text(p.first, pad - 5, 176, 118, DISPLAY, t.ink) +
    text(p.last, pad - 3, 282, 118, DISPLAY_I, t.ink) +
    bio.map((l, i) => text(l, pad, 340 + i * 30, 22, TEXT, t.ink, { op: 0.86 })).join('') +
    art + `</g>`)
}

// ── heatmap ─────────────────────────────────────────────────────────────────
function heatmap(d, t) {
  const top = 132, gap = 3, cols = d.weeks.length
  const pitch = (W + gap) / cols, cell = pitch - gap
  const H = top + 7 * pitch + 26
  const a = 'Every day, '
  const total = d.total.toLocaleString('en-US')
  let out = text(a, 0, 76, 44, DISPLAY, t.pageInk) + text('in blue', width(a, 44, DISPLAY), 76, 44, DISPLAY_I, t.blue) +
    text(total, W, 76, 44, DISPLAY, t.pageInk, { anchor: 'end' }) +
    label('Contributions, past year', W - width(total, 44, DISPLAY) - 14, 76, t.pageMuted, { anchor: 'end' }) +
    hairline(0, W, 96.5, t)
  let lastLabel = -9
  d.weeks.forEach((week, c) => {
    const first = week.contributionDays[0].date
    const month = first.slice(5, 7)
    if (c > 0 && month !== d.weeks[c - 1].contributionDays[0].date.slice(5, 7) && c - lastLabel > 2 && c < cols - 1) {
      out += label(MONTHS[month - 1], c * pitch, top - 12, t.pageMuted)
      lastLabel = c
    }
    for (const day of week.contributionDays)
      out += `<rect x="${r(c * pitch)}" y="${r(top + day.weekday * pitch)}" width="${r(cell)}" height="${r(cell)}" rx="2.5" fill="${t.cells[LEVELS.indexOf(day.contributionLevel)]}"/>`
  })
  // Callout for the busiest day: a leader line from its cell to a note under the grid.
  const b = d.busiest
  const col = d.weeks.findIndex((w) => w.contributionDays.includes(b))
  const bx = col * pitch, cx = r(bx + cell + gap / 2), by = top + 7 * pitch + 8
  const note = `Busiest day · ${MONTHS[b.date.slice(5, 7) - 1]} ${+b.date.slice(8)} · ${b.contributionCount}`
  const end = col > cols / 2
  out += `<rect x="${r(bx - 1)}" y="${r(top + b.weekday * pitch - 1)}" width="${r(cell + 2)}" height="${r(cell + 2)}" rx="3.5" fill="none" stroke="${t.pageInk}" stroke-width="1.5"/>` +
    `<path fill="none" stroke="${t.pageInk}" d="M${cx} ${r(top + b.weekday * pitch + cell + 1)}V${r(by + 6)}H${end ? cx - 10 : cx + 10}"/>` +
    label(note, end ? cx - 16 : cx + 16, by + 10, t.pageInk, { anchor: end ? 'end' : 'start' })
  return svg(Math.round(H), `Every day, in blue. ${total} contributions in the past year. ${note}.`, out)
}

// ── stats ───────────────────────────────────────────────────────────────────
function stats(d, t) {
  const H = 292, split = 548, base = 264, maxH = 150
  let out = text('Month by month', 0, 62, 28, DISPLAY, t.pageInk) + text('Written in', split + 36, 62, 28, DISPLAY, t.pageInk) +
    hairline(0, split - 36, 82.5, t) + hairline(split + 36, W, 82.5, t) + hairline(0, split - 36, base + 0.5, t) +
    `<path stroke="${t.rule}" stroke-opacity="${t.ruleOp}" d="M${split + 0.5} 40V${H}"/>`
  const peak = Math.max(...d.months.map((m) => m.n), 1)
  const slot = (split - 36 + 14) / d.months.length, bw = slot - 14
  d.months.forEach((m, i) => {
    const h = m.n && Math.max((m.n / peak) * maxH, 2), x = i * slot, top = m.n === peak
    out += `<rect x="${r(x)}" y="${r(base - h)}" width="${r(bw)}" height="${r(h)}" rx="2" fill="${top ? t.cells[4] : t.cells[3]}"/>` +
      label(m.n.toLocaleString('en-US'), x + bw / 2, base - h - 8, top ? t.pageInk : t.pageMuted, { anchor: 'middle', size: 13, track: 0, f: top ? MONO_M : MONO, op: m.n ? 1 : 0.5 }) +
      label(m.name, x + bw / 2, base + 22, t.pageMuted, { anchor: 'middle', size: 13, track: 0.06 })
  })
  d.languages.forEach((l, i) => {
    const y = 122 + i * 38, x = split + 36, w = W - x
    const pct = l.share < 0.01 ? '<1%' : `${Math.round(l.share * 100)}%`
    out += text(l.name, x, y, 19, TEXT, t.pageInk) + label(pct, W, y, t.pageMuted, { anchor: 'end', size: 13, track: 0.02 }) +
      `<rect x="${x}" y="${y + 9}" width="${w}" height="3" rx="1.5" fill="${t.cells[0]}"/>` +
      `<rect x="${x}" y="${y + 9}" width="${r(Math.max(w * l.share, 3))}" height="3" rx="1.5" fill="${t.cells[i ? 3 : 4]}"/>`
  })
  return svg(H, `Contributions by month: ${d.months.map((m) => `${m.name} ${m.n}`).join(', ')}. Languages: ${d.languages.map((l) => `${l.name} ${Math.round(l.share * 100)}%`).join(', ')}.`, out)
}

// ── project tiles (one SVG each so the README can link them) ────────────────
const CREAM = '#F6EFE0', COL = 384, PAD = 36
// `top` is transparent space baked in above the tile: README images cannot carry margins.
function tile(p, h, top, nameSize, blurbSize, blurbFont) {
  const ink = p.ink ?? CREAM, mid = top + h / 2, ax = W - PAD, ay = p.tag ? top + h - PAD - 9 : mid - 7
  const max = W - COL - PAD - 34, greedy = wrap(p.blurb, blurbSize, blurbFont, max), lead = blurbSize * 1.3
  // Re-wrap a two-line blurb to even lengths so no word is left alone on the last line.
  const lines = greedy.length > 1 ? wrap(p.blurb, blurbSize, blurbFont, Math.min(max, (width(p.blurb, blurbSize, blurbFont) / greedy.length) * 1.15)) : greedy
  return svg(top + h, `${p.name}. ${p.blurb}`,
    `<rect y="${top}" width="${W}" height="${h}" rx="8" fill="${p.color}"/>` +
    text(p.name, PAD - 3, p.tag ? top + 112 : mid + nameSize * 0.27, nameSize, DISPLAY_I, ink) +
    lines.map((l, i) => text(l, COL, (p.tag ? top + 76 : mid + blurbSize * 0.3 - ((lines.length - 1) * lead) / 2) + i * lead, blurbSize, blurbFont, ink, { op: 0.92 })).join('') +
    (p.tag ? label(p.tag, PAD, top + h - PAD + 4, ink, { op: 0.85 }) : '') +
    `<path fill="none" stroke="${ink}" stroke-width="1.6" d="M${ax - 13} ${ay + 13}L${ax} ${ay}M${ax - 10} ${ay}H${ax}V${ay + 10}"/>`)
}

function footer(p, t) {
  const s = p.site.replace(/^https?:\/\//, ''), w = width(s.toUpperCase(), 13, MONO_M, 0.12)
  return svg(64, s, hairline(0, W, 16.5, t) + label(s, 0, 46, t.pageInk, { f: MONO_M }) +
    `<path fill="none" stroke="${t.pageInk}" stroke-width="1.4" d="M${r(w + 10)} 46L${r(w + 20)} 36M${r(w + 12)} 36H${r(w + 20)}V44"/>`)
}

export function render(profile, data, portrait) {
  const files = {}
  for (const [name, t] of Object.entries(THEMES)) {
    files[`header-${name}.svg`] = header(profile, data, t, portrait)
    files[`heatmap-${name}.svg`] = heatmap(data, t)
    files[`stats-${name}.svg`] = stats(data, t)
    files[`footer-${name}.svg`] = footer(profile, t)
  }
  files[`tile-${profile.lead.slug}.svg`] = tile(profile.lead, 200, 24, 96, 27, DISPLAY)
  for (const p of profile.projects) files[`tile-${p.slug}.svg`] = tile(p, 104, 10, 48, 21, TEXT)
  return files
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const read = (f) => readFileSync(f, 'utf8')
  const raw = JSON.parse(read(process.argv[2]))
  if (!raw.data?.user) throw new Error(`No user in ${process.argv[2]}: ${JSON.stringify(raw.errors ?? raw).slice(0, 300)}`)
  const portraitFile = `${root}portrait.svg`
  // portrait.svg is hand-made line art; only its inner markup is placed in the header.
  const portrait = existsSync(portraitFile) ? read(portraitFile).replace(/^[\s\S]*?<svg[^>]*>|<\/svg>\s*$/g, '') : null
  mkdirSync(`${root}assets`, { recursive: true })
  for (const [name, body] of Object.entries(render(JSON.parse(read(`${root}profile.json`)), shape(raw), portrait)))
    writeFileSync(`${root}assets/${name}`, body)
}
