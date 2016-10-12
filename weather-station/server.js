'use strict';

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const five = require('johnny-five');
const fetch = require('node-fetch');
const apiKey = 'WEATHER_API_KEY';

let servo;
let leds;

/**
 * Setup Express server
 */
app.use(express.static(__dirname + '/public'))
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html')
});

/**
 * Get the forecast for a particular place
 */
function getForecast(place) {
  const weatherURL = 'http://api.openweathermap.org/data/2.5/forecast?' + 'q=' + encodeURIComponent(place) +'&mode=json&units=metric&appid=' + apiKey;

  return new Promise((res, rej) => {
    fetch(weatherURL)
      .then(response => res(response.json()))
      .catch(err => rej(err));
  });
}

function getCurrentWeather(weather) {
  return weather.list[0];
}

function mapTemperatureToValue(temp) {
  if (temp <= 0) return 0;
  else if (temp <= 10) return 1;
  else if (temp <= 15) return 2;
  else if (temp <= 20) return 3;
  else if (temp <= 27) return 4;
  return 6;
}

function lightUpLeds(weather) {
  const currentTemperature = weather.main.temp;
  const value = mapTemperatureToValue(currentTemperature);

  leds.forEach((led, index) => {
    if (index <= value) {
      led.on();
    } else {
      led.off();
    }
  });

  return weather;
}

function moveServoToCondition(weather) {
  const description = weather.weather[0].description;
  console.log(weather.weather[0]);
  const angle = mapConditionToAngle(description);
  console.log('Condition is', description, 'angle is', angle);

  servo.to(angle, 600);
  return weather;
}

function mapConditionToAngle(condition) {
  switch (condition) {
    case 'clear sky':
    case 'sky is clear':
    return 160;
    case 'shower rain':
    case 'light rain':
    return 85;
    case 'rain':
    case 'moderate rain':
    return 105;
    case 'scattered clouds':
    return 115;
    case 'broken clouds':
    return 135;
    case 'thunderstorm':
    return 150;
  }
}

/**
 * Listen to the Arduino board.
 * Once it's connected, prepare the hardware,
 * and set up the socket events.
 */
five.Board().on('ready', function() {
  servo = new five.Servo(9);
  leds = new five.Leds([11,8,7,6,5,4,3]);

  // Setting up the listeners for our websocket events.
  io.on('connection', (client) => {
    // Just to make sure we're connected...
    client.on('join', (data) => console.log('Connected'));

    // The meat of our application.
    //
    // Listen to changes sent by the search field on the page.
    // Once a 'search-weather' event is sent, trigger the chain
    client.on('search-weather', (data) => {
      getForecast(data.city)
        .then(getCurrentWeather)
        .then(moveServoToCondition)
        .then(lightUpLeds)
        .catch(err => console.log('Error getting weather: ', err))
    });
  });
});

/**
 * Initialize the local express server
 */
 const port = process.env.PORT || 3000;

 server.listen(port);
 console.log(`Server listening on http://localhost:${port}`);
