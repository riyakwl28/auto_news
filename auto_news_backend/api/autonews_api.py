from flask import Flask,request, jsonify, send_file
import pickle
import feedparser as fp
import newspaper
from newspaper import Article
from multiprocessing.dummy import Pool as ThreadPool
import datetime
from datetime import date
from GoogleNews import GoogleNews
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import punkt
from nltk.corpus.reader import wordnet
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
import requests
import numpy as np
import pandas as pd
import json
import time
from flask_cors import CORS

#downloading required files
nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('punkt')



app = Flask(__name__)
CORS(app)

'''helper functions for crawling begin here'''

#function to choose from which sources data has to be crawled
def get_sources(sources_json,addFlag):
    if addFlag=="0":
        with open('../sources.json') as f:
            data = json.load(f)
            return data
    elif addFlag=="1":
        data={}
        for item in sources_json:
            temp=item['source']
            data[temp]={'link':item['url'],'rss':item['rss']}
        return data
    elif addFlag=="2":
        data={}
        with open('../sources.json') as f:
            data = json.load(f)
        for item in sources_json:
            temp=item['source']
            data[temp]={'link':item['url'],'rss':item['rss']}
        return data
    
def get_urls(website):
    article_urls=[]
    # traverse the website dictionary and parse rss to extract url of articles.
    for source, value in website.items():
        if 'rss' in value:
            #parsing rss here 
            d = fp.parse(value['rss'])
            for entry in d.entries:
                #if published date is present then add it in the artciles_list             
                if hasattr(entry, 'published'):
                    article_urls.append({'source': source,'url': entry.link})
    return article_urls


#needed for summarizing
sent_detector = nltk.data.load('tokenizers/punkt/english.pickle')

# storing today's date
current=datetime.datetime.today()


def getData(item_article):
    
    url=item_article['url']
    source=item_article['source']
    
    article = Article(url)
    
    article.download()
    
    try:
        # parsing the article        
        article.parse()

        #getting desc,title,published date and image url         
        title=article.title
        content=article.text
        img=article.top_image
        temp_date=article.publish_date

        # summarize the content
        temp_content = re.sub(r'^\s*[\(\[].*?[\)\]]\s*', '', content)
        sentences = sent_detector.tokenize(temp_content)
        summary=(" ".join(sentences[:2]).strip())
        
        # print(temp_date,url )
        
        #setting default date as today's date          
        set_date=current.date()
        
        #if published date exists then set date to published_date 
        if temp_date:
            set_date=temp_date.date()
        # print(temp_date, set_date)
        
        #calculating number of days between today and the published date
        delta=current.date()-set_date
        num=delta.days
        # print(num)
        
        # if published date is within a week then returning the info otherwise ignoring it
        if num<8:
            return {'source': source,'url': url,'date':set_date,'title':title,'content':content,'img':img,'summary':summary}
        
        else:
            return None
    
    except Exception as e:
        print(e.__class__)
        return {'message':"I got error"}

def remove_blacklist(final_articles):
    black_file=open('../blacklist_en.txt','r')
    lines=black_file.readlines()

    blacklist_words= []

    for line in lines:
        blacklist_words.append(line.strip())

    filtered_articles=[]
    for i in range(len(final_articles)):
        item=final_articles[i]
        desc=(item['content'])
        if (len(desc))==0:
            continue
        found_blacklist_word = False
        for word in blacklist_words:
            if re.search("\W%s\W" % word, desc, re.IGNORECASE) != None:
                print(re.search("\W%s\W" % word, desc, re.IGNORECASE))
                found_blacklist_word = True
                break
        if found_blacklist_word:
            print("Ignoring")
            print(final_articles[i]['content'])
            continue
        else:
            filtered_articles.append(final_articles[i])

    return filtered_articles

#query terms for google crawling
def get_query():
    query_file=open('../query_terms.txt','r')
    lines=query_file.readlines()
    query_terms= []
    for line in lines:
        query_terms.append(line.strip())
    return query_terms

