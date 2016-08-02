'use strict';

const five = require('johnny-five');
const readline = require('readline');
const fetch = require('node-fetch');
const apiKey = 'bdcf92bdc2316915261fc4f7de818938';
const args = process.argv[2] || 'Nuuk Greenland';
const mapRange = require('./helpers').mapRange;

let servo;
let leds;

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

  console.log('Temp is: ', temp);

  if (temp <= 0) return 0;
  else if (temp <= 10) return 1;
  else if (temp <= 15) return 2;
  else if (temp <= 20) return 3;
  else if (temp <= 25) return 4;
  return 6
}

function moveServo(servo, angle) {
    console.log('Angle:', angle);
    //servo.to(angle);
}

function lightUpLeds(value) {
  leds.forEach((led, index) => {
    if (index <= value) {
      led.on();
    } else {
      led.off();
    }
  });
}

let range = mapRange(0, 30, 90, 180);

five.Board().on('ready', function() {
  servo = new five.Servo(9);
  leds = new five.Leds([11,8,7,6,5,4,3]);

  getForecast(args)
    .then(getCurrentWeather)
    .then(mapTemperatureToValue)
    .then(lightUpLeds)
    .then(temp => moveServo(servo, temp))
    .catch(err => console.log('Ops', err))
});
