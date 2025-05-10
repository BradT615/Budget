#!/bin/bash
# This script runs the Next.js 15 codemod to automatically handle async API upgrades
# and applies the specific file fixes needed to fix the deployment issue

# Run the official Next.js codemod for async APIs
echo "Running Next.js async API codemod..."
npx @next/codemod@canary next-async-request-api .

# Copy our fixed files
echo "Applying specific fixes for deployment..."
cp -f src/app/dashboard/expenses/page.tsx ./src/app/dashboard/expenses/page.tsx
cp -f src/app/dashboard/income/page.tsx ./src/app/dashboard/income/page.tsx
cp -f src/app/dashboard/transactions/page.tsx ./src/app/dashboard/transactions/page.tsx
cp -f next.config.js ./next.config.js

echo "Fixes applied! Now run the following to commit and deploy:"
echo "git add ."
echo "git commit -m 'Fix Next.js 15 breaking changes'"
echo "git push"