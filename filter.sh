#!/bin/bash
git filter-branch -f --tree-filter '
find . -type f -not -path "*/\.git/*" -not -path "*/node_modules/*" -not -path "*/\.next/*" -exec perl -pi -e "s/wss:\/\/hhg-backend--0000001\.orangepebble-efef5f40\.centralindia\.azurecontainerapps\.io/<YOUR_BACKEND_URL>/g" {} +
' HEAD
