/* =========================================================
   CBZ Gestion — 4. Bilan total
   Entrées, sorties, salaires, économies, investissements, reste
   ========================================================= */
(function () {
  'use strict';
  var S = Store, U = UI, esc = UI.esc, argent = UI.argent;
  var periode = UI.moisCourant();

  function somme(l) { return l.reduce(function (s, e) { return s + Number(e.montant || 0); }, 0); }
  function dansPeriode(iso) { return periode === 'tout' || U.moisDe(iso) === periode; }

  function calculer() {
    var d = S.data;
    var paiements = [];
    d.commandes.forEach(function (c) {
      (c.paiements || []).forEach(function (p) {
        if (dansPeriode(p.date)) paiements.push({ date: p.date, montant: p.montant, client: c.clientNom, numero: c.numero });
      });
    });
    var cmds = d.commandes.filter(function (c) { return dansPeriode(c.date); });
    var depEnt = d.depensesEntreprise.filter(function (e) { return dansPeriode(e.date); });
    var depMaison = d.depensesMaison.filter(function (e) { return dansPeriode(e.date); });
    var salaires = d.salaires.filter(function (s) { return periode === 'tout' || s.mois === periode; });
    var epargnes = d.epargnes.filter(function (e) { return dansPeriode(e.date); });
    var r = {
      paiements: paiements, cmds: cmds, depEnt: depEnt, depMaison: depMaison, salaires: salaires, epargnes: epargnes,
      entrees: somme(paiements),
      ca: cmds.reduce(function (s, c) { return s + c.total; }, 0),
      creances: d.commandes.reduce(function (s, c) { return s + S.reste(c); }, 0),
      consommable: somme(depEnt.filter(function (e) { return e.type === 'consommable'; })),
      autre: somme(depEnt.filter(function (e) { return e.type === 'autre'; })),
      maison: somme(depMaison),
      salaire: somme(salaires),
      economie: somme(epargnes.filter(function (e) { return e.type === 'economie'; })),
      investissement: somme(epargnes.filter(function (e) { return e.type === 'investissement'; }))
    };
    r.depEntTotal = r.consommable + r.autre;
    r.sorties = r.depEntTotal + r.maison + r.salaire;
    r.mises = r.economie + r.investissement;
    r.reste = r.entrees - r.sorties - r.mises;
    return r;
  }

  function optionsPeriode() {
    var d = S.data, tout = [];
    d.commandes.forEach(function (c) { tout.push({ date: c.date }); (c.paiements || []).forEach(function (p) { tout.push({ date: p.date }); }); });
    tout = tout.concat(d.depensesEntreprise, d.depensesMaison, d.epargnes);
    d.salaires.forEach(function (s) { tout.push({ date: s.mois + '-15T12:00:00' }); });
    return U.optionsPeriode(tout, periode, false);
  }

  function page(el) {
    var d = S.data, r = calculer();
    var moisCible = periode === 'tout' ? U.moisCourant() : periode;
    var masse = d.employes.reduce(function (s, e) { return s + Number(e.salaire || 0); }, 0);

    var h = '<div class="page-tete"><div><h1>Bilan total</h1><p class="sous">' + esc(U.libellePeriode(periode)) + '</p></div>' +
      '<div class="filtres"><select id="periode-total">' + optionsPeriode() + '</select>' +
      '<button class="btn principal" id="imp-total">🖨 Imprimer le bilan complet</button></div></div>';

    // résultat
    h += '<section class="carte resultat ' + (r.reste >= 0 ? 'positif' : 'negatif') + '">' +
      '<div><span class="resultat-label">Ce qui reste</span><span class="resultat-valeur">' + argent(r.reste) + '</span>' +
      '<span class="resultat-detail">' + (r.reste >= 0 ? '✔ Excédent' : '⚠ Déficit') + ' = entrées ' + argent(r.entrees) + ' − dépenses ' + argent(r.sorties) +
      ' − économies et investissements ' + argent(r.mises) + '</span></div></section>';

    h += '<div class="tuiles">' +
      U.tuile('Entrées (encaissé)', argent(r.entrees), 'vert', 'Chiffre d\'affaires : ' + argent(r.ca)) +
      U.tuile('Dépenses entreprise', argent(r.depEntTotal), '', 'Consommables ' + argent(r.consommable) + ' · autres ' + argent(r.autre)) +
      U.tuile('Dépenses maison', argent(r.maison)) +
      U.tuile('Salaires', argent(r.salaire), '', d.employes.length + ' employé(s)') +
      U.tuile('Économies', argent(r.economie)) +
      U.tuile('Investissements', argent(r.investissement)) +
      U.tuile('Clients : reste à encaisser', argent(r.creances), r.creances ? 'rouge' : '', 'Toutes périodes') + '</div>';

    h += '<section class="carte"><h2>Où va l\'argent</h2>' + U.barres([
      { label: 'Entrées (encaissé)', valeur: r.entrees, classe: 'entree' },
      { label: 'Dépenses consommables', valeur: r.consommable },
      { label: 'Autres dépenses entreprise', valeur: r.autre },
      { label: 'Dépenses maison', valeur: r.maison },
      { label: 'Salaires', valeur: r.salaire },
      { label: 'Économies', valeur: r.economie },
      { label: 'Investissements', valeur: r.investissement },
      { label: r.reste >= 0 ? 'Reste' : 'Déficit', valeur: r.reste, classe: r.reste >= 0 ? 'entree' : 'deficit' }
    ]) + '</section>';

    // salaires
    h += '<div class="deux-colonnes"><section class="carte"><div class="carte-tete"><h2>Employés et salaires</h2>' +
      '<button class="btn" id="ajout-employe">+ Employé</button></div>';
    if (!d.employes.length) h += '<p class="vide">Aucun employé. Ajoutez vos employés et leur salaire mensuel.</p>';
    else {
      h += '<table class="tableau compact"><thead><tr><th>Employé</th><th>Poste</th><th class="num">Salaire mensuel</th><th></th></tr></thead><tbody>' +
        d.employes.map(function (e) {
          return '<tr><td>' + esc(e.nom + ' ' + e.prenom) + '</td><td>' + esc(e.poste || '') + '</td><td class="num">' + argent(e.salaire) + '</td>' +
            '<td class="actions"><button class="btn petit" data-modif-emp="' + e.id + '">Modifier</button><button class="btn-icone" data-suppr-emp="' + e.id + '">🗑</button></td></tr>';
        }).join('') + '</tbody><tfoot><tr><td colspan="2"><strong>Masse salariale mensuelle</strong></td><td class="num"><strong>' + argent(masse) + '</strong></td><td></td></tr></tfoot></table>' +
        '<button class="btn principal" id="payer-salaires">Enregistrer les salaires de ' + U.nomMois(moisCible) + '</button>';
    }
    h += '<h3>Salaires versés — ' + esc(U.libellePeriode(periode)) + '</h3>';
    h += r.salaires.length ? '<table class="tableau compact"><thead><tr><th>Mois</th><th>Employé</th><th class="num">Montant</th><th></th></tr></thead><tbody>' +
      r.salaires.map(function (s) {
        return '<tr><td>' + U.nomMois(s.mois) + '</td><td>' + esc(s.nom) + '</td><td class="num">' + argent(s.montant) + '</td>' +
          '<td class="actions"><button class="btn-icone" data-suppr-sal="' + s.id + '" title="Supprimer">🗑</button></td></tr>';
      }).join('') + '</tbody></table>' : '<p class="vide">Aucun salaire enregistré pour cette période.</p>';
    h += '</section>';

    // économies / investissements
    h += '<section class="carte"><h2>Économies et investissements</h2>' +
      '<form class="formulaire grille2" id="form-epargne">' +
      '<label>Catégorie<select name="type"><option value="economie">Économie</option><option value="investissement">Investissement</option></select></label>' +
      '<label>Montant (' + esc(d.parametres.devise) + ') *<input name="montant" type="number" min="0" step="any" required></label>' +
      '<label>Libellé *<input name="libelle" required placeholder="ex : épargne banque, nouvelle machine…"></label>' +
      '<label>Date et heure<input name="date" type="datetime-local" value="' + U.pourInput() + '"></label>' +
      '<div class="form-action plein"><button class="btn principal" type="submit">+ Enregistrer</button></div></form>';
    h += r.epargnes.length ? '<table class="tableau compact"><thead><tr><th>Date</th><th>Catégorie</th><th>Libellé</th><th class="num">Montant</th><th></th></tr></thead><tbody>' +
      r.epargnes.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; }).map(function (e) {
        return '<tr><td>' + U.dateHeure(e.date) + '</td><td>' + (e.type === 'economie' ? 'Économie' : 'Investissement') + '</td><td>' + esc(e.libelle) + '</td>' +
          '<td class="num">' + argent(e.montant) + '</td><td class="actions"><button class="btn-icone" data-suppr-ep="' + e.id + '">🗑</button></td></tr>';
      }).join('') + '</tbody></table>' : '<p class="vide">Rien pour cette période.</p>';
    h += '</section></div>';

    el.innerHTML = h;

    el.querySelector('#periode-total').onchange = function () { periode = this.value; App.rendre(); };
    el.querySelector('#imp-total').onclick = function () { U.imprimer(impression(r)); };
    el.querySelector('#ajout-employe').onclick = function () { modaleEmploye(null); };
    el.querySelectorAll('[data-modif-emp]').forEach(function (b) {
      b.onclick = function () { modaleEmploye(d.employes.find(function (e) { return e.id === b.getAttribute('data-modif-emp'); })); };
    });
    el.querySelectorAll('[data-suppr-emp]').forEach(function (b) {
      b.onclick = function () {
        if (!U.confirmer('Supprimer cet employé ? (les salaires déjà versés restent enregistrés)')) return;
        d.employes = d.employes.filter(function (e) { return e.id !== b.getAttribute('data-suppr-emp'); });
        S.enregistrer(); App.rendre();
      };
    });
    var bp = el.querySelector('#payer-salaires');
    if (bp) bp.onclick = function () {
      var deja = d.salaires.filter(function (s) { return s.mois === moisCible; }).map(function (s) { return s.employeId; });
      var aPayer = d.employes.filter(function (e) { return deja.indexOf(e.id) < 0; });
      if (!aPayer.length) { U.toast('Les salaires de ' + U.nomMois(moisCible) + ' sont déjà enregistrés.', 'erreur'); return; }
      var tot = aPayer.reduce(function (s, e) { return s + Number(e.salaire); }, 0);
      if (!U.confirmer('Enregistrer les salaires de ' + U.nomMois(moisCible) + ' pour ' + aPayer.length + ' employé(s), total ' + argent(tot) + ' ?')) return;
      aPayer.forEach(function (e) {
        d.salaires.push({ id: S.id(), employeId: e.id, nom: (e.nom + ' ' + e.prenom).trim(), mois: moisCible, montant: Number(e.salaire), date: new Date().toISOString() });
      });
      S.enregistrer(); U.toast('Salaires enregistrés.'); App.rendre();
    };
    el.querySelectorAll('[data-suppr-sal]').forEach(function (b) {
      b.onclick = function () {
        if (!U.confirmer('Supprimer ce salaire versé ?')) return;
        d.salaires = d.salaires.filter(function (s) { return s.id !== b.getAttribute('data-suppr-sal'); });
        S.enregistrer(); App.rendre();
      };
    });
    el.querySelector('#form-epargne').onsubmit = function (ev) {
      ev.preventDefault();
      var v = U.lireForm(this);
      d.epargnes.push({ id: S.id(), type: v.type, libelle: v.libelle, montant: Number(v.montant) || 0, date: U.depuisInput(v.date) });
      S.enregistrer(); U.toast('Enregistré.'); App.rendre();
    };
    el.querySelectorAll('[data-suppr-ep]').forEach(function (b) {
      b.onclick = function () {
        if (!U.confirmer('Supprimer cette ligne ?')) return;
        d.epargnes = d.epargnes.filter(function (e) { return e.id !== b.getAttribute('data-suppr-ep'); });
        S.enregistrer(); App.rendre();
      };
    });
  }

  function modaleEmploye(e) {
    var nouveau = !e;
    e = e || { nom: '', prenom: '', poste: '', salaire: '' };
    var corps = U.ouvrirModale(nouveau ? 'Nouvel employé' : 'Modifier l\'employé',
      '<form class="formulaire grille2"><label>Nom *<input name="nom" required value="' + esc(e.nom) + '"></label>' +
      '<label>Prénom<input name="prenom" value="' + esc(e.prenom) + '"></label>' +
      '<label>Poste<input name="poste" value="' + esc(e.poste) + '" placeholder="ex : imprimeur, secrétaire…"></label>' +
      '<label>Salaire mensuel (' + esc(S.data.parametres.devise) + ') *<input name="salaire" type="number" min="0" step="any" required value="' + esc(e.salaire) + '"></label>' +
      '<div class="modale-pied plein"><span></span><button class="btn principal">Enregistrer</button></div></form>');
    corps.querySelector('form').onsubmit = function (ev) {
      ev.preventDefault();
      var v = U.lireForm(this);
      var c = nouveau ? { id: S.id() } : e;
      c.nom = v.nom; c.prenom = v.prenom; c.poste = v.poste; c.salaire = Number(v.salaire) || 0;
      if (nouveau) S.data.employes.push(c);
      S.enregistrer(); U.fermerModale(); App.rendre();
    };
  }

  function ligne(label, val, fort) {
    return '<tr' + (fort ? ' class="fort"' : '') + '><td>' + esc(label) + '</td><td class="num">' + argent(val) + '</td></tr>';
  }

  function impression(r) {
    var rc = Commandes.resume(r.cmds);
    var h = '<div class="rapport">' + U.entete() + '<h2 class="imp-titre">BILAN TOTAL — ' + esc(U.libellePeriode(periode)) + '</h2>';
    h += '<h3>Résumé</h3><table class="imp-table resume"><tbody>' +
      ligne('Entrées (sommes encaissées)', r.entrees) +
      ligne('Dépenses consommables', r.consommable) + ligne('Autres dépenses entreprise', r.autre) +
      ligne('Total dépenses entreprise', r.depEntTotal, true) +
      ligne('Dépenses maison', r.maison) + ligne('Salaires', r.salaire) +
      ligne('Total des dépenses', r.sorties, true) +
      ligne('Économies', r.economie) + ligne('Investissements', r.investissement) +
      ligne(r.reste >= 0 ? 'CE QUI RESTE' : 'DÉFICIT', r.reste, true) +
      '</tbody></table>' +
      '<p>Chiffre d\'affaires des commandes de la période : <strong>' + argent(rc.total) + '</strong> (' + rc.nb + ' commandes, ' + rc.qte + ' livrets). ' +
      'Reste à encaisser auprès des clients (toutes périodes) : <strong>' + argent(r.creances) + '</strong>.</p>';

    h += '<h3>Entrées — paiements reçus</h3>' + (r.paiements.length ? '<table class="imp-table"><thead><tr><th>Date</th><th>Reçu</th><th>Client</th><th class="num">Montant</th></tr></thead><tbody>' +
      r.paiements.sort(function (a, b) { return a.date < b.date ? -1 : 1; }).map(function (p) {
        return '<tr><td>' + U.dateHeure(p.date) + '</td><td>' + esc(p.numero) + '</td><td>' + esc(p.client) + '</td><td class="num">' + argent(p.montant) + '</td></tr>';
      }).join('') + '</tbody><tfoot><tr class="fort"><td colspan="3">TOTAL</td><td class="num">' + argent(r.entrees) + '</td></tr></tfoot></table>' : '<p>Aucune.</p>');

    h += '<h3>Dépenses entreprise</h3>' + (r.depEnt.length ? Depenses.tableauImpression(r.depEnt.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; }), false) : '<p>Aucune.</p>');
    h += '<h3>Dépenses maison</h3>' + (r.depMaison.length ? Depenses.tableauImpression(r.depMaison.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; }), true) : '<p>Aucune.</p>');
    h += '<h3>Salaires</h3>' + (r.salaires.length ? '<table class="imp-table"><thead><tr><th>Mois</th><th>Employé</th><th class="num">Montant</th></tr></thead><tbody>' +
      r.salaires.map(function (s) { return '<tr><td>' + U.nomMois(s.mois) + '</td><td>' + esc(s.nom) + '</td><td class="num">' + argent(s.montant) + '</td></tr>'; }).join('') +
      '</tbody><tfoot><tr class="fort"><td colspan="2">TOTAL</td><td class="num">' + argent(r.salaire) + '</td></tr></tfoot></table>' : '<p>Aucun.</p>');
    h += '<h3>Économies et investissements</h3>' + (r.epargnes.length ? '<table class="imp-table"><thead><tr><th>Date</th><th>Catégorie</th><th>Libellé</th><th class="num">Montant</th></tr></thead><tbody>' +
      r.epargnes.map(function (e) { return '<tr><td>' + U.dateHeure(e.date) + '</td><td>' + (e.type === 'economie' ? 'Économie' : 'Investissement') + '</td><td>' + esc(e.libelle) + '</td><td class="num">' + argent(e.montant) + '</td></tr>'; }).join('') +
      '</tbody><tfoot><tr class="fort"><td colspan="3">TOTAL</td><td class="num">' + argent(r.mises) + '</td></tr></tfoot></table>' : '<p>Aucun.</p>');
    h += '<div class="signatures"><div>Établi par</div><div>Visa du responsable</div></div></div>';
    return h;
  }

  window.BilanTotal = { page: page, calculer: calculer };
})();
