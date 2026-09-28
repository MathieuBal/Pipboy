# Terminaux à codes

## Première activation sur la session Supabase existante

Dans Console MJ > Terminaux à codes, utilisez **Copier le script d’activation**, puis **Ouvrir SQL Editor**. Collez le script, lancez **Run**, revenez au Pip-Boy et touchez **Vérifier l’activation**. Le script est `supabase/migrations/20260928_terminals.sql` (copie servie à `public/setup/terminals.sql`). Il ne supprime ni ne remplace la campagne ; il peut être exécuté plusieurs fois. Une nouvelle installation utilisant `supabase/schema.sql` l’inclut déjà.

L’application ne peut pas installer elle-même une fonction SQL avec sa clé publique. Le module affiche donc clairement l’activation nécessaire. La préparation MJ est utilisable avant activation. Le mode local fonctionne immédiatement, pour un test sur le même navigateur ; il ne constitue pas une séparation de sécurité entre deux personnes.

## Utilisation

1. MJ : saisir un titre, un code de 4 à 32 caractères (lettres A–Z, chiffres, tiret) et le texte préparé. Chaque code doit être distinct. Aucun texte de démonstration n’est ajouté.
2. Donner le code en jeu. Le joueur ouvre **TERMINAL**, saisit le code et touche **Déverrouiller**.
3. Le serveur vérifie l’appartenance à la session et le code, puis archive le document pour les joueurs de cette session. L’affichage est progressif, avec **Afficher immédiatement** ; il est immédiat si le système demande de réduire les animations.
4. Les archives restent accessibles après rechargement, dans TERMINAL et DATA. Un second déverrouillage ne duplique pas la fiche.
5. **Désactiver le code** bloque les futurs déverrouillages, sans retirer une archive existante. **Refermer l’accès** désactive le code et masque l’archive existante. Les informations déjà lues ne peuvent naturellement pas être effacées de la mémoire du joueur.

Modifier un texte préparé n’écrase pas une archive déjà reçue. Une nouvelle saisie du bon code actualise l’archive. Le MJ peut aussi modifier directement une fiche déjà transmise dans le catalogue.

## Stockage et contrôles

Les textes et codes sont conservés dans `state.terminals`, qui n’est pas projeté par `get_session` côté joueur. `unlock_terminal` ne retourne que la fiche déverrouillée, sans son code ni les autres textes. Les droits sont vérifiés par le serveur. Les essais sont limités à cinq par utilisateur et session sur une fenêtre de trente secondes. Le verrouillage de la ligne campagne empêche une sauvegarde MJ obsolète d’annuler silencieusement un déverrouillage : elle reçoit le conflit de révision habituel.

Les sauvegardes complètes MJ incluent les terminaux. Les exports joueur les excluent. L’accès est partagé à l’échelle de la session, pas attribué individuellement à chaque joueur.
