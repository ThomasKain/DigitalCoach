# Install frontend dependencies
cd ./digital-coach-app
npm ci

# Install backend dependencies
cd ../mlapi
uv sync
