# Pip-Boy JDR

Compagnon de campagne mobile-first en français, fondé sur le cahier de lancement v0.2. React, TypeScript, Vite, Supabase et GitHub Pages. Aucun asset Bethesda redistribué.

## Essayer

```sh
npm ci
npm run dev
```

Sans paramètres Supabase, le site ouvre une **démonstration locale clairement signalée**. Dans « Console MJ », ouvrez le catalogue puis envoyez une fiche secrète. Revenez en vue joueur : elle apparaît dans son module. La sauvegarde et les échanges entre onglets utilisent le stockage de ce navigateur ; ils ne relient pas deux appareils. Les données de démo ne sont pas confidentielles et sont incluses dans le frontend.

Modules : carte, journal/documents/terminaux/quêtes, holobandes avec transcription, personnes, faune et objets. Le MJ peut créer et enrichir les huit types de fiches, rechercher par texte/tags, filtrer par type/visibilité, envoyer par bouton ou glisser-déposer, masquer avec confirmation, déplacer la position et remplacer l’image de carte. Les terminaux peuvent lier plusieurs documents ; chaque document lié garde sa propre visibilité et doit être envoyé individuellement.

Les holobandes de démonstration sont des **transcriptions originales sans fichier audio**. Associez une URL directe MP3/AAC dans l’éditeur pour écouter vos médias. La lecture reste manuelle ; aucun autoplay.

## Activer une vraie session sur deux appareils

1. Créer un projet Supabase.
2. Exécuter une fois `supabase/schema.sql` dans SQL Editor. Le script crée les tables, les fonctions, les droits et la publication Realtime. Il est destiné à un projet neuf, pas à une migration incrémentale.
3. Dans Authentication → Providers, activer Email et Anonymous Sign-ins. Créer un compte MJ avec un mot de passe depuis Authentication → Users. Ne pas distribuer ses identifiants au joueur.
4. Copier `.env.example` vers `.env.local` et remplir `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` avec l’URL et la clé publique/publishable. **Jamais de clé service-role ou secret.** Relancer Vite après modification.
5. Sur le site, « Connecter une session » → « Maître du jeu » : se connecter. La première connexion crée la campagne ; les suivantes reprennent la session existante du compte.
6. Donner le code affiché au joueur. Sur son téléphone : même site → « Connecter une session » → « Joueur » → saisir le code. Un compte anonyme est créé automatiquement.
7. Depuis la console MJ, envoyer une fiche. Elle est sauvegardée en base puis signalée à l’autre appareil via Realtime. Un rafraîchissement de secours toutes les dix secondes gère une liaison Realtime interrompue.

Le code de huit caractères est une invitation privée. Cette version prévoit une campagne/session par compte MJ. La présence signifie « appareil ayant consulté la session dans les 35 dernières secondes » ; un téléphone en veille peut apparaître déconnecté. Une session en ligne n’utilise pas les données de démo pendant son chargement et les erreurs de sauvegarde sont affichées.

## Publier sur GitHub Pages

1. Fusionner la branche de développement dans `main`.
2. Dans le dépôt, Settings → Pages → Source : **GitHub Actions**.
3. Dans Settings → Secrets and variables → Actions → Variables, définir `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`. Sans ces variables, la publication reste en mode démo.
4. Exécuter « Deploy Pip-Boy to Pages » dans Actions, ou pousser sur `main`.
5. Attendre la réussite du job de déploiement. L’URL publique attendue est `https://mathieubal.github.io/Pipboy/` ; elle ne doit être annoncée active qu’après vérification du déploiement.

Les routes sont `#/` (joueur) et `#/gm` (MJ) : le hash évite les erreurs 404 de GitHub Pages. `base: './'` conserve la compatibilité avec le sous-répertoire `/Pipboy/`. Les variables Vite sont intégrées à la compilation ; une modification requiert une nouvelle publication.

## Architecture et isolation des données

- `src/App.tsx` : interfaces et interactions, éditeur, carte, audio, connexion.
- `src/data.ts` : types et contenu de démonstration original.
- `src/store.ts` : adaptation localStorage/Supabase.
- `src/style.css` : thème phosphore, responsive 320 px, effets désactivables, reduced-motion.
- `supabase/schema.sql` : état de campagne JSONB, adhésions, projection joueur et signaux.

Le modèle JSONB garde un identifiant stable par fiche et des mises à jour atomiques. Il est volontairement plus compact que les tables proposées dans le cahier ; une future migration peut les normaliser. Le contrôle de révision évite d’écraser silencieusement une modification concurrente.

Les tables d’état et d’adhésion n’autorisent aucune lecture ou écriture directe aux clients. Les fonctions SQL vérifient l’identité et la propriété. `get_session` produit côté serveur une projection joueur, sans fiches masquées, journal MJ ni code d’invitation. La table Realtime ne contient que l’identifiant de session et un numéro de révision, avec RLS. Le rôle MJ ne dépend jamais du bouton ou de la route du navigateur. Les fonctions sont privées par défaut et leur exécution est accordée seulement aux utilisateurs authentifiés.

Les notes personnelles et préférences sont locales à l’appareil. Elles ne sont pas partagées. L’export joueur est limité aux données visibles ; l’export MJ contient la campagne complète et ses secrets. Les médias distants doivent être accessibles publiquement (pas de stockage de fichiers dans ce MVP).

## Vérifier

```sh
npm test
npm run build
```

Le test exécute le schéma dans un vrai moteur PostgreSQL embarqué (PGlite), avec une identité Auth simulée : propriétaire, joueur et tiers. Il vérifie les lectures interdites, la projection sans secret, l’envoi/retrait persistant et les conflits de révision. Il ne remplace pas une validation Supabase de bout en bout sur deux appareils.

Checklist sur le projet Supabase réel : rejoindre depuis un second appareil, transmettre les quatre types de contenu, recharger, déplacer la position, vérifier qu’un lieu secret reste absent, tester un fichier MP3 sur iPhone et les erreurs réseau. Aucun projet Supabase n’est créé ni configuré automatiquement.

## Limites connues

- Pas de moteur de règles, combat automatisé, uploads, PWA hors ligne ni gestion multi-campagne.
- Quêtes : statut et objectifs rédigés dans le contenu, sans sous-objectifs structurés.
- La carte incluse est un schéma fictif interactif. Le MJ peut fournir une image de campagne ; les coordonnées restent normalisées de 0 à 1. Zoom par boutons et déplacement par défilement.
- Un document déjà lu ou copié ne peut pas être « désappris » après masquage.
- Tests Supabase en conditions réelles non exécutés : aucun projet Supabase n’était configuré au moment de la livraison.
