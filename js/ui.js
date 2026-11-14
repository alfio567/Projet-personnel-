/* =========================================================
   CBZ Gestion — outils d'interface : format, modales,
   graphiques, impression, filtres de période
   ========================================================= */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function argent(n) {
    var v = Math.round(Number(n || 0));
    // espaces insécables : un montant ne se coupe jamais sur deux lignes
    var s = v.toLocaleString('fr-FR').replace(/[\s\u202f\u00a0]/g, '\u00a0');
    return s + '\u00a0' + (Store.data.parametres.devise || 'F');
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  // date ISO -> "14/11/2026 à 15:06"
  function dateHeure(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear() +
      ' à ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function dateCourte(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear();
  }
  // valeur pour <input type="datetime-local">
  function pourInput(iso) {
    var d = iso ? new Date(iso) : new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
      'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function depuisInput(v) {
    return v ? new Date(v).toISOString() : new Date().toISOString();
  }
  function moisDe(iso) {
    var d = new Date(iso);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1);
  }
  var NOMS_MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet',
    'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  function nomMois(m) {
    var p = m.split('-');
    return NOMS_MOIS[Number(p[1]) - 1] + ' ' + p[0];
  }
  function moisCourant() { return moisDe(new Date().toISOString()); }

  /* ---------- Filtre de période ----------
     valeurs : 'encours' (non archivé), 'tout', 'AAAA-MM', 'arch:<id>' */
  function optionsPeriode(elements, valeur, avecEncours, module) {
    var mois = {};
    elements.forEach(function (e) { mois[moisDe(e.date)] = true; });
    mois[moisCourant()] = true;
    var liste = Object.keys(mois).sort().reverse();
    var h = '';
    if (avecEncours) h += '<option value="encours">Période en cours (non archivée)</option>';
    h += '<option value="tout">Toute la période</option>';
    h += '<optgroup label="Par mois">';
    liste.forEach(function (m) {
      h += '<option value="' + m + '">' + nomMois(m) + '</option>';
    });
    h += '</optgroup>';
    if (module) {
      var arch = Store.data.archives.filter(function (a) { return a.module === module; });
      if (arch.length) {
        h += '<optgroup label="Bilans archivés">';
        arch.slice().reverse().forEach(function (a) {
          h += '<option value="arch:' + a.id + '">' + esc(a.titre) + '</option>';
        });
        h += '</optgroup>';
      }
    }
    return h.replace('value="' + valeur + '"', 'value="' + valeur + '" selected');
  }
  function filtrerPeriode(elements, periode) {
    if (periode === 'tout') return elements.slice();
    if (periode === 'encours') return elements.filter(function (e) { return !e.archive; });
    if (periode.indexOf('arch:') === 0) {
      var aid = periode.slice(5);
      return elements.filter(function (e) { return e.archive === aid; });
    }
    return elements.filter(function (e) { return moisDe(e.date) === periode; });
  }
  function libellePeriode(periode) {
    if (periode === 'tout') return 'Toute la période';
    if (periode === 'encours') return 'Période en cours';
    if (periode.indexOf('arch:') === 0) {
      var a = Store.data.archives.find(function (x) { return x.id === periode.slice(5); });
      return a ? a.titre : 'Archive';
    }
    return nomMois(periode);
  }

  /* ---------- Modale ---------- */
  var modale = null;
  function ouvrirModale(titre, contenuHtml, opts) {
    fermerModale();
    opts = opts || {};
    modale = document.createElement('div');
    modale.className = 'modale-fond';
    modale.innerHTML =
      '<div class="modale ' + (opts.large ? 'large' : '') + '" role="dialog" aria-modal="true">' +
      '<div class="modale-tete"><h2>' + esc(titre) + '</h2>' +
      '<button class="btn-icone" data-fermer title="Fermer">✕</button></div>' +
      '<div class="modale-corps">' + contenuHtml + '</div></div>';
    document.body.appendChild(modale);
    modale.addEventListener('click', function (e) {
      if (e.target === modale || e.target.closest('[data-fermer]')) fermerModale();
    });
    var premier = modale.querySelector('input:not([type=checkbox]), select, textarea');
    if (premier) premier.focus();
    return modale.querySelector('.modale-corps');
  }
  function fermerModale() {
    if (modale) { modale.remove(); modale = null; }
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') fermerModale();
  });

  /* ---------- Notification ---------- */
  function toast(msg, type) {
    document.querySelectorAll('.toast').forEach(function (x) { x.remove(); });
    var t = document.createElement('div');
    t.className = 'toast ' + (type || 'ok');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add('visible'); }, 10);
    setTimeout(function () { t.classList.remove('visible'); setTimeout(function () { t.remove(); }, 300); }, 2600);
  }

  /* ---------- Graphique en barres horizontales ----------
     items : [{label, valeur, classe?, info?}] — une seule série */
  function barres(items, opts) {
    opts = opts || {};
    if (!items.length) return '<p class="vide">Aucune donnée pour cette période.</p>';
    var max = Math.max.apply(null, items.map(function (i) { return Math.abs(i.valeur); })) || 1;
    var fmt = opts.format || argent;
    return '<div class="barres">' + items.map(function (i) {
      var w = Math.max(0.5, Math.abs(i.valeur) / max * 100);
      var tip = i.label + ' : ' + fmt(i.valeur) + (i.info ? ' — ' + i.info : '');
      return '<div class="barre-ligne" title="' + esc(tip) + '">' +
        '<span class="barre-label">' + esc(i.label) + '</span>' +
        '<span class="barre-piste"><span class="barre ' + (i.classe || '') + '" style="width:' + w + '%"></span></span>' +
        '<span class="barre-valeur">' + esc(fmt(i.valeur)) + '</span></div>';
    }).join('') + '</div>';
  }

  // Colonnes verticales (évolution par mois)
  function colonnes(items, opts) {
    opts = opts || {};
    if (!items.length) return '<p class="vide">Aucune donnée.</p>';
    var max = Math.max.apply(null, items.map(function (i) { return i.valeur; })) || 1;
    var fmt = opts.format || argent;
    return '<div class="colonnes">' + items.map(function (i) {
      var h = Math.max(1, i.valeur / max * 100);
      return '<div class="colonne" title="' + esc(i.label + ' : ' + fmt(i.valeur)) + '">' +
        '<span class="colonne-valeur">' + esc(fmt(i.valeur)) + '</span>' +
        '<span class="colonne-piste"><span class="colonne-barre" style="height:' + h + '%"></span></span>' +
        '<span class="colonne-label">' + esc(i.label) + '</span></div>';
    }).join('') + '</div>';
  }

  function tuile(label, valeur, classe, sous) {
    return '<div class="tuile ' + (classe || '') + '"><span class="tuile-label">' + esc(label) +
      '</span><span class="tuile-valeur">' + esc(valeur) + '</span>' +
      (sous ? '<span class="tuile-sous">' + esc(sous) + '</span>' : '') + '</div>';
  }

  /* ---------- Impression ---------- */
  function entete() {
    var p = Store.data.parametres;
    return '<div class="imp-entete"><div><div class="imp-nom">' + esc(p.entreprise) + '</div>' +
      (p.slogan ? '<div>' + esc(p.slogan) + '</div>' : '') +
      (p.adresse ? '<div>' + esc(p.adresse) + '</div>' : '') +
      (p.telephone ? '<div>Tél : ' + esc(p.telephone) + '</div>' : '') +
      '</div><div class="imp-date">Imprimé le ' + dateHeure(new Date().toISOString()) + '</div></div>';
  }
  function imprimer(html) {
    var zone = document.getElementById('zone-impression');
    zone.innerHTML = html;
    document.body.classList.add('impression');
    setTimeout(function () {
      window.print();
      document.body.classList.remove('impression');
    }, 50);
  }

  function confirmer(msg) { return window.confirm(msg); }

  // lit les champs d'un formulaire : {name: valeur}
  function lireForm(form) {
    var o = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name) return;
      if (el.type === 'checkbox') o[el.name] = el.checked;
      else if (el.type === 'radio') { if (el.checked) o[el.name] = el.value; }
      else o[el.name] = el.value.trim();
    });
    return o;
  }

  function normaliser(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  window.UI = {
    esc: esc, argent: argent, dateHeure: dateHeure, dateCourte: dateCourte,
    pourInput: pourInput, depuisInput: depuisInput, moisDe: moisDe, nomMois: nomMois,
    moisCourant: moisCourant, optionsPeriode: optionsPeriode, filtrerPeriode: filtrerPeriode,
    libellePeriode: libellePeriode, ouvrirModale: ouvrirModale, fermerModale: fermerModale,
    toast: toast, barres: barres, colonnes: colonnes, tuile: tuile, entete: entete,
    imprimer: imprimer, confirmer: confirmer, lireForm: lireForm, normaliser: normaliser
  };
})();
