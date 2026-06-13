# Diamond Creation CRM — Script de déploiement
# Double-clique sur ce fichier et choisis "Exécuter avec PowerShell"

$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectPath

Write-Host ""
Write-Host "💎 Diamond Creation CRM — Déploiement" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Yellow
Write-Host ""

# 1. Vérifier que git est installé
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git n'est pas installé!" -ForegroundColor Red
    Write-Host "   Télécharge-le sur: https://git-scm.com/download/win" -ForegroundColor Cyan
    Read-Host "Appuie sur Entrée pour quitter"
    exit 1
}

# 2. Vérifier que Node.js est installé
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js n'est pas installé!" -ForegroundColor Red
    Write-Host "   Télécharge-le sur: https://nodejs.org (version LTS)" -ForegroundColor Cyan
    Read-Host "Appuie sur Entrée pour quitter"
    exit 1
}

Write-Host "✅ Git trouvé: $(git --version)" -ForegroundColor Green
Write-Host "✅ Node.js trouvé: $(node --version)" -ForegroundColor Green
Write-Host ""

# 3. Init git
if (-not (Test-Path ".git")) {
    Write-Host "📦 Initialisation du repo git..." -ForegroundColor Cyan
    git init
    git branch -M main
} else {
    Write-Host "📦 Repo git existant détecté" -ForegroundColor Cyan
}

# 4. Config git
$gitEmail = git config user.email 2>$null
if (-not $gitEmail) {
    git config user.email "diamondcreationrd@gmail.com"
    git config user.name "Spartacus"
}

# 5. Commit
Write-Host "💾 Commit du code..." -ForegroundColor Cyan
git add .
git commit -m "feat: Diamond Creation CRM — initial commit" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   (Rien de nouveau à committer)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Code prêt!" -ForegroundColor Green
Write-Host ""

# 6. GitHub
Write-Host "🐙 GitHub — Crée un repo MAINTENANT:" -ForegroundColor Yellow
Write-Host "   1. Va sur https://github.com/new" -ForegroundColor White
Write-Host "   2. Nom du repo: diamond-crm" -ForegroundColor White
Write-Host "   3. Laisse tout par défaut (Private)" -ForegroundColor White
Write-Host "   4. Clique 'Create repository'" -ForegroundColor White
Write-Host "   5. Copie l'URL du repo (ex: https://github.com/TON-USERNAME/diamond-crm.git)" -ForegroundColor White
Write-Host ""
$repoUrl = Read-Host "Colle l'URL du repo GitHub ici"

if ($repoUrl) {
    Write-Host ""
    Write-Host "🚀 Push vers GitHub..." -ForegroundColor Cyan
    git remote add origin $repoUrl 2>$null
    git remote set-url origin $repoUrl
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Code pushé sur GitHub!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🚂 Railway — Dernière étape:" -ForegroundColor Yellow
        Write-Host "   1. Va sur https://railway.app" -ForegroundColor White
        Write-Host "   2. New Project → Deploy from GitHub repo" -ForegroundColor White
        Write-Host "   3. Sélectionne 'diamond-crm'" -ForegroundColor White
        Write-Host "   4. Add Plugin → PostgreSQL" -ForegroundColor White
        Write-Host "   5. Copie DATABASE_URL dans les variables d'env" -ForegroundColor White
        Write-Host "   6. Ajoute les autres variables du fichier .env.example" -ForegroundColor White
        Write-Host ""
        Write-Host "💎 URL finale: https://diamond-crm.up.railway.app" -ForegroundColor Yellow
    } else {
        Write-Host ""
        Write-Host "❌ Erreur lors du push." -ForegroundColor Red
        Write-Host "   Si c'est une erreur d'authentification, va sur:" -ForegroundColor Yellow
        Write-Host "   https://github.com/settings/tokens → Generate new token" -ForegroundColor Cyan
        Write-Host "   Et utilise le token comme mot de passe" -ForegroundColor Yellow
    }
}

Write-Host ""
Read-Host "Appuie sur Entrée pour fermer"
