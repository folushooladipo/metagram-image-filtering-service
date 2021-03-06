# Tl;dr: my submission
- I have added a Postman collection that contains all you need to send requests to this service.
- Check `./deployment_screenshots` for screenshots of my Elastic Beanstalk deployment. They are supposed to be viewed in the order that they are numbered.
- Read the [Features Implemented](#features-implemented) section for all the features I implemented.
- I have added a Postman collection that will help in making requests. It can be found at `./metagram-image-filtering-service.postman_collection.json`.
- Strong TypeScript coding patterns were used (variables have types, functions have return types etc) and high-quality code and logic was used- all as required in the submission rubric.

## Features implemented
- Required features:
    - An endpoint for filtering/transforming images.
- Standout features:
    - Restricting access to the endpoint used to filter images using an API key.
    - Setting up ESLint, adding a bunch of rules to `.eslintrc.json` and fixing all the issues raised by the linter.
    - Deploying the frontend app using S3 and CloudFront: I added the UI's files to an S3 bucket as static assets but kept the bucket private and inaccessible to the public. Then I created a CloudFront distribution and gave it an Origin Access Identity (OAI) that allowed the distribution to access and serve the files in my S3 bucket. I also created a new role that enabled the EC2 instance(s) that contained the backend REST API to have permission to create signed URLs for getting and putting objects in that particular bucket. The result can be viewed at [this CloudFront URL](http://darqu04zcxi87.cloudfront.net/). (NB: you have to use the HTTP website and not the HTTPS because Elastic Beanstalk serves the backend over HTTP and making a request from an HTTPS origin to an HTTP server will cause a [mixed content error](https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content). In the future maybe I will setup Elastic Beanstalk environments that have load balancers that have HTTPS listeners. Since I don't have a ready-made SSL certificate for that effort right now, we'll have to stick with using HTTP.)

# About
This is the Metagram Image Filtering Service. It's a microservice that enables clients to filter/transform images.

Metagram is a cloud application that I built as part of the the Udacity Cloud Engineering Nanodegree. You can check out the app's backend app in [this repository](https://github.com/folushooladipo/metagram-api).

You need an API key to be able to filter images. See the section on [generating API keys](#getting-an-api-key) for the steps required to get a key.

## Setup
You need to have [Node.js 12+](https://nodejs.org/en/), [Yarn](https://yarnpkg.com/) and [Git](https://git-scm.com/) installed in order to run this app.
- Open a terminal/command prompt.
- Clone this repository using:
```bash
git clone https://github.com/folushooladipo/metagram-image-filtering-service.git
```
- Install the project's dependencies by entering this command in the terminal:
```bash
yarn
```
- Open `.env.sample`, make a copy of it, save that copy as `.env`, remove all the comments in it and supply values to its list of environment variables.
- Run the command below to start the app's server:
```bash
yarn dev
```
- The app will be available at `http://localhost:8082`

## Getting an API key
You need an API key in order to filter an image. This app only issues API keys to known/trusted sources or clients. Those clients are identified using the identifiers `TRUSTED_SOURCE_LOCAL` (for your local machine) and `TRUSTED_SOURCE_DEV` (for your dev instance) that are stored as environment variables. Let's say you configured one of those identifiers to be `my_secure_home_laptop`. (Please don't use this value as it's easy to guess and it's here in the docs.) To obtain an API key, send the following request to a running instance of this app:
```bash
GET /apikey?sourceID=my_secure_home_laptop
```
You can always modify the app to add or remove trusted clients.

## How to filter an image
In order to filter an image, you must have an API key and have a URL for your target image. The image must be accessible using nothing but that URL because there's no way to provide authorisation headers. Thereafter, you can filter the image by making the following HTTP request:
```bash
GET /filteredimage?image_url=<YOUR_IMAGE_URL>&api_key=<YOUR_API_KEY>
```
Here is an example that uses a publicly-accessible image:
```bash
GET /filteredimage?image_url=https://rovettidesign.com/wp-content/uploads/2011/07/clouds2.jpg&api_key<YOUR_API_KEY>
```

## Known issues/limitations
Some images are publicly available but cannot be fetched by this app. An example is [this Wikipedia image](https://upload.wikimedia.org/wikipedia/commons/b/bd/Golden_tabby_and_white_kitten_n01.jpg). It can be viewed in a browser tab but cannot be fetched by this app. The underlying reason can be found [here](https://github.com/oliver-moran/jimp/issues/643).
