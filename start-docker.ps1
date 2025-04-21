Write-Host "Starting Docker containers for Intelligent-System..." -ForegroundColor Green

# Build and start the containers
docker-compose up -d

Write-Host "`nContainers started successfully!" -ForegroundColor Green
Write-Host "MongoDB: mongodb://localhost:27017/intelligent_system_db"
Write-Host "Backend API: http://localhost:5000"
Write-Host "Frontend: http://localhost:5175"

Write-Host "`nUse the following command to stop the containers:" -ForegroundColor Yellow
Write-Host "docker-compose down" -ForegroundColor Yellow 