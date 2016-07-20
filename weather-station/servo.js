'use strict';

var five = require("johnny-five");
var readline = require("readline");
const fetch = require('node-fetch');
const apiKey = 'bdcf92bdc2316915261fc4f7de818938';
const args = process.argv[2] || 'Berlin';

let servo;

function getWeather(servo, place) {
    const weatherURL = 'http://api.openweathermap.org/data/2.5/forecast?' + 'q=' + encodeURIComponent(place) +'&mode=json&units=metric&appid=' + apiKey;

    const promise = fetch(weatherURL)
		.then(response => response.json())
        .then(mapWeather)
        .then(angle => moveServo(servo, angle))
		.catch(err => console.log(err));
}

function mapWeather(weatherData) {
    const temp = weatherData.list[0].main.temp;

    if (temp <= 0) return 5;
    else if (temp <= 10) return 45;
    else if (temp <= 20) return 90;
    else return 150;
}

function moveServo(servo, angle) {
    console.log('Angle:', angle);
    servo.to(angle);
}

five.Board().on("ready", function() {
  servo = new five.Servo(9);
  getWeather(servo, args);
});
