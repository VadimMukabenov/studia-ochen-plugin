@echo off
cd /d "%~dp0"
docker info >nul 2>&1
if errorlevel 1 (
  echo Install and start Docker Desktop, wait until it is ready, then start again.
  pause
  exit /b 1
)
docker compose version >nul 2>&1
if errorlevel 1 (
  echo Docker Compose v2 is required. Update Docker Desktop.
  pause
  exit /b 1
)
echo Loading the prepared application and model. First start may take a few minutes.
docker load -i image.tar.gz
if errorlevel 1 (
  echo Could not load image.tar.gz. Extract the entire archive and check free disk space.
  pause
  exit /b 1
)
docker compose up -d --wait --wait-timeout 120
if errorlevel 1 (
  echo Could not start. Check: docker compose logs. Port 18763 must be free.
  pause
  exit /b 1
)
echo Ready: http://127.0.0.1:18763
echo Editor is ready. Choose objects, edit, then download SVG.
echo Stop: docker compose down
start "" "http://127.0.0.1:18763"
pause
