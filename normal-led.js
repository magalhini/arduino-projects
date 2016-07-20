var five = require('johnny-five')
var board = new five.Board();

board.on('ready', function() {
    var leds = new five.Leds([5, 6, 4]);
     var pot = new five.Sensor("A0");

     pot.scale([-1, 2]).on("change", function() {
     var lastIndex = Math.round(this.value);

     console.log(lastIndex)

     if (lastIndex === -1) {
       leds.off();
     } else {
       leds.each(function(led, index) {
         if (index <= lastIndex) {
           led.on();
         } else {
           led.off();
         }
       });
     }
   });
});
