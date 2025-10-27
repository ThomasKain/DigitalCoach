FROM ubuntu:latest

# Install some baseline dependencies
RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y lsb-release curl git gpg

# Install NodeSource's APT repository (for NodeJS)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Install Redis's APT repository
RUN curl -fsSL https://packages.redis.io/gpg | gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
RUN chmod 644 /usr/share/keyrings/redis-archive-keyring.gpg
RUN echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/redis.list

# Install NodeJS, Redis, Python, Pip, and NLTK
RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y nodejs redis python3-full python3-nltk

# Install UV
RUN curl -fsSL https://astral.sh/uv/install.sh | bash -

# Install the Firebase CLI
RUN npm install -g firebase-tools

# Install NLTK's datasets
RUN python3 -m nltk.downloader all
