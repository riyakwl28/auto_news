import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControl from '@material-ui/core/FormControl';
import FormArray from './components/FormArray';
import axios from 'axios';
import './Crawl.css'
import LoadingSpinner from './components/LoadingSpinner';


class Crawl extends React.Component {

  state={value:"no",data:"",loading:false,message:""};
  
  hideLoader = () => {
    this.setState({ loading: false });
  }

  showLoader = () => {
    this.setState({ loading: true });
  }
  
  handleChange = (event) => {
    this.setState({value:event.target.value});
  };

  onSubmitForm=(jsonData)=>{
    console.log(jsonData)
    this.setState({ data: jsonData });
  }
  
  onPressCrawl = async() => {
    console.log(this.state.data);
    this.showLoader();
    try {
      const response=await axios({
        method: 'post',
        headers: { 
          'Content-Type': 'application/json'
        },
        url: 'http://127.0.0.1:5000/crawlweb',
        data: JSON.stringify(this.state.data)
      })
      .then(result => this.setState({
        loading: false,
        message: "Crawling Done",
      }));
      } catch (e) {
      this.setState({message:e.message,loading:false});
    }
    
  }

  render() {
    const {value} =this.state
    return (
      <div>
        {
          this.state.message?<div className={`crawl-done`}>{this.state.message}</div> :<React.Fragment>
        
          <Typography variant="h6" gutterBottom>
            Sources
          </Typography>
          <hr></hr>
          {(this.state.loading) ? <LoadingSpinner message="Data is being Crawled!!" /> :<Grid container style={{alignContent:'center'}}>
            <Grid item >
              <Typography variant="h8" color="inherit" noWrap >
                  Want to Add Sources?
                    <RadioGroup row aria-label="sourcePredict" name="sourcePredict1" value={this.state.value} onChange={this.handleChange}>
                    <FormControlLabel labelPlacement="bottom" value="yes" control={<Radio />} label="Yes" />
                    <FormControlLabel labelPlacement="bottom" value="no" control={<Radio />} label="No" />
                    </RadioGroup>
              </Typography>
              <div>
                  {  value==='yes'
                      ? <FormArray onSubmitForm={this.onSubmitForm}/>
                      : null
                  }
                
              </div>
              
            </Grid>
          </Grid> }
          
          <button className={`crawl-button`} onClick={this.onPressCrawl} disabled={this.state.value==="no"}>
            Crawl the data
          </button>
        </React.Fragment>
        }
      </div>
      
    );
  }
}
export default Crawl;