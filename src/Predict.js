import React from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControl from '@material-ui/core/FormControl';
import axios from 'axios';
import './Crawl.css';
import LoadingSpinner from './components/LoadingSpinner';



class Predict extends React.Component {

  state={value:"other",confidence:"40.0",loading:false,message:""};
  
  handleChange = (event) => {
    this.setState({value:event.target.value});
  };

  handleConfidenceChange= (event) => {
    this.setState({confidence:event.target.value});
  };

  onPressPredict= async()=>{
    this.setState({loading:true})
    console.log(this.state);
    try {
      const response=await axios({
        method: 'post',
        headers: { 
          'Content-Type': 'application/json'
        },
        url: 'http://127.0.0.1:5000/predictCategory',
        data: JSON.stringify({confidence:this.state.confidence,value:this.state.value})
      })
      .then(result => this.setState({
        loading: false,
        message: "Crawling Done",
      }));
      console.log(response);
    } catch (e) {
      this.setState({message:e.message,loading:false});
    }
  }

  render(){
    return (
      <div>
        {
          this.state.message?<div className={`crawl-done`}>{this.state.message}</div>:<React.Fragment>
            {
              (this.state.loading) ? <LoadingSpinner message="Predicting!!" />:<Grid container direction={'column'} spacing={30}>
              <Grid item>
                <FormControl component="fieldset">
                  <Typography variant="h6" color="inherit" noWrap>
                    Choose from Google or other websites
                  </Typography>
                  <RadioGroup aria-label="sourcePredict" name="sourcePredict1" value={this.state.value} onChange={this.handleChange}>
                    <FormControlLabel value="other" control={<Radio />} label="Other Websites" />
                    <FormControlLabel value="google" control={<Radio />} label="Google" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item>
                  <Typography variant="h6" color="inherit" noWrap>
                    Enter Confidence Score(if needed)
                  </Typography>
                  <input
                    type="text"
                    placeholder={`40.0`}
                    value={this.state.confidence}
                    onChange={this.handleConfidenceChange}
                  />
              </Grid>
            </Grid>
            }
          
          <button className={`crawl-button`} onClick={this.onPressPredict}>
              Predict
          </button>
        </React.Fragment>
        }
      </div>
    
  )};
}
export default Predict;