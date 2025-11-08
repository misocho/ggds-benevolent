#!/bin/bash
# Setup Git Hooks for GGDS Project
# This script installs Git hooks to prevent committing secrets

set -e

echo "🔧 Setting up Git hooks for GGDS Benevolent Fund..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get the git root directory
GIT_DIR=$(git rev-parse --git-dir 2>/dev/null)

if [ -z "$GIT_DIR" ]; then
    echo "❌ Error: Not a git repository"
    exit 1
fi

HOOKS_DIR="$GIT_DIR/hooks"

# Create hooks directory if it doesn't exist
mkdir -p "$HOOKS_DIR"

# Copy pre-push hook
if [ -f ".git/hooks/pre-push" ]; then
    echo -e "${GREEN}✅ Pre-push hook found${NC}"
else
    echo "📝 Creating pre-push hook..."

    cat > "$HOOKS_DIR/pre-push" << 'EOF'
#!/bin/bash
# Git Pre-Push Hook - Secret Detection
# Prevents pushing sensitive data to remote repository

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

remote="$1"
url="$2"

z40=0000000000000000000000000000000000000000

echo -e "${GREEN}🔒 Running secret detection pre-push hook...${NC}"

secrets_found=0

while read local_ref local_sha remote_ref remote_sha
do
    if [ "$local_sha" = $z40 ]; then
        :
    else
        if [ "$remote_sha" = $z40 ]; then
            range="$local_sha"
        else
            range="$remote_sha..$local_sha"
        fi

        files=$(git diff --name-only $range)

        declare -a patterns=(
            "AKIA[0-9A-Z]{16}"
            "aws_access_key_id.*=.*['\"]?[A-Z0-9]{20}['\"]?"
            "aws_secret_access_key.*=.*['\"]?[A-Za-z0-9/+=]{40}['\"]?"
            "DO[0-9A-Z]{16,}"
            "SPACES_ACCESS_KEY.*=.*['\"]?[A-Z0-9]{20,}['\"]?"
            "SPACES_SECRET_KEY.*=.*['\"]?[A-Za-z0-9/+=]{40,}['\"]?"
            "api[_-]?key.*['\"]?[0-9a-zA-Z]{32,}['\"]?"
            "secret[_-]?key.*['\"]?[0-9a-zA-Z]{32,}['\"]?"
            "SECRET_KEY.*=.*['\"]?[0-9a-zA-Z]{32,}['\"]?"
            "password.*['\"]?[0-9a-zA-Z!@#$%^&*]{8,}['\"]?"
            "PASSWORD.*=.*['\"]?[0-9a-zA-Z!@#$%^&*]{8,}['\"]?"
            "SMTP_PASSWORD.*=.*['\"]?[0-9a-zA-Z!@#$%^&*]{8,}['\"]?"
            "token.*['\"]?[0-9a-zA-Z-_]{20,}['\"]?"
            "-----BEGIN.*PRIVATE KEY-----"
            "postgres://[a-zA-Z0-9]+:[a-zA-Z0-9]+@"
            "DATABASE_URL.*postgresql.*://.*:.*@"
            "re_[0-9a-zA-Z]{20,}"
        )

        for pattern in "${patterns[@]}"
        do
            matches=$(git diff $range | grep -E "$pattern" | grep -v "^-" | grep -v ".example" | grep -v "PLACEHOLDER" | grep -v "YOUR_" | grep -v "<PLEASE_PROVIDE>" | grep -v "your-" | grep -v "xxxxx" | grep -v "template")

            if [ -n "$matches" ]; then
                if [ $secrets_found -eq 0 ]; then
                    echo -e "\n${RED}⚠️  WARNING: Potential secrets detected!${NC}\n"
                fi
                secrets_found=1
                echo -e "${YELLOW}Pattern matched: $pattern${NC}"
                echo "$matches" | head -n 3
                echo ""
            fi
        done
    fi
done

if [ $secrets_found -eq 1 ]; then
    echo -e "${RED}❌ PUSH REJECTED: Potential secrets detected!${NC}"
    echo -e "${YELLOW}Remove secrets and try again, or use: git push --no-verify${NC}"
    exit 1
else
    echo -e "${GREEN}✅ No secrets detected. Push allowed.${NC}"
    exit 0
fi
EOF

    chmod +x "$HOOKS_DIR/pre-push"
    echo -e "${GREEN}✅ Pre-push hook created and enabled${NC}"
fi

# Test the hook
echo ""
echo "🧪 Testing pre-push hook..."
if [ -x "$HOOKS_DIR/pre-push" ]; then
    echo -e "${GREEN}✅ Hook is executable${NC}"
else
    echo -e "${YELLOW}⚠️  Making hook executable...${NC}"
    chmod +x "$HOOKS_DIR/pre-push"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Git hooks setup complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "The pre-push hook will now:"
echo "  • Scan commits for API keys and secrets"
echo "  • Prevent pushing sensitive data"
echo "  • Protect your credentials"
echo ""
echo "To bypass the hook (not recommended):"
echo "  git push --no-verify"
echo ""
