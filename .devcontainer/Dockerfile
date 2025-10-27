FROM ubuntu:latest

# Install some baseline dependencies
RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y lsb-release curl git gpg python3-pip

# Install NodeSource APT repository (for NodeJS)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Install Redis APT repository
RUN curl -fsSL https://packages.redis.io/gpg | gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
RUN chmod 644 /usr/share/keyrings/redis-archive-keyring.gpg
RUN echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/redis.list

# Install NodeJS and Redis
RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y nodejs redis

# Install NLTK
RUN pip install nltk
