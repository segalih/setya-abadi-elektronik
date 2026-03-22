# Starts all development services in separate windows
Write-Host "Starting Setya Abadi Elektronik Development Services..." -ForegroundColor Cyan

# 1. Laravel API
Start-Process cmd.exe -ArgumentList "/k", "cd apps\api && php artisan serve" -WindowStyle Normal

# 2. Laravel Queue
Start-Process cmd.exe -ArgumentList "/k", "cd apps\api && php artisan queue:listen" -WindowStyle Normal

# 3. Web Frontend
Start-Process cmd.exe -ArgumentList "/k", "cd apps\web && npm run dev" -WindowStyle Normal

# 4. Notification Service
Start-Process cmd.exe -ArgumentList "/k", "cd apps\notification-service && npm run dev" -WindowStyle Normal

Write-Host "All services are starting in separate windows." -ForegroundColor Green
