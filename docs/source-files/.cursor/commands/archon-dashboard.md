Launch the Archon Dashboard visualization panel.

## Steps

1. Check if `dashboard/server.js` exists in the archon directory. If not, inform the user that the dashboard module is not installed.

2. Check if port 3141 is already in use (`lsof -i :3141`):
   - In use → open browser directly: `open http://localhost:3141`
   - Not in use → start server in background and open browser (path derived from manifest directory structure):
     ```
     node <archon>/dashboard/server.js &
     open http://localhost:3141
     ```

3. Inform the user the dashboard is running and viewable in the browser. File changes auto-refresh via SSE.
   - Custom port: `ARCHON_PORT=8080 node <archon>/dashboard/server.js`
   - Stop: `kill $(lsof -t -i:3141)`
