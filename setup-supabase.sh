#!/bin/bash

echo "========================================="
echo "🚀 Fresh Talent Store - Supabase Setup"
echo "========================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "📦 Installing Supabase CLI..."
    
    # For Ubuntu/Debian
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
        sudo mv supabase /usr/local/bin/
    fi
    
    echo "✅ Supabase CLI installed"
else
    echo "✅ Supabase CLI already installed"
fi

echo ""
echo "📋 Next steps:"
echo "1. Go to https://app.supabase.com"
echo "2. Sign up/Login with GitHub"
echo "3. Click 'New Project'"
echo "4. Enter:"
echo "   - Name: fresh-talent-store"
echo "   - Database Password: (create a strong password)"
echo "   - Region: Europe (Frankfurt) - closest to Rwanda"
echo "5. Wait for database to spin up (2-3 minutes)"
echo ""
echo "Once your project is ready, run: ./configure-supabase.sh"
