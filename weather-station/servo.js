'use strict';

const five = require('johnny-five');
const readline = require('readline');
const fetch = require('node-fetch');
const apiKey = 'bdcf92bdc2316915261fc4f7de818938';
const args = process.argv[2] || 'Berlin';
const mapRange = require('./helpers').mapRange;

let servo;

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

function mapTemperatureToValue(weatherData) {
  const temp = weatherData.main.temp;

  if (temp <= 0) return 5;
  else if (temp <= 10) return 45;
  else if (temp <= 20) return 90;
  return 150;
}

function moveServo(servo, angle) {
    console.log('Angle:', angle);
    //servo.to(angle);
}

let range = mapRange(0, 30, 90, 180);
console.log(range(0));

getForecast(args)
  .then(getCurrentWeather)
  .then(mapTemperatureToValue)
  .then(temp => moveServo(servo, temp))
  .catch(err => console.log('Ops', err))

/*five.Board().on('ready', function() {
  servo = new five.Servo(9);
});*/
