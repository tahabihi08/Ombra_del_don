# Ombra del Don : site + panneau admin (100 % gratuit)

Site statique (HTML/CSS/JS) dont tout le contenu est dans `content.json`.
Le panneau admin (`/admin/`) modifie ce fichier et le publie sur GitHub ; Netlify met le site à jour automatiquement.

Coût : 0 €. GitHub (gratuit) + Netlify (offre gratuite) + Google Fonts (gratuit).

## 1. Mise en ligne (une seule fois, ~10 minutes)

1. Crée un compte sur https://github.com puis un nouveau dépôt, par exemple `ombra-del-don` (privé ou public).
2. Dans le dépôt : **Add file → Upload files**, glisse TOUT le contenu de ce dossier (y compris `admin/` et `assets/`), puis **Commit changes**.
3. Va sur https://app.netlify.com → **Add new site → Import an existing project → GitHub** → choisis le dépôt. Laisse les réglages par défaut (pas de commande de build, dossier publié `.`) → **Deploy**.
4. Pour garder l'adresse `ombradeldon.netlify.app` : Site configuration → Change site name. Si le site actuel existe déjà sur ton compte, relie plutôt ce dépôt à lui (Site configuration → Build & deploy → Link repository).

## 2. Connexion au panneau admin

1. Sur GitHub : Settings (de ton profil) → Developer settings → **Personal access tokens → Fine-grained tokens → Generate new token**.
   - Repository access : **Only select repositories** → ton dépôt.
   - Permissions → Repository permissions → **Contents : Read and write**.
2. Copie le token (`github_pat_...`).
3. Ouvre `https://TON-SITE.netlify.app/admin/`, renseigne `utilisateur/depot`, la branche (`main`) et le token, puis **Se connecter**.

Sécurité : le token est la seule clé. Sans lui, le panneau ne peut rien publier. Ne le partage pas ; tu peux le révoquer à tout moment sur GitHub. Coche « Se souvenir » uniquement sur ton propre appareil.

## 3. Ce que tu peux contrôler

- Sections : ajouter, supprimer, masquer, réordonner. Types disponibles : accueil, à propos, chiffres, hiérarchie, membres, règlement, alliances, galerie, actualités, formulaire rejoindre, formulaire meeting, FAQ, contact, section libre.
- Textes, boutons, liens, photos (téléversement direct, réduites automatiquement), logos des alliances, réseaux sociaux.
- Couleurs, logo, favicon, SEO et image de partage, écran d'entrée, musique d'ambiance, CSS personnalisé.
- Ouverture/fermeture du recrutement et des meetings, mode maintenance, sauvegarde et import JSON, aperçu avant publication.

## 4. Formulaires « Rejoindre » et « Meeting »

Ils utilisent Netlify Forms (gratuit, 100 envois par mois). Les réponses arrivent dans Netlify : **Site → Forms**. Tu peux activer une notification e-mail : Forms → Form notifications. Un champ anti-spam invisible est déjà en place.

Si tu dépasses 100 envois par mois, remplace l'action des formulaires par Formspree (offre gratuite) ou ajoute une notification Discord via un webhook Netlify.

## 5. Avant de publier : à personnaliser

Les chiffres, noms de membres, alliances et textes fournis sont des exemples. Remplace-les dans l'admin. Le logo `assets/logo.svg` est un modèle générique : mets le tien dans Paramètres → Logo.

## 6. Mode hors-ligne

Sans token : bouton « Mode hors-ligne » sur l'écran de connexion. Tu modifies, tu télécharges `content.json` et tu le remplaces dans le dépôt (les images doivent alors être ajoutées à la main dans `images/`).

## Fichiers

- `index.html`, `style.css`, `app.js` : le site public
- `content.json` : tout le contenu
- `admin/index.html` : le panneau admin
- `netlify.toml`, `robots.txt` : en-têtes de sécurité et exclusion de l'admin des moteurs de recherche
