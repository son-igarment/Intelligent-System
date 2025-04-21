Write-Host "Stopping Docker containers for Intelligent-System..." -ForegroundColor Yellow

# Stop the containers
docker-compose down

Write-Host "`nContainers stopped successfully!" -ForegroundColor Green 