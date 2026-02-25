#!/bin/bash

# Test script for TV subscription expiry cron job
# Usage: ./test-cron.sh [your-app-url]

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get URL from argument or use default
APP_URL="${1:-http://localhost:3000}"

echo "🧪 Testing TV Subscription Expiry Cron Job"
echo "=========================================="
echo ""

# Test 1: GET request (for Vercel cron)
echo "📋 Test 1: GET request (Vercel cron method)"
echo "URL: $APP_URL/api/tv/check-expiry"
echo ""

response=$(curl -s -w "\n%{http_code}" "$APP_URL/api/tv/check-expiry")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✅ GET request successful (Status: $http_code)${NC}"
    echo "Response:"
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
else
    echo -e "${RED}❌ GET request failed (Status: $http_code)${NC}"
    echo "Response:"
    echo "$body"
fi

echo ""
echo "----------------------------------------"
echo ""

# Test 2: POST request with auth (for GitHub Actions/external calls)
echo "📋 Test 2: POST request (External call method)"

read -p "Enter CRON_SECRET (or press Enter to skip): " CRON_SECRET

if [ -z "$CRON_SECRET" ]; then
    echo -e "${YELLOW}⚠️  Skipping POST test (no CRON_SECRET provided)${NC}"
else
    echo "URL: $APP_URL/api/tv/check-expiry"
    echo "Auth: Bearer $CRON_SECRET"
    echo ""
    
    response=$(curl -s -w "\n%{http_code}" -X POST "$APP_URL/api/tv/check-expiry" \
        -H "Authorization: Bearer $CRON_SECRET" \
        -H "Content-Type: application/json")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✅ POST request successful (Status: $http_code)${NC}"
        echo "Response:"
        echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
    else
        echo -e "${RED}❌ POST request failed (Status: $http_code)${NC}"
        echo "Response:"
        echo "$body"
    fi
fi

echo ""
echo "=========================================="
echo "✨ Testing complete!"
echo ""
echo "Next steps:"
echo "1. If tests passed locally, deploy to Vercel"
echo "2. Check Vercel Dashboard → Cron Jobs"
echo "3. Monitor logs after 9:00 AM UTC"
echo ""
