'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _styles = require('material-ui/styles');

var _transitions = require('material-ui/styles/transitions');

var _colorManipulator = require('material-ui/styles/colorManipulator');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _Clock = require('./Clock');

var _Clock2 = _interopRequireDefault(_Clock);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var styles = function styles(theme) {
  return {
    root: {
      width: 288,
      fontFamily: theme.typography.fontFamily
    },
    header: {
      background: theme.palette.primary.main,
      color: (0, _colorManipulator.fade)((0, _colorManipulator.getContrastRatio)(theme.palette.primary.main, theme.palette.common.black) < 7 ? theme.palette.common.white : theme.palette.common.black, 0.54),
      padding: '20px 0',
      lineHeight: '58px',
      fontSize: '58px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'baseline',
      userSelect: 'none'
    },
    time: {
      transition: 'all ' + _transitions.duration.short + 'ms ' + _transitions.easing.easeInOut,
      cursor: 'pointer'
    },
    placeholder: {
      flex: 1
    },
    ampm: {
      display: 'flex',
      flexDirection: 'column-reverse',
      flex: 1,
      fontSize: '14px',
      lineHeight: '20px',
      marginLeft: 16,
      fontWeight: 700
    },
    select: {
      color: (0, _colorManipulator.getContrastRatio)(theme.palette.primary.main, theme.palette.common.black) < 7 ? theme.palette.common.white : theme.palette.common.black
    },
    body: {
      padding: '24px 16px',
      background: theme.palette.background.paper
    }
  };
};

var TimePicker = function (_React$Component) {
  _inherits(TimePicker, _React$Component);

  function TimePicker(props) {
    _classCallCheck(this, TimePicker);

    var _this = _possibleConstructorReturn(this, (TimePicker.__proto__ || Object.getPrototypeOf(TimePicker)).call(this, props));

    _this.handleClockChange = function (value) {
      if (_this.state.select === 'h') {
        if (_this.props.mode === '12h') {
          if (_this.state.hours >= 12) {
            _this.setState({ hours: value === 12 ? value : value + 12 }, _this.propagateChange);
          } else {
            _this.setState({ hours: value === 12 ? 0 : value }, _this.propagateChange);
          }
        } else {
          _this.setState({ hours: value }, _this.propagateChange);
        }
      } else {
        _this.setState({ minutes: value }, function () {
          _this.propagateChange();
        });
      }
    };

    _this.handleClockChangeDone = function (e) {
      e.preventDefault(); // prevent mouseUp after touchEnd

      if (_this.state.select === 'm') {
        if (_this.props.onMinutesSelected) {
          setTimeout(function () {
            _this.props.onMinutesSelected();
          }, 300);
        }
      } else {
        setTimeout(function () {
          _this.setState({ select: 'm' });
        }, 300);
      }
    };

    _this.editHours = function () {
      return _this.setState({ select: 'h' });
    };

    _this.editMinutes = function () {
      return _this.setState({ select: 'm' });
    };

    _this.setAm = function () {
      if (_this.state.hours >= 12) {
        _this.setState({ hours: _this.state.hours - 12 }, _this.propagateChange);
      }
    };

    _this.setPm = function () {
      if (_this.state.hours < 12) {
        _this.setState({ hours: _this.state.hours + 12 }, _this.propagateChange);
      }
    };

    _this.propagateChange = function () {
      if (_this.props.onChange != null) {
        var date = new Date();
        date.setHours(_this.state.hours);
        date.setMinutes(_this.state.minutes);
        date.setSeconds(0);
        date.setMilliseconds(0);
        _this.props.onChange(date);
      }
    };

    var defaultValue = new Date();
    defaultValue.setSeconds(0);
    defaultValue.setMilliseconds(0);
    var time = props.value || props.defaultValue || defaultValue;
    _this.state = {
      select: 'h',
      hours: time.getHours(),
      minutes: time.getMinutes()
    };
    return _this;
  }

  _createClass(TimePicker, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (nextProps.value != null && (this.props.value == null || nextProps.value.getTime() !== this.props.value.getTime())) {
        this.setState({
          hours: nextProps.value.getHours(),
          minutes: nextProps.value.getMinutes()
        });
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          classes = _props.classes,
          mode = _props.mode;


      var clockMode = this.state.select === 'm' ? 'minutes' : mode;
      var minutes = this.state.minutes;

      var _formatHours = (0, _util.formatHours)(this.state.hours, mode),
          hours = _formatHours.hours,
          isPm = _formatHours.isPm;

      return _react2.default.createElement(
        'div',
        { className: classes.root },
        _react2.default.createElement(
          'div',
          { className: classes.header },
          _react2.default.createElement('div', { className: classes.placeholder }),
          _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement(
              'span',
              {
                className: (0, _classnames2.default)(classes.time, _defineProperty({}, classes.select, this.state.select === 'h' && 'active')),
                onClick: this.editHours
              },
              (0, _util.twoDigits)(hours)
            ),
            ':',
            _react2.default.createElement(
              'span',
              {
                className: (0, _classnames2.default)(classes.time, _defineProperty({}, classes.select, this.state.select === 'm' && 'active')),
                onClick: this.editMinutes
              },
              (0, _util.twoDigits)(minutes)
            )
          ),
          mode === '12h' ? _react2.default.createElement(
            'div',
            { className: classes.ampm },
            _react2.default.createElement(
              'span',
              {
                className: (0, _classnames2.default)(classes.time, _defineProperty({}, classes.select, isPm)),
                onClick: this.setPm
              },
              'PM'
            ),
            _react2.default.createElement(
              'span',
              {
                className: (0, _classnames2.default)(classes.time, _defineProperty({}, classes.select, !isPm)),
                onClick: this.setAm
              },
              'AM'
            )
          ) : _react2.default.createElement('div', { className: classes.placeholder })
        ),
        _react2.default.createElement(
          'div',
          { className: classes.body },
          _react2.default.createElement(_Clock2.default, {
            mode: clockMode,
            onChange: this.handleClockChange,
            value: clockMode === 'minutes' ? minutes : hours,
            onMouseUp: this.handleClockChangeDone,
            onTouchEnd: this.handleClockChangeDone
          })
        )
      );
    }
  }]);

  return TimePicker;
}(_react2.default.Component);

TimePicker.propTypes = {
  /** The initial value of the time picker. */
  defaultValue: _propTypes2.default.instanceOf(Date),
  /** Sets the clock mode, 12-hour or 24-hour clocks are supported. */
  mode: _propTypes2.default.oneOf(['12h', '24h']),
  /** Callback that is called with the new date (as Date instance) when the value is changed. */
  onChange: _propTypes2.default.func,
  /** Callback that is called when the minutes are changed. Can be used to automatically hide the picker after selecting a time. */
  onMinutesSelected: _propTypes2.default.func,
  /** The value of the time picker, for use in controlled mode. */
  value: _propTypes2.default.instanceOf(Date)
};

TimePicker.defaultProps = {
  mode: '12h'
};

exports.default = (0, _styles.withStyles)(styles)(TimePicker);