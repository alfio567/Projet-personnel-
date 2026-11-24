// Contenu du rapport, partie par partie.
// Types de blocs : h1, h2, h3, p, ul, img, pair, table, todo.
// Dans le texte, **gras** est mis en gras.
// Les blocs "todo" apparaissent surlignés en jaune : infos qui manquent encore.

module.exports = [
  // ============================================================
  { t: "h1", text: "1. Contexte du stage : présentation d'ODHE Groupe" },
  { t: "todo", text: "À COMPLÉTER avec les réponses de Yannis AKAKPOVI : historique (création de Dasco Communication, passage à ODHE Groupe), organigramme, domaine et secteur d'activité, positionnement sur le marché, département de travail (tuteur, poste et missions, collègues et objectifs de l'équipe)." },

  // ============================================================
  { t: "h1", text: "2. Missions prévues" },

  { t: "h2", text: "2.1 Les tâches confiées" },
  { t: "p", text: "À Epitech, le stage de deuxième année n'impose pas de sujet défini à l'avance : ce sont les besoins de l'entreprise d'accueil qui fixent les missions. Chez ODHE Groupe, j'ai été intégré au pôle « Digital et solutions technologiques », dans le service de développement de sites web, en tant que développeur web full stack stagiaire." },
  { t: "p", text: "Les missions qui m'ont été confiées étaient les suivantes :" },
  { t: "ul", items: [
    "participer, en binôme, au développement de deux plateformes web : **TopSender** et **AlloMairie**, devenue **allo.bj** ;",
    "concevoir et développer la partie serveur (backend) de ces applications : base de données, API et sécurité des comptes ;",
    "contribuer à la partie visible (frontend), en reliant les pages à l'API ;",
    "mettre les applications en ligne afin qu'elles puissent être testées.",
  ] },

  { t: "h2", text: "2.2 Lien entre mes tâches et l'entreprise" },
  { t: "p", text: "**Impact sur l'entreprise.** ODHE Groupe propose à ses clients des sites, des applications et des outils numériques sur mesure. TopSender et AlloMairie sont deux projets de son pôle digital. Le backend en est le cœur : c'est lui qui stocke les données, applique les règles de fonctionnement et sécurise les accès. Sans lui, les interfaces ne peuvent pas fonctionner." },
  { t: "p", text: "**Méthodologie de travail.** Je travaillais en binôme avec Falonne EDAH, sous la supervision de mon tuteur, Yannis AKAKPOVI. Pour chaque projet, nous commencions par définir ensemble l'architecture du code (les modules, la base de données et les routes de l'API), puis nous nous répartissions le travail. Sur TopSender, l'organisation suivait des règles précises : une branche Git par tâche, une demande de fusion (pull request) relue avant d'être acceptée, et un découpage du code par module pour éviter que deux personnes modifient le même fichier en même temps." },
  { t: "p", text: "**Outils utilisés.** Le tableau ci-dessous résume les principaux outils utilisés pendant le stage.", keepNext: true },
  { t: "table", widths: [2272, 3400, 3400], headers: ["Domaine", "TopSender", "AlloMairie"], rows: [
    ["Backend", "Python, Django, Django REST Framework", "Node.js, Express, Prisma"],
    ["Sécurité", "Jetons JWT, codes OTP", "Jetons JWT, bcrypt, limitation des requêtes"],
    ["Base de données", "PostgreSQL (Supabase)", "PostgreSQL (Supabase)"],
    ["Frontend", "React, Vite, Tailwind CSS", "React, Vite, Recharts"],
    ["Services externes", "FedaPay (mobile money), Brevo (e-mails)", "Nodemailer (e-mails)"],
    ["Mise en ligne", "Render, Gunicorn, Docker", "Render (API), Vercel (site)"],
    ["Travail en équipe", "Git, GitHub, pull requests", "Git, GitHub"],
  ], caption: "Tableau 1 : outils utilisés sur les deux projets" },
  { t: "p", text: "**Impact de mon travail sur l'avancement.** Le backend devait être prêt pour que les pages puissent afficher de vraies données. En livrant l'architecture du serveur dès la troisième semaine de stage, puis les routes de l'API module par module, j'ai permis à l'équipe de brancher les pages au fur et à mesure. La mise en ligne sur Render a ensuite permis à toute l'équipe de tester l'application dans des conditions réelles." },

  // ============================================================
  { t: "h1", text: "3. Travail effectué" },

  { t: "h2", text: "3.1 TopSender" },
  { t: "h3", text: "Présentation du projet" },
  { t: "p", text: "TopSender est une plateforme de campagnes publicitaires. Elle met en relation deux types d'utilisateurs : les **annonceurs**, qui achètent un pack et lancent des campagnes par SMS, par e-mail ou sur les réseaux sociaux, et les **diffuseurs**, qui partagent ces campagnes, envoient une preuve de partage et sont rémunérés pour cela. Les paiements se font par mobile money, le moyen de paiement le plus utilisé au Bénin." },
  { t: "img", file: "topsender-architecture.png", type: "png", w: 600, h: 187, caption: "Figure 1 : architecture technique de TopSender" },

  { t: "h3", text: "Mes réalisations" },
  { t: "p", text: "J'ai été le principal développeur du backend de TopSender (27 contributions entre le 22 juillet et le 7 octobre 2026). Mes réalisations sont les suivantes :" },
  { t: "ul", items: [
    "**Architecture du serveur** : création du projet Django et découpage en modules indépendants (utilisateurs, campagnes, diffusions, paiements, contacts, administration), pour que chacun puisse travailler sans gêner les autres.",
    "**Comptes et sécurité** : inscription des annonceurs et des diffuseurs, connexion par jeton JWT, vérification par code à usage unique (OTP) à l'inscription et à la connexion, et vérification d'identité (KYC) : pièce d'identité pour un particulier, RCCM et IFU pour une entreprise.",
    "**Panneau d'administration** : une API qui permet aux administrateurs de valider les KYC, de suspendre ou réactiver un compte, de gérer les packs et les codes promo, de suivre les recharges et les transactions (avec factures PDF), de consulter les statistiques et le journal des actions.",
    "**Gestion des contacts** : création de listes, import de contacts et lien de désinscription, pour respecter le choix des destinataires.",
    "**Paiements, campagnes et diffusions** : participation au développement de ces modules avec mon binôme.",
    "**Base de données et mise en ligne** : migration de la base PostgreSQL vers Supabase, puis déploiement du backend sur Render (serveur Gunicorn, fichiers statiques, domaines autorisés et règles CORS).",
    "**Frontend** : routes de l'application, pages de connexion et d'inscription, tableau de bord et déconnexion automatique après une période d'inactivité.",
  ] },
  { t: "p", text: "**Rendu.** L'API de TopSender est en ligne sur Render et alimente l'interface React de la plateforme." },
  { t: "todo", text: "À AJOUTER : 2 à 4 captures d'écran de TopSender (accueil, inscription avec OTP, tableau de bord annonceur ou diffuseur, panneau admin)." },

  { t: "h2", text: "3.2 AlloMairie (aujourd'hui allo.bj)" },
  { t: "h3", text: "Présentation du projet" },
  { t: "p", text: "AlloMairie est une plateforme de participation citoyenne. Sans créer de compte, les habitants peuvent signaler une anomalie (voirie, éclairage, déchets, eau), signaler un problème sur une infrastructure (route, pont, école, marché), faire une suggestion ou féliciter leur mairie. Les agents et les administrateurs de chaque commune traitent ces messages depuis un espace dédié, et un superadministrateur suit l'ensemble des 77 communes du Bénin." },
  { t: "p", text: "Après la fin de mon stage, le projet a été élargi à l'ensemble des institutions de l'État et renommé **allo.bj**. Le parcours « Écrire à ma mairie » de la nouvelle plateforme reprend directement AlloMairie." },
  { t: "pair", a: { file: "allo-accueil.jpg", caption: "Figure 2 : page d'accueil de la plateforme (version allo.bj)" },
               b: { file: "allo-ecrire-mairie.jpg", caption: "Figure 3 : le parcours « Écrire à ma mairie », issu d'AlloMairie" } },

  { t: "h3", text: "Mes réalisations" },
  { t: "p", text: "J'ai réalisé l'essentiel du backend d'AlloMairie pendant le stage (11 des 14 contributions au backend, entre le 11 août et le 5 octobre 2026) :" },
  { t: "ul", items: [
    "**Structure du projet** : une API Node.js et Express organisée en modules (authentification, administration, signalements, communes, structures, localisation). Chaque module est découpé en routes, contrôleur, service et validation des données.",
    "**Base de données** : conception du schéma avec Prisma (comptes, signalements, citoyens sans compte, infrastructures, fiches des communes) et import des localités du Bénin : départements, communes, arrondissements, villages et quartiers.",
    "**Comptes et sécurité** : trois rôles (agent de mairie, administrateur, superadministrateur), mots de passe chiffrés avec bcrypt, sessions par jetons JWT renouvelables, changement de mot de passe. Chaque agent ne voit que les messages de sa commune.",
    "**Signalements** : envoi par le citoyen, avec une limite du nombre d'envois pour éviter les abus, puis consultation et changement de statut (nouveau, en cours, résolu, rejeté).",
    "**Statistiques** : résumé global, évolution mois par mois, répartition par commune et par arrondissement.",
    "**Administration** : création, désactivation, archivage et suppression des comptes des agents, script de création du premier superadministrateur et fiches des communes modifiables.",
    "**Frontend** : pages de l'espace administrateur et superadministrateur, page de participation, vue d'ensemble et statistiques.",
    "**Mise en ligne** : API sur Render, site sur Vercel et base de données sur Supabase.",
  ] },
  { t: "pair", a: { file: "allo-admin-mairie.jpg", caption: "Figure 4 : tableau de bord de l'administrateur d'une mairie" },
               b: { file: "allo-par-commune.jpg", caption: "Figure 5 : suivi commune par commune (superadministrateur)" } },
  { t: "p", text: "Les captures d'écran proviennent de la version actuelle de la plateforme et ont été réalisées avec des données de démonstration : les noms et les messages affichés sont fictifs." },

  { t: "h2", text: "3.3 Points de facilité" },
  { t: "ul", items: [
    "**Le backend** : c'est la partie dans laquelle j'étais le plus à l'aise. Concevoir des modèles de données, écrire des règles et exposer une API demande une logique proche de celle que nous pratiquons à Epitech, où les projets nous apprennent à structurer un programme et à raisonner de façon algorithmique.",
    "**Git et GitHub** : ces outils étaient déjà utilisés à Epitech pour rendre nos projets, ce qui m'a permis de suivre facilement l'organisation par branches et pull requests.",
    "**Le travail en équipe** : la répartition claire des tâches avec mon binôme et la disponibilité de mon tuteur permettaient de lever rapidement les blocages.",
  ] },

  { t: "h2", text: "3.4 Difficultés rencontrées et solutions" },
  { t: "p", text: "**Le frontend.** Le frontend a été la partie la plus difficile pour moi." },
  { t: "todo", text: "À COMPLÉTER : ce qui était difficile exactement (React ? la mise en page et le responsive ? relier les pages à l'API ?) et comment tu t'en es sorti (documentation, tutoriels, aide de Falonne ou de Yannis…)." },
  { t: "p", text: "**Les conflits Git.** En travaillant à plusieurs sur le même dépôt, nous avons rencontré des conflits de fusion, notamment dans le fichier de configuration du serveur. J'ai appris à les résoudre proprement, en relisant les deux versions avant de fusionner, et à récupérer plus souvent les modifications de la branche principale pour en limiter le nombre." },
  { t: "p", text: "**La base de données et la mise en ligne.** Mettre les deux projets en ligne a demandé plusieurs corrections. Sur TopSender, il a fallu régler la connexion à Supabase, les fichiers statiques, les domaines autorisés et les règles CORS. Sur AlloMairie, le site affichait une erreur quand on rechargeait une page hébergée sur Vercel, et la limitation des requêtes bloquait des utilisateurs une fois l'API placée derrière le serveur de Render. Pour avancer, j'ai lu la documentation de chaque outil, testé chaque réglage un par un et séparé la configuration de développement de celle de production." },

  // ============================================================
  { t: "h1", text: "4. Bilan" },
  { t: "todo", text: "À RÉDIGER à l'étape suivante : ce que j'ai appris (compétences techniques, soft skills, monde de l'entreprise, organisation), ce que j'ai apporté à l'entreprise, ce que j'aurais aimé avoir de plus ou de moins." },
];
