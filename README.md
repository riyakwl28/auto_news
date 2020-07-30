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

### Crawl using Websites' RSS
**You send:**  Any additional sources(it's name, it's website's URL and it's RSS feed URL along with a flag("0","1" or "2") which determines whether you want to search default sources or the new one only).
**You get:** A JSON response.

**Example Request:**
```json
POST request to /crawlweb 
Accept: application/json
Content-Type: application/json
{
    "sources": [{"source":"cio_etc_dc","url":"https://cio.economictimes.indiatimes.com/","rss":"https://cio.economictimes.indiatimes.com/rss/data-center"}],
    "add": "0" 
}
```
**Successful Response:**
```json
{
   "StatusMessage":"Crawling Done"
}
```
**Failed Response:**
```json
{
   "StatusMessage":"Error Occured"
}
```
### Crawl using Google News
**You send:**  The date range within which news is needed
**You get:** A JSON response.

**Example Request:**
```json
POST request to /crawlgoogle 
Accept: application/json
Content-Type: application/json
{
    "startDate": "2020-07-28",
    "endDate": "2020-07-31" 
}
```
**Successful Response:**
```json
{
   "StatusMessage":"Crawling Done"
}
```
**Failed Response:**
```json
{
   "StatusMessage":"Error Occured"
}
```

### Predict
**You send:**  A flag("google" or "other") which selects which crawled articles to predict whether from Google or from Websites' RSS and a confidence score which determines the threshold of probability of predcition below which the articles will be eliminated.
**You get:** A JSON response.

**Example Request:**
```json
POST request to /predictCategory
Accept: application/json
Content-Type: application/json
{
    "value":"google",
    "confidence": "40.0" 
}
```
**Successful Response:**
```json
{
   "StatusMessage":"Predicting Done"
}
```
**Failed Response:**
```json
{
   "StatusMessage":"Error Occured"
}
```

### Download
**You send:**  A flag("other" or "google") whether to download google predcited articles or websites' articles
**You get:** A JSON response.

**Example Request:**
```json
POST request to /predictCategory
response-type: "blob"
{
    "value":"google"
}
```
**Successful Response:**
File is downloaded

**Failed Response:**
```json
{
   "StatusMessage":"Error Occured"
}
```
<br/>
The default sources for Websites Crawling is stored in `auto_news_backend/sources.json` file.
The query terms for Google Crawling is stored in `auto_news_backend/query_terms.txt` file.

## Steps to Setup the API. 
1. Clone this repository.<br/>

2. Go to `auto_news_backend` and install requirements using the following command

#### `pip install -r requirements.txt`

3. To run the API, in the project directory go to `auto_news_backend/api` and then run:

#### `python autonews_api.py`

This will run the API on `localhost:5000` which can be changed in `app.run()` method.<br/>

## Model Training
The dataset and other files related to model training can be found in `auto_news_backend`. Python notebooks dedicated to each step of the process beginning from EDA, text preprocessing and model creation can be found in the same folder.

The dataset is created from Intel India Market Intelligence Newsletters archives and has around 400 articles with 6 categories namely:iot, telecom, dc(data center), cloud, cc(client computing), ai(artificial intelligence), and industry. Around 15% of the data was used for testing.

The model uses SVM with grid search cross validation for categorizing the articles. The model achieved an accuracy of 77.89% on testing data, which can be improved once mor data is added in the corpus.
