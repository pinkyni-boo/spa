# Dashboard Server Restart Guide

## Issue
All Dashboard APIs returning 404 errors because server hasn't loaded the new routes yet.

## Solution
**Restart the Node.js server:**

### Option 1: Terminal
1. Stop current server: `Ctrl + C`
2. Start again: `npm start` (hoặc `node index.js`)

### Option 2: If using nodemon
Server should auto-restart. If not, manually restart as above.

## Verify
After restart, check Console - errors should be gone and data should load.

## Expected Console Output
```
🔄 [DASHBOARD] Fetching data...
📊 [DASHBOARD] Stats Response: {success: true, stats: {...}}
📈 [DASHBOARD] Revenue Response: {success: true, data: [...]}
🏆 [DASHBOARD] Services Response: {success: true, services: [...]}
👥 [DASHBOARD] Staff Response: {success: true, staff: [...]}
```
