# Diamond Creation CRM — Guide de démarrage

## Étape 1 — Installer les dépendances

```bash
cd diamond-crm
npm install
```

## Étape 2 — Configurer l'environnement

```bash
cp .env.example .env
```

Remplis les valeurs dans `.env` :
- **DATABASE_URL** → ton URL PostgreSQL (Railway te donne ça automatiquement)
- **NEXTAUTH_SECRET** → génère avec : `openssl rand -base64 32`
- **NEXTAUTH_URL** → ton URL (ex: https://diamond-crm.up.railway.app)
- **RESEND_API_KEY** → crée un compte sur resend.com (gratuit)
- **TWILIO_*** → compte Twilio pour les SMS

## Étape 3 — Base de données

```bash
npm run db:push       # Créer les tables
npx ts-node prisma/seed.ts  # Créer le premier admin
```

## Étape 4 — Lancer en local

```bash
npm run dev
# Ouvre http://localhost:3000
```

## Étape 5 — Déployer sur Railway

1. Crée un compte sur railway.app
2. New Project → Deploy from GitHub
3. Ajoute un service PostgreSQL
4. Copie DATABASE_URL dans les variables d'environnement
5. Ajoute toutes les autres variables
6. Deploy!

---

## Connexion initiale

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Super Admin | admin@diamondcreation.ca | admin123! |
| Client (démo) | marie@leprestige.ca | client123! |

**Change les mots de passe après la première connexion!**

---

## Webhooks à configurer

### Meta (Facebook/Instagram Lead Ads)
- URL: `https://ton-domaine.com/api/webhooks/meta`
- Champ: `META_WEBHOOK_VERIFY_TOKEN` dans .env

### TikTok Lead Gen
- URL: `https://ton-domaine.com/api/webhooks/tiktok`

### Google Lead Form Extensions
- URL: `https://ton-domaine.com/api/webhooks/google`
- Header: `Authorization: Bearer {GOOGLE_WEBHOOK_SECRET}`

---

## Structure du projet

```
diamond-crm/
├── prisma/
│   ├── schema.prisma        ← Toutes les tables
│   └── seed.ts              ← Données initiales
├── src/
│   ├── app/
│   │   ├── admin/           ← Portail Diamond Creation
│   │   ├── client/          ← Portail client
│   │   ├── l/[slug]/        ← Landing pages publiques
│   │   └── api/
│   │       ├── leads/       ← API leads
│   │       ├── landing-pages/
│   │       └── webhooks/
│   │           ├── meta/    ← Meta Lead Ads
│   │           ├── tiktok/  ← TikTok Lead Gen
│   │           └── google/  ← Google Lead Forms
│   ├── components/
│   │   ├── layout/          ← Sidebars admin + client
│   │   ├── dashboard/       ← Stats, tables, graphiques
│   │   └── landing-pages/   ← Renderer + templates
│   └── lib/
│       ├── auth.ts          ← NextAuth config
│       ├── prisma.ts        ← Client DB
│       ├── leads.ts         ← Service leads + CPL/CPA
│       └── notifications.ts ← Email (Resend) + SMS (Twilio)
```
