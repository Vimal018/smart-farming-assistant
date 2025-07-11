#!/usr/bin/env bash
set -o errexit

# Install all dependencies (including devDependencies)
npm install --legacy-peer-deps

# Build your TypeScript project
npm run build
