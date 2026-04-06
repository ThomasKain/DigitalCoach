# DigitalCoach

Senior Design Project for Fall 2022-Spring 2023

DigitalCoach is an AI-powered interview prep web application that allows job seekers to practice interviewing and receive immediate feedback. Some key features of DigitalCoach include creating interview sets from our database of questions and then recording corresponding video responses. Our AI uses machine learning models to analyze audio and video through a sentiment analysis. At the end, users are left with an overall score and actionable feedback.

For more detailed documentation on the different parts of the app ([frontend](/digital-coach-app/README.md), [ml-api](/ml-api/README.md), [ml model](/ml/README.md)) refer to the README.md file in the root directory of the folders.

# Setup Instructions

## Setup

1. Create a firebase app [here](https://console.firebase.google.com)
1. Create a service account for the firebase app you've created using the Google Cloud console with [instructions here](https://cloud.google.com/iam/docs/creating-managing-service-accounts#creating)
1. Populate the `.env` files in `digital-coach-app/` and `digital-coach-app/functions/` directory with the service account credentials. The files in the repository are just sample env files. Make sure that the files are named .env without the example part!
1. Install the latest stable version of Node [here](https://nodejs.org/en/)
1. Install yarn [here](https://classic.yarnpkg.com/en/docs/install)
1. Install Python 3.10 [here](https://www.python.org/downloads/)
1. Install redis [here](https://redis.io/docs/getting-started/)
1. Install pipenv [here](https://pipenv.pypa.io/en/latest/)
   - Make sure you run this in administrator mode if you're on Windows!
1. Install nltk with `pip install nltk`
1. Open python with `python` in the command line
   - Ensure you are running python 3.10!
1. Type into the python console:
   ```
   import nltk
   nltk.download()
   ```
   and download all packages in the UI prompt (sorry we didn't figure out which ones you really need)
1. Create an account with Assembly AI and get an API key
1. Populate the .env file in `ml-api/` with the API key from AssemblyAI. The files in the repository are just sample env files. Make sure that the files are named .env without the example part!
1. Ensure that firebase is connected: run `firebase login` and click the link to login and authenticate
1. Run `firebase projects:list` to see the projectId
1. Set the current project using the projectId from the previous step: `firebase use <projectId>`

## Frontend

- Prerequisites
  - Ensure you are running Windows or Ubuntu to avoid complier issues
  - Use Node v20.19.2

1. cd to the `digital-coach-app` directory
1. run `yarn install` to install dependencies for Next.JS
1. run `npm install -g firebase-tools` to install firebase
1. cd to the `functions` directory
1. run `yarn install` to install dependencies for the firebase functions
1. run `yarn add typescript@latest` to upgrade typescript
1. run `yarn build --skipLibCheck` to build the firebase functions modules
1. cd back to the `digital-coach-app` directory
1. run `yarn run emulate` to run the firebase emulator
1. in another terminal in the `digital-coach-app` directory, run `yarn run dev` to run the Next.JS dev server
1. Navigate to `localhost:3000/api/seed` to seed the database.

- The Next.JS dev server is served at `localhost:3000`
- The Firebase emulation console is served at `localhost:4000`

## Backend

1. start your redis server with the instructions from the installation page [here](https://redis.io/docs/getting-started/)
1. cd to the `ml-api` directory
1. run `pipenv install` to install the dependencies for the flask API
1. run `pipenv run serve` to start the Flask API server

## Local LLM Setup
The AI model(s) used for this application are implemented via the Docker Model Runner (DMR). This provides the following advantages:

1. Portability between systems. (AI models should work with NVIDIA, AMD, and Intel GPUs).
2. Switching between models requires minimal code changes (see below for steps).
3. Docker model runner can use both the CPU and/or GPU for AI inference with little configuration.

To set up the AI model(s) on your host machine, do the following steps:

1. Open Docker Desktop, then go to settings which should be a gear icon on the top right, and then select the “AI” section.
2. Enable the following options:
    - “Enable Docker Model Runner”
    - “Enable host-side TCP support” (use the default port number)
    - “Enable GPU-backed inference” (if you don’t see this option then ignore this)
3. Download the AI model’s file. In `mlapi/.env.example` there should be a `MODEL` environment variable that’s populated with the name of the current AI model being used (in the later section we’ve provided steps for how to change the AI model). In your host machine’s terminal, run the following command: `docker model pull <model-name>`.

Congratulations, you have a local LLM on your machine that the web application can use for ML tasks! You can also use it personally within Docker Desktop by selecting the “Models” tab in the left-hand side of the Docker Desktop navigation bar, and then selecting the AI model that you downloaded.

If you want to switch to a different model, Docker Hub has plenty of AI models to choose from. However, be mindful of the AI model’s size because if its too large and can’t fit in your GPU’s VRAM then AI inference will take much longer or fail. After you find a model, you must perform the following: 

1. In `mlapi/.env`, change the environment variable `MODEL` to be `MODEL="ai/<model-name>"` where `<model-name>` can be found when you visit that specific AI model’s Docker Hub page under the “Variant” category and make sure to copy the entire name listed.
2. In `/docker-compose.yml` in the top-level `models` section, change the `model` field to also be `model: ai/<model-name>`

Notes: 
- We don’t recommend using a system that doesn’t have a GPU because CPU inference is very slow.
- As far as we know, if you have a GPU then there isn’t a way to set up DMR so that it only uses your CPU for inference. This shouldn’t be a problem and makes sense because GPU-bound inference is much faster than CPU-bound inference.
- The model itself will be hosted on your host machine and NOT a container.
- If you make changes to the configuration of the model within `docker-compose.yml`, you may have to unload and then load the model back again for the configurations to take effect because DMR is separate from Docker Compose. Specifically, after closing the application with `docker-compose down`, unload the model with `docker model rm <model-name>` and then redownload it with `docker model pull <model-name>`.

# Technologies Used

## Frontend

- Next.JS
- React
- Firebase
  - Storage
  - Firestore
  - Functions
- Sass

## Build Tools

- Yarn
- Pipenv

## Machine Learning API

- Flask
- Redis

## Machine Learning Model

- RQ
- AssemblyAI
- FER
- Numpy
- Scipy
- Matplotlib
- Jupyter Notebook
- Keras
- OpenCV
- Tensorflow
- NLTK

# Members

- Ming Lin (Fullstack)
- Max Shi (Fullstack)
- Hamzah Nizami (Machine Learning)
- Suzy Shailesh (UX/UI Design)
- Michael McCreesh (QA)
- Aparajita Rana (Product Management)
