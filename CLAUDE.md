# Learning Hub: instructions for Claude

A static site (GitHub Pages) that holds one learning topic per week as 7 short interactive modules, an archive of past weeks, and a weekly check-in. The user is neurodivergent (ADHD): short stops, tappable visuals, hooks tying theory to practice, short dense videos, no walls of text. See `profile.js`.

## Weekly loop

1. The user opens a chat and says the topic for next week (or sends a check-in, see below).
2. Read the latest check-in issues: `gh issue list --label checkin --state open --json number,title,body` (or the GitHub MCP tool). The body ends with a `<!-- hub-checkin {...} -->` JSON comment. Close issues you have processed.
3. Update `profile.js`: adjust `works` / `avoid` from the feedback (stops that helped or did not, focus, length, best formats). Set `next` to `{topic, status}`.
4. Research the topic (current sources, web search). Never invent video URLs: use a real page you found, or `kind: "search"` with a query.
5. Write `weeks/wNN.js` (next number, two digits) following the schema below. Add it to `weeks/manifest.js`. Bump `HUB.v` in `config.js`.
6. Test locally (`python3 -m http.server`, open on a 390px-wide viewport), then commit to `main`. GitHub Pages deploys from `main` root.
7. The newest week is "This week"; all earlier weeks appear in the Archive automatically. Do not delete old weeks.

## Week schema (`weeks/wNN.js`)

```js
window.WEEKS = window.WEEKS || [];
window.WEEKS.push({
  id: "w02", n: 2, lang: "en",          // lang: "en" or "it" (module UI strings; hub chrome is always English)
  topic: "…", start: "YYYY-MM-DD",     // start = the Monday
  summary: "One sentence.",
  days: [ /* exactly 7 */ {
    n: 1, title: "…", sub: "…",
    keywords: ["…"],                   // 5-6 short words: they become the mind map
    nodes: [ /* 5-7 stops, about 18-20 min total */ ],
    extra: [ { kind: "video"|"read", t: "…", src: "…", url: "https://…" },
             { kind: "search", t: "…", q: "youtube search query" } ]
  } ]
});
```

Each node has `type`, `title`, `min` (minutes). Types:

| type | fields |
|---|---|
| `hook` | `text`, `practice` |
| `cards` | `items: [{t, d, use?, svg?}]`, `note?` (tap to reveal) |
| `sort` | `intro`, `buckets: [..]`, `items: [{t, b}]` (b = bucket index), `hints?: {item: text}` |
| `order` | `intro`, `items: [{t, lvl}]` in the correct order, `doneMsg?`, `wrongMsg?` |
| `quiz` | `qs: [{q, o: [..], a, why}]`, or with `retry: true`: `o: [{t, ok?, why}]` |
| `compare` | `a: {name, icon}`, `b: {name, icon}`, `rows: [{k, a, b}]`, `note?` (icon: leaf, paw, random, parallel) |
| `ranges` | `intro`, `min0`, `max0`, `step?`, `unit`, `edge`, `items: [{t, from, to, d}]` |
| `slider` | `intro`, `visual: "thread"\|"bar"`, `lo`, `hi`, `levels: [{n?, t, alias?, d, facts?: [{k, v}]}]` |
| `hotspots` | `intro`, `parts: [{id, t, show, d, wide?}]` (tap parts of a labelled object) |
| `map` | none: built from the day's `keywords` |
| `finalmap` | none: last stop of day 7 |

Day 2 onward starts with an automatic recap of the previous day's quiz; day 1 recaps last week's day 7 quiz. Keep one non-retry `quiz` per day for that.

Rules: 5-7 stops per day, each with something to tap; every day opens with a hook linking theory to a practical use; accurate facts from sources you checked; paraphrase, do not copy text; no real-person photos; no copyrighted characters.

## Feedback path

The page cannot write to Claude. Feedback is stored in the browser; the weekly check-in opens a prefilled GitHub issue (label `checkin`) in this repo. Read it as in step 2.

## Files

`index.html`, `style.css`, `app.js` (renderers, router), `config.js` (repo name, cache version), `profile.js` (profile and next week), `weeks/` (content).
