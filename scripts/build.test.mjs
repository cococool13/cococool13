import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { shape, render } from './build.mjs'

// 53 weeks ending Tue 2026-11-10, one contribution on every day except a 9 on Oct 19.
const start = Date.UTC(2025, 10, 9)
const weeks = Array.from({ length: 53 }, (_, w) => ({
  contributionDays: Array.from({ length: w === 52 ? 3 : 7 }, (_, i) => {
    const date = new Date(start + (w * 7 + i) * 864e5).toISOString().slice(0, 10)
    const busy = date === '2026-10-19'
    return { date, weekday: i, contributionCount: busy ? 9 : 1, contributionLevel: busy ? 'FOURTH_QUARTILE' : 'FIRST_QUARTILE' }
  }),
}))
const raw = { data: { user: {
  contributionsCollection: { contributionCalendar: { totalContributions: 375, weeks } },
  repositories: { nodes: [
    { languages: { edges: [{ size: 300, node: { name: 'Swift' } }, { size: 100, node: { name: 'Rust' } }] } },
    { languages: { edges: [{ size: 100, node: { name: 'Rust' } }] } },
  ] },
} } }

test('shapes GitHub data into the numbers the page prints', () => {
  const d = shape(raw)
  assert.equal(d.today, '2026-11-10')
  assert.equal(d.weekday, 2)
  assert.equal(d.issue, 314)
  assert.equal(d.busiest.date, '2026-10-19')
  assert.equal(d.months.length, 12)
  assert.deepEqual(d.months.at(-1), { name: 'Nov', n: 10 })
  assert.deepEqual(d.languages, [{ name: 'Swift', share: 0.6 }, { name: 'Rust', share: 0.4 }])
})

test('draws one cell per day in both themes', () => {
  const profile = JSON.parse(readFileSync(new URL('../profile.json', import.meta.url), 'utf8'))
  const files = render(profile, shape(raw), null)
  for (const theme of ['light', 'dark']) {
    const cells = files[`heatmap-${theme}.svg`].match(/<rect [^>]*rx="2.5"/g)
    assert.equal(cells.length, 52 * 7 + 3)
  }
  for (const body of Object.values(files)) assert.ok(!/NaN|undefined/.test(body))
})
