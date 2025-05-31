#!/bin/bash
cd frontend
pnpm build || exit 1
cd ..
git subtree push --prefix frontend/dist origin gh-pages
