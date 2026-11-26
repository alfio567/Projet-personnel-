// Contenu du rapport, partie par partie.
// Types de blocs : h1, h2, h3, p, ul, img, pair, table, todo.
// Dans le texte, **gras** est mis en gras.
// Les blocs "todo" apparaissent surlignés en jaune : infos qui manquent encore.

module.exports = [
  // ============================================================
  { t: "h1", text: "1. Contexte du stage : présentation d'ODHE Groupe" },

  { t: "h2", text: "1.1 Historique" },
  { t: "p", text: "L'entreprise a été créée en mars 2019 sous le nom de **DASCO Communication**. En novembre 2026, elle est devenue **ODHE Groupe SARL**, afin d'élargir ses activités, de couvrir davantage de terrain et d'internationaliser ses services. Mon stage s'est donc déroulé chez DASCO Communication, et le changement de nom est intervenu à sa fin." },
  { t: "p", text: "ODHE est né d'une conviction : l'excellence créative n'a aucune frontière. Sa mission est de devenir la référence créative et numérique pour des marques exigeantes. Sa signature, « Nous donnons une voix visuelle à vos ambitions », et son slogan, « Créer, Communiquer, Transformer », résument cette ambition." },

  { t: "h2", text: "1.2 Organisation" },
  { t: "p", text: "ODHE Groupe SARL est dirigé par Mme DHENONWEMAN AKUAVI Odile Bernadette et compte quatre employés. Son siège se trouve à Cotonou, au Bénin, dans le quartier de Fifadji, près du CEG Zogbo. Avec une équipe resserrée, l'agence s'appuie sur des prestataires spécialisés selon les projets. Un recrutement de motion designer est actuellement en cours." },
  { t: "img", file: "organigramme.png", type: "png", w: 600, h: 362, caption: "organigramme d'ODHE Groupe et place du stage", keepNext: true },

  { t: "h2", text: "1.3 Domaine et secteur d'activité" },
  { t: "p", text: "ODHE Groupe est une agence créative et de conseil, qui intervient dans le secteur de la communication et du numérique. Son activité est organisée en quatre pôles :", keepNext: true },
  { t: "table", widths: [2800, 6272], headers: ["Pôle", "Activités"], rows: [
    ["Identité et supports", "Branding et identité visuelle, print, goodies et objets publicitaires"],
    ["Digital et technologie", "Création web, community management, solutions numériques sur mesure (OhClean, FêteBénin), création de jeux vidéo"],
    ["Production et événementiel", "Vidéo et photo, motion design, événementiel avec FêteBénin"],
    ["Conseil et formation", "Consulting stratégique, ODHE Academy (formations en présentiel ou en ligne, avec attestation)"],
  ], caption: "les quatre pôles d'activité d'ODHE Groupe" },
  { t: "p", text: "Le groupe développe aussi deux activités annexes : **ODHE Immo** et **ODHE Store**." },

  { t: "h2", text: "1.4 Positionnement sur le marché" },
  { t: "p", text: "Avec plus de sept ans d'expérience et une offre entièrement sur mesure, ODHE Groupe se présente comme un partenaire unique pour toute la communication de ses clients. Ces clients sont surtout des PME et des commerces, des écoles et des universités, des hôtels et des restaurants, des institutions et des associations, ainsi que des particuliers pour leurs événements ou leurs formations. L'agence travaille aussi avec des clients à l'étranger, au Sénégal et au Togo." },
  { t: "p", text: "À Cotonou, ses principaux concurrents sont les agences Bamboo Communication, SKM, Hello Design, Jawuntaa et Sav+, ainsi que de nombreux freelances. Face à eux, ODHE Groupe se distingue par :", keepNext: true },
  { t: "ul", items: [
    "**la stratégie avant la création** : « nous pensons avec vous avant de créer pour vous » ;",
    "**une offre complète sous un même toit**, de la stratégie jusqu'à l'événement ;",
    "**ses propres outils numériques** (FêteBénin, OhClean), la création de jeux vidéo et une académie de formation, ce que peu d'agences proposent à Cotonou ;",
    "**des prix accessibles** : des services à partir de 5 000 FCFA, une commande en ligne et un devis détaillé sous 24 heures ;",
    "**un niveau d'exécution international**, avec la proximité d'une agence locale.",
  ] },
  { t: "p", text: "Ses valeurs sont la créativité, l'excellence, la proximité, l'innovation et l'intégrité." },

  { t: "h2", text: "1.5 Département de travail" },
  { t: "p", text: "J'ai effectué mon stage dans le pôle **Digital et technologie**, au sein du service de développement de sites web. Mon tuteur, **Yannis AKAKPOVI**, y occupe le poste de développeur web full stack : il conçoit les applications de l'agence, de la base de données jusqu'aux écrans, organise le travail de l'équipe et relit le code avant qu'il soit intégré. Je travaillais en binôme avec **Falonne EDAH**, elle aussi étudiante à Epitech." },
  { t: "p", text: "L'objectif de l'équipe était de concevoir et de mettre en ligne des plateformes web complètes et fiables pour l'agence et ses clients. Pendant mon stage, cela s'est traduit par deux projets : TopSender et AlloMairie." },
  { t: "todo", text: "À VÉRIFIER avec Yannis : les missions de son poste décrites ci-dessus (je les ai déduites de l'organisation des projets)." },

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
  ], caption: "outils utilisés sur les deux projets" },
  { t: "p", text: "**Impact de mon travail sur l'avancement.** Le backend devait être prêt pour que les pages puissent afficher de vraies données. En livrant l'architecture du serveur dès la troisième semaine de stage, puis les routes de l'API module par module, j'ai permis à l'équipe de brancher les pages au fur et à mesure. La mise en ligne sur Render a ensuite permis à toute l'équipe de tester l'application dans des conditions réelles." },

  // ============================================================
  { t: "h1", text: "3. Travail effectué" },

  { t: "h2", text: "3.1 TopSender" },
  { t: "h3", text: "Présentation du projet" },
  { t: "p", text: "TopSender est une plateforme de campagnes publicitaires. Elle met en relation deux types d'utilisateurs : les **annonceurs**, qui achètent un pack et lancent des campagnes par SMS, par e-mail ou sur les réseaux sociaux, et les **diffuseurs**, qui partagent ces campagnes, envoient une preuve de partage et sont rémunérés pour cela. Les paiements se font par mobile money, le moyen de paiement le plus utilisé au Bénin." },
  { t: "img", file: "topsender-architecture.png", type: "png", w: 600, h: 187, caption: "architecture technique de TopSender" },

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
  { t: "pair", a: { file: "allo-accueil.jpg", caption: "page d'accueil de la plateforme (version allo.bj)" },
               b: { file: "allo-ecrire-mairie.jpg", caption: "le parcours « Écrire à ma mairie », issu d'AlloMairie" } },

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
  { t: "pair", a: { file: "allo-admin-mairie.jpg", caption: "tableau de bord de l'administrateur d'une mairie" },
               b: { file: "allo-par-commune.jpg", caption: "suivi commune par commune (superadministrateur)" } },
  { t: "p", text: "Les captures d'écran proviennent de la version actuelle de la plateforme et ont été réalisées avec des données de démonstration : les noms et les messages affichés sont fictifs." },

  { t: "h2", text: "3.3 Points de facilité" },
  { t: "ul", items: [
    "**Le backend** : c'est la partie dans laquelle j'étais le plus à l'aise. Concevoir des modèles de données, écrire des règles et exposer une API demande une logique proche de celle que nous pratiquons à Epitech, où les projets nous apprennent à structurer un programme et à raisonner de façon algorithmique.",
    "**Git et GitHub** : ces outils étaient déjà utilisés à Epitech pour rendre nos projets, ce qui m'a permis de suivre facilement l'organisation par branches et pull requests.",
    "**Le travail en équipe** : la répartition claire des tâches avec mon binôme et la disponibilité de mon tuteur permettaient de lever rapidement les blocages.",
  ] },

  { t: "h2", text: "3.4 Difficultés rencontrées et solutions" },
  { t: "p", text: "**Le frontend.** Le frontend a été la partie la plus difficile pour moi." },
  { t: "p", text: "Ma difficulté n'était pas de faire fonctionner les pages, mais de leur donner un design à la fois beau, soigné et lisible : choisir les couleurs, les espacements, la hiérarchie des informations et une mise en page qui reste claire sur téléphone. Pour avancer, je me suis appuyé sur mon binôme et sur mon tuteur, plus à l'aise sur la conception visuelle, et je me suis concentré sur ce que je maîtrisais : la structure des pages, la navigation et la connexion à l'API. Cette répartition nous a permis de livrer des interfaces de qualité, et elle m'a montré clairement le domaine que je dois encore travailler." },
  { t: "p", text: "**Les conflits Git.** En travaillant à plusieurs sur le même dépôt, nous avons rencontré des conflits de fusion, notamment dans le fichier de configuration du serveur. J'ai appris à les résoudre proprement, en relisant les deux versions avant de fusionner, et à récupérer plus souvent les modifications de la branche principale pour en limiter le nombre." },
  { t: "p", text: "**La base de données et la mise en ligne.** Mettre les deux projets en ligne a demandé plusieurs corrections. Sur TopSender, il a fallu régler la connexion à Supabase, les fichiers statiques, les domaines autorisés et les règles CORS. Sur AlloMairie, le site affichait une erreur quand on rechargeait une page hébergée sur Vercel, et la limitation des requêtes bloquait des utilisateurs une fois l'API placée derrière le serveur de Render. Pour avancer, j'ai lu la documentation de chaque outil, testé chaque réglage un par un et séparé la configuration de développement de celle de production." },

  // ============================================================
  { t: "h1", text: "4. Bilan" },
  { t: "h2", text: "4.1 Ce que j'ai appris" },
  { t: "p", text: "**Compétences techniques.** Ce stage m'a fait progresser sur l'ensemble de la chaîne d'une application web. J'ai appris deux technologies de backend très utilisées en entreprise : **Django**, avec Django REST Framework, sur TopSender, et **Node.js**, avec Express, sur AlloMairie. J'ai découvert **Prisma**, qui permet de décrire la base de données dans un schéma clair et de la faire évoluer par migrations. Enfin, j'ai appris à **déployer un site** de bout en bout : base de données sur Supabase, site sur Vercel et surtout API sur **Render**, que je maîtrise désormais, de la configuration des variables d'environnement jusqu'à la résolution des erreurs de production." },
  { t: "p", text: "**Savoir-être.** Ma plus grande progression concerne le **travail en équipe**. Travailler en binôme sur un même dépôt m'a appris à définir une architecture commune avant de coder, à me répartir clairement les tâches, à communiquer sur l'avancement et à intégrer mon travail à celui des autres sans le casser." },
  { t: "p", text: "**Monde de l'entreprise et organisation.** À la différence des projets d'école, ces plateformes sont destinées à de vrais utilisateurs : des annonceurs, des diffuseurs, des citoyens et des agents de mairie. Le code doit donc être fiable, sécurisé et mis en ligne, et pas seulement fonctionner sur mon ordinateur. J'ai aussi appris à organiser mon travail par étapes : concevoir, développer module par module, tester puis déployer." },

  { t: "h2", text: "4.2 Ce que j'ai apporté à l'entreprise" },
  { t: "p", text: "J'ai apporté à ODHE Groupe un travail rigoureux et soigné sur deux projets complets. Sur TopSender comme sur AlloMairie, j'ai conçu et développé l'essentiel du backend, c'est-à-dire la partie qui stocke les données, applique les règles et protège les comptes, puis je l'ai mis en ligne. L'équipe dispose ainsi de deux API fonctionnelles et déployées, sur lesquelles les interfaces ont pu être construites. Le découpage en modules que j'ai mis en place permet aussi de faire évoluer ces plateformes facilement, comme le montre l'élargissement d'AlloMairie en allo.bj." },

  { t: "h2", text: "4.3 Ce que j'aurais aimé avoir de plus" },
  { t: "p", text: "J'aurais aimé disposer de plus de temps pour approfondir mes connaissances en frontend. Le backend a occupé la plus grande partie de mon stage, et je n'ai pas pu aller aussi loin que je le souhaitais dans la conception d'interfaces. C'est un point que je compte travailler pendant la suite de ma formation, afin de devenir un développeur full stack plus complet." },
];
