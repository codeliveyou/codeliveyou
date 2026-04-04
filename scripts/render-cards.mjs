/**
 * Renders GitHub stats SVGs using anuraghazra/github-readme-stats (same logic as the Vercel API,
 * but runs in CI with PAT_1 so it does not depend on the public deployment).
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import statsApi from "github-readme-stats/api/index.js";
import topLangsApi from "github-readme-stats/api/top-langs.js";

const username =
  process.env.GITHUB_REPOSITORY_OWNER ||
  process.env.USERNAME ||
  "chronometric";
const workspace = process.env.WORKSPACE || process.cwd();

async function renderCard(handler, query, filename) {
  let svg = "";
  const res = {
    setHeader: () => {},
    send: (value) => {
      svg = value;
      return value;
    },
  };
  await handler({ query }, res);
  if (!svg) {
    throw new Error(`Card renderer returned empty output for ${filename}.`);
  }
  const out = path.join(workspace, "profile", filename);
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, svg, "utf8");
  console.log(`Wrote ${out}`);
}

await renderCard(
  statsApi,
  {
    username,
    show_icons: "true",
    theme: "tokyonight",
    hide_border: "true",
    rank_icon: "github",
  },
  "stats.svg",
);

await renderCard(
  topLangsApi,
  {
    username,
    layout: "compact",
    theme: "tokyonight",
    hide_border: "true",
    langs_count: "8",
    hide: "jupyter notebook",
    size_weight: "0.5",
    count_weight: "0.5",
  },
  "top-langs.svg",
);
