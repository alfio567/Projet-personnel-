/* =========================================================
   CBZ Gestion — navigation, accueil, paramètres, sauvegarde
   ========================================================= */
(function () {
  'use strict';
  var S = Store, U = UI, esc = UI.esc, argent = UI.argent;

  var MENU = [
    { titre: 'Accueil', icone: '🏠', route: 'accueil' },
    { titre: 'Commande entreprise', icone: '📘', sous: [
      { titre: 'Commande', route: 'ce-commande' },
      { titre: 'Clients', route: 'ce-clients' },
      { titre: 'Livrets', route: 'ce-livrets' },
      { titre: 'Bilan', route: 'ce-bilan' }
    ] },
    { titre: 'Dépense entreprise', icone: '🏭', sous: [
      { titre: 'Dépense consommable', route: 'de-consommable' },
      { titre: 'Autre dépense', route: 'de-autre' },
      { titre: 'Bilan', route: 'de-bilan' }
    ] },
    { titre: 'Dépense maison', icone: '🏡', sous: [
      { titre: 'Dépense', route: 'dm-depense' },
      { titre: 'Bilan', route: 'dm-bilan' }
    ] },
    { titre: 'Bilan total', icone: '📊', route: 'bt' },
    { titre: 'Paramètres et sauvegarde', icone: '⚙️', route: 'parametres' }
  ];

  var PAGES = {
    'accueil': accueil,
    'ce-commande': Commandes.pageCommande,
    'ce-clients': Commandes.pageClients,
    'ce-livrets': Commandes.pageLivrets,
    'ce-bilan': Commandes.pageBilan,
    'de-consommable': Depenses.pageConsommable,
    'de-autre': Depenses.pageAutre,
    'de-bilan': Depenses.pageBilanEntreprise,
    'dm-depense': Depenses.pageMaison,
    'dm-bilan': Depenses.pageBilanMaison,
    'bt': BilanTotal.page,
    'parametres': parametres
  };

  function route() {
    var r = (location.hash || '#accueil').slice(1);
    return PAGES[r] ? r : 'accueil';
  }

  function menu() {
    var r = route();
    var p = S.data.parametres;
    document.getElementById('marque').innerHTML = '<span class="marque-nom">' + esc(p.entreprise) + '</span><span class="marque-sous">Gestion interne</span>';
    document.getElementById('menu').innerHTML = MENU.map(function (m, i) {
      if (!m.sous) {
        return '<a class="menu-lien ' + (r === m.route ? 'actif' : '') + '" href="#' + m.route + '"><span class="ico">' + m.icone + '</span>' +
          (m.route === 'bt' ? '<span class="num-cat">4</span>' : '') + esc(m.titre) + '</a>';
      }
      var ouvert = m.sous.some(function (s) { return s.route === r; });
      return '<div class="menu-groupe ' + (ouvert ? 'ouvert' : '') + '"><div class="menu-titre"><span class="ico">' + m.icone + '</span>' +
        '<span class="num-cat">' + i + '</span>' + esc(m.titre) + '</div>' +
        m.sous.map(function (s) {
          return '<a class="menu-sous ' + (r === s.route ? 'actif' : '') + '" href="#' + s.route + '">' + esc(s.titre) + '</a>';
        }).join('') + '</div>';
    }).join('');
  }

  function rendre() {
    menu();
    var el = document.getElementById('contenu');
    var y = window.scrollY;
    PAGES[route()](el);
    window.scrollTo(0, y);
    rappelSauvegarde();
    document.body.classList.remove('menu-ouvert');
  }

  /* ---------- Accueil ---------- */
  function accueil(el) {
    var d = S.data;
    var m = U.moisCourant();
    var paye = 0;
    d.commandes.forEach(function (c) { (c.paiements || []).forEach(function (p) { if (U.moisDe(p.date) === m) paye += Number(p.montant); }); });
    var depEnt = Depenses.somme(d.depensesEntreprise.filter(function (e) { return U.moisDe(e.date) === m; }));
    var depMaison = Depenses.somme(d.depensesMaison.filter(function (e) { return U.moisDe(e.date) === m; }));
    var impayes = d.commandes.filter(function (c) { return S.reste(c) > 0; });
    var du = impayes.reduce(function (s, c) { return s + S.reste(c); }, 0);
    var faibles = d.livrets.filter(function (l) { return l.stock < 10; });
    var cmdMois = d.commandes.filter(function (c) { return U.moisDe(c.date) === m; });

    var h = '<div class="page-tete"><div><h1>Bonjour 👋</h1><p class="sous">Point du mois de ' + U.nomMois(m) + '</p></div></div>';
    h += '<div class="tuiles">' +
      U.tuile('Commandes du mois', cmdMois.length) +
      U.tuile('Encaissé ce mois', argent(paye), 'vert') +
      U.tuile('Dépenses entreprise', argent(depEnt)) +
      U.tuile('Dépenses maison', argent(depMaison)) +
      U.tuile('Clients qui doivent', argent(du), du ? 'rouge' : '', impayes.length + ' commande(s)') + '</div>';
    h += '<div class="raccourcis">' +
      '<a class="raccourci" href="#ce-commande"><span>📘</span>Nouvelle commande</a>' +
      '<a class="raccourci" href="#ce-clients"><span>👤</span>Ajouter un client</a>' +
      '<a class="raccourci" href="#de-consommable"><span>🧾</span>Dépense consommable</a>' +
      '<a class="raccourci" href="#de-autre"><span>💡</span>Autre dépense</a>' +
      '<a class="raccourci" href="#dm-depense"><span>🏡</span>Dépense maison</a>' +
      '<a class="raccourci" href="#bt"><span>📊</span>Bilan total</a></div>';
    if (faibles.length) {
      h += '<section class="carte"><h2>⚠ Stock faible</h2><ul class="liste-simple">' + faibles.map(function (l) {
        return '<li><strong>' + esc(l.nom) + '</strong> : ' + l.stock + ' en stock</li>';
      }).join('') + '</ul><a href="#ce-livrets">Gérer le stock →</a></section>';
    }
    if (!d.livrets.length && !d.clients.length) {
      h += '<section class="carte bienvenue"><h2>Pour commencer</h2><ol>' +
        '<li>Dans <a href="#parametres">Paramètres</a>, saisissez le nom de l\'imprimerie (il apparaît sur les reçus).</li>' +
        '<li>Ajoutez vos <a href="#ce-livrets">livrets</a> avec leur prix à l\'unité et le stock.</li>' +
        '<li>Ajoutez vos <a href="#ce-clients">clients</a> (et marquez les clients fidèles).</li>' +
        '<li>Passez une <a href="#ce-commande">commande</a> : cliquez sur un livret, choisissez les clients et les quantités.</li>' +
        '<li>Pensez à faire une <a href="#parametres">sauvegarde</a> chaque semaine sur une clé USB.</li></ol></section>';
    }
    el.innerHTML = h;
  }

  /* ---------- Paramètres ---------- */
  function parametres(el) {
    var p = S.data.parametres;
    var d = S.data;
    var h = '<div class="page-tete"><div><h1>Paramètres et sauvegarde</h1></div></div>';
    h += '<section class="carte"><h2>Informations de l\'entreprise (affichées sur les reçus)</h2>' +
      '<form class="formulaire grille2" id="form-param">' +
      '<label>Nom de l\'entreprise<input name="entreprise" value="' + esc(p.entreprise) + '"></label>' +
      '<label>Activité / slogan<input name="slogan" value="' + esc(p.slogan) + '"></label>' +
      '<label>Adresse<input name="adresse" value="' + esc(p.adresse) + '"></label>' +
      '<label>Téléphone<input name="telephone" value="' + esc(p.telephone) + '"></label>' +
      '<label>Monnaie (symbole)<input name="devise" value="' + esc(p.devise) + '" placeholder="F, FCFA…"></label>' +
      '<div class="form-action"><button class="btn principal">Enregistrer</button></div></form></section>';

    h += '<section class="carte"><h2>Sauvegarde des données</h2>' +
      '<p>Les données sont enregistrées <strong>dans ce navigateur, sur ce PC</strong>. Pour ne rien perdre (panne, nettoyage du navigateur), ' +
      'téléchargez une sauvegarde régulièrement et copiez-la sur une clé USB ou sur Google Drive.</p>' +
      '<p>Dernière sauvegarde : <strong>' + (p.derniereSauvegarde ? U.dateHeure(p.derniereSauvegarde) : 'jamais') + '</strong></p>' +
      '<p class="stats-donnees">' + d.livrets.length + ' livrets · ' + d.clients.length + ' clients · ' + d.commandes.length + ' commandes · ' +
      (d.depensesEntreprise.length + d.depensesMaison.length) + ' dépenses · ' + d.archives.length + ' bilans archivés</p>' +
      '<div class="boutons"><button class="btn principal" id="exporter">⬇ Télécharger une sauvegarde</button>' +
      '<label class="btn">⬆ Restaurer une sauvegarde<input type="file" id="importer" accept=".json,application/json" hidden></label></div></section>';

    h += '<section class="carte danger"><h2>Zone sensible</h2><p>Effacer toutes les données de l\'application. Faites d\'abord une sauvegarde !</p>' +
      '<button class="btn rouge" id="effacer">Tout effacer</button></section>';
    el.innerHTML = h;

    el.querySelector('#form-param').onsubmit = function (e) {
      e.preventDefault();
      var v = U.lireForm(this);
      Object.keys(v).forEach(function (k) { p[k] = v[k]; });
      if (!p.devise) p.devise = 'F';
      S.enregistrer(); U.toast('Paramètres enregistrés.'); rendre();
    };
    el.querySelector('#exporter').onclick = exporter;
    el.querySelector('#importer').onchange = function () {
      var f = this.files[0];
      if (!f) return;
      var lecteur = new FileReader();
      lecteur.onload = function () {
        try {
          var donnees = JSON.parse(lecteur.result);
          if (!donnees || !Array.isArray(donnees.commandes) || !donnees.parametres) throw new Error('format');
          if (!U.confirmer('Remplacer TOUTES les données actuelles par celles de la sauvegarde « ' + f.name + ' » ?')) return;
          S.remplacer(donnees);
          U.toast('Sauvegarde restaurée.'); rendre();
        } catch (err) {
          alert('Ce fichier n\'est pas une sauvegarde valide de l\'application.');
        }
      };
      lecteur.readAsText(f);
    };
    el.querySelector('#effacer').onclick = function () {
      if (!U.confirmer('Effacer DÉFINITIVEMENT toutes les données ?')) return;
      if (prompt('Pour confirmer, tapez EFFACER') !== 'EFFACER') return;
      S.reinitialiser(); U.toast('Données effacées.'); location.hash = '#accueil'; rendre();
    };
  }

  function exporter() {
    S.data.parametres.derniereSauvegarde = new Date().toISOString();
    S.enregistrer();
    var blob = new Blob([JSON.stringify(S.data, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    var dt = new Date();
    a.href = URL.createObjectURL(blob);
    a.download = 'sauvegarde-gestion-' + dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0') + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    U.toast('Sauvegarde téléchargée.');
    rendre();
  }

  function rappelSauvegarde() {
    var bandeau = document.getElementById('bandeau');
    var d = S.data, p = d.parametres;
    var aDesDonnees = d.commandes.length || d.depensesEntreprise.length || d.depensesMaison.length || d.clients.length;
    var vieux = !p.derniereSauvegarde || (Date.now() - new Date(p.derniereSauvegarde).getTime()) > 7 * 864e5;
    if (aDesDonnees && vieux && route() !== 'parametres') {
      bandeau.innerHTML = '💾 Pensez à faire une sauvegarde de vos données (' +
        (p.derniereSauvegarde ? 'dernière il y a plus de 7 jours' : 'aucune sauvegarde faite') + '). ' +
        '<button class="btn petit" id="sauver-vite">Sauvegarder maintenant</button>';
      bandeau.hidden = false;
      document.getElementById('sauver-vite').onclick = exporter;
    } else {
      bandeau.hidden = true;
    }
  }

  window.addEventListener('hashchange', function () { rendre(); window.scrollTo(0, 0); });
  window.addEventListener('beforeunload', function (e) {
    if (Commandes.panierNonVide()) { e.preventDefault(); e.returnValue = ''; }
  });
  document.getElementById('bouton-menu').onclick = function () { document.body.classList.toggle('menu-ouvert'); };

  window.App = { rendre: rendre };
  rendre();
})();
