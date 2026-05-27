#!/usr/bin/env bash
#
# start.sh — boots the Hostel Management System backend (Spring Boot)
# and frontend (Vite) together in one terminal.
#
# Usage:   ./start.sh
# Stop:    Ctrl+C  (kills both processes cleanly)
#
# Prereqs: Java 17, Maven, Node 18+, npm.
# On first run, also: cd frontend && npm install
#
set -e

cd "$(dirname "$0")"

# kill both children when this script is interrupted / exits
cleanup() {
  echo
  echo "── Stopping HMS dev servers ──"
  # SIGTERM all members of this process group
  kill 0 2>/dev/null || true
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "▶ Starting backend (Spring Boot, port 8080)…"
( cd backend && mvn -q spring-boot:run ) &

echo "▶ Starting frontend (Vite, port 5173)…"
( cd frontend && npm run dev ) &

echo
echo "🏠 HMS dev stack running."
echo "   Backend  : http://localhost:8080"
echo "   Frontend : http://localhost:5173"
echo "   Press Ctrl+C to stop both."
echo

wait
