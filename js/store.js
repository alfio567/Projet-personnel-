/* =========================================================
   CBZ Gestion — stockage des données (localStorage)
   Toutes les données restent sur ce PC, dans le navigateur.
   ========================================================= */
(function () {
  'use strict';

  var CLE = 'cbz-gestion-v1';

  function vide() {
    return {
      version: 1,
      parametres: {
        entreprise: 'CBZ Imprimerie',
        slogan: 'Livrets de prières',
        adresse: '',
        telephone: '',
        devise: 'F',
        derniereSauvegarde: null
      },
      compteurs: { recu: 0 },
      livrets: [],          // {id, nom, prix, stock, description}
      clients: [],          // {id, nom, prenom, tel, whatsapp, email, fidele, remiseType, remiseValeur, creeLe}
      commandes: [],        // {id, numero, date, clientId, clientNom, lignes[], sousTotal, remise, total, paiements[], archive}
      depensesEntreprise: [], // {id, type:'consommable'|'autre', libelle, montant, date, note, archive}
      depensesMaison: [],   // {id, nom, prenom, libelle, montant, but, date, archive}
      employes: [],         // {id, nom, prenom, poste, salaire}
      salaires: [],         // {id, employeId, nom, mois:'AAAA-MM', montant, date}
      epargnes: [],         // {id, type:'economie'|'investissement', libelle, montant, date, note}
      archives: []          // {id, module, date, titre, du, au, resume{}, ids[]}
    };
  }

  function charger() {
    try {
      var brut = localStorage.getItem(CLE);
      if (!brut) return vide();
      var d = JSON.parse(brut);
      var base = vide();
      // fusion pour ajouter les champs manquants (anciennes versions)
      Object.keys(base).forEach(function (k) {
        if (d[k] === undefined) d[k] = base[k];
      });
      Object.keys(base.parametres).forEach(function (k) {
        if (d.parametres[k] === undefined) d.parametres[k] = base.parametres[k];
      });
      return d;
    } catch (e) {
      console.error(e);
      alert("Impossible de lire les données enregistrées. Restaurez une sauvegarde depuis Paramètres.");
      return vide();
    }
  }

  var data = charger();

  function enregistrer() {
    try {
      localStorage.setItem(CLE, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error(e);
      alert("Erreur : les données n'ont pas pu être enregistrées (" + e.message + ").");
      return false;
    }
  }

  function id() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /* ---------- Calculs commandes ---------- */
  function paye(c) {
    return (c.paiements || []).reduce(function (s, p) { return s + Number(p.montant || 0); }, 0);
  }
  function reste(c) {
    return Math.max(0, Math.round(c.total - paye(c)));
  }
  function qteTotale(c) {
    return c.lignes.reduce(function (s, l) { return s + Number(l.qte); }, 0);
  }

  // remise d'un client fidèle pour un sous-total et une quantité
  function calculRemise(client, sousTotal, qte) {
    if (!client || !client.fidele) return 0;
    var v = Number(client.remiseValeur || 0);
    var r = client.remiseType === 'montant' ? v * qte : sousTotal * v / 100;
    return Math.min(sousTotal, Math.round(r));
  }

  window.Store = {
    get data() { return data; },
    enregistrer: enregistrer,
    id: id,
    paye: paye,
    reste: reste,
    qteTotale: qteTotale,
    calculRemise: calculRemise,
    remplacer: function (nouvelles) {
      var base = vide();
      Object.keys(base).forEach(function (k) {
        if (nouvelles[k] === undefined) nouvelles[k] = base[k];
      });
      data = nouvelles;
      enregistrer();
    },
    reinitialiser: function () {
      data = vide();
      enregistrer();
    },
    prochainNumero: function () {
      data.compteurs.recu = (data.compteurs.recu || 0) + 1;
      return 'R' + String(data.compteurs.recu).padStart(5, '0');
    },
    client: function (cid) {
      return data.clients.find(function (c) { return c.id === cid; });
    },
    livret: function (lid) {
      return data.livrets.find(function (l) { return l.id === lid; });
    }
  };
})();
