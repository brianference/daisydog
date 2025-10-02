#!/bin/bash
# Playwright Extended Setup Script
# Cost: FREE (unlimited)

set -e

echo "🎭 Playwright Extended Testing Setup"
echo "===================================="
echo ""

# Install Playwright with all browsers
echo "📦 Installing Playwright browsers..."
npx playwright install --with-deps

# Verify installation
echo ""
echo "✅ Verifying Playwright installation..."
npx playwright --version

# Run test suite
echo ""
echo "🧪 Running extended test suite..."
npm run test:playwright-extended

echo ""
echo "✅ Setup complete! Available commands:"
echo "   npm run test:playwright-extended    - Run all extended tests"
echo "   npm run test:visual-regression      - Visual regression only"
echo "   npm run test:safety-automated       - Safety filter tests"
echo ""
echo "Reports available at: testing/playwright-extended/reports/"
