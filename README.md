# The Circulatory System of the Rupee

An animated circular Sankey diagram of how money moves through the Indian
economy — RBI, government, banks, capital markets, households, businesses,
the foreign sector and the informal economy — with particles flowing along
each link like blood cells through vessels.

Built as a single self-contained static site (no server, no build step
required to run) using D3 v7 and `d3-sankey-circular` (which, unlike plain
d3-sankey, can lay out genuine feedback loops — money going back and forth
between households and banks, government and markets, and so on — instead
of forcing everything into one direction).

## Run it locally

Just open `index.html` in a browser — double-click it, or:

```bash
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows
```

Everything (D3, the sankey layout engine, and the app code) is pre-bundled
into `bundle.js`, so it works offline. Only the two Google Fonts (Fraunces,
IBM Plex Sans) need internet — the page falls back to system fonts without it.

If you'd rather serve it (avoids any browser file:// quirks):

```bash
npx serve .
# or
python3 -m http.server 8000
```

## Deploy to GitHub Pages

1. Push this folder to a GitHub repo (root, or a `/docs` folder — either works).
2. In the repo: **Settings → Pages → Source**, pick the branch (and `/docs`
   folder if you used one), save.
3. Your site will be live at `https://<username>.github.io/<repo>/` within
   a minute or two.

No build step runs on GitHub Pages — it just serves `index.html`,
`styles.css` and `bundle.js` as static files.

## Editing the data

The whole dataset — nodes, flows, values, labels, colors — lives in one
place: `src/data.js`. Edit it, then rebuild the bundle:

```bash
npm install
npm run build       # or: npm run watch (rebuilds on save)
```

## About the figures

Values are in ₹ lakh crore per year (1 lakh crore = ₹1 trillion ≈ $120bn),
and are an **illustrative, order-of-magnitude model**, grounded in
approximate FY2024–25 public data (RBI Annual Report & Monetary Policy
Report, Union Budget documents, CSO National Accounts, Ministry of Commerce
trade statistics, World Bank remittance estimates) — recalled from training
data, not freshly looked up or independently verified for this build. It's
meant to convey scale and direction, not serve as an audited national
accounts reconciliation. If you want it more precise or more current,
two easy next steps:

- Ask an AI assistant with live web search to refresh the numbers in
  `src/data.js` against the latest RBI/Budget/CSO releases.
- Swap in your own sourced figures — the code doesn't care where the
  numbers came from, only that `links` values are internally consistent
  enough to compare.

## Structure

```
index.html          entry point
styles.css           visual design
bundle.js            pre-built bundle (D3 + d3-sankey-circular + app) — ships as-is
src/
  data.js            nodes, links, values, colors — the only file you'll usually edit
  app.js             layout computation, rendering, particle animation, interactivity
package.json         esbuild scripts to rebuild bundle.js after editing src/
```
