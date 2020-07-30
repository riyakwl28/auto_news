import React from 'react';
import Typography from '@material-ui/core/Typography';
import './Crawl.css';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import axios from 'axios';


class Download extends React.Component {

 state={message:"",value:""}

  mymap={'other':'predicted_articles.csv','google':'google_predicted_articles.csv'}

 handleChange = (event) => {
  this.setState({value:event.target.value});
};
  
  onPressPredict= async ()=>{
    console.log(JSON.stringify({value:this.state.value}))
    try {
      const response=await axios({
        url: 'http://127.0.0.1:5000/download', //your url
        method: 'POST',
        responseType: 'blob',// important
        data :JSON.stringify({value:this.state.value}),
      }).then((response) => {
        this.setState({message:"Data is being downloaded"})
         const url = window.URL.createObjectURL(new Blob([response.data]));
         const link = document.createElement('a');
         link.href = url;
         link.setAttribute('download', this.mymap[this.state.value]); //or any other extension
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
        Choose the File to download.
      </Typography>
      <RadioGroup row aria-label="sourceDownload" name="sourceDownload1" value={this.state.value} onChange={this.handleChange}>
                    <FormControlLabel labelPlacement="bottom" value="google" control={<Radio />} label="Google" />
                    <FormControlLabel labelPlacement="bottom" value="other" control={<Radio />} label="Other Websites" />
                    </RadioGroup>
      <button className={`crawl-button`} onClick={this.onPressPredict}>
          Download the data
        </button>
        </React.Fragment>
      }
      
      </div>
  )};
}

export default Download;