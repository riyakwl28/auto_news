import React from 'react';
import Typography from '@material-ui/core/Typography';
import './Crawl.css';
import axios from 'axios';


class Download extends React.Component {

 state={message:""}
  
  onPressPredict= async ()=>{
    try {
      const response=await axios({
        url: 'http://127.0.0.1:5000/download', //your url
        method: 'GET',
        responseType: 'blob', // important
      }).then((response) => {
        this.setState({message:"Data is being downloaded"})
         const url = window.URL.createObjectURL(new Blob([response.data]));
         const link = document.createElement('a');
         link.href = url;
         link.setAttribute('download', 'predicted_articles.csv'); //or any other extension
         document.body.appendChild(link);
         link.click();
      });
      console.log(response);
    } catch (e) {
      this.setState({message:e.message});
    }
  }
  render(){
    return (
    <div>
      {
        this.state.message?<div>{this.state.message}</div>:<React.Fragment><Typography variant="h6" gutterBottom>
        Press the button to download required files.
      </Typography>
      <button className={`crawl-button`} onClick={this.onPressPredict}>
          Download the data
        </button>
        </React.Fragment>
      }
      
      </div>
  )};
}

export default Download;