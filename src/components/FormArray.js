import React from "react";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import Typography from '@material-ui/core/Typography';
import RadioGroup from '@material-ui/core/RadioGroup';
import "./style.css";

class FormArray extends React.Component {
  constructor() {
    super();
    this.state = {
      sources: [{ source: "", url: "", rss: "" }],  
      add:"0"
    };
  }

  handleChange = (event) => {
    this.setState({add:event.target.value});
  };

  handleSourceNameChange = idx => evt => {
    const newSources = this.state.sources.map((source, sidx) => {
      if (idx !== sidx) return source;
      return { ...source, source: evt.target.value };
    });

    this.setState({ sources: newSources });
  };

  handleSourceUrlChange = idx => evt => {
    const newSources = this.state.sources.map((source, sidx) => {
      if (idx !== sidx) return source;
      return { ...source, url: evt.target.value };
    });

    this.setState({ sources: newSources });
  };

  handleSourceRssChange = idx => evt => {
    const newSources = this.state.sources.map((source, sidx) => {
      if (idx !== sidx) return source;
      return { ...source, rss: evt.target.value };
    });

    this.setState({ sources: newSources });
  };

  handleSubmit = evt => {
      evt.preventDefault();
    this.props.onSubmitForm(JSON.stringify(this.state));
  };

  handleAddSource = () => {
    this.setState({
      sources: this.state.sources.concat([{ source: "" , url: "", rss: ""}])
    });
  };

  handleRemoveSource = idx => () => {
    this.setState({
      sources: this.state.sources.filter((s, sidx) => idx !== sidx)
    });
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit} style={{border:'2px solid black',align:'center',paddingTop:'5px'}}>
          <Typography variant="h8" color="inherit" noWrap>
               <div className = "ui grid ">
                 <div className = "four wide column"></div>
                    <div className = "eight wide column">
                      <h5> Choose from the option below to crawl</h5>
                      </div>
                      <div className = "four wide column"></div>
                </div>
                  <RadioGroup aria-label="sourceAdd" name="sourceAdd1" value={this.state.value} onChange={this.handleChange}>
                  <FormControlLabel  value="0" control={<Radio />} label="Default Search" />
                  <FormControlLabel  value="1" control={<Radio />} label="Only Search the given sources" />
                  <FormControlLabel  value="2" control={<Radio />} label="Append" />
                  </RadioGroup>
            </Typography>
        {this.state.sources.map((source, idx) => (
          <div className="source">
          <div className= "ui input focus">
            <input
              type="text"
              placeholder={`Source Name`}
              value={source.source}
              onChange={this.handleSourceNameChange(idx)}
            />
           </div>
        
            <div className="ui input focus">
            <input
              type="text"
              placeholder={`Source URL`}
              value={source.url}
              onChange={this.handleSourceUrlChange(idx)}
            />
            </div>
           
            <div className="ui input focus">
            <input
              type="text"
              placeholder={`Source RSS`}
              value={source.rss}
              onChange={this.handleSourceRssChange(idx)}
            />
            </div>
            <button
              type="button"
              onClick={this.handleRemoveSource(idx)}
              className="small"
            >
              -
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={this.handleAddSource}
          className="small">
          Add Source
        </button>
        <button>Submit</button>
      </form>
    );
  }
}

export default FormArray;