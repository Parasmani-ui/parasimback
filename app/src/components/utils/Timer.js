import React, { useState, useEffect, useRef } from 'react';
import { Form, Button } from 'react-bootstrap';
import InputGroup from 'react-bootstrap/InputGroup';

function Timer() {
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [remainingTime, setRemainingTime] = useState(0);
  const hoursRef = useRef(null);
  const minutesRef = useRef(null);
  const secondsRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime(prevTime => {
        if (prevTime > 0) {
          return prevTime - 1;
        } else {
          clearInterval(timer);
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (timeInSeconds) => {
    const formattedHours = padZero(Math.floor(timeInSeconds / 3600));
    const formattedMinutes = padZero(Math.floor((timeInSeconds % 3600) / 60));
    const formattedSeconds = padZero(timeInSeconds % 60);

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  };

  const padZero = (value) => {
    return String(value).padStart(2, '0');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const hoursValue = parseInt(hours) || 0;
    const minutesValue = parseInt(minutes) || 0;
    const secondsValue = parseInt(seconds) || 0;

    const totalSeconds = (hoursValue * 3600) + (minutesValue * 60) + secondsValue;

    setRemainingTime(totalSeconds);
  };

  const handleInputChange = (e, setter, maxLength, nextRef) => {
    const input = e.target.value;

    if (/^\d*$/.test(input) && input.length <= maxLength) {
      setter(input);
      if (input.length === maxLength && nextRef && nextRef.current) {
        nextRef.current.focus();
      }
    }
  };

  return (
    <div>
      <Form onSubmit={handleSubmit}>
        <InputGroup className="mb-3">
          <Form.Control
            type="number"
            value={hours}
            onChange={(e) => handleInputChange(e, setHours, 2, minutesRef)}
            maxLength={2}
            placeholder="hh"
            style={{borderRight: 'none'}}
          />
          <span className="input-group-text" style={{backgroundColor: 'white', borderLeft: 'none', borderRight: 'none'}}>:</span>
          <Form.Control
            type="number"
            value={minutes}
            onChange={(e) => handleInputChange(e, setMinutes, 2, secondsRef)}
            maxLength={2}
            placeholder="mm"
            style={{borderLeft: 'none', borderRight: 'none'}}
          />
          <span className="input-group-text" style={{backgroundColor: 'white', borderLeft: 'none', borderRight: 'none'}}>:</span>
          <Form.Control
            type="number"
            value={seconds}
            onChange={(e) => handleInputChange(e, setSeconds, 2, null)}
            maxLength={2}
            placeholder="ss"
            style={{borderLeft: 'none'}}
          />
        </InputGroup>
        <Button type="submit">Start</Button>
      </Form>
      <div>{formatTime(remainingTime)}</div>
    </div>
  );
}

export default Timer;
