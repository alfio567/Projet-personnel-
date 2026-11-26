// Génère le rapport de stage au format Word (.docx).
// Usage : node rapport-stage/generer-rapport.js
// Normes Epitech : marges 2 cm (haut), 3 cm (bas), 2,5 cm (gauche/droite),
// Calibri 12 pour le corps, 14 pour les titres, justifié, interligne 1,5.

const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType,
  BorderStyle, ShadingType, TabStopType, HeadingLevel, LevelFormat,
  Table, TableRow, TableCell, WidthType, Footer, PageNumber, VerticalAlign,
} = require("docx");
const CONTENU = require("./contenu");
// Numéros de page des titres, calculés par construire.sh à partir du rendu PDF
const PAGES_JSON = path.join(__dirname, "pages.json");
const PAGES = fs.existsSync(PAGES_JSON) ? JSON.parse(fs.readFileSync(PAGES_JSON, "utf8")) : {};

const DIR = __dirname;
const img = (f) => fs.readFileSync(path.join(DIR, "images", f));

// ---- Couleurs (tirées du logo ODHE) ----
const NAVY = "1C2F5A";
const GREEN = "8AAC2E";
const FONT = "Calibri";

// ---- Mise en page (1 cm = 567 DXA) ----
const cm = (v) => Math.round(v * 567);
const PAGE = {
  size: { width: 11906, height: 16838 }, // A4
  margin: { top: cm(2), bottom: cm(3), left: cm(2.5), right: cm(2.5) },
};

// ---- Infos du stage ----
const INFOS = {
  theme: "Développement de sites web au sein d'une agence de communication",
  stagiaire: "Toussaint ZANNOU",
  promotion: "Epitech – Promotion PSE 2030",
  tuteur: "Yannis AKAKPOVI, Développeur web full stack",
  poste: "Développeur web full stack (stagiaire)",
  service: "Développement de sites web",
  entreprise: "ODHE Groupe (anciennement Dasco Communication)",
  lieu: "Cotonou, Bénin",
  periode: "Du 6 juillet 2026 au 6 novembre 2026 (4 mois)",
  annee: "Année universitaire 2026 – 2027",
};

// ================== PAGE DE GARDE ==================
function pageDeGarde() {
  const ligneInfo = (label, valeur) =>
    new Paragraph({
      tabStops: [{ type: TabStopType.LEFT, position: cm(4.2) }],
      spacing: { after: 140 },
      indent: { left: cm(0.6) },
      children: [
        new TextRun({ text: "›  ", color: GREEN, bold: true, size: 24, font: FONT }),
        new TextRun({ text: label, color: NAVY, bold: true, size: 24, font: FONT }),
        new TextRun({ text: "\t: " + valeur, size: 24, font: FONT }),
      ],
    });

  return [
    // Logos : Epitech à gauche, ODHE à droite
    new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: 11906 - 2 * cm(2.5) }],
      children: [
        new ImageRun({ type: "png", data: img("logo-epitech.png"),
          transformation: { width: 170, height: Math.round(170 * 728 / 2832) } }),
        new TextRun({ text: "\t" }),
        new ImageRun({ type: "png", data: img("logo-odhe.png"),
          transformation: { width: 115, height: Math.round(115 * 467 / 732) } }),
      ],
    }),

    // Titre
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 2200, after: 200 },
      children: [new TextRun({ text: "RAPPORT DE STAGE", bold: true, size: 64, color: NAVY, font: FONT, characterSpacing: 40 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: GREEN, space: 1 } },
      indent: { left: cm(4), right: cm(4) },
      spacing: { after: 400 },
      children: [],
    }),

    // Thème
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 1600 },
      children: [
        new TextRun({ text: "Thème : ", bold: true, size: 28, color: NAVY, font: FONT }),
        new TextRun({ text: INFOS.theme, italics: true, size: 28, font: FONT }),
      ],
    }),

    // Bloc d'informations
    ligneInfo("Stagiaire", INFOS.stagiaire),
    ligneInfo("Promotion", INFOS.promotion),
    ligneInfo("Tuteur", INFOS.tuteur),
    ligneInfo("Poste occupé", INFOS.poste),
    ligneInfo("Service", INFOS.service),
    ligneInfo("Entreprise", INFOS.entreprise),
    ligneInfo("Lieu", INFOS.lieu),
    ligneInfo("Période", INFOS.periode),

    // Bandeau année universitaire
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 2400 },
      shading: { type: ShadingType.CLEAR, color: "auto", fill: NAVY },
      border: {
        top: { style: BorderStyle.SINGLE, size: 6, color: NAVY, space: 8 },
        bottom: { style: BorderStyle.SINGLE, size: 6, color: NAVY, space: 8 },
      },
      children: [new TextRun({ text: INFOS.annee, bold: true, size: 26, color: "FFFFFF", font: FONT })],
    }),
  ];
}


// ================== CORPS DU RAPPORT ==================
// Texte avec **gras** -> TextRun
function runs(text, extra = {}) {
  return text.split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((part) =>
    part.startsWith("**")
      ? new TextRun({ text: part.slice(2, -2), bold: true, ...extra })
      : new TextRun({ text: part, ...extra }));
}

// Légendes numérotées automatiquement : "Figure n : ..." / "Tableau n : ..."
const compteur = { Figure: 0, Tableau: 0 };
const legende = (text, type = "Figure") => new Paragraph({
  style: "Legende", alignment: AlignmentType.CENTER,
  children: [new TextRun(`${type} ${++compteur[type]} : ${text}`)],
});

