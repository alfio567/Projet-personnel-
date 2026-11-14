/* =========================================================
   CBZ Gestion — 1. Commande entreprise
   Sous-parties : Commande, Clients, Livrets, Bilan
   ========================================================= */
(function () {
  'use strict';
  var S = Store, U = UI, esc = UI.esc, argent = UI.argent;

  /* ---------- Archives (commun à tous les bilans) ---------- */
  window.Archives = {
    // archive tous les éléments non archivés d'une collection
    archiver: function (module, collection, titre, resume) {
      var items = S.data[collection].filter(function (e) { return !e.archive; });
      if (!items.length) { U.toast('Rien à archiver.', 'erreur'); return null; }
      var dates = items.map(function (e) { return e.date; }).sort();
      var a = {
        id: S.id(), module: module, collection: collection, date: new Date().toISOString(),
        titre: titre, du: dates[0], au: dates[dates.length - 1], resume: resume,
        ids: items.map(function (e) { return e.id; })
      };
      items.forEach(function (e) { e.archive = a.id; });
      S.data.archives.push(a);
      S.enregistrer();
      return a;
    },
    desarchiver: function (aid) {
      var a = S.data.archives.find(function (x) { return x.id === aid; });
      if (!a) return;
      S.data[a.collection].forEach(function (e) { if (e.archive === aid) delete e.archive; });
      S.data.archives = S.data.archives.filter(function (x) { return x.id !== aid; });
      S.enregistrer();
    },
    liste: function (module) {
      return S.data.archives.filter(function (a) { return a.module === module; }).slice().reverse();
    },
    // tableau HTML de la liste des archives d'un module
    tableau: function (module, colonnesResume) {
      var arch = this.liste(module);
      if (!arch.length) return '<p class="vide">Aucun bilan archivé pour le moment.</p>';
      return '<table class="tableau"><thead><tr><th>Bilan</th><th>Archivé le</th><th>Période</th>' +
        colonnesResume.map(function (c) { return '<th class="num">' + esc(c.label) + '</th>'; }).join('') +
        '<th></th></tr></thead><tbody>' + arch.map(function (a) {
          return '<tr><td><strong>' + esc(a.titre) + '</strong></td><td>' + U.dateHeure(a.date) + '</td>' +
            '<td>' + U.dateCourte(a.du) + ' → ' + U.dateCourte(a.au) + '</td>' +
            colonnesResume.map(function (c) { return '<td class="num">' + argent(a.resume[c.cle] || 0) + '</td>'; }).join('') +
            '<td class="actions"><button class="btn petit" data-voir-archive="' + a.id + '">Voir</button>' +
            '<button class="btn petit discret" data-desarchiver="' + a.id + '" title="Remettre dans la période en cours">Désarchiver</button></td></tr>';
        }).join('') + '</tbody></table>';
    }
  };

  /* ---------- Panier en cours (mémoire) ----------
     { clientId: { lignes: { livretId: qte }, verse: '' , toutPaye: bool } } */
  var panier = {};
  var etat = { recherche: '', periodeHisto: 'tout', periodeBilan: 'encours' };

  function nomClient(c) { return c ? (c.nom + ' ' + c.prenom).trim() : 'Client supprimé'; }

  function badgeFidele(c) {
    if (!c || !c.fidele) return '';
    var v = Number(c.remiseValeur || 0);
    var r = !v ? '' : (c.remiseType === 'montant' ? ' -' + argent(v) + '/livret' : ' -' + v + ' %');
    return '<span class="badge fidele" title="Client fidèle">★ Fidèle' + esc(r) + '</span>';
  }

  function calculPanierClient(cid) {
    var p = panier[cid], c = S.client(cid);
    var lignes = Object.keys(p.lignes).map(function (lid) {
      var l = S.livret(lid);
      if (!l) return null;
      var q = Number(p.lignes[lid]) || 0;
      return { livretId: lid, nom: l.nom, prixUnit: Number(l.prix), qte: q, total: Number(l.prix) * q };
    }).filter(function (x) { return x && x.qte > 0; });
    var sousTotal = lignes.reduce(function (s, l) { return s + l.total; }, 0);
    var qte = lignes.reduce(function (s, l) { return s + l.qte; }, 0);
    var remise = S.calculRemise(c, sousTotal, qte);
    var total = sousTotal - remise;
    var verse = p.toutPaye ? total : Math.min(total, Math.max(0, Number(p.verse) || 0));
    return { client: c, lignes: lignes, sousTotal: sousTotal, remise: remise, total: total, verse: verse, reste: total - verse };
  }

  /* =========================================================
     PAGE : COMMANDE
     ========================================================= */
  function pageCommande(el) {
    var d = S.data;
    var h = '<div class="page-tete"><div><h1>Commande</h1><p class="sous">Cliquez sur un livret pour choisir les clients et les quantités.</p></div></div>';

    // grille des livrets
    h += '<section class="carte"><h2>Livrets disponibles</h2>';
    if (!d.livrets.length) {
      h += '<p class="vide">Aucun livret. Ajoutez vos livrets dans <a href="#ce-livrets">Livrets</a>.</p>';
    } else {
      h += '<div class="grille-livrets">' + d.livrets.map(function (l) {
        var cls = l.stock <= 0 ? 'rupture' : (l.stock < 10 ? 'faible' : '');
        return '<button class="livret-carte" data-livret="' + l.id + '">' +
          '<span class="livret-nom">' + esc(l.nom) + '</span>' +
          '<span class="livret-prix">' + argent(l.prix) + ' <small>/ unité</small></span>' +
          '<span class="stock ' + cls + '">Stock : ' + l.stock + (l.stock <= 0 ? ' (à produire)' : '') + '</span>' +
          '</button>';
      }).join('') + '</div>';
    }
    h += '</section>';

    // panier
    var cids = Object.keys(panier).filter(function (cid) { return Object.keys(panier[cid].lignes).length; });
    if (cids.length) {
      var totalGeneral = 0, verseGeneral = 0;
      h += '<section class="carte panier"><div class="carte-tete"><h2>Commande en cours</h2>' +
        '<button class="btn discret" data-vider>Vider</button></div>';
      cids.forEach(function (cid) {
        var r = calculPanierClient(cid);
        totalGeneral += r.total; verseGeneral += r.verse;
        h += '<div class="panier-client"><div class="panier-client-tete"><strong>' + esc(nomClient(r.client)) + '</strong> ' +
          badgeFidele(r.client) + '<button class="btn-icone" data-retirer-client="' + cid + '" title="Retirer ce client">✕</button></div>' +
          '<table class="tableau compact"><thead><tr><th>Livret</th><th class="num">Prix unité</th><th class="num">Quantité</th><th class="num">Montant</th><th></th></tr></thead><tbody>' +
          r.lignes.map(function (l) {
            return '<tr><td>' + esc(l.nom) + '</td><td class="num">' + argent(l.prixUnit) + '</td>' +
              '<td class="num"><input type="number" min="1" class="qte" value="' + l.qte + '" data-qte-client="' + cid + '" data-qte-livret="' + l.livretId + '"></td>' +
              '<td class="num">' + argent(l.total) + '</td>' +
              '<td><button class="btn-icone" data-retirer-ligne="' + cid + '|' + l.livretId + '" title="Retirer">✕</button></td></tr>';
          }).join('') + '</tbody></table>' +
          '<div class="panier-totaux">' +
          '<div><span>Sous-total</span><strong>' + argent(r.sousTotal) + '</strong></div>' +
          (r.remise ? '<div class="remise"><span>Réduction fidélité</span><strong>- ' + argent(r.remise) + '</strong></div>' : '') +
          '<div class="total"><span>Total à payer</span><strong>' + argent(r.total) + '</strong></div>' +
          '<div class="paiement"><label><input type="checkbox" data-toutpaye="' + cid + '"' + (panier[cid].toutPaye ? ' checked' : '') + '> Tout payé</label>' +
          '<label>Montant versé <input type="number" min="0" data-verse="' + cid + '" value="' + (panier[cid].toutPaye ? r.total : esc(panier[cid].verse)) + '"' + (panier[cid].toutPaye ? ' disabled' : '') + '></label></div>' +
          '<div class="' + (r.reste > 0 ? 'reste-du' : 'solde') + '"><span>' + (r.reste > 0 ? 'Reste à payer' : 'Soldé') + '</span><strong>' + argent(r.reste) + '</strong></div>' +
          '</div></div>';
      });
      h += '<div class="panier-pied"><div>Total général : <strong>' + argent(totalGeneral) + '</strong> — versé : <strong>' + argent(verseGeneral) + '</strong> — reste : <strong>' + argent(totalGeneral - verseGeneral) + '</strong></div>' +
        '<button class="btn principal" data-valider>✔ Valider et enregistrer</button></div></section>';
    }

    // impayés
    var impayes = d.commandes.filter(function (c) { return S.reste(c) > 0; })
      .sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    var totalImpaye = impayes.reduce(function (s, c) { return s + S.reste(c); }, 0);
    h += '<section class="carte"><div class="carte-tete"><h2>Reste à payer <span class="badge alerte">' + impayes.length + '</span></h2>' +
      '<div class="total-impaye">Total dû : <strong>' + argent(totalImpaye) + '</strong></div></div>';
    if (!impayes.length) h += '<p class="vide">Tout le monde a payé. 👍</p>';
    else h += tableauCommandes(impayes, true);
    h += '</section>';

    // historique
    var histo = U.filtrerPeriode(d.commandes, etat.periodeHisto)
      .filter(function (c) {
        if (!etat.recherche) return true;
        var q = U.normaliser(etat.recherche);
        return U.normaliser(c.clientNom + ' ' + c.numero + ' ' + c.lignes.map(function (l) { return l.nom; }).join(' ')).indexOf(q) >= 0;
      })
      .sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    h += '<section class="carte"><div class="carte-tete"><h2>Historique des commandes</h2><div class="filtres">' +
      '<input type="search" placeholder="Rechercher (client, n° reçu, livret)" id="recherche-cmd" value="' + esc(etat.recherche) + '">' +
      '<select id="periode-histo">' + U.optionsPeriode(d.commandes, etat.periodeHisto, true) + '</select></div></div>';
    h += histo.length ? tableauCommandes(histo, false) : '<p class="vide">Aucune commande.</p>';
    h += '</section>';

    el.innerHTML = h;

    // événements
    el.querySelectorAll('[data-livret]').forEach(function (b) {
      b.onclick = function () { modaleChoixClients(b.getAttribute('data-livret')); };
    });
    el.querySelectorAll('[data-qte-client]').forEach(function (i) {
      i.onchange = function () {
        var q = Math.max(1, parseInt(i.value, 10) || 1);
        panier[i.getAttribute('data-qte-client')].lignes[i.getAttribute('data-qte-livret')] = q;
        App.rendre();
      };
    });
    el.querySelectorAll('[data-retirer-ligne]').forEach(function (b) {
      b.onclick = function () {
        var p = b.getAttribute('data-retirer-ligne').split('|');
        delete panier[p[0]].lignes[p[1]];
        if (!Object.keys(panier[p[0]].lignes).length) delete panier[p[0]];
        App.rendre();
      };
    });
    el.querySelectorAll('[data-retirer-client]').forEach(function (b) {
      b.onclick = function () { delete panier[b.getAttribute('data-retirer-client')]; App.rendre(); };
    });
    el.querySelectorAll('[data-toutpaye]').forEach(function (c) {
      c.onchange = function () { panier[c.getAttribute('data-toutpaye')].toutPaye = c.checked; App.rendre(); };
    });
    el.querySelectorAll('[data-verse]').forEach(function (i) {
      i.onchange = function () { panier[i.getAttribute('data-verse')].verse = i.value; App.rendre(); };
    });
    var bv = el.querySelector('[data-vider]');
    if (bv) bv.onclick = function () { if (U.confirmer('Vider la commande en cours ?')) { panier = {}; App.rendre(); } };
    var bval = el.querySelector('[data-valider]');
    if (bval) bval.onclick = validerPanier;
    var rech = el.querySelector('#recherche-cmd');
    rech.oninput = function () {
      etat.recherche = rech.value;
      var pos = rech.selectionStart;
      App.rendre();
      var r2 = document.getElementById('recherche-cmd');
      r2.focus(); r2.setSelectionRange(pos, pos);
    };
    el.querySelector('#periode-histo').onchange = function () { etat.periodeHisto = this.value; App.rendre(); };
    lierActionsCommandes(el);
  }

  function tableauCommandes(liste, modeImpayes) {
    return '<div class="defile"><table class="tableau"><thead><tr><th>N° reçu</th><th>Date et heure</th><th>Client</th>' +
      (modeImpayes ? '<th>Téléphone</th>' : '<th>Livrets</th>') +
      '<th class="num">Total</th><th class="num">Payé</th><th class="num">Reste</th><th>Statut</th><th></th></tr></thead><tbody>' +
      liste.map(function (c) {
        var reste = S.reste(c), cl = S.client(c.clientId);
        var detail = modeImpayes ? esc(cl ? (cl.tel || cl.whatsapp || '') : '') :
          c.lignes.map(function (l) { return esc(l.nom) + ' ×' + l.qte; }).join(', ');
        return '<tr><td>' + esc(c.numero) + '</td><td>' + U.dateHeure(c.date) + '</td><td>' + esc(c.clientNom) + '</td>' +
          '<td>' + detail + '</td><td class="num">' + argent(c.total) + '</td><td class="num">' + argent(S.paye(c)) + '</td>' +
          '<td class="num ' + (reste ? 'rouge' : '') + '">' + argent(reste) + '</td>' +
          '<td>' + (reste ? '<span class="badge alerte">Reste à payer</span>' : '<span class="badge ok">Remboursé / payé</span>') +
          (c.archive ? ' <span class="badge gris">archivé</span>' : '') + '</td>' +
          '<td class="actions">' +
          (reste ? '<button class="btn petit principal" data-encaisser="' + c.id + '">Encaisser</button>' : '') +
          '<button class="btn petit" data-recu="' + c.id + '">Reçu</button>' +
          (modeImpayes ? '' : '<button class="btn-icone" data-suppr-cmd="' + c.id + '" title="Supprimer la commande">🗑</button>') +
          '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  function lierActionsCommandes(el) {
    el.querySelectorAll('[data-encaisser]').forEach(function (b) {
      b.onclick = function () { modaleEncaisser(b.getAttribute('data-encaisser')); };
    });
    el.querySelectorAll('[data-recu]').forEach(function (b) {
      b.onclick = function () {
        var c = S.data.commandes.find(function (x) { return x.id === b.getAttribute('data-recu'); });
        U.imprimer(recuHtml(c));
      };
    });
    el.querySelectorAll('[data-suppr-cmd]').forEach(function (b) {
      b.onclick = function () {
        var c = S.data.commandes.find(function (x) { return x.id === b.getAttribute('data-suppr-cmd'); });
        if (!U.confirmer('Supprimer la commande ' + c.numero + ' de ' + c.clientNom + ' ?\nLes livrets seront remis en stock.')) return;
        c.lignes.forEach(function (l) { var lv = S.livret(l.livretId); if (lv) lv.stock += Number(l.qte); });
        S.data.commandes = S.data.commandes.filter(function (x) { return x.id !== c.id; });
        S.enregistrer(); U.toast('Commande supprimée.'); App.rendre();
      };
    });
  }

  /* ---------- Modale : choisir les clients pour un livret ---------- */
  function modaleChoixClients(lid, preselection) {
    var l = S.livret(lid);
    var fidelesSeulement = false;
    var choix = preselection || {}; // clientId -> qte
    var corps = U.ouvrirModale(l.nom + ' — ' + argent(l.prix) + ' / unité', '', { large: true });

    function dessiner(filtre) {
      var clients = S.data.clients.slice().sort(function (a, b) { return nomClient(a).localeCompare(nomClient(b)); })
        .filter(function (c) {
          if (fidelesSeulement && !c.fidele) return false;
          if (!filtre) return true;
          return U.normaliser(nomClient(c) + ' ' + c.tel + ' ' + c.whatsapp).indexOf(U.normaliser(filtre)) >= 0;
        });
      var liste = clients.length ? clients.map(function (c) {
        var sel = choix[c.id] !== undefined;
        return '<label class="choix-client ' + (sel ? 'selectionne' : '') + '">' +
          '<input type="checkbox" data-choix="' + c.id + '"' + (sel ? ' checked' : '') + '>' +
          '<span class="choix-nom"><strong>' + esc(nomClient(c)) + '</strong> ' + badgeFidele(c) +
          '<small>' + esc(c.tel || '') + (c.whatsapp ? ' · WhatsApp ' + esc(c.whatsapp) : '') + '</small></span>' +
          '<span class="choix-qte">Qté <input type="number" min="1" value="' + (sel ? choix[c.id] : 1) + '" data-choix-qte="' + c.id + '"></span>' +
          '</label>';
      }).join('') : '<p class="vide">Aucun client trouvé.</p>';
      var nbSel = Object.keys(choix).length;
      var qteSel = Object.keys(choix).reduce(function (s, k) { return s + Number(choix[k]); }, 0);
      corps.querySelector('.liste-choix').innerHTML = liste;
      corps.querySelector('.resume-choix').innerHTML = nbSel + ' client(s) — ' + qteSel + ' livret(s) — ' + argent(qteSel * l.prix) +
        (qteSel > l.stock ? ' <span class="badge alerte">dépasse le stock (' + l.stock + ')</span>' : '');
      corps.querySelectorAll('[data-choix]').forEach(function (cb) {
        cb.onchange = function () {
          var cid = cb.getAttribute('data-choix');
          if (cb.checked) choix[cid] = Math.max(1, parseInt(corps.querySelector('[data-choix-qte="' + cid + '"]').value, 10) || 1);
          else delete choix[cid];
          dessiner(corps.querySelector('#filtre-clients').value);
        };
      });
      corps.querySelectorAll('[data-choix-qte]').forEach(function (i) {
        i.onclick = function (e) { e.stopPropagation(); };
        i.onchange = function () {
          var cid = i.getAttribute('data-choix-qte');
          choix[cid] = Math.max(1, parseInt(i.value, 10) || 1);
          dessiner(corps.querySelector('#filtre-clients').value);
        };
      });
    }

    corps.innerHTML =
      '<div class="barre-outils"><input type="search" id="filtre-clients" placeholder="Rechercher un client…">' +
      '<label class="interrupteur"><input type="checkbox" id="fideles-seul"> Clients fidèles uniquement</label>' +
      '<button class="btn" id="nouveau-client">+ Nouveau client</button></div>' +
      '<div class="liste-choix"></div>' +
      '<div class="modale-pied"><span class="resume-choix"></span>' +
      '<button class="btn principal" id="ajouter-panier">Ajouter à la commande</button></div>';

    if (!S.data.clients.length) {
      corps.querySelector('.liste-choix').innerHTML = '<p class="vide">Aucun client enregistré. Cliquez sur « + Nouveau client ».</p>';
    }
    dessiner('');
    corps.querySelector('#filtre-clients').oninput = function () { dessiner(this.value); };
    corps.querySelector('#fideles-seul').onchange = function () { fidelesSeulement = this.checked; dessiner(corps.querySelector('#filtre-clients').value); };
    corps.querySelector('#nouveau-client').onclick = function () {
      modaleClient(null, function (nouveau) {
        choix[nouveau.id] = 1;
        modaleChoixClients(lid, choix);
      }, function () { modaleChoixClients(lid, choix); });
    };
    corps.querySelector('#ajouter-panier').onclick = function () {
      var ids = Object.keys(choix);
      if (!ids.length) { U.toast('Sélectionnez au moins un client.', 'erreur'); return; }
      ids.forEach(function (cid) {
        if (!panier[cid]) panier[cid] = { lignes: {}, verse: '', toutPaye: true };
        panier[cid].lignes[lid] = (Number(panier[cid].lignes[lid]) || 0) + Number(choix[cid]);
      });
      U.fermerModale();
      App.rendre();
      U.toast(l.nom + ' ajouté pour ' + ids.length + ' client(s).');
    };
  }

  /* ---------- Validation de la commande ---------- */
  function validerPanier() {
    var cids = Object.keys(panier);
    // contrôle du stock
    var besoin = {};
    cids.forEach(function (cid) {
      Object.keys(panier[cid].lignes).forEach(function (lid) {
        besoin[lid] = (besoin[lid] || 0) + Number(panier[cid].lignes[lid]);
      });
    });
    var manques = Object.keys(besoin).filter(function (lid) { var l = S.livret(lid); return l && besoin[lid] > l.stock; })
      .map(function (lid) { var l = S.livret(lid); return '• ' + l.nom + ' : demandé ' + besoin[lid] + ', en stock ' + l.stock; });
    if (manques.length && !U.confirmer('Stock insuffisant :\n' + manques.join('\n') + '\n\nEnregistrer quand même ? (le stock deviendra négatif = à produire)')) return;

    var now = new Date().toISOString();
    var creees = [];
    cids.forEach(function (cid) {
      var r = calculPanierClient(cid);
      if (!r.lignes.length) return;
      var c = {
        id: S.id(), numero: S.prochainNumero(), date: now, clientId: cid, clientNom: nomClient(r.client),
        lignes: r.lignes.map(function (l) { return { livretId: l.livretId, nom: l.nom, prixUnit: l.prixUnit, qte: l.qte }; }),
        sousTotal: r.sousTotal, remise: r.remise, total: r.total,
        paiements: r.verse > 0 ? [{ date: now, montant: r.verse }] : []
      };
      r.lignes.forEach(function (l) { var lv = S.livret(l.livretId); lv.stock -= l.qte; });
      S.data.commandes.push(c);
      creees.push(c);
    });
    S.enregistrer();
    panier = {};
    App.rendre();
    modaleResultats(creees);
  }

  function modaleResultats(cmds) {
    var total = cmds.reduce(function (s, c) { return s + c.total; }, 0);
    var paye = cmds.reduce(function (s, c) { return s + S.paye(c); }, 0);
    var qte = cmds.reduce(function (s, c) { return s + S.qteTotale(c); }, 0);
    var h = '<div class="tuiles">' +
      U.tuile('Commandes', cmds.length) + U.tuile('Livrets', qte) +
      U.tuile('Montant total', argent(total)) + U.tuile('Encaissé', argent(paye), 'vert') +
      U.tuile('Reste à payer', argent(total - paye), total - paye > 0 ? 'rouge' : '') + '</div>' +
      '<h3>Montant par client</h3>' +
      U.barres(cmds.map(function (c) {
        var r = S.reste(c);
        return { label: c.clientNom, valeur: c.total, info: r ? 'reste ' + argent(r) : 'payé' };
      })) +
      '<table class="tableau compact"><thead><tr><th>N° reçu</th><th>Client</th><th class="num">Total</th><th class="num">Payé</th><th class="num">Reste</th><th></th></tr></thead><tbody>' +
      cmds.map(function (c) {
        return '<tr><td>' + c.numero + '</td><td>' + esc(c.clientNom) + '</td><td class="num">' + argent(c.total) + '</td>' +
          '<td class="num">' + argent(S.paye(c)) + '</td><td class="num">' + argent(S.reste(c)) + '</td>' +
          '<td><button class="btn petit" data-recu-res="' + c.id + '">🖨 Reçu</button></td></tr>';
      }).join('') + '</tbody></table>' +
      '<div class="modale-pied"><span>Enregistré le ' + U.dateHeure(cmds[0] ? cmds[0].date : '') + '</span>' +
      '<button class="btn principal" id="tous-recus">🖨 Imprimer tous les reçus</button></div>';
    var corps = U.ouvrirModale('Commandes enregistrées ✔', h, { large: true });
    corps.querySelectorAll('[data-recu-res]').forEach(function (b) {
      b.onclick = function () {
        U.imprimer(recuHtml(cmds.find(function (c) { return c.id === b.getAttribute('data-recu-res'); })));
      };
    });
    corps.querySelector('#tous-recus').onclick = function () {
      U.imprimer(cmds.map(recuHtml).join('<div class="saut-page"></div>'));
    };
  }

  /* ---------- Encaissement d'un reste à payer ---------- */
  function modaleEncaisser(cid) {
    var c = S.data.commandes.find(function (x) { return x.id === cid; });
    var reste = S.reste(c);
    var hist = (c.paiements || []).map(function (p) {
      return '<li>' + U.dateHeure(p.date) + ' : ' + argent(p.montant) + '</li>';
    }).join('');
    var corps = U.ouvrirModale('Encaisser — ' + c.clientNom + ' (' + c.numero + ')',
      '<p>Total : <strong>' + argent(c.total) + '</strong> — déjà payé : <strong>' + argent(S.paye(c)) + '</strong> — reste : <strong class="rouge">' + argent(reste) + '</strong></p>' +
      (hist ? '<p>Paiements précédents :</p><ul class="liste-simple">' + hist + '</ul>' : '') +
      '<form class="formulaire"><label>Montant reçu<input type="number" name="montant" min="1" max="' + reste + '" value="' + reste + '" required></label>' +
      '<label>Date et heure<input type="datetime-local" name="date" value="' + U.pourInput() + '"></label>' +
      '<label class="ligne-case"><input type="checkbox" name="imprimer" checked> Imprimer le reçu après</label>' +
      '<div class="modale-pied"><span></span><button class="btn principal" type="submit">Enregistrer le paiement</button></div></form>');
    corps.querySelector('form').onsubmit = function (e) {
      e.preventDefault();
      var v = U.lireForm(this);
      var m = Math.min(reste, Number(v.montant) || 0);
      if (m <= 0) return;
      c.paiements.push({ date: U.depuisInput(v.date), montant: m });
      S.enregistrer();
      U.fermerModale();
      U.toast(S.reste(c) ? 'Paiement enregistré. Reste : ' + argent(S.reste(c)) : 'Commande entièrement payée.');
      App.rendre();
      if (v.imprimer) U.imprimer(recuHtml(c));
    };
  }

  /* ---------- Reçu imprimable ---------- */
  function recuHtml(c) {
    var cl = S.client(c.clientId);
    var reste = S.reste(c);
    return '<div class="recu">' + U.entete() +
      '<h2 class="imp-titre">REÇU N° ' + esc(c.numero) + '</h2>' +
      '<div class="recu-infos"><div><strong>Client :</strong> ' + esc(c.clientNom) +
      (cl && cl.tel ? '<br><strong>Tél :</strong> ' + esc(cl.tel) : '') +
      (cl && cl.whatsapp ? '<br><strong>WhatsApp :</strong> ' + esc(cl.whatsapp) : '') + '</div>' +
      '<div><strong>Date :</strong> ' + U.dateHeure(c.date) + '</div></div>' +
      '<table class="imp-table"><thead><tr><th>Livret</th><th class="num">Prix unité</th><th class="num">Qté</th><th class="num">Montant</th></tr></thead><tbody>' +
      c.lignes.map(function (l) {
        return '<tr><td>' + esc(l.nom) + '</td><td class="num">' + argent(l.prixUnit) + '</td><td class="num">' + l.qte + '</td><td class="num">' + argent(l.prixUnit * l.qte) + '</td></tr>';
      }).join('') + '</tbody><tfoot>' +
      '<tr><td colspan="3">Sous-total</td><td class="num">' + argent(c.sousTotal) + '</td></tr>' +
      (c.remise ? '<tr><td colspan="3">Réduction client fidèle</td><td class="num">- ' + argent(c.remise) + '</td></tr>' : '') +
      '<tr class="fort"><td colspan="3">TOTAL</td><td class="num">' + argent(c.total) + '</td></tr>' +
      (c.paiements || []).map(function (p) {
        return '<tr><td colspan="3">Versé le ' + U.dateHeure(p.date) + '</td><td class="num">' + argent(p.montant) + '</td></tr>';
      }).join('') +
      '<tr class="fort"><td colspan="3">' + (reste ? 'RESTE À PAYER' : 'SOLDÉ — somme totale payée') + '</td><td class="num">' + argent(reste) + '</td></tr>' +
      '</tfoot></table>' +
      '<div class="recu-statut ' + (reste ? 'reste' : 'ok') + '">' + (reste ? 'Reste à payer : ' + argent(reste) : 'Payé intégralement') + '</div>' +
      '<div class="signatures"><div>Signature client</div><div>Cachet et signature</div></div>' +
      '<p class="imp-merci">Merci pour votre confiance.</p></div>';
  }

  /* =========================================================
     PAGE : CLIENTS
     ========================================================= */
  var rechercheClient = '';
  function pageClients(el) {
    var d = S.data;
    var clients = d.clients.slice().sort(function (a, b) { return nomClient(a).localeCompare(nomClient(b)); })
      .filter(function (c) {
        return !rechercheClient || U.normaliser(nomClient(c) + ' ' + c.tel + ' ' + c.whatsapp + ' ' + c.email).indexOf(U.normaliser(rechercheClient)) >= 0;
      });
    var h = '<div class="page-tete"><div><h1>Clients</h1><p class="sous">' + d.clients.length + ' client(s) dont ' +
      d.clients.filter(function (c) { return c.fidele; }).length + ' fidèle(s).</p></div>' +
      '<button class="btn principal" id="ajout-client">+ Ajouter un client</button></div>';
    h += '<section class="carte"><div class="carte-tete"><h2>Liste des clients</h2><div class="filtres">' +
      '<input type="search" id="recherche-client" placeholder="Rechercher…" value="' + esc(rechercheClient) + '"></div></div>';
    if (!clients.length) h += '<p class="vide">Aucun client.</p>';
    else {
      h += '<div class="defile"><table class="tableau"><thead><tr><th>Nom</th><th>Prénom</th><th>Téléphone</th><th>WhatsApp</th><th>Gmail</th><th>Fidélité</th><th class="num">Commandes</th><th class="num">Doit</th><th></th></tr></thead><tbody>' +
        clients.map(function (c) {
          var cmds = d.commandes.filter(function (x) { return x.clientId === c.id; });
          var doit = cmds.reduce(function (s, x) { return s + S.reste(x); }, 0);
          var wa = (c.whatsapp || '').replace(/[^0-9]/g, '');
          return '<tr><td><strong>' + esc(c.nom) + '</strong></td><td>' + esc(c.prenom) + '</td><td>' + esc(c.tel) + '</td>' +
            '<td>' + (wa ? '<a href="https://wa.me/' + wa + '" target="_blank" rel="noopener">' + esc(c.whatsapp) + '</a>' : '') + '</td>' +
            '<td>' + esc(c.email || '') + '</td><td>' + (c.fidele ? badgeFidele(c) : '<span class="gris">—</span>') + '</td>' +
            '<td class="num">' + cmds.length + '</td><td class="num ' + (doit ? 'rouge' : '') + '">' + argent(doit) + '</td>' +
            '<td class="actions"><button class="btn petit" data-modif-client="' + c.id + '">Modifier</button>' +
            '<button class="btn-icone" data-suppr-client="' + c.id + '" title="Supprimer">🗑</button></td></tr>';
        }).join('') + '</tbody></table></div>';
    }
    h += '</section>';
    el.innerHTML = h;

    el.querySelector('#ajout-client').onclick = function () { modaleClient(null, function () { App.rendre(); }); };
    var r = el.querySelector('#recherche-client');
    r.oninput = function () {
      rechercheClient = r.value; var pos = r.selectionStart; App.rendre();
      var r2 = document.getElementById('recherche-client'); r2.focus(); r2.setSelectionRange(pos, pos);
    };
    el.querySelectorAll('[data-modif-client]').forEach(function (b) {
      b.onclick = function () { modaleClient(S.client(b.getAttribute('data-modif-client')), function () { App.rendre(); }); };
    });
    el.querySelectorAll('[data-suppr-client]').forEach(function (b) {
      b.onclick = function () {
        var c = S.client(b.getAttribute('data-suppr-client'));
        if (!U.confirmer('Supprimer le client ' + nomClient(c) + ' ?\n(Ses commandes passées restent dans l\'historique.)')) return;
        d.clients = d.clients.filter(function (x) { return x.id !== c.id; });
        delete panier[c.id];
        S.enregistrer(); U.toast('Client supprimé.'); App.rendre();
      };
    });
  }

  function modaleClient(c, apres, annuler) {
    var nouveau = !c;
    c = c || { nom: '', prenom: '', tel: '', whatsapp: '', email: '', fidele: false, remiseType: 'pourcent', remiseValeur: '' };
    var corps = U.ouvrirModale(nouveau ? 'Nouveau client' : 'Modifier le client',
      '<form class="formulaire grille2">' +
      '<label>Nom *<input name="nom" required value="' + esc(c.nom) + '"></label>' +
      '<label>Prénom *<input name="prenom" required value="' + esc(c.prenom) + '"></label>' +
      '<label>Numéro de téléphone *<input name="tel" type="tel" required value="' + esc(c.tel) + '"></label>' +
      '<label>Numéro WhatsApp<input name="whatsapp" type="tel" value="' + esc(c.whatsapp) + '" placeholder="ex : 22501020304"></label>' +
      '<label class="plein">Gmail (optionnel)<input name="email" type="email" value="' + esc(c.email || '') + '"></label>' +
      '<fieldset class="plein"><legend><label class="ligne-case"><input type="checkbox" name="fidele"' + (c.fidele ? ' checked' : '') + '> Client fidèle (bénéficie d\'une réduction)</label></legend>' +
      '<div class="grille2 zone-remise">' +
      '<label>Type de réduction<select name="remiseType">' +
      '<option value="pourcent"' + (c.remiseType !== 'montant' ? ' selected' : '') + '>Pourcentage (%)</option>' +
      '<option value="montant"' + (c.remiseType === 'montant' ? ' selected' : '') + '>Montant par livret (' + esc(S.data.parametres.devise) + ')</option></select></label>' +
      '<label>Valeur de la réduction<input name="remiseValeur" type="number" min="0" step="any" value="' + esc(c.remiseValeur) + '"></label>' +
      '</div></fieldset>' +
      '<div class="modale-pied plein"><button type="button" class="btn discret" id="annuler-client">Annuler</button><button class="btn principal" type="submit">Enregistrer</button></div></form>');
    var form = corps.querySelector('form');
    function majRemise() { corps.querySelector('.zone-remise').classList.toggle('desactive', !form.fidele.checked); }
    form.fidele.onchange = majRemise; majRemise();
    corps.querySelector('#annuler-client').onclick = function () { U.fermerModale(); if (annuler) annuler(); };
    form.onsubmit = function (e) {
      e.preventDefault();
      var v = U.lireForm(form);
      if (v.remiseType === 'pourcent' && Number(v.remiseValeur) > 100) { U.toast('Le pourcentage ne peut pas dépasser 100.', 'erreur'); return; }
      var cible = nouveau ? { id: S.id(), creeLe: new Date().toISOString() } : c;
      cible.nom = v.nom; cible.prenom = v.prenom; cible.tel = v.tel; cible.whatsapp = v.whatsapp; cible.email = v.email;
      cible.fidele = v.fidele; cible.remiseType = v.remiseType; cible.remiseValeur = Number(v.remiseValeur) || 0;
      if (nouveau) S.data.clients.push(cible);
      // met à jour le nom sur les commandes existantes
      S.data.commandes.forEach(function (x) { if (x.clientId === cible.id) x.clientNom = nomClient(cible); });
      S.enregistrer();
      U.fermerModale();
      U.toast(nouveau ? 'Client ajouté.' : 'Client modifié.');
      if (apres) apres(cible);
    };
  }

  /* =========================================================
     PAGE : LIVRETS
     ========================================================= */
  function pageLivrets(el) {
    var d = S.data;
    var valeurStock = d.livrets.reduce(function (s, l) { return s + Math.max(0, l.stock) * l.prix; }, 0);
    var h = '<div class="page-tete"><div><h1>Livrets</h1><p class="sous">' + d.livrets.length + ' livret(s) — valeur du stock : ' + argent(valeurStock) + '</p></div>' +
      '<button class="btn principal" id="ajout-livret">+ Ajouter un livret</button></div>';
    h += '<section class="carte"><h2>Catalogue et stock</h2>';
    if (!d.livrets.length) h += '<p class="vide">Aucun livret. Cliquez sur « + Ajouter un livret ».</p>';
    else {
      h += '<div class="defile"><table class="tableau"><thead><tr><th>Livret</th><th>Description</th><th class="num">Prix unité</th><th class="num">Stock</th><th class="num">Vendus</th><th></th></tr></thead><tbody>' +
        d.livrets.map(function (l) {
          var vendus = d.commandes.reduce(function (s, c) {
            return s + c.lignes.filter(function (x) { return x.livretId === l.id; }).reduce(function (a, x) { return a + Number(x.qte); }, 0);
          }, 0);
          var cls = l.stock <= 0 ? 'rupture' : (l.stock < 10 ? 'faible' : '');
          return '<tr><td><strong>' + esc(l.nom) + '</strong></td><td>' + esc(l.description || '') + '</td>' +
            '<td class="num">' + argent(l.prix) + '</td><td class="num"><span class="stock ' + cls + '">' + l.stock + '</span></td>' +
            '<td class="num">' + vendus + '</td>' +
            '<td class="actions"><button class="btn petit" data-stock="' + l.id + '">+ Stock</button>' +
            '<button class="btn petit" data-modif-livret="' + l.id + '">Modifier</button>' +
            '<button class="btn-icone" data-suppr-livret="' + l.id + '" title="Supprimer">🗑</button></td></tr>';
        }).join('') + '</tbody></table></div>';
    }
    h += '</section>';
    el.innerHTML = h;

    el.querySelector('#ajout-livret').onclick = function () { modaleLivret(null); };
    el.querySelectorAll('[data-modif-livret]').forEach(function (b) {
      b.onclick = function () { modaleLivret(S.livret(b.getAttribute('data-modif-livret'))); };
    });
    el.querySelectorAll('[data-stock]').forEach(function (b) {
      b.onclick = function () {
        var l = S.livret(b.getAttribute('data-stock'));
        var corps = U.ouvrirModale('Ajouter du stock — ' + l.nom,
          '<form class="formulaire"><p>Stock actuel : <strong>' + l.stock + '</strong></p>' +
          '<label>Quantité imprimée / ajoutée<input type="number" name="qte" min="1" required></label>' +
          '<div class="modale-pied"><span></span><button class="btn principal">Ajouter</button></div></form>');
        corps.querySelector('form').onsubmit = function (e) {
          e.preventDefault();
          l.stock += parseInt(this.qte.value, 10) || 0;
          S.enregistrer(); U.fermerModale(); U.toast('Stock mis à jour : ' + l.stock); App.rendre();
        };
      };
    });
    el.querySelectorAll('[data-suppr-livret]').forEach(function (b) {
      b.onclick = function () {
        var l = S.livret(b.getAttribute('data-suppr-livret'));
        if (!U.confirmer('Supprimer le livret « ' + l.nom + ' » ?\n(Les commandes passées restent dans l\'historique.)')) return;
        d.livrets = d.livrets.filter(function (x) { return x.id !== l.id; });
        Object.keys(panier).forEach(function (cid) { delete panier[cid].lignes[l.id]; });
        S.enregistrer(); U.toast('Livret supprimé.'); App.rendre();
      };
    });
  }

  function modaleLivret(l) {
    var nouveau = !l;
    l = l || { nom: '', prix: '', stock: '', description: '' };
    var corps = U.ouvrirModale(nouveau ? 'Nouveau livret' : 'Modifier le livret',
      '<form class="formulaire grille2">' +
      '<label class="plein">Nom du livret *<input name="nom" required value="' + esc(l.nom) + '"></label>' +
      '<label>Prix à l\'unité (' + esc(S.data.parametres.devise) + ') *<input name="prix" type="number" min="0" step="any" required value="' + esc(l.prix) + '"></label>' +
      '<label>Quantité en stock *<input name="stock" type="number" step="1" required value="' + esc(l.stock) + '"></label>' +
      '<label class="plein">Description (optionnel)<input name="description" value="' + esc(l.description || '') + '"></label>' +
      '<div class="modale-pied plein"><span></span><button class="btn principal" type="submit">Enregistrer</button></div></form>');
    corps.querySelector('form').onsubmit = function (e) {
      e.preventDefault();
      var v = U.lireForm(this);
      var cible = nouveau ? { id: S.id() } : l;
      cible.nom = v.nom; cible.prix = Number(v.prix) || 0; cible.stock = parseInt(v.stock, 10) || 0; cible.description = v.description;
      if (nouveau) S.data.livrets.push(cible);
      S.enregistrer(); U.fermerModale(); U.toast(nouveau ? 'Livret ajouté.' : 'Livret modifié.'); App.rendre();
    };
  }

  /* =========================================================
     PAGE : BILAN DES COMMANDES
     ========================================================= */
  function resumeCommandes(cmds) {
    var r = { nb: cmds.length, qte: 0, brut: 0, remises: 0, total: 0, encaisse: 0, reste: 0, parLivret: {}, parClient: {} };
    cmds.forEach(function (c) {
      r.qte += S.qteTotale(c); r.brut += c.sousTotal; r.remises += c.remise; r.total += c.total;
      r.encaisse += S.paye(c); r.reste += S.reste(c);
      c.lignes.forEach(function (l) {
        var k = l.nom;
        if (!r.parLivret[k]) r.parLivret[k] = { qte: 0, montant: 0 };
        r.parLivret[k].qte += Number(l.qte); r.parLivret[k].montant += l.prixUnit * l.qte;
      });
      if (!r.parClient[c.clientNom]) r.parClient[c.clientNom] = 0;
      r.parClient[c.clientNom] += c.total;
    });
    return r;
  }

  function contenuBilanCommandes(cmds, r) {
    var livrets = Object.keys(r.parLivret).map(function (k) { return { label: k, valeur: r.parLivret[k].montant, qte: r.parLivret[k].qte }; })
      .sort(function (a, b) { return b.valeur - a.valeur; });
    var clients = Object.keys(r.parClient).map(function (k) { return { label: k, valeur: r.parClient[k] }; })
      .sort(function (a, b) { return b.valeur - a.valeur; }).slice(0, 10);
    return {
      tuiles: '<div class="tuiles">' +
        U.tuile('Commandes', r.nb) + U.tuile('Livrets vendus', r.qte) +
        U.tuile('Chiffre d\'affaires', argent(r.total), '', r.remises ? 'dont ' + argent(r.remises) + ' de réductions' : '') +
        U.tuile('Encaissé', argent(r.encaisse), 'vert') +
        U.tuile('Reste à payer', argent(r.reste), r.reste ? 'rouge' : '') + '</div>',
      livrets: livrets, clients: clients
    };
  }

  function pageBilan(el) {
    var d = S.data;
    var cmds = U.filtrerPeriode(d.commandes, etat.periodeBilan).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    var r = resumeCommandes(cmds);
    var c = contenuBilanCommandes(cmds, r);
    var h = '<div class="page-tete"><div><h1>Bilan des commandes</h1><p class="sous">' + esc(U.libellePeriode(etat.periodeBilan)) + '</p></div>' +
      '<div class="filtres"><select id="periode-bilan">' + U.optionsPeriode(d.commandes, etat.periodeBilan, true, 'commandes') + '</select>' +
      '<button class="btn" id="imp-bilan">🖨 Imprimer</button>' +
      (etat.periodeBilan === 'encours' ? '<button class="btn principal" id="archiver-bilan">📦 Faire le point et archiver</button>' : '') +
      '</div></div>';
    h += c.tuiles;
    h += '<div class="deux-colonnes"><section class="carte"><h2>Ventes par livret</h2>' +
      U.barres(c.livrets.map(function (x) { return { label: x.label, valeur: x.valeur, info: x.qte + ' exemplaire(s)' }; })) + '</section>' +
      '<section class="carte"><h2>Meilleurs clients</h2>' + U.barres(c.clients) + '</section></div>';
    h += '<section class="carte"><h2>Détail des commandes (' + cmds.length + ')</h2>' +
      (cmds.length ? tableauCommandes(cmds.slice().reverse(), false) : '<p class="vide">Aucune commande pour cette période.</p>') + '</section>';
    h += '<section class="carte"><h2>Bilans archivés</h2>' +
      Archives.tableau('commandes', [{ label: 'Chiffre d\'affaires', cle: 'total' }, { label: 'Encaissé', cle: 'encaisse' }, { label: 'Reste', cle: 'reste' }]) + '</section>';
    el.innerHTML = h;

    el.querySelector('#periode-bilan').onchange = function () { etat.periodeBilan = this.value; App.rendre(); };
    el.querySelector('#imp-bilan').onclick = function () { U.imprimer(impressionBilan(cmds, r, U.libellePeriode(etat.periodeBilan))); };
    var ba = el.querySelector('#archiver-bilan');
    if (ba) ba.onclick = function () {
      if (!cmds.length) { U.toast('Aucune commande à archiver.', 'erreur'); return; }
      var titre = prompt('Nom de ce bilan (ex : Bilan novembre 2026) :', 'Bilan du ' + U.dateCourte(new Date().toISOString()));
      if (!titre) return;
      var a = Archives.archiver('commandes', 'commandes', titre, { nb: r.nb, qte: r.qte, total: r.total, encaisse: r.encaisse, reste: r.reste });
      if (a) { U.toast('Bilan archivé. Une nouvelle période commence.'); App.rendre(); }
    };
    lierArchives(el, function (v) { etat.periodeBilan = v; });
    lierActionsCommandes(el);
  }

  function lierArchives(el, choisir) {
    el.querySelectorAll('[data-voir-archive]').forEach(function (b) {
      b.onclick = function () { choisir('arch:' + b.getAttribute('data-voir-archive')); App.rendre(); window.scrollTo(0, 0); };
    });
    el.querySelectorAll('[data-desarchiver]').forEach(function (b) {
      b.onclick = function () {
        if (!U.confirmer('Désarchiver ce bilan ? Ses éléments reviendront dans la période en cours.')) return;
        Archives.desarchiver(b.getAttribute('data-desarchiver'));
        choisir('encours'); App.rendre();
      };
    });
  }
  Archives.lier = lierArchives;

  function impressionBilan(cmds, r, periode) {
    return '<div class="rapport">' + U.entete() + '<h2 class="imp-titre">BILAN DES COMMANDES — ' + esc(periode) + '</h2>' +
      '<table class="imp-table resume"><tbody>' +
      '<tr><td>Nombre de commandes</td><td class="num">' + r.nb + '</td></tr>' +
      '<tr><td>Livrets vendus</td><td class="num">' + r.qte + '</td></tr>' +
      '<tr><td>Montant brut</td><td class="num">' + argent(r.brut) + '</td></tr>' +
      '<tr><td>Réductions fidélité</td><td class="num">- ' + argent(r.remises) + '</td></tr>' +
      '<tr class="fort"><td>Chiffre d\'affaires</td><td class="num">' + argent(r.total) + '</td></tr>' +
      '<tr><td>Encaissé</td><td class="num">' + argent(r.encaisse) + '</td></tr>' +
      '<tr class="fort"><td>Reste à payer</td><td class="num">' + argent(r.reste) + '</td></tr></tbody></table>' +
      '<h3>Ventes par livret</h3><table class="imp-table"><thead><tr><th>Livret</th><th class="num">Quantité</th><th class="num">Montant</th></tr></thead><tbody>' +
      Object.keys(r.parLivret).map(function (k) {
        return '<tr><td>' + esc(k) + '</td><td class="num">' + r.parLivret[k].qte + '</td><td class="num">' + argent(r.parLivret[k].montant) + '</td></tr>';
      }).join('') + '</tbody></table>' +
      '<h3>Détail des commandes</h3><table class="imp-table"><thead><tr><th>N°</th><th>Date</th><th>Client</th><th>Livrets</th><th class="num">Total</th><th class="num">Payé</th><th class="num">Reste</th></tr></thead><tbody>' +
      cmds.map(function (c) {
        return '<tr><td>' + esc(c.numero) + '</td><td>' + U.dateHeure(c.date) + '</td><td>' + esc(c.clientNom) + '</td><td>' +
          c.lignes.map(function (l) { return esc(l.nom) + ' ×' + l.qte; }).join(', ') + '</td><td class="num">' + argent(c.total) +
          '</td><td class="num">' + argent(S.paye(c)) + '</td><td class="num">' + argent(S.reste(c)) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  window.Commandes = {
    pageCommande: pageCommande,
    pageClients: pageClients,
    pageLivrets: pageLivrets,
    pageBilan: pageBilan,
    resume: resumeCommandes,
    panierNonVide: function () { return Object.keys(panier).length > 0; }
  };
})();