#function to crawl google
def extract_google(query_terms,startDate,endDate):
    if len(startDate)==0:
        startDate=datetime.datetime.today().strftime('%d/%m/%Y')
    if len(endDate)==0:
        endDate=datetime.datetime.strftime(datetime.datetime.today().date()-datetime.timedelta(days=7),'%d/%m/%Y')
    startDate=datetime.datetime.strptime(startDate, '%Y-%m-%d').strftime('%d/%m/%y')
    endDate=datetime.datetime.strptime(endDate, '%Y-%m-%d').strftime('%d/%m/%y')
    final_articles=[]
    print(startDate)
    print(endDate)
    print("Crawling Starting")
    # here extracting news from google news
    googlenews = GoogleNews()
    googlenews.setTimeRange(startDate,endDate)
    for query in query_terms:
        googlenews.clear()

        #forming the search term     
        googlenews.search("India Technology "+query)

        result = googlenews.result()

        for n in range(len(result)):
            source=result[n]['media']
            url=result[n]['link']
            try:
                article=Article(url)
                article.download()
                article.parse()
            except Exception as e:
                print("Trouble downloading so skipping")
                continue
            content=article.text
            
            # summarize the content
            temp_content = re.sub(r'^\s*[\(\[].*?[\)\]]\s*', '', content)
            sentences = sent_detector.tokenize(temp_content)
            summary=(" ".join(sentences[:2]).strip())
            
            date=result[n]['date']
            if(date.find('ago')!=-1):
                date=current.date()
            title=result[n]['title']
    #         content=result[n]['desc']
            img=result[n]['img']
            #adding the extracted info in final_articles list         
            final_articles.append({'source': source,'url': url,'date':date,'title':title,'content':content,'img':img})
    return final_articles

'''Helper functions for prediction begin here'''
'''###############################################################################################################################'''

# SVM
path_models = "../data_models/"
path_svm = path_models + 'best_svc.pickle'
with open(path_svm, 'rb') as data:
    svc_model = pickle.load(data)


path_tfidf = "../dataset/data_pickles/tfidf.pickle"

with open(path_tfidf, 'rb') as data:
    tfidf = pickle.load(data)

#getting required data
def get_data_from_csv(google_or_other):
    if google_or_other=="other":
        data = pd.read_csv("../articles.csv") 
    else:
        data=pd.read_csv("../google_articles.csv")
    df_features=data[['content']]
    df_info=data[['source','url','date','title','img','summary']]
    return (df_features, df_info)

#category mapping
category_codes = {
    'ai': 0,
    'iot': 1,
    'industry': 2,
    'cloud': 3,
    'dc': 4,
    'telecom': 5,
    'cc': 6,
    'other': 7
}

#text pre-processing
punctuation_signs = list("?:!.,;")
stop_words = list(stopwords.words('english'))

def create_features_from_df(df):
    df['Content_Parsed_1'] = df['content'].str.replace("\r", " ")
    df['Content_Parsed_1'] = df['Content_Parsed_1'].str.replace("\n", " ")
    df['Content_Parsed_1'] = df['Content_Parsed_1'].str.replace("    ", " ")
    df['Content_Parsed_1'] = df['Content_Parsed_1'].str.replace('"', '')
    df['Content_Parsed_1'] = df['Content_Parsed_1'].str.replace('”', '')
    df['Content_Parsed_1'] = df['Content_Parsed_1'].str.replace('“', '')
    df['Content_Parsed_2'] = df['Content_Parsed_1'].str.lower()
    df['Content_Parsed_3'] = df['Content_Parsed_2']
    for punct_sign in punctuation_signs:
        if(punct_sign=='.'):
            df['Content_Parsed_3'] = df['Content_Parsed_3'].str.replace(punct_sign, " ")
        df['Content_Parsed_3'] = df['Content_Parsed_3'].str.replace(punct_sign, '')
        
    df['Content_Parsed_4'] = df['Content_Parsed_3'].str.replace("'s", "")
    df['Content_Parsed_4'] = df['Content_Parsed_3'].str.replace("’s", "")
    df['Content_Parsed_4'] = df['Content_Parsed_3'].str.replace("'", "")
    df['Content_Parsed_4'] = df['Content_Parsed_3'].str.replace("’", "")
    
    wordnet_lemmatizer = WordNetLemmatizer()
    nrows = len(df)
    lemmatized_text_list = []
    for row in range(0, nrows):

        # Create an empty list containing lemmatized words
        lemmatized_list = []
        # Save the text and its words into an object
        text = df.loc[row]['Content_Parsed_4']
        text_words = text.split(" ")
        # Iterate through every word to lemmatize
        for word in text_words:
            lemmatized_list.append(wordnet_lemmatizer.lemmatize(word, pos="v"))
        # Join the list
        lemmatized_text = " ".join(lemmatized_list)
        # Append to the list containing the texts
        lemmatized_text_list.append(lemmatized_text)
    
    df['Content_Parsed_5'] = lemmatized_text_list
    
    df['Content_Parsed_6'] = df['Content_Parsed_5']
    for stop_word in stop_words:
        regex_stopword = r"\b" + stop_word + r"\b"
        df['Content_Parsed_6'] = df['Content_Parsed_6'].str.replace(regex_stopword, '')

    list_columns = ["Content_Parsed_6"]
    df = df[list_columns]
    df = df.rename(columns={'Content_Parsed_6': 'Content_Parsed'})
    # TF-IDF
    features = tfidf.transform(df['Content_Parsed']).toarray()
    print(features.shape)
    print(features)
    return (df,features)

