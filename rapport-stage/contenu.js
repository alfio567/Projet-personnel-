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
  { t: "p", text: "**Impact sur l'entreprise.** ODHE Groupe propose à ses clients des sites, des applications et des outils numériques sur mesure. TopSender et allo.bj sont deux projets de son pôle digital. Le backend en est le cœur : c'est lui qui stocke les données, applique les règles de fonctionnement et sécurise les accès. Sans lui, les interfaces ne peuvent pas fonctionner." },
  { t: "p", text: "**Méthodologie de travail.** Je travaillais en binôme avec Falonne EDAH, sous la supervision de mon tuteur, Yannis AKAKPOVI. Pour chaque projet, nous commencions par définir ensemble l'architecture du code (les modules, la base de données et les routes de l'API), puis nous nous répartissions le travail. Sur TopSender, l'organisation suivait des règles précises : une branche Git par tâche, une demande de fusion (pull request) relue avant d'être acceptée, et un découpage du code par module pour éviter que deux personnes modifient le même fichier en même temps." },
  { t: "p", text: "**Outils utilisés.** Le tableau ci-dessous résume les principaux outils utilisés pendant le stage.", keepNext: true },
  { t: "table", widths: [3000, 6072], headers: ["Domaine", "Outils"], rows: [
    ["Backend", "Python, Django, Django REST Framework, authentification JWT"],
    ["Base de données", "PostgreSQL, hébergée sur Supabase"],
    ["Frontend", "React, Vite, Tailwind CSS"],
    ["Services externes", "FedaPay (paiement mobile money), Brevo (envoi d'e-mails)"],
    ["Mise en ligne", "Render, Gunicorn, Docker"],
    ["Travail en équipe", "Git et GitHub (branches, pull requests, relecture de code)"],
  ], caption: "Tableau 1 : outils utilisés pendant le stage (TopSender)" },
  { t: "todo", text: "À COMPLÉTER : les technologies utilisées pour allo.bj (langage, framework, base de données, hébergement)." },
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

  { t: "h2", text: "3.2 AlloMairie, devenu allo.bj" },
  { t: "h3", text: "Présentation du projet" },
  { t: "p", text: "allo.bj est une plateforme citoyenne du Bénin dont la devise résume le principe : « le citoyen écrit, l'État répond ». Le projet a d'abord été conçu sous le nom d'AlloMairie, pour permettre aux habitants de signaler les problèmes de leur commune (voirie, éclairage, déchets, eau). Il a ensuite été élargi à l'ensemble des institutions de l'État et renommé allo.bj. La plateforme comporte trois espaces :" },
  { t: "ul", items: [
    "**le site public** : sans créer de compte, le citoyen écrit au gouvernement ou à sa mairie, par écrit ou par message vocal, reçoit un numéro de suivi et peut consulter la réponse ;",
    "**l'espace des institutions** : les agents et administrateurs de chaque ministère ou mairie traitent les messages, y répondent, les transfèrent et suivent leurs délais ;",
    "**le tableau de bord du superadministrateur** : une vue nationale de toutes les institutions, des 77 communes et des comptes.",
  ] },
  { t: "pair", a: { file: "allo-accueil.jpg", caption: "Figure 2 : page d'accueil d'allo.bj" },
               b: { file: "allo-ecrire-gouv.jpg", caption: "Figure 3 : écrire au gouvernement (étape 1)" } },

  { t: "h3", text: "Mes réalisations" },
  { t: "p", text: "Sur allo.bj, j'ai pris en charge le backend, c'est-à-dire tout ce qui se passe derrière les écrans :" },
  { t: "ul", items: [
    "**la réception des messages** des citoyens (texte, message vocal, photo, position), avec la création d'un numéro de suivi unique envoyé par e-mail ;",
    "**l'orientation automatique** : chaque domaine est rattaché à un ministère et chaque commune à sa mairie, et une date limite de réponse est calculée selon le délai annoncé par l'institution ;",
    "**les rôles et la sécurité** : agent, administrateur et superadministrateur, mot de passe temporaire à changer à la première connexion, blocage de 15 minutes après 10 essais ratés ;",
    "**le traitement des messages** : réponses, notes internes, transferts, validation des réponses des agents et historique complet des actions ;",
    "**les statistiques et rapports** : taux de traitement, délai moyen, respect des délais, sujets en hausse et export des données au format tableur (CSV) ;",
    "**les consignes** envoyées par le superadministrateur, avec accusé de lecture.",
  ] },
  { t: "todo", text: "À VÉRIFIER : cette liste a été rédigée à partir du guide du site. Retire ce que tu n'as pas fait toi-même et ajoute ce qui manque." },
  { t: "pair", a: { file: "allo-fiche-message.jpg", caption: "Figure 4 : traitement d'un message par une institution" },
               b: { file: "allo-tableau-national.jpg", caption: "Figure 5 : tableau de bord national du superadministrateur" } },
  { t: "p", text: "Les captures d'écran d'allo.bj ont été réalisées avec des données de démonstration : les noms et les messages affichés sont fictifs." },

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
  { t: "p", text: "**La base de données et la mise en ligne.** La connexion à Supabase, puis le déploiement sur Render, ont demandé plusieurs corrections : adresse de la base de données, fichiers statiques, domaines autorisés et règles CORS. Pour avancer, j'ai lu la documentation de Django et de Render, testé chaque réglage un par un et séparé la configuration de développement de celle de production." },

  // ============================================================
  { t: "h1", text: "4. Bilan" },
  { t: "todo", text: "À RÉDIGER à l'étape suivante : ce que j'ai appris (compétences techniques, soft skills, monde de l'entreprise, organisation), ce que j'ai apporté à l'entreprise, ce que j'aurais aimé avoir de plus ou de moins." },
];
