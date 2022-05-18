import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState, useRef } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField'; 

function App() {
  const[weatherData, setWeatherData] = useState(); 
  const[locationData, setLocationData] = useState(); 
  const[storiesData, setStoriesData] = useState(); 
  const[storiesLoaded, setStoriesLoaded] = useState(10); 
  let zip = ""; 
  //const APIKey = process.env.REACT_APP_api_key; 
  const APIKey = "1d9b6d7477f71113003f2531b1ab7677"; 
  const generateLocationData = () => { 
    if(zip!="") {
      fetch("http://api.openweathermap.org/geo/1.0/zip?zip=" + zip + ",US&appid=" + APIKey)
      .then((res) => res.json())
      .then((data) => setLocationData(data)); 
    }
  }

  const generateWeatherData = () => {
    if(locationData) {
      fetch("https://api.openweathermap.org/data/2.5/onecall?lat=" + locationData.lat + "&lon=" + locationData.lon + "&exclude=minutely,alerts&appid=" + APIKey)
      .then((res) => res.json())
      .then((data) => setWeatherData(data))
    }
  }

  const generateStoriesData = () => {
    if(locationData) {
      fetch("https://api.nytimes.com/svc/mostpopular/v2/viewed/1.json?api-key=hjsVQGzl9AHGR1Bxh0OSJHPOotTQln0m")
      .then((res) => res.json())
      .then((data) => setStoriesData(data))
    }
  }

  useEffect(() => {
    generateLocationData(); 
    generateWeatherData(); 
    generateStoriesData();
  }, [])

  // console.log(weatherData); 
  const textFieldRef = useRef(); 
  const textFieldRef2 = useRef(); 
  if(!locationData) {
    return (
      <div className="App">
        <h2>Enter Zipcode</h2>
        <form>
          <TextField id="zipcode" variant="outlined" inputRef={textFieldRef}/>
        </form>
        <h2>Enter Number of Stories to Load</h2>
        <form>
          <TextField id="storiesNumber" variant="outlined" inputRef={textFieldRef2}/>
        </form>
        <br></br>
        <Button variant="outlined" onClick={() => {
          zip = textFieldRef.current.value; 
          if(textFieldRef2.current.value != "") {
            setStoriesLoaded(parseInt(textFieldRef2.current.value)); 
          }
          console.log(storiesLoaded); 
          generateLocationData(); 
        }}>Generate</Button>
      </div>
    );
  }
  else if (!weatherData || !storiesData) {
    generateWeatherData(); 
    generateStoriesData();
    console.log(locationData); 
    return(
      <div className="App">
        <p>Generating Weather Data...</p>
      </div>
    ); 
  }
  else {
    console.log(weatherData); 
    console.log("sending..." + storiesLoaded)
    return(
      <div className="App" style={{display: "flex"}}>
        <StoriesCard stories={storiesData} loadNumber={storiesLoaded}/>
        <WeatherCard style={{width: 360}} offset={weatherData.timezone_offset} weather={weatherData.current} hourly={weatherData.hourly} daily={weatherData.daily} name={locationData.name} latitude={locationData.lat} longitude={locationData.lon}/>
      </div>
    ); 
  }
}

class WeatherCard extends React.Component {
  render() {
    console.log(this.props.weather); 
    const divStyle = {
      backgroundColor: "lightblue", 
      width: 360,
    }
    const imgStyle = {
      width: 360, 
      height: "auto",
      padding: 0,
      margin: 0,
    }
    let hourlyForecastRows = []; 
    for(let x = 0; x < 8; x++) {
      let hourlyForecast = []; 
      for(let i = 0; i < 3; i++) {
        hourlyForecast.push(this.props.hourly[(3*x+i)]); 
      }
      hourlyForecastRows.push(hourlyForecast); 
    }
    let dailyForecastRows = []; 
    for(let x = 0; x < 2; x++) {
      let dailyForecast = []; 
      for(let i = 0; i < 3; i++) {
        dailyForecast.push(this.props.daily[(1+3*x+i)]); 
      }
      dailyForecastRows.push(dailyForecast); 
    }
    const iconURL = "http://openweathermap.org/img/wn/" + this.props.weather.weather[0].icon + "@2x.png";
    return(
      <div style={divStyle}>
        <h1 style={{fontSize: 44, fontFamily: "Courier New"}}>{this.props.name} Weather</h1>
        <img src={iconURL} alt={this.props.weather.weather[0].description} style={imgStyle}/>
        <h2>{this.props.weather.weather[0].description}</h2>
        <h4 style={{fontSize: 84, padding: 0, fontFamily: 'Garamond'}}>{Math.round(((this.props.weather.temp-273.15)*(9/5)+32)*10)/10}&deg;F</h4>
        {/* <h4>Hi {Math.round(((this.props.weather.main.temp_max-273.15)*(9/5)+32)*10)/10}&deg;F / Lo {Math.round(((this.props.weather.main.temp_min-273.15)*(9/5)+32)*10)/10}&deg;F</h4> */}
        <h4>Pressure: {this.props.weather.pressure*100} Pascals / {Math.round(this.props.weather.pressure/0.3386)/100}Hg</h4>
        <h4>Wind: {Math.round(this.props.weather.wind_speed*223.7)/100}mph</h4>
        <h4>UV Index: {this.props.weather.uvi}</h4>
        <h4>Latitude: {this.props.latitude}, Longitude: {this.props.longitude}</h4>
        <br></br>
        <h1 style={{fontStyle: "italic"}}>Hourly Forecasts</h1>
        {hourlyForecastRows.map((row) => <HourlyForecastRow timeOffset={this.props.offset} data={row}/>)}
        <br></br>
        <h1 style={{fontStyle: "italic"}}>Daily Forecasts</h1>
        {dailyForecastRows.map((row) => <DailyForecastRow data={row}/>)}
      </div>
    );
  }
}

