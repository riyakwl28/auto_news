import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormArray from './components/FormArray';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import axios from 'axios';
import './Crawl.css'
import LoadingSpinner from './components/LoadingSpinner';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';



class Crawl extends React.Component {

  classes = makeStyles((theme) => ({
    container: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: 200,
    },
  }));

  state={value:"no",data:"",loading:false,message:"",checked:false,dateValue:false,startDate:"",endDate:""};
  
  toggleChecked=()=>{
    console.log(!(this.state.checked))
    this.setState({checked:!(this.state.checked)})
  }

  handleDateChange =(event) =>{
    this.setState({ dateValue: event.target.value });
  }

  handleStartDateChange=(event) =>{
    console.log(event.target.value);
    this.setState({startDate:event.target.value});
  }

  handleEndDateChange=(event) =>{
    this.setState({endDate:event.target.value});
  }

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
    var dataToSend=JSON.stringify(this.state.data);
    console.log(dataToSend);
    if(!this.state.checked && this.state.value==='no'){
      dataToSend=JSON.stringify({"sources":[],"add":"0"})
    }
    var urlTo='http://127.0.0.1:5000/crawlweb'
    if(this.state.checked){
      dataToSend=JSON.stringify({"startDate":this.state.startDate,"endDate":this.state.endDate});
      urlTo='http://127.0.0.1:5000/crawlgoogle'
    }
    this.showLoader();
    try {
        await axios({
        method: 'post',
        headers: { 
          'Content-Type': 'application/json'
        },
        url: urlTo,
        data: dataToSend
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
    const {value,dateValue,checked} =this.state
    return (
      <div>
        {
          this.state.message?<div className={`crawl-done`}>{this.state.message}</div> :<React.Fragment>
        
          <Typography variant="h6" gutterBottom>
            Sources
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={<Switch checked={this.state.checked} onChange={this.toggleChecked} />}
              label="Google Crawl"
            />
        </FormGroup>
          <hr></hr>
          
          {(this.state.loading) ? <LoadingSpinner message="Data is being Crawled!!" /> : 
          <div>
            {(this.state.checked)?
              (
                <Grid container style={{alignContent:'center'}}>
                  <Grid item >
                    <Typography variant="h8" color="inherit" noWrap >
                          <h5> Want to Add Date Range?</h5>
                            <RadioGroup row aria-label="date" name="date1" value={this.state.dateValue} onChange={this.handleDateChange}>
                            <FormControlLabel labelPlacement="bottom" value="yes" control={<Radio />} label="Yes" />
                            <FormControlLabel labelPlacement="bottom" value="no" control={<Radio />} label="No" />
                            </RadioGroup>
                    </Typography>
                  </Grid>
                </Grid> 
                
              ): 
              (
                <Grid container style={{alignContent:'center'}}>
                
                  <Grid item >
                    <Typography variant="h8" color="inherit" noWrap >
                        <h5> Want to Add Sources?</h5>
                          <RadioGroup row aria-label="sourcePredict" name="sourcePredict1" value={this.state.value} onChange={this.handleChange}>
                          <FormControlLabel labelPlacement="bottom" value="yes" control={<Radio />} label="Yes" />
                          <FormControlLabel labelPlacement="bottom" value="no" control={<Radio />} label="No" />
                          </RadioGroup>
                    </Typography>
                  </Grid>
                </Grid>
              )
             }
          </div>
          
          }
              <br/>
              <div className="sources-form">
                  {  value==='yes'
                      ? <FormArray onSubmitForm={this.onSubmitForm}/>
                      : null
                  }
                
              </div>
              
                
              <div className="sources-form">
                  {
                    (dateValue==='yes' && checked)?
                    (
                      <Grid container justify="space-around">
                      <form className={this.classes.container} noValidate>
                        <TextField
                          id="startDate"
                          label="Start Date"
                          type="date"
                          value={this.state.startDate}
                          onChange={this.handleStartDateChange}
                          className={this.classes.textField}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </form>
                      <form className={this.classes.container} noValidate>
                        <TextField
                          id="date"
                          label="End Date"
                          type="date"
                          value={this.state.endDate}
                          onChange={this.handleEndDateChange}
                          className={this.classes.textField}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </form>
                      </Grid>
                      
                    )
                      :
                      null
                  }
              </div>
                
          
         
           
          
          <button className={`crawl-button`} onClick={this.onPressCrawl}>
            Crawl the data
          </button>
        </React.Fragment>
        }
      </div>
      
    );
  }
}
export default Crawl;