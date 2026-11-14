# CBZ Gestion — application interne de l'imprimerie

Application pour faire le point des dépenses du mois et suivre les commandes de livrets de prières.
Elle fonctionne **sans Internet et sans installation** : il suffit d'un navigateur (Google Chrome ou Microsoft Edge).

## Installer sur le PC de la secrétaire

1. Copier tout le dossier (`index.html`, `css/`, `js/`) sur le PC, par exemple dans `Documents\CBZ Gestion`.
2. Double-cliquer sur `index.html` : l'application s'ouvre dans le navigateur.
3. Créer un raccourci sur le bureau : clic droit sur `index.html` → *Envoyer vers* → *Bureau (créer un raccourci)*.

> Toujours ouvrir l'application **avec le même navigateur** et **depuis le même dossier** : les données sont
> enregistrées dans ce navigateur, sur ce PC.

## Les 4 catégories

| Catégorie | Contenu |
|---|---|
| **1. Commande entreprise** | **Commande** : les livrets (prix à l'unité et stock). On clique sur un livret, on choisit les clients et la quantité, on indique s'ils ont tout payé ou combien ils ont versé. Après validation : résumé visuel et reçus à imprimer. La liste « Reste à payer » montre qui doit combien (date et heure enregistrées) et permet d'encaisser la suite.<br>**Clients** : ajout, modification, suppression (nom, prénom, téléphone, WhatsApp, Gmail optionnel). Un client fidèle reçoit une réduction en pourcentage ou en montant par livret.<br>**Livrets** : ajout, modification, suppression, prix à l'unité, stock et réapprovisionnement.<br>**Bilan** : chiffre d'affaires, encaissé, reste à payer, ventes par livret, meilleurs clients. Bouton « Faire le point et archiver » pour clôturer une période ; les bilans archivés restent consultables. |
| **2. Dépense entreprise** | **Dépense consommable**, **Autre dépense** (date et heure enregistrées automatiquement) et **Bilan** (total, répartition, évolution par mois, archivage). |
| **3. Dépense maison** | **Dépense** : nom, prénom, dépense, montant, but, date et heure. **Bilan** : par personne, par but, par mois. |
| **4. Bilan total** | Entrées (sommes encaissées), toutes les dépenses, **salaires des employés**, **économies** et **investissements**, et **ce qui reste**. Bouton pour imprimer le bilan complet. |

Chaque liste et chaque bilan peut être filtré par mois et imprimé (ou enregistré en PDF depuis la fenêtre d'impression).

## Sauvegarde (important)

Dans **Paramètres et sauvegarde** :

- **Télécharger une sauvegarde** crée un fichier `.json` avec toutes les données. Le copier chaque semaine sur une clé USB ou sur Google Drive.
- **Restaurer une sauvegarde** recharge un de ces fichiers (par exemple sur un nouveau PC).

Un bandeau orange rappelle de sauvegarder quand la dernière sauvegarde a plus de 7 jours.

Dans Paramètres, on règle aussi le nom de l'imprimerie, l'adresse, le téléphone et la monnaie (affichés sur les reçus).
