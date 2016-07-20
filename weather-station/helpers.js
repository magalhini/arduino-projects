'use strict';

const mapRange = ((minIn, maxIn, minOut, maxOut) => (n) => (n - minIn) * (maxOut - minOut) / (maxIn - minIn) + minOut);

module.exports = {
  mapRange
};
