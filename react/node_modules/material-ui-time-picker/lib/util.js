'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.twoDigits = twoDigits;
exports.formatHours = formatHours;
exports.getShortestAngle = getShortestAngle;
function twoDigits(n) {
  return n < 10 ? '0' + n : '' + n;
}

function formatHours(hours, mode) {
  var isPm = hours >= 12;
  if (mode === '24h') {
    return { hours: hours, isPm: isPm };
  } else if (hours === 0 || hours === 12) {
    return { hours: 12, isPm: isPm };
  } else if (hours < 12) {
    return { hours: hours, isPm: isPm };
  } else {
    return { hours: hours - 12, isPm: isPm };
  }
}

function mod(a, b) {
  return a - Math.floor(a / b) * b;
}

function getShortestAngle(from, to) {
  var difference = to - from;
  return from + mod(difference + 180, 360) - 180;
}