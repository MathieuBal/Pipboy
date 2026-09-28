# Table de jeu : plein écran, repère et sauvegardes

## Table plein écran

Dans Console MJ → Table de jeu, « Table plein écran » occupe la zone disponible du navigateur, y compris sur iPhone. Les barres système de Safari peuvent rester présentes. « Réserve de pions » et « Réglages du pion » ouvrent des panneaux repliables. « Quitter le plein écran » ou Échap rend la navigation normale. Les déplacements tactiles et le zoom restent disponibles.

## Repère partagé

Sur la scène actuellement affichée au joueur, choisir « Montrer un endroit », puis toucher le point voulu. Un repère « Regarde ici » apparaît pendant environ 20 secondes. Il respecte la carte active et ne peut pas être envoyé depuis une scène préparée en privé. Il ne déplace pas les pions et ne révèle aucune fiche.

Le repère utilise un pion de transport réservé, visible, via les fonctions Supabase existantes : aucune nouvelle migration SQL n'est nécessaire. Il est exclu des pions manipulables et des sauvegardes complètes. Le dernier repère remplace le précédent. Le rafraîchissement de secours de la session peut retarder sa réception ; il n'est plus rendu après son expiration. Les deux appareils doivent être dans la même session pour le partager. En démo, seuls les onglets du même navigateur communiquent.

## Sauvegardes

Réglages → Sauvegardes de campagne (MJ uniquement).

- Télécharger ma campagne : fichier JSON versionné, contenant fiches et secrets, pions, positions, carte, journal et suivi/notes MJ du scénario. Les fichiers images/audio ne sont pas embarqués. Les paramètres d'authentification et notes personnelles de navigateur ne sont pas exportés.
- Choisir une sauvegarde : validation avant affichage d'un aperçu. Format version 1 ou ancien export brut complet ; limite 1,8 Mo. Un export joueur ancien peut être incomplet : vérifier l'aperçu.
- Confirmer le remplacement : la campagne active est remplacée, avec les visibilités de la sauvegarde. Les joueurs connectés recevront ces changements.
- Avant le remplacement, la campagne courante est copiée dans le stockage local, séparément pour chaque session. Si cette copie échoue, la restauration est annulée.
- Revenir à l'état précédent : recharge la dernière copie de secours dans l'aperçu ; une nouvelle confirmation est requise.

La copie locale n'est pas une archive durable et n'est pas synchronisée entre appareils. Chaque restauration remplace la copie précédente. Conserver les exports téléchargés pour disposer de plusieurs versions. Les sauvegardes MJ contiennent les secrets de campagne.
