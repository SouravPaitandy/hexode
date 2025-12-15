@echo off
start cmd /k "cd server && npm run dev"
start cmd /k "cd client && npm run dev"
start cmd /k "cd server && npx y-websocket"
echo DevDock Starting (API + Frontend + Collab)...