const SANS_BORD = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const BORD = { style: BorderStyle.SINGLE, size: 4, color: "BFC6D6" };
const LARGEUR = 11906 - 2 * cm(2.5); // largeur du texte en DXA

function rendre(bloc) {
  switch (bloc.t) {
    case "h1": case "h1u": return [new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [new TextRun(bloc.text)] })];
    case "toc": {
      const entrees = CONTENU.filter((b) => ["h1", "h1u", "h2"].includes(b.t) && b.text !== "Sommaire");
      return entrees.map((b) => new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: LARGEUR, leader: "dot" }],
        indent: { left: b.t === "h2" ? 400 : 0 },
        spacing: { before: b.t === "h2" ? 0 : 160, after: 60, line: 300 },
        children: [
          new TextRun({ text: b.text, bold: b.t !== "h2", color: b.t !== "h2" ? NAVY : undefined, size: 24 }),
          new TextRun({ text: "\t" + (PAGES[b.text] || "0"), bold: b.t !== "h2", size: 24 }),
        ],
      }));
    }
    case "h2": return [new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(bloc.text)] })];
    case "h3": return [new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(bloc.text)] })];
    case "p": return [new Paragraph({ style: "Corps", keepNext: !!bloc.keepNext, children: runs(bloc.text) })];
    case "ul": return bloc.items.map((it) => new Paragraph({
      style: "Corps", numbering: { reference: "puces", level: 0 }, spacing: { after: 60 }, children: runs(it) }));
    case "todo": return [new Paragraph({ style: "Corps", children: [
      new TextRun({ text: "[" + bloc.text + "]", bold: true, highlight: "yellow" })] })];
    case "img": return [
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60 }, keepNext: true, children: [
        new ImageRun({ type: bloc.type || "jpg", data: img(bloc.file), transformation: { width: bloc.w, height: bloc.h } })] }),
      legende(bloc.caption)];
    case "pair": {
      const w = Math.floor(LARGEUR / 2);
      const cellule = (x) => new TableCell({
        width: { size: w, type: WidthType.DXA },
        borders: { top: SANS_BORD, bottom: SANS_BORD, left: SANS_BORD, right: SANS_BORD },
        margins: { left: 60, right: 60 },
        children: [
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60 }, children: [
            new ImageRun({ type: "jpg", data: img(x.file), transformation: { width: 290, height: x.h || 181 } })] }),
          legende(x.caption)],
      });
      return [new Table({ width: { size: 2 * w, type: WidthType.DXA }, columnWidths: [w, w],
        rows: [new TableRow({ cantSplit: true, children: [cellule(bloc.a), cellule(bloc.b)] })] }),
        new Paragraph({ spacing: { after: 0 }, children: [] })];
    }
    case "table": {
      const cell = (text, i, entete) => new TableCell({
        width: { size: bloc.widths[i], type: WidthType.DXA },
        borders: { top: BORD, bottom: BORD, left: BORD, right: BORD },
        shading: entete ? { type: ShadingType.CLEAR, color: "auto", fill: NAVY }
                        : (i === 0 ? { type: ShadingType.CLEAR, color: "auto", fill: "EEF5DF" } : undefined),
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ keepNext: true, keepLines: true, spacing: { after: 0, line: 276 }, children:
          runs(text, entete ? { bold: true, color: "FFFFFF" } : (i === 0 ? { bold: true, color: NAVY } : {})) })],
      });
      return [
        new Table({ width: { size: bloc.widths.reduce((a, b) => a + b), type: WidthType.DXA }, columnWidths: bloc.widths,
          rows: [new TableRow({ tableHeader: true, children: bloc.headers.map((h, i) => cell(h, i, true)) }),
                 ...bloc.rows.map((r) => new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, i, false)) }))] }),
        legende(bloc.caption, "Tableau")];
    }
    default: throw new Error("Bloc inconnu : " + bloc.t);
  }
}

const piedDePage = new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
  new TextRun({ children: [PageNumber.CURRENT], size: 20, color: NAVY, font: FONT })] })] });

// ================== DOCUMENT ==================
const doc = new Document({
  creator: INFOS.stagiaire,
  title: "Rapport de stage – " + INFOS.stagiaire,
  styles: {
    default: { document: { run: { font: FONT, size: 24 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT, size: 28, bold: true, color: NAVY, allCaps: true },
        paragraph: { spacing: { before: 0, after: 240 }, keepNext: true, outlineLevel: 0,
          border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GREEN, space: 4 } } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT, size: 28, bold: true, color: NAVY },
        paragraph: { spacing: { before: 280, after: 120 }, keepNext: true, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT, size: 24, bold: true, color: GREEN },
        paragraph: { spacing: { before: 160, after: 80 }, keepNext: true, outlineLevel: 2 } },
      { id: "Corps", name: "Corps", basedOn: "Normal", quickFormat: true,
        run: { font: FONT, size: 24 },
        paragraph: { alignment: AlignmentType.JUSTIFIED, spacing: { line: 360, after: 120 } } },
      { id: "Legende", name: "Légende", basedOn: "Normal", quickFormat: true,
        run: { font: FONT, size: 20, italics: true, color: "555555" },
        paragraph: { spacing: { before: 40, after: 200 } } },
    ],
  },
  numbering: { config: [{ reference: "puces", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•",
    alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 567, hanging: 283 } } } }] }] },
  sections: [
    { properties: { page: PAGE }, children: pageDeGarde() },
    { properties: { page: PAGE }, footers: { default: piedDePage },
      children: CONTENU.flatMap(rendre) },
  ],
});

const out = path.join(DIR, "Rapport_de_stage_Toussaint_ZANNOU.docx");
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(out, buf);
  console.log("Écrit :", out);
});
