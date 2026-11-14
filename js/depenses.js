/* =========================================================
   CBZ Gestion — 2. Dépense entreprise  &  3. Dépense maison
   ========================================================= */
(function () {
  'use strict';
  var S = Store, U = UI, esc = UI.esc, argent = UI.argent;

  var etat = {
    periodeListe: {},            // par page
    periodeBilanEnt: 'encours',
    periodeBilanMaison: 'encours'
  };

  var TYPES = { consommable: 'Dépense consommable', autre: 'Autre dépense' };

  function somme(l) { return l.reduce(function (s, e) { return s + Number(e.montant || 0); }, 0); }
  function parDateDesc(a, b) { return a.date < b.date ? 1 : -1; }

  /* ---------- Formulaire (ajout / modification) ---------- */
  function champsForm(maison, e) {
    e = e || {};
    var h = '';
    if (maison) {
      h += '<label>Nom *<input name="nom" required value="' + esc(e.nom || '') + '"></label>' +
        '<label>Prénom *<input name="prenom" required value="' + esc(e.prenom || '') + '"></label>';
    }
    h += '<label>' + (maison ? 'Dépense effectuée *' : 'Libellé de la dépense *') +
      '<input name="libelle" required value="' + esc(e.libelle || '') + '" placeholder="' + (maison ? 'ex : marché, électricité…' : 'ex : papier A4, encre, reliure…') + '"></label>' +
      '<label>Montant (' + esc(S.data.parametres.devise) + ') *<input name="montant" type="number" min="0" step="any" required value="' + esc(e.montant || '') + '"></label>';
    if (maison) h += '<label>But de la dépense<input name="but" value="' + esc(e.but || '') + '" placeholder="ex : nourriture, santé, école…"></label>';
    h += '<label>Date et heure<input name="date" type="datetime-local" value="' + U.pourInput(e.date) + '"></label>';
    if (!maison) h += '<label>Note (optionnel)<input name="note" value="' + esc(e.note || '') + '"></label>';
    return h;
  }

  function appliquer(e, v, maison) {
    if (maison) { e.nom = v.nom; e.prenom = v.prenom; e.but = v.but; } else { e.note = v.note; }
    e.libelle = v.libelle; e.montant = Number(v.montant) || 0; e.date = U.depuisInput(v.date);
  }

  /* ---------- Page liste (consommable / autre / maison) ---------- */
  function pageListe(el, cfg) {
    var maison = cfg.collection === 'depensesMaison';
    var toutes = S.data[cfg.collection].filter(function (e) { return maison || e.type === cfg.type; });
    var cle = cfg.collection + (cfg.type || '');
    var periode = etat.periodeListe[cle] || U.moisCourant();
    var liste = U.filtrerPeriode(toutes, periode).sort(parDateDesc);

    var h = '<div class="page-tete"><div><h1>' + esc(cfg.titre) + '</h1><p class="sous">' + esc(cfg.aide) + '</p></div></div>';
    h += '<section class="carte"><h2>Ajouter une dépense</h2><form class="formulaire grille-auto" id="form-dep">' + champsForm(maison) +
      '<div class="form-action"><button class="btn principal" type="submit">+ Enregistrer</button></div></form>' +
      '<p class="aide">La date et l\'heure actuelles sont remplies automatiquement ; modifiez-les si besoin.</p></section>';

    h += '<section class="carte"><div class="carte-tete"><h2>Dépenses — ' + esc(U.libellePeriode(periode)) + '</h2><div class="filtres">' +
      '<select id="periode-liste">' + U.optionsPeriode(toutes, periode, true) + '</select>' +
      '<button class="btn" id="imp-liste">🖨 Imprimer</button></div></div>';
    h += '<div class="total-ligne">Total : <strong>' + argent(somme(liste)) + '</strong> (' + liste.length + ' dépense(s))</div>';
    if (!liste.length) h += '<p class="vide">Aucune dépense pour cette période.</p>';
    else h += tableau(liste, maison, true);
    h += '</section>';
    el.innerHTML = h;

    el.querySelector('#form-dep').onsubmit = function (ev) {
      ev.preventDefault();
      var v = U.lireForm(this);
      var e = { id: S.id() };
      if (!maison) e.type = cfg.type;
      appliquer(e, v, maison);
      S.data[cfg.collection].push(e);
      S.enregistrer();
      U.toast('Dépense enregistrée : ' + argent(e.montant));
      App.rendre();
      var p = document.querySelector('#form-dep input');
      if (p) p.focus();
    };
    el.querySelector('#periode-liste').onchange = function () { etat.periodeListe[cle] = this.value; App.rendre(); };
    el.querySelector('#imp-liste').onclick = function () {
      U.imprimer('<div class="rapport">' + U.entete() + '<h2 class="imp-titre">' + esc(cfg.titre.toUpperCase()) + ' — ' + esc(U.libellePeriode(periode)) + '</h2>' +
        tableauImpression(liste, maison) + '</div>');
    };
    lierActions(el, cfg.collection, maison);
  }

  function tableau(liste, maison, actions) {
    return '<div class="defile"><table class="tableau"><thead><tr><th>Date et heure</th>' +
      (maison ? '<th>Nom et prénom</th><th>Dépense</th><th>But</th>' : '<th>Type</th><th>Libellé</th><th>Note</th>') +
      '<th class="num">Montant</th>' + (actions ? '<th></th>' : '') + '</tr></thead><tbody>' +
      liste.map(function (e) {
        return '<tr><td>' + U.dateHeure(e.date) + '</td>' +
          (maison ? '<td>' + esc(e.nom + ' ' + e.prenom) + '</td><td>' + esc(e.libelle) + '</td><td>' + esc(e.but || '') + '</td>'
            : '<td>' + esc(TYPES[e.type] || '') + '</td><td>' + esc(e.libelle) + '</td><td>' + esc(e.note || '') + '</td>') +
          '<td class="num">' + argent(e.montant) + (e.archive ? ' <span class="badge gris">archivé</span>' : '') + '</td>' +
          (actions ? '<td class="actions"><button class="btn petit" data-modif-dep="' + e.id + '">Modifier</button>' +
            '<button class="btn-icone" data-suppr-dep="' + e.id + '" title="Supprimer">🗑</button></td>' : '') + '</tr>';
      }).join('') + '</tbody></table></div>';
  }

  function tableauImpression(liste, maison) {
    return '<table class="imp-table"><thead><tr><th>Date et heure</th>' +
      (maison ? '<th>Nom et prénom</th><th>Dépense</th><th>But</th>' : '<th>Type</th><th>Libellé</th><th>Note</th>') +
      '<th class="num">Montant</th></tr></thead><tbody>' +
      liste.map(function (e) {
        return '<tr><td>' + U.dateHeure(e.date) + '</td>' +
          (maison ? '<td>' + esc(e.nom + ' ' + e.prenom) + '</td><td>' + esc(e.libelle) + '</td><td>' + esc(e.but || '') + '</td>'
            : '<td>' + esc(TYPES[e.type] || '') + '</td><td>' + esc(e.libelle) + '</td><td>' + esc(e.note || '') + '</td>') +
          '<td class="num">' + argent(e.montant) + '</td></tr>';
      }).join('') + '</tbody><tfoot><tr class="fort"><td colspan="4">TOTAL</td><td class="num">' + argent(somme(liste)) + '</td></tr></tfoot></table>';
  }

  function lierActions(el, collection, maison) {
    el.querySelectorAll('[data-modif-dep]').forEach(function (b) {
      b.onclick = function () {
        var e = S.data[collection].find(function (x) { return x.id === b.getAttribute('data-modif-dep'); });
        var corps = U.ouvrirModale('Modifier la dépense', '<form class="formulaire grille2">' + champsForm(maison, e) +
          (!maison ? '<label>Type<select name="type"><option value="consommable"' + (e.type === 'consommable' ? ' selected' : '') + '>Consommable</option><option value="autre"' + (e.type === 'autre' ? ' selected' : '') + '>Autre dépense</option></select></label>' : '') +
          '<div class="modale-pied plein"><span></span><button class="btn principal" type="submit">Enregistrer</button></div></form>');
        corps.querySelector('form').onsubmit = function (ev) {
          ev.preventDefault();
          var v = U.lireForm(this);
          appliquer(e, v, maison);
          if (!maison) e.type = v.type;
          S.enregistrer(); U.fermerModale(); U.toast('Dépense modifiée.'); App.rendre();
        };
      };
    });
    el.querySelectorAll('[data-suppr-dep]').forEach(function (b) {
      b.onclick = function () {
        var e = S.data[collection].find(function (x) { return x.id === b.getAttribute('data-suppr-dep'); });
        if (!U.confirmer('Supprimer la dépense « ' + e.libelle + ' » de ' + argent(e.montant) + ' ?')) return;
        S.data[collection] = S.data[collection].filter(function (x) { return x.id !== e.id; });
        S.enregistrer(); U.toast('Dépense supprimée.'); App.rendre();
      };
    });
  }

  // regroupe par mois -> colonnes (ordre chronologique)
  function parMois(liste) {
    var m = {};
    liste.forEach(function (e) { var k = U.moisDe(e.date); m[k] = (m[k] || 0) + Number(e.montant); });
    return Object.keys(m).sort().slice(-12).map(function (k) {
      var p = k.split('-');
      return { label: U.nomMois(k).slice(0, 4) + ' ' + p[0].slice(2), valeur: m[k] };
    });
  }
  function grouper(liste, fn) {
    var m = {};
    liste.forEach(function (e) { var k = fn(e) || '(non précisé)'; m[k] = (m[k] || 0) + Number(e.montant); });
    return Object.keys(m).map(function (k) { return { label: k, valeur: m[k] }; })
      .sort(function (a, b) { return b.valeur - a.valeur; }).slice(0, 10);
  }

  /* ---------- Bilan dépenses entreprise ---------- */
  function pageBilanEntreprise(el) {
    var toutes = S.data.depensesEntreprise;
    var periode = etat.periodeBilanEnt;
    var liste = U.filtrerPeriode(toutes, periode).sort(parDateDesc);
    var cons = liste.filter(function (e) { return e.type === 'consommable'; });
    var autres = liste.filter(function (e) { return e.type === 'autre'; });
    var total = somme(liste);

    var h = '<div class="page-tete"><div><h1>Bilan des dépenses entreprise</h1><p class="sous">' + esc(U.libellePeriode(periode)) + '</p></div>' +
      '<div class="filtres"><select id="periode-bilan">' + U.optionsPeriode(toutes, periode, true, 'depEnt') + '</select>' +
      '<button class="btn" id="imp-bilan">🖨 Imprimer</button>' +
      (periode === 'encours' ? '<button class="btn principal" id="archiver">📦 Faire le point et archiver</button>' : '') + '</div></div>';
    h += '<div class="tuiles">' + U.tuile('Dépenses consommables', argent(somme(cons)), '', cons.length + ' dépense(s)') +
      U.tuile('Autres dépenses', argent(somme(autres)), '', autres.length + ' dépense(s)') +
      U.tuile('Total dépenses entreprise', argent(total), 'rouge') + '</div>';
    h += '<div class="deux-colonnes"><section class="carte"><h2>Répartition</h2>' +
      U.barres([{ label: 'Consommables', valeur: somme(cons) }, { label: 'Autres dépenses', valeur: somme(autres) }].filter(function (x) { return x.valeur; })) +
      '<h3>Principaux postes</h3>' + U.barres(grouper(liste, function (e) { return e.libelle; })) + '</section>' +
      '<section class="carte"><h2>Évolution par mois</h2>' + U.colonnes(parMois(liste)) + '</section></div>';
    h += '<section class="carte"><h2>Détail (' + liste.length + ')</h2>' + (liste.length ? tableau(liste, false, true) : '<p class="vide">Aucune dépense.</p>') + '</section>';
    h += '<section class="carte"><h2>Bilans archivés</h2>' + Archives.tableau('depEnt', [{ label: 'Consommables', cle: 'consommable' }, { label: 'Autres', cle: 'autre' }, { label: 'Total', cle: 'total' }]) + '</section>';
    el.innerHTML = h;

    el.querySelector('#periode-bilan').onchange = function () { etat.periodeBilanEnt = this.value; App.rendre(); };
    el.querySelector('#imp-bilan').onclick = function () {
      U.imprimer('<div class="rapport">' + U.entete() + '<h2 class="imp-titre">BILAN DES DÉPENSES ENTREPRISE — ' + esc(U.libellePeriode(periode)) + '</h2>' +
        '<table class="imp-table resume"><tbody><tr><td>Dépenses consommables</td><td class="num">' + argent(somme(cons)) + '</td></tr>' +
        '<tr><td>Autres dépenses</td><td class="num">' + argent(somme(autres)) + '</td></tr>' +
        '<tr class="fort"><td>TOTAL</td><td class="num">' + argent(total) + '</td></tr></tbody></table>' +
        '<h3>Détail</h3>' + tableauImpression(liste, false) + '</div>');
    };
    var ba = el.querySelector('#archiver');
    if (ba) ba.onclick = function () {
      if (!liste.length) { U.toast('Aucune dépense à archiver.', 'erreur'); return; }
      var titre = prompt('Nom de ce bilan :', 'Dépenses entreprise au ' + U.dateCourte(new Date().toISOString()));
      if (!titre) return;
      Archives.archiver('depEnt', 'depensesEntreprise', titre, { consommable: somme(cons), autre: somme(autres), total: total });
      U.toast('Bilan archivé.'); App.rendre();
    };
    Archives.lier(el, function (v) { etat.periodeBilanEnt = v; });
    lierActions(el, 'depensesEntreprise', false);
  }

  /* ---------- Bilan dépenses maison ---------- */
  function pageBilanMaison(el) {
    var toutes = S.data.depensesMaison;
    var periode = etat.periodeBilanMaison;
    var liste = U.filtrerPeriode(toutes, periode).sort(parDateDesc);
    var total = somme(liste);

    var h = '<div class="page-tete"><div><h1>Bilan des dépenses maison</h1><p class="sous">' + esc(U.libellePeriode(periode)) + '</p></div>' +
      '<div class="filtres"><select id="periode-bilan">' + U.optionsPeriode(toutes, periode, true, 'depMaison') + '</select>' +
      '<button class="btn" id="imp-bilan">🖨 Imprimer</button>' +
      (periode === 'encours' ? '<button class="btn principal" id="archiver">📦 Faire le point et archiver</button>' : '') + '</div></div>';
    h += '<div class="tuiles">' + U.tuile('Total dépenses maison', argent(total), 'rouge') + U.tuile('Nombre de dépenses', liste.length) + '</div>';
    h += '<div class="deux-colonnes"><section class="carte"><h2>Par personne</h2>' + U.barres(grouper(liste, function (e) { return (e.nom + ' ' + e.prenom).trim(); })) +
      '<h3>Par but</h3>' + U.barres(grouper(liste, function (e) { return e.but; })) + '</section>' +
      '<section class="carte"><h2>Évolution par mois</h2>' + U.colonnes(parMois(liste)) + '</section></div>';
    h += '<section class="carte"><h2>Détail (' + liste.length + ')</h2>' + (liste.length ? tableau(liste, true, true) : '<p class="vide">Aucune dépense.</p>') + '</section>';
    h += '<section class="carte"><h2>Bilans archivés</h2>' + Archives.tableau('depMaison', [{ label: 'Total', cle: 'total' }]) + '</section>';
    el.innerHTML = h;

    el.querySelector('#periode-bilan').onchange = function () { etat.periodeBilanMaison = this.value; App.rendre(); };
    el.querySelector('#imp-bilan').onclick = function () {
      U.imprimer('<div class="rapport">' + U.entete() + '<h2 class="imp-titre">BILAN DES DÉPENSES MAISON — ' + esc(U.libellePeriode(periode)) + '</h2>' +
        tableauImpression(liste, true) + '</div>');
    };
    var ba = el.querySelector('#archiver');
    if (ba) ba.onclick = function () {
      if (!liste.length) { U.toast('Aucune dépense à archiver.', 'erreur'); return; }
      var titre = prompt('Nom de ce bilan :', 'Dépenses maison au ' + U.dateCourte(new Date().toISOString()));
      if (!titre) return;
      Archives.archiver('depMaison', 'depensesMaison', titre, { total: total });
      U.toast('Bilan archivé.'); App.rendre();
    };
    Archives.lier(el, function (v) { etat.periodeBilanMaison = v; });
    lierActions(el, 'depensesMaison', true);
  }

  window.Depenses = {
    pageConsommable: function (el) {
      pageListe(el, { titre: 'Dépenses consommables', collection: 'depensesEntreprise', type: 'consommable', aide: 'Papier, encre, colle, reliure… tout ce qui est consommé pour la production.' });
    },
    pageAutre: function (el) {
      pageListe(el, { titre: 'Autres dépenses', collection: 'depensesEntreprise', type: 'autre', aide: 'Loyer, électricité, transport, réparation, internet…' });
    },
    pageMaison: function (el) {
      pageListe(el, { titre: 'Dépenses maison', collection: 'depensesMaison', aide: 'Qui a dépensé, pour quoi, dans quel but, et quand.' });
    },
    pageBilanEntreprise: pageBilanEntreprise,
    pageBilanMaison: pageBilanMaison,
    somme: somme,
    tableauImpression: tableauImpression
  };
})();
