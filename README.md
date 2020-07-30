# AutoNews: Automatic News Articles Crawler and Curator using Machine Learning

To run the React Application =>In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

<br/>
The first screen `Crawl.js` of application does the crawling, where the sources can be chosen between Websites' RSS or Google News. Depending upon it, the respective API call is made which is a POST request to **localhost:5000/crawlweb** for websites and **localhost:5000/crawlgoogle** for Google News.

<br/>
The second screen `Predict.js` does the categorisation and makes a POST request to **localhost:5000/predictCategory**.
<br/>
The third screen `Download.js` downloads the required file by making a POST request to **localhost:5000/downlaod**.
<br/>

## Steps to Setup the API. 
1.Clone this repository.
2.Go to auto_news_backend and install requirements using the following command
### `pip install -r requirements.txt`
3.To run the API, in the project directory go to auto_news_backend/api and then run:
### `python autonews_api.py`
