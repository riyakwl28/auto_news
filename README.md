# AutoNews: Automatic News Articles Crawler and Curator using Machine Learning

To run the React Application, in the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.<br/>

## React Application
The first screen `src/Crawl.js` of application does the crawling, where the sources can be chosen between Websites' RSS or Google News. Depending upon it, the respective API call is made which is a `POST` request to **localhost:5000/crawlweb** for websites and **localhost:5000/crawlgoogle** for Google News.<br/>

The second screen `src/Predict.js` does the categorisation and makes a `POST` request to **localhost:5000/predictCategory** .<br/>

The third screen `src/Download.js` downloads the required file by making a `POST` request to **localhost:5000/downlaod** .<br/>

## API Documentation
This API uses `POST` request to communicate and . All requests must include a `content-type` of `application/json` except request to `localhost:5000/download` and the body must be valid JSON.


## Steps to Setup the API. 
1. Clone this repository.<br/>

2. Go to auto_news_backend and install requirements using the following command

### `pip install -r requirements.txt`

3. To run the API, in the project directory go to auto_news_backend/api and then run:

### `python autonews_api.py`

This will run the API on localhost:5000 which can be changed in app.run() method.<br/>

