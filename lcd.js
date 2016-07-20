var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  var lcd = new five.LCD({
    // LCD pin name  RS  EN  DB4 DB5 DB6 DB7
    // Arduino pin # 7    8   9   10  11  12
    pins: [7, 8, 9, 10, 11, 12],
    rows: 4,
    cols: 16,
    backlight: 6
  });

  lcd.useChar("check");
  lcd.clear().print("rmurphey, hgstrp");

  this.repl.inject({
    lcd: lcd
  });

});
