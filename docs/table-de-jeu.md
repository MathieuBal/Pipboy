# Table de jeu — première version

Ouvrir Console MJ → Table de jeu. Les cartes du scénario sont des scènes : sélectionner une scène permet de la préparer en privé sans changer la carte de la joueuse. « Afficher cette scène » change la carte dans MAP et restaure sa position. Les pions restent enregistrés sur leur scène.

Glisser une illustration depuis la réserve sur la carte, ou utiliser son bouton Ajouter sur mobile. Un pion est toujours ajouté en secret. Le sélectionner pour le nommer, le redimensionner, le révéler, le masquer, le dupliquer (copie secrète) ou le retirer. La dernière suppression peut être annulée. Le pion joueur est un pion libre ; le repère de position historique du Pip-Boy est indépendant.

Glisser le fond à la souris pour se déplacer ; sur mobile, faire défiler. Zoom par boutons. Les pions se déplacent à la souris, au doigt ou avec les flèches du clavier (Maj pour un plus grand pas). Les positions sont sauvegardées à la fin du déplacement, pas à chaque mouvement. Le Pip-Boy affiche les pions révélés de la scène active ; la joueuse ne les déplace pas dans cette première version. Révéler un pion ne révèle pas automatiquement sa fiche dans PERSONNES/FAUNE.

## Liaison entre appareils

Le mode local synchronise les onglets du même navigateur, pas deux téléphones. Le site doit être relié à un projet Supabase selon le README. Aucun serveur de synchronisation n'est créé automatiquement.

- Nouveau projet : exécuter `supabase/schema.sql` (il inclut les pions).
- Projet déjà installé : exécuter `supabase/migrations/20260927_tabletop.sql`. Cette migration peut être répétée. Elle remplace uniquement la projection de lecture, sans supprimer de campagne.
- Les pions utilisent le même enregistrement atomique et les mêmes signaux Realtime que les fiches. La projection SQL ne transmet au joueur que les pions révélés de la scène active. Les notes et autres champs non explicitement autorisés sont exclus.
- La création d'une nouvelle session importe désormais la préparation locale, y compris les pions. Une session déjà existante est reprise sans être écrasée.

Le brouillard de guerre, le pointeur partagé, les jets de dés et le déplacement autorisé aux joueurs ne sont pas encore inclus. Les images publiques ne servent pas de stockage confidentiel : les secrets sont les fiches, positions et pions filtrés par le serveur.
