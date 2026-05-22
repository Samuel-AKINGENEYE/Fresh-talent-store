#!/bin/bash

echo "🚀 Fresh Talent Store - Daily Development Session"
echo "=================================================="
echo ""

# 1. Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# 2. Start dev server in background
echo "🔄 Starting dev server..."
npm run dev &
DEV_PID=$!

# 3. Wait a bit
sleep 3

# 4. Open in browser
echo "🌐 Opening in browser..."
xdg-open http://localhost:3000 2>/dev/null || open http://localhost:3000 2>/dev/null || echo "Open http://localhost:3000 manually"

echo ""
echo "✅ Development environment ready!"
echo "📝 When you're done, run: ./commit.sh"
echo ""
echo "Press Ctrl+C to stop the dev server when finished"

# Wait for user to press Ctrl+C
wait $DEV_PID
