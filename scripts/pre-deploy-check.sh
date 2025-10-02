#!/bin/bash
# Pre-Deployment Verification Script
# Run this BEFORE every deployment to catch issues

set -e

echo "🚀 DaisyDog Pre-Deployment Verification"
echo "======================================"
echo ""

# Step 1: Build verification
echo "📦 Step 1/5: Testing production build..."
npm run build
echo "✅ Build successful"
echo ""

# Step 2: Check dist folder
echo "📂 Step 2/5: Verifying dist folder contents..."
if [ ! -d "dist" ]; then
    echo "❌ ERROR: dist folder not found!"
    exit 1
fi

if [ ! -f "dist/index.html" ]; then
    echo "❌ ERROR: dist/index.html not found!"
    exit 1
fi

echo "✅ dist folder contains required files"
echo ""

# Step 3: Check for broken links
echo "🔗 Step 3/5: Checking for broken links..."
if command -v grep &> /dev/null; then
    broken_links=$(grep -r "href=\"/chat\"" dist/ 2>/dev/null || true)
    if [ -n "$broken_links" ]; then
        echo "❌ ERROR: Found broken /chat links!"
        echo "$broken_links"
        exit 1
    fi
    echo "✅ No broken links found"
fi
echo ""

# Step 4: Run safety tests
echo "🛡️ Step 4/5: Running safety filter tests..."
if ! npm run test:safety; then
    echo "❌ ERROR: Safety tests failed! Fix issues before deploying."
    exit 1
fi
echo "✅ Safety tests passed"
echo ""

# Step 5: Preview build
echo "👀 Step 5/5: Starting preview server..."
echo "Open http://localhost:4173 to verify:"
echo "  - Homepage loads correctly"
echo "  - About page card width is 900px (not 1400px)"
echo "  - 404 page has no broken links/images"
echo "  - Voice features work (TTS speed 1.25)"
echo ""
echo "Press Ctrl+C when verification complete"
npm run preview
