// Gobble Dash — the entrypoint (Node 22, standard library only).
//
// The game is plain static files in game/ beside this file: index.html and
// its ES modules, no library, no build step, no network request. This
// program hands the entry in: it copies game/ and screenshots/ into the
// output directory and writes dossier.json there with buildDossier from the
// vendored make.fun library, so the judge can read the game.
//
// Run it locally (outside the grader) with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Inside the grader MAKEFUN_OUTPUT_DIR is unset and /output is used.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fail fast with a clear message when the entry is incomplete, instead of
// writing a half-empty output directory the gate would refuse.
for (const needed of [join(here, 'game'), join(here, 'game', 'index.html')]) {
  if (!existsSync(needed)) {
    throw new Error(`Gobble Dash entry is incomplete: missing ${needed}`);
  }
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The caps mirror the gate's own limits (see the kit's RULES.txt): game/
// stays within 993 files and 48 MiB, screenshots within 4 files of 256 KiB
// each, and the dossier text within 160 KiB.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
