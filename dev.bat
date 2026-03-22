@echo off
echo Starting Setya Abadi Elektronik Development Services...

:: 1. Laravel API
start "LARAVEL API" cmd /k "cd apps\api && (php artisan serve --port=8000 || pause)"

:: 2. Laravel Queue
start "LARAVEL QUEUE" cmd /k "cd apps\api && (php artisan queue:listen || pause)"

:: 3. Web Frontend
start "WEB FRONTEND" cmd /k "cd apps\web && (npm run dev || pause)"

:: 4. Notification Service
start "NOTIF SERVICE" cmd /k "cd apps\notification-service && (npm run dev || pause)"

echo.
echo NOTE: You can also use "npm run dev" in the root terminal 
echo to run ALL services in a single interleaved terminal (Recommended).
echo.
pause