def get_category_name(category_id):
    for category, id_ in category_codes.items():    
        if id_ == category_id:
            return category

def predict_from_features(features,confidence):
        
    # Obtain the highest probability of the predictions for each article
    predictions_proba = svc_model.predict_proba(features).max(axis=1)    
    
    # Predict using the input model
    predictions_pre = svc_model.predict(features)
    print(predictions_proba)
    print(predictions_pre)

    # Replace prediction with 7 if associated cond. probability less than threshold
    predictions = []
    probability=[]

    for prob, cat in zip(predictions_proba, predictions_pre):
        probability.append(prob)
        if prob > confidence:
            predictions.append(cat)
        else:
            predictions.append(7)

    # Return result
    categories = [get_category_name(x) for x in predictions]
    
    return (probability,categories)

#making the final data
def complete_df(df,df_content,categories,probability):
    df['Prediction'] = categories
    df['Probability']=probability
    df['Content']=df_content['content']
    return df

def build_actual_response(response):

    response.headers.add("Access-Control-Allow-Origin", "*")
    print(response)
    return response

#helper functions end here
'''############################################################################################################################'''

@app.route('/crawlweb',methods=["POST"])
def crawlweb():
    
    try:

        json_data = request.json
        if type(json_data) is str: 
            json_data=json.loads(json_data)   
        print(type(json_data))
        website=get_sources(json_data["sources"],json_data["add"])

        print(website)
        
        # list to store a dictionary of source and urls of articles
        article_urls=get_urls(website)
        
        # creating threads to speed up the download process
        pool = ThreadPool(10)

        """list storing the extracted info of articles,
        here calling the getData method on article_urls items one by one"""
        final_articles = pool.map(getData, article_urls)
        final_articles= remove_blacklist(final_articles)
        final_articles_df=pd.DataFrame.from_dict(final_articles)
        final_articles_df.to_csv('../data_from_api/articles.csv',header=True,index=False)
        pool.close() 
        pool.join()
        return build_actual_response(jsonify({ 'StatusMessage': 'Crawling Done' }))

    except Exception as e:
        print(e)
        return build_actual_response(jsonify({ 'StatusMessage': 'Error occured' }))

@app.route('/crawlgoogle',methods=["POST"])
def crawlgoogle():
    try:
        json_data = request.json
        print(json_data)
        if type(json_data) is str:
            json_data=json.loads(json_data)
        print(json_data)
        startDate=json_data['startDate']
        endDate=json_data['endDate']
        query_terms=get_query()
        print(query_terms)
        final_articles=extract_google(query_terms,startDate,endDate)
        final_articles= remove_blacklist(final_articles)
        final_articles_df=pd.DataFrame.from_dict(final_articles)
        final_articles_df.to_csv('google_articles.csv',header=True,index=False)
        return build_actual_response(jsonify({ 'StatusMessage': 'Crawling Done' }))
    
    except Exception as e:
        print(e)
        return build_actual_response(jsonify({ 'StatusMessage': 'Error occured' }))

@app.route('/predictCategory',methods=["POST"])
def predict():

    try:
        json_data=request.json
        if type(json_data) is str:
            json_data=json.loads(json_data)
        print(json_data)
        confidence=json_data["confidence"]
        confidence=float(confidence)/100
        print(confidence)
        google_or_other=json_data["value"]
        df_features,df_info=get_data_from_csv(google_or_other)
        print(df_features)
        print(df_info)
        df_features = df_features.reset_index().drop('index', axis=1)

        print(df_features.shape)
        print(df_info.shape)

        df,features = create_features_from_df(df_features)
        print(features)
        # Predict
        probability,predictions = predict_from_features(features,confidence)
        df = complete_df(df_info,df, predictions,probability)
        if google_or_other=="other":
            df.to_csv('predicted_articles.csv',header=True,index=False)
        else:
            df.to_csv('google_predicted_articles.csv',header=True,index=False)

        return build_actual_response(jsonify({ 'StatusMessage': 'Predicting Done' }))
    except Exception as e:
        return build_actual_response(jsonify({'resp':e}))
    
@app.route('/download',methods=["POST"])
def download_file():
    try:
        json_data=request.json
        print(type(json_data))
        print(json_data)
        if type(json_data) is str:
            json_data=json.loads(json_data)
        print(type(json_data))
        # download_file=json_data["value"]
        print(download_file)
        if download_file=="other":
            return build_actual_response(send_file('predicted_articles.csv', attachment_filename='predicted_articles.csv'))
        else:
            return build_actual_response(send_file('google_predicted_articles.csv', attachment_filename='google_predicted_articles.csv'))
    except Exception as e:
        return build_actual_response(jsonify({'resp':e}))

if __name__=="__main__":
    print("App")
    app.run(debug=True)