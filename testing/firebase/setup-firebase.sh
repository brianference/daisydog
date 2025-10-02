#!/bin/bash
# Firebase Test Lab Setup Script
# Cost: FREE (10 virtual + 5 real device tests/day)

set -e

echo "🔥 Firebase Test Lab Setup"
echo "=========================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "📦 Installing Firebase CLI..."
    npm install -g firebase-tools
else
    echo "✅ Firebase CLI already installed"
fi

# Check if gcloud CLI is installed
if ! command -v gcloud &> /dev/null; then
    echo "📦 Installing Google Cloud SDK..."
    echo "Visit: https://cloud.google.com/sdk/docs/install"
    echo "Then run: gcloud components install firebase"
    exit 1
else
    echo "✅ Google Cloud SDK already installed"
fi

# Login to Firebase
echo ""
echo "🔐 Logging into Firebase..."
firebase login

# Initialize Firebase Test Lab
echo ""
echo "🚀 Initializing Firebase Test Lab..."
firebase init testlab

# Configure project
echo ""
echo "📋 Test Lab Configuration:"
echo "- Free tier: 10 virtual tests/day (300/month)"
echo "- Free tier: 5 real device tests/day (150/month)"
echo "- Config file: testing/firebase/firebase-test-lab.yml"
echo ""
echo "✅ Setup complete! Run tests with:"
echo "   npm run test:firebase:virtual (virtual devices)"
echo "   npm run test:firebase:real (real devices)"
