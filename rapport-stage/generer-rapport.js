// Génère le rapport de stage au format Word (.docx).
// Usage : node rapport-stage/generer-rapport.js
// Normes Epitech : marges 2 cm (haut), 3 cm (bas), 2,5 cm (gauche/droite),
// Calibri 12 pour le corps, 14 pour les titres, justifié, interligne 1,5.

const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType,
  BorderStyle, ShadingType, TabStopType,
} = require("docx");

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

// ================== DOCUMENT ==================
const doc = new Document({
  creator: INFOS.stagiaire,
  title: "Rapport de stage – " + INFOS.stagiaire,
  styles: {
    default: { document: { run: { font: FONT, size: 24 } } },
  },
  sections: [
    { properties: { page: PAGE }, children: pageDeGarde() },
    // Les autres parties (résumé, remerciements, sommaire, ...) seront ajoutées ici.
  ],
});

const out = path.join(DIR, "Rapport_de_stage_Toussaint_ZANNOU.docx");
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(out, buf);
  console.log("Écrit :", out);
});
