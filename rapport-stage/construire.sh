#!/bin/bash
# Construit le rapport en deux passes : la première calcule les numéros de page
# des titres (pour le sommaire), la seconde les écrit.
# Usage : bash rapport-stage/construire.sh
set -e
cd "$(dirname "$0")"
OUT=Rapport_de_stage_Toussaint_ZANNOU
TMP=$(mktemp -d)
for passe in 1 2; do
  node generer-rapport.js
  zip -d $OUT.docx '*/' >/dev/null 2>&1 || true
  soffice --headless --convert-to pdf --outdir "$TMP" $OUT.docx >/dev/null 2>&1
  node -e '
    const fs = require("fs");
    const titres = require("./contenu").filter(b => ["h1","h1u","h2"].includes(b.t)).map(b => b.text);
    const { execSync } = require("child_process");
    const n = +execSync(`pdfinfo "${process.argv[1]}"`).toString().match(/Pages:\s+(\d+)/)[1];
    const norm = t => t.toUpperCase().replace(/\s+/g, " ").trim();
    // Un titre est repéré quand une ligne entière de la page lui correspond.
    const lignes = [];
    for (let p = 1; p <= n; p++)
      lignes[p] = execSync(`pdftotext -f ${p} -l ${p} "${process.argv[1]}" -`).toString().split("\n").map(norm);
    const pages = {};
    const sommaire = lignes.findIndex((l, p) => p > 0 && l && l.includes("SOMMAIRE"));
    for (const t of titres) {
      for (let p = 2; p <= n; p++) {
        if (p === sommaire && t !== "Sommaire") continue;
        if (lignes[p].includes(norm(t))) { pages[t] = p; break; }
      }
    }
    fs.writeFileSync("pages.json", JSON.stringify(pages, null, 2));
    console.log("Passe terminée,", n, "pages");
  ' "$TMP/$OUT.pdf"
done
cp "$TMP/$OUT.pdf" "$OUT.pdf"
rm -rf "${TMP:?}"
