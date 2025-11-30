# Deploy the Fixed Upload Code

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deploying Fixed Upload Code" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (Test-Path .git) {
    Write-Host "✓ Git repository found" -ForegroundColor Green
    
    # Add all changes
    Write-Host ""
    Write-Host "Adding changes..." -ForegroundColor Yellow
    git add .
    
    # Commit
    Write-Host "Committing changes..." -ForegroundColor Yellow
    git commit -m "Fix: Simplified upload route to resolve 500 error"
    
    # Push
    Write-Host "Pushing to repository..." -ForegroundColor Yellow
    git push
    
    Write-Host ""
    Write-Host "✓ Code pushed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Waiting for automatic deployment..." -ForegroundColor Yellow
    Write-Host "Check deployment status at:" -ForegroundColor Cyan
    Write-Host "https://console.cloud.google.com/run/detail/europe-west1/khair-backend-autodeploy" -ForegroundColor White
    
} else {
    Write-Host "✗ No git repository found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please initialize git first:" -ForegroundColor Yellow
    Write-Host "  git init" -ForegroundColor White
    Write-Host "  git add ." -ForegroundColor White
    Write-Host "  git commit -m 'Initial commit'" -ForegroundColor White
    Write-Host "  git remote add origin YOUR_REPO_URL" -ForegroundColor White
    Write-Host "  git push -u origin main" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  After Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Wait 1-2 minutes for deployment to complete" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Test the upload at:" -ForegroundColor Yellow
Write-Host "   https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/admin" -ForegroundColor White
Write-Host ""
Write-Host "3. Open browser console (F12) to see detailed logs" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. If it still fails, check Cloud Run logs:" -ForegroundColor Yellow
Write-Host "   https://console.cloud.google.com/run" -ForegroundColor White
Write-Host ""
