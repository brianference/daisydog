# DaisyDog Testing Infrastructure

Comprehensive multi-platform testing setup with **100% FREE** tools and services.

## Testing Stack Overview

### ~~Firebase Test Lab~~ (Not Applicable - Web App)
- **Note**: Firebase Test Lab is for mobile apps (APK/IPA)
- **Alternative**: Use Playwright for responsive testing (FREE, unlimited)
- **Config**: Kept for reference only: `testing/firebase/firebase-test-lab.yml`

### PRIMARY: Kobiton Community Plan (FREE)
- **Allocation**: Unlimited manual testing
- **Devices**: Real devices (older models)
- **Cost**: $0 forever
- **Use For**: Safety feature validation, voice testing, game mechanics
- **Config**: `testing/kobiton/kobiton-config.json`

### SECONDARY: Appetize.io (FREE - 100 mins/month)
- **Allocation**: 100 minutes/month
- **Cost**: $0
- **Use For**: iframe/game integration, network throttling, video performance
- **Config**: `testing/appetize/appetize-config.json`

### TERTIARY: Playwright (FREE - Unlimited)
- **Allocation**: Unlimited automated tests
- **Cost**: $0 forever
- **Use For**: CI/CD automation, safety filter testing, visual regression
- **Config**: `testing/playwright-extended/playwright.config.extended.ts`

### BETA TESTING: TestFlight + Google Play (FREE)
- **TestFlight**: 10,000 testers max
- **Google Play**: Unlimited beta testers
- **Cost**: $0 forever
- **Use For**: Real family testing, production validation
- **Configs**: 
  - `testing/beta-testing/testflight-config.json`
  - `testing/beta-testing/google-play-beta.json`

## Quick Start

### 1. ~~Firebase Test Lab~~ (Not Needed - Web App)
```bash
# Firebase Test Lab is for mobile apps (APK/IPA)
# For web responsive testing, use Playwright instead:
npm run test:playwright-extended
npm run test:mobile
```

### 2. Kobiton Community Plan (FREE - Manual Testing Only)
```bash
# Sign up for free Community Plan at: https://kobiton.com/community
# Get dashboard link:
npm run test:kobiton

# MANUAL TESTING ONLY:
# 1. Sign up at https://kobiton.com/community
# 2. Access https://portal.kobiton.com
# 3. Upload web app URL: https://daisydog.org
# 4. Select real devices (older models available on free tier)
# 5. Manually test safety features, voice, games
```

### 3. Appetize.io Setup (FREE - Manual Testing Only)
```bash
# Sign up for free account at: https://appetize.io
# Get dashboard link:
npm run test:appetize

# MANUAL TESTING ONLY (100 mins/month):
# 1. Sign up at https://appetize.io
# 2. Upload web app URL: https://daisydog.org
# 3. Test: iframe/game integration, network throttling, video performance
# 4. Budget: 100 minutes/month free
```

### 4. Playwright Extended (FREE - Unlimited Automation)
```bash
# Run automated setup script
bash testing/playwright-extended/setup-playwright.sh

# OR manual install:
npx playwright install --with-deps

# AUTOMATED TESTS:
npm run test:playwright-extended  # All extended tests
npm run test:safety-automated     # Safety filter tests
npm run test:visual-regression    # Visual regression
npm run test:mobile               # Mobile responsive

# NOTE: These commands require prior build:
npm run build  # Build first
npm run test:playwright-extended  # Then run tests
```

### 5. Beta Testing Setup (FREE)
```bash
# TestFlight (iOS) - 10,000 testers max
# 1. Sign up for Apple Developer ($99/year - not free)
# 2. Add app to App Store Connect
# 3. Configure beta testing groups (see testflight-config.json)
# 4. Upload builds via Xcode or CI/CD

# Google Play (Android) - Unlimited testers
# 1. Sign up for Google Play Console ($25 one-time - not free)
# 2. Create app in Play Console
# 3. Set up testing tracks (see google-play-beta.json)
# 4. Upload APK/AAB builds

# Both require developer accounts but beta testing itself is FREE
```

## CI/CD Integration

### GitHub Actions Workflow
Automated testing runs on every push/PR via `.github/workflows/testing-automation.yml`:

**Daily Automated Tests:**
- Safety filter validation (Playwright + Jest)
- Visual regression testing
- Mobile responsive testing
- Lighthouse performance checks

**Pre-Release Full Suite:**
- Trigger with commit message: `[full-test]`
- OR manually via GitHub Actions dashboard
- Runs all test platforms
- Uploads coverage to Codecov

**Commands:**
```bash
# Trigger daily tests locally
npm run test:daily

# Run full suite locally
npm run test:all

# Pre-deployment verification (REQUIRED)
bash scripts/pre-deploy-check.sh
```

## Test Execution Schedule

### Daily (Automated via GitHub Actions)
- Safety filter tests (Playwright + Jest)
- Visual regression testing
- Mobile responsive validation
- Lighthouse performance checks

### Daily (Manual via Dashboards)
- Kobiton Community: Safety feature validation on real devices (manual only)
- Appetize.io: Game/iframe integration testing (manual only, 100 mins/month)

### Weekly (Manual + Beta)
- Kobiton: Voice feature validation on real devices
- Appetize.io: iframe/game integration (budget 100 mins/month carefully)
- TestFlight/Play: Beta build distribution to family testers

### Pre-Deployment (MANDATORY)
```bash
# ALWAYS run before deploying:
bash scripts/pre-deploy-check.sh
```
This script:
1. Tests production build (`npm run build`)
2. Verifies dist folder contents
3. Checks for broken links
4. Runs safety filter tests
5. Starts preview server for manual verification

### Pre-Release (Comprehensive)
- All platforms: Full regression suite
- Real family testing groups
- Performance & security audits
- Beta tester feedback integration

## Reporting

All test results are saved to:
- Firebase: `testing/firebase/reports/`
- Kobiton: `testing/kobiton/reports/`
- Appetize: `testing/appetize/reports/`
- Playwright: `testing/playwright-extended/reports/`
- Beta: Feedback via email & in-app surveys

## Cost Summary

| Platform | Allocation | Type | Cost |
|----------|-----------|------|------|
| Playwright Extended | Unlimited automated tests | Automated | $0 |
| Playwright Mobile | Unlimited responsive tests | Automated | $0 |
| GitHub Actions CI/CD | 2,000 minutes/month (free tier) | Automated | $0 |
| Kobiton Community | Unlimited manual testing | Manual | $0 |
| Appetize.io | 100 minutes/month | Manual | $0 |
| TestFlight | 10,000 beta testers | Beta | $0 |
| Google Play Beta | Unlimited beta testers | Beta | $0 |
| **TOTAL** | **Full automation + manual testing** | **Mixed** | **$0/month** |

## Next Steps

1. Set up Firebase Test Lab for daily regression
2. Configure Kobiton for safety feature testing
3. Integrate Playwright into CI/CD pipeline
4. Launch beta testing groups on TestFlight & Play
5. Monitor test results and iterate

All testing infrastructure is **100% FREE** and ready for production use.
