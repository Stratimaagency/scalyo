# Règles du projet Scalyo

## Contexte de travail
- Le propriétaire du projet (l'utilisateur) fait TOUT lui-même : code, déploiement, configuration, infrastructure.
- Son dev le conseille rapidement mais ne fait pas le travail à sa place.
- Ne jamais proposer de "faire appel à un dev" ou "engager quelqu'un" — l'utilisateur gère tout seul.

## Infrastructure
- Hébergement cible : Cloudflare (Workers, Pages, D1) — gratuit et performant.
- Ne pas proposer de solutions payantes quand une alternative gratuite existe.
- Toujours privilégier les solutions les plus simples et économiques.

## Communication
- Répondre en français.
- Être direct et concis — pas de blabla.
- Donner des instructions actionables, pas des explications théoriques.

## Git
- Remote GitLab : https://gitlab.com/scalyo-group/scalyo-project.git
- Branche de travail : preprod-v2
- Pour pusher : git push https://oauth2:$GITLAB_TOKEN@gitlab.com/scalyo-group/scalyo-project.git preprod-v2
- Ne jamais pusher sur origin (GitHub suspendu)
- GITLAB_TOKEN est disponible dans l'environnement
