@echo off
REM start.bat — Windows launcher that opens two new terminal windows,
REM one for the Spring Boot backend and one for the Vite frontend.
REM Closing either window stops only that side. Use Ctrl+C inside each
REM window for a clean shutdown.
REM
REM Prereqs: Java 17, Maven, Node 18+, npm. On first run also:
REM   cd frontend
REM   npm install

setlocal
cd /d %~dp0

start "HMS Backend"  cmd /k "cd backend  && mvn spring-boot:run"
start "HMS Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo HMS dev stack starting in two new terminal windows.
echo   Backend  : http://localhost:8080
echo   Frontend : http://localhost:5173
echo.
endlocal
