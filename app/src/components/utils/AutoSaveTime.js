import React, { useState, useEffect, useRef } from 'react';
import { Form, Button } from 'react-bootstrap';
import InputGroup from 'react-bootstrap/InputGroup';
import Icon from '../Icon.js';
import db from '../utils/db';
import ShowToast from '../utils/ShowToast';

const AutoSaveTime = (props) => {
    const [owner, setOwner] = useState();
    const [hours, setHours] = useState('');
    const [minutes, setMinutes] = useState('');
    const [seconds, setSeconds] = useState('');
    const [origTime, setOrigTime] = useState(props.value || '::');
    const [showSave, setShowSave] = useState(false);
    const minutesRef = useRef(null);
    const secondsRef = useRef(null);

    useEffect(() => {
        if (props.owner && props.owner != owner ) {
            setTime(props.value || '::');
            setOrigTime(props.value || '::');
            setOwner(props.owner);
            setShowSave(false);
        }
    });

    useEffect(() => {
        setOrigTime(props.value || '::');
        setShowSave(false);
        setTime(props.value || '::');
    }, [props.value]);

    const getTime = () => {
        return padZero(hours) + ':' + padZero(minutes) + ':' + padZero(seconds);
    };

    const setTime = (time) => {
        const [_hours, _minutes, _seconds] = time.split(':');
        setHours(_hours);
        setMinutes(_minutes);
        setSeconds(_seconds);
    };

    const padZero = (value) => {
        return value ? value.toString().padStart(2, '0') : '';
    };

    const onSave = async () => {
        if (parseInt(hours || 0) < 0) {
            ShowToast({ icon: 'danger', heading: 'Wrong Time', message: 'Hours cannot be negative' });
            return;
        }
        if (parseInt(minutes || 0) < 0 || parseInt(minutes || 0) >= 60) {
            ShowToast({ icon: 'danger', heading: 'Wrong Time', message: 'Minutes cannot be negative or above 59' });
            return;
        }
        if (parseInt(seconds || 0) < 0 || parseInt(seconds || 0) >= 60) {
            ShowToast({ icon: 'danger', heading: 'Wrong Time', message: 'Seconds cannot be negative or above 59' });
            return;
        }

        const value = getTime();

        /*
        if (props.onSave) {
            await props.onSave(value);
            setShowSave(false);
            return;
        }
        */

        const saveFunction = props.saveFn || 'saveCaseStudyData';

        await db[saveFunction](props, props.saveKey, value, props.filters || null, false);
        setOrigTime(value);
        setShowSave(false);

        props.updateGameTimer(value);
    };

    const timeToMilliseconds = (time) => {
        const [hours, minutes, seconds] = time ? time.split(':') : [0, 0, 0];
        return parseInt(hours || 0) * 3600 + parseInt(minutes || 0) * 60 + parseInt(seconds || 0) * 1000;
    };

    const compare = (time1, time2) => {
        return timeToMilliseconds(time1) == timeToMilliseconds(time2);
    };

    useEffect(() => {
        const time = getTime();
        setShowSave(!compare(time, origTime));
    }, [origTime]);

    useEffect(() => {
        const time = getTime();
        setShowSave(!compare(time, origTime));
    }, [hours]);

    useEffect(() => {
        const time = getTime();
        setShowSave(!compare(time, origTime));
    }, [minutes]);

    useEffect(() => {
        const time = getTime();
        setShowSave(!compare(time, origTime));
    }, [seconds]);

    const onCancel = () => {
        setTime(origTime);
        setShowSave(false);
    };

    const handleInputChange = (e, setter, maxLength, nextRef) => {
        const input = e.target.value;

        if (maxLength && /^\d*$/.test(input) && input.length <= maxLength) {
            setter(input);
            if (input.length === maxLength && nextRef && nextRef.current) {
                nextRef.current.focus();
            }
        }
        else
        {
            setter(input);
        }
    };

    return (
        <InputGroup className="mb-3">
            <Form.Control
                type="number"
                value={hours}
                onChange={(e) => handleInputChange(e, setHours, 0, minutesRef)}
                placeholder="hh"
                style={{ borderRight: 'none' }}
            />
            <span className="input-group-text" style={{ backgroundColor: 'white', borderLeft: 'none', borderRight: 'none' }}>:</span>
            <Form.Control
                type="number"
                value={minutes}
                onChange={(e) => handleInputChange(e, setMinutes, 2, secondsRef)}
                maxLength={2}
                placeholder="mm"
                style={{ borderLeft: 'none', borderRight: 'none' }}
                ref={minutesRef}
            />
            <span className="input-group-text" style={{ backgroundColor: 'white', borderLeft: 'none', borderRight: 'none' }}>:</span>
            <Form.Control
                type="number"
                value={seconds}
                onChange={(e) => handleInputChange(e, setSeconds, 2, null)}
                maxLength={2}
                placeholder="ss"
                style={{ borderLeft: 'none' }}
                ref={secondsRef}
            />
            {showSave && <InputGroup.Text onClick={onSave}><Icon name="save" /></InputGroup.Text>}
            {showSave && <InputGroup.Text onClick={onCancel}><Icon name="cross" /></InputGroup.Text>}
        </InputGroup>
    );
};

export default AutoSaveTime;
