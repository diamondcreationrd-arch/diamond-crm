@echo off
echo.
echo  Diamondcreationrd-arch/diamond-crm -- Push vers GitHub
echo  ========================================================
echo.

cd /d "%~dp0"

echo [1/5] Initialisation git...
git init
git branch -M main

echo [2/5] Configuration...
git config user.email "diamondcreationrd@gmail.com"
git config user.name "Spartacus"

echo [3/5] Ajout des fichiers...
git add .

echo [4/5] Commit...
git commit -m "feat: Diamond Creation CRM -- initial commit"

echo [5/5] Push vers GitHub...
git remote remove origin 2>nul
git remote add origin https://github.com/diamondcreationrd-arch/diamond-crm.git
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo  OK! Code envoye sur GitHub!
    echo  https://github.com/diamondcreationrd-arch/diamond-crm
    echo.
) else (
    echo.
    echo  ERREUR lors du push.
    echo  Si on te demande un mot de passe, utilise un Personal Access Token.
    echo  Va sur: https://github.com/settings/tokens
    echo.
)

pause