class StoriesCard extends React.Component {
  render() {
    console.log("loaded: " + this.props.loadNumber); 
    const storyArray = []; 
    for(let x = 0; x<this.props.loadNumber; x++) {
      storyArray.push(this.props.stories.results[x]); 
    }
    return(
      <div style={{backgroundColor: "#e0e0e0"}}>
        <h1 style={{fontSize: 44, fontFamily: "Courier New"}}>New York Times Top {this.props.loadNumber} Most Popular Articles</h1>
        {storyArray.map((story) => <StoryBox storyItem={story} key={story.title}/> )}
      </div>
    ); 
  }
}

class StoryBox extends React.Component {
  render() {
    if(this.props.storyItem.media[0]) {
      return(
        <div>
          <a href={this.props.storyItem.url} style={{color: "black", fontWeight: "bold", fontSize: 26}}>{this.props.storyItem.title}</a>
          <h4>{this.props.storyItem.byline}</h4>
          <br></br>
          <img src={this.props.storyItem.media[0]["media-metadata"][2].url} />
          <p style={{fontSize: 12, fontStyle: 'italic', color: 'grey'}}>{this.props.storyItem.media[0].caption}</p>
          <p>{this.props.storyItem.abstract}</p>
          <br></br>
        </div>
      );
    }
    else {
      return(
        <div>
          <a href={this.props.storyItem.url} style={{color: "black", fontWeight: "bold", fontSize: 26}}>{this.props.storyItem.title}</a>
          <h4>{this.props.storyItem.byline}</h4>
          <p>{this.props.storyItem.abstract}</p>
          <br></br>
        </div>
      );
    }
  }
}

class HourlyForecastRow extends React.Component {
  render() {
    return(
      <div style={{display: "flex"}}>
        {this.props.data.map((hour) => <ForecastCard offset={this.props.timeOffset} hourlyData={hour}/>)}
      </div>
    ); 
  }
}

class ForecastCard extends React.Component {
  render() {
    let time = this.props.hourlyData.dt%86400; 
    time = Math.round(time/3600); 
    time += this.props.offset/3600; 
    const imgStyle = {
      width: 97, 
      height: "auto",
      padding: 0,
      margin: 0,
    }
    let timeString = ""; 
    if(time < 0) {
      time += 24; 
    }
    if(time == 0) {
      timeString = "12AM";
    }
    else if (time < 12) {
      timeString = time + "AM"; 
    }
    else if (time == 12) {
      timeString = "12PM"; 
    }
    else {
      timeString = (time-12) + "PM"; 
    }
    const divStyle = {
      padding: 5, 
      margin: 4,
      borderStyle: "solid", 
      borderThickness: 1,
    }
    const iconURL = "http://openweathermap.org/img/wn/" + this.props.hourlyData.weather[0].icon + "@2x.png";
    return(
      <div style={divStyle}>
        <h4>{timeString}</h4>
        <img src={iconURL} style={imgStyle}/>
        <p>{this.props.hourlyData.weather[0].main}</p>
        <h3>{Math.round(((this.props.hourlyData.temp-273.15)*(9/5)+32)*10)/10}&deg;F</h3>
      </div>
    );
  }
}

class DailyForecastRow extends React.Component {
  render() {
    return(
      <div style={{display: "flex"}}>
        {this.props.data.map((day) => <DailyCard dailyData={day}/>)}
      </div>
    ); 
  }
}

class DailyCard extends React.Component {
  render() {
    const imgStyle = {
      width: 97, 
      height: "auto",
      padding: 0,
      margin: 0,
    }
    const divStyle = {
      padding: 5, 
      margin: 4,
      borderStyle: "solid", 
      borderThickness: 1,
    }
    const iconURL = "http://openweathermap.org/img/wn/" + this.props.dailyData.weather[0].icon + "@2x.png";
    let timeStamp = this.props.dailyData.dt; 
    timeStamp *= 1000; 
    const dateObject = new Date(timeStamp); 
    const date = dateObject.toLocaleString("en-US", {month: "numeric"}) + "/" + dateObject.toLocaleString("en-US", {day: "numeric"})
    return(
      <div style={divStyle}>
        <h4>{dateObject.toLocaleString("en-US", {weekday: "long"})}</h4>
        <h4>{date}</h4>
        <img src={iconURL} style={imgStyle}/>
        <p>{this.props.dailyData.weather[0].main}</p>
        <h3>{Math.round((this.props.dailyData.temp.max-273.15)*(9/5)+32)}&deg;F / {Math.round((this.props.dailyData.temp.min-273.15)*(9/5)+32)}&deg;F</h3>
      </div>
    );
  }
}

export default App;
