#!/bin/bash

# ============================================================================
# BorondoTours - GitHub Configuration Script
# Points 2 & 3: Branch Protection Rules + Secrets Setup
# ============================================================================
# Execution: bash ./setup-branch-protection-and-secrets.sh
# ============================================================================

REPO="ChrisPol01/BorondoTours"
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}GitHub Configuration Script${NC}"
echo -e "${BLUE}Repository: $REPO${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# ============================================================================
# POINT 2: BRANCH PROTECTION RULES
# ============================================================================

echo -e "${YELLOW}[POINT 2] Configuring Branch Protection Rules...${NC}"
echo ""

# Main branch protection (Production)
echo -e "${BLUE}Setting up MAIN branch protection (production)...${NC}"
gh api repos/$REPO/branches/main/protection \
  -X PUT \
  -f required_pull_request_reviews='{"dismissal_restrictions":{},"require_code_owner_reviews":false,"required_approving_review_count":1}' \
  -f required_status_checks='{"strict":true,"contexts":["ci/build","ci/test","ci/lint"]}' \
  -f enforce_admins=true \
  -f dismiss_stale_reviews=true \
  -f require_conversation_resolution=true && echo -e "${GREEN}✓ Main branch protection configured${NC}" || echo -e "${RED}✗ Failed to configure main branch${NC}"

echo ""

# Staging branch protection (Pre-production)
echo -e "${BLUE}Setting up STAGING branch protection (pre-production)...${NC}"
gh api repos/$REPO/branches/staging/protection \
  -X PUT \
  -f required_pull_request_reviews='{"dismissal_restrictions":{},"require_code_owner_reviews":false,"required_approving_review_count":1}' \
  -f required_status_checks='{"strict":true,"contexts":["ci/build","ci/test","ci/lint"]}' \
  -f enforce_admins=false \
  -f dismiss_stale_reviews=true \
  -f require_conversation_resolution=true && echo -e "${GREEN}✓ Staging branch protection configured${NC}" || echo -e "${RED}✗ Failed to configure staging branch${NC}"

echo ""
echo -e "${GREEN}[POINT 2] Branch Protection Rules - COMPLETED${NC}"
echo ""

# ============================================================================
# POINT 3: GITHUB SECRETS STRUCTURE
# ============================================================================

echo -e "${YELLOW}[POINT 3] Creating GitHub Secrets Structure...${NC}"
echo ""

# Array of secrets to create
SECRETS=(
  "DATABASE_URL"
  "REDIS_URL"
  "JWT_PRIVATE_KEY"
  "JWT_PUBLIC_KEY"
  "GOOGLE_CLIENT_ID"
  "GOOGLE_CLIENT_SECRET"
  "MAPBOX_TOKEN"
  "AWS_ACCESS_KEY_ID"
  "AWS_SECRET_ACCESS_KEY"
  "AWS_S3_BUCKET"
  "STAGING_API_URL"
  "VITE_API_URL"
  "VITE_MAPBOX_TOKEN"
)

echo -e "${BLUE}Creating 13 repository secrets (empty values initially)...${NC}"
echo ""

for secret in "${SECRETS[@]}"; do
  gh secret set "$secret" --repo $REPO --body "" && echo -e "${GREEN}✓ $secret${NC}" || echo -e "${RED}✗ Failed to create $secret${NC}"
done

echo ""
echo -e "${GREEN}[POINT 3] GitHub Secrets - COMPLETED${NC}"
echo ""

# ============================================================================
# VERIFICATION
# ============================================================================

echo -e "${YELLOW}[VERIFICATION] Checking configurations...${NC}"
echo ""

echo -e "${BLUE}Main branch protection status:${NC}"
gh api repos/$REPO/branches/main/protection --jq '.required_pull_request_reviews, .required_status_checks, .enforce_admins'
echo ""

echo -e "${BLUE}Staging branch protection status:${NC}"
gh api repos/$REPO/branches/staging/protection --jq '.required_pull_request_reviews, .required_status_checks, .enforce_admins'
echo ""

echo -e "${BLUE}Secrets list (count):${NC}"
gh secret list --repo $REPO --jq 'length'
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Configuration Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Summary:${NC}"
echo "✓ Main branch protection: Requires 1 review, status checks, conversation resolution"
echo "✓ Staging branch protection: Requires 1 review, status checks, conversation resolution"
echo "✓ 13 Secrets created (ready for values)"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Review each secret and add its value:"
echo "   gh secret set SECRET_NAME --repo $REPO --body 'your-value'"
echo "2. Create GitHub Environments (staging, production)"
echo "3. Configure deployment restrictions per environment"
echo ""
