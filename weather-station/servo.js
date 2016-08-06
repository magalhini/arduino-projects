'use strict';

const five = require('johnny-five');
const readline = require('readline');
const fetch = require('node-fetch');
const apiKey = 'bdcf92bdc2316915261fc4f7de818938';
const args = process.argv[2] || 'berlin';
const mapRange = require('./helpers').mapRange;

let servo;
let leds;
let rl = readline.createInterface(process.stdin, process.stdout);

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
  console.log('Temperature in', args, temp);
  if (temp <= 0) return 0;
  else if (temp <= 10) return 1;
  else if (temp <= 15) return 2;
  else if (temp <= 20) return 3;
  else if (temp <= 25) return 4;
  return 6;
}

function moveServo(angle) {
    servo.to(angle, 600);
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
  const angle = mapConditionToAngle(description);
  console.log('Condition is', description);

  servo.to(angle, 600);
  return weather;
}

function mapConditionToAngle(condition) {
  switch (condition) {
    case 'clear sky':
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

five.Board().on('ready', function() {
  servo = new five.Servo(9);
  leds = new five.Leds([11,8,7,6,5,4,3]);

  rl.question('Where?', (answer) => {
    getForecast(answer)
      .then(getCurrentWeather)
      .then(moveServoToCondition)
      .then(lightUpLeds)
      .catch(err => console.log('Error getting weather: ', err))
    rl.close();
    
  })


});
