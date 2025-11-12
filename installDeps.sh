#!/usr/bin/env bash

# Store project root directory
PROJECT=$PWD

# Install frontend dependencies
cd "$PROJECT/digital-coach-app" || exit
npm ci
cd "$PROJECT/digital-coach-app/functions" || exit
npm ci

# Install backend dependencies
cd "$PROJECT/mlapi" || exit
uv sync
