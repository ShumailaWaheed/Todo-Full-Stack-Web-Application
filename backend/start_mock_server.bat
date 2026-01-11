@echo off
echo Starting Todo API Mock Server...
echo.

cd /d "%~dp0"

if exist "node_modules" (
    echo Using existing node modules...
) else (
    echo Installing dependencies...
    npm install express cors
)

echo.
echo Starting server on http://localhost:8081
echo.
node mock_api_server.js