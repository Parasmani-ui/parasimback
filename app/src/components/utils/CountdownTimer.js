import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Icon from '../Icon';
import ShowToast from '../utils/ShowToast';

const calcRemainingTime = (timer, startedDate) => {
    var [timerHours, timerMinutes, timerSeconds] = timer ? timer.split(':') : [0, 0, 0];
    const started = new Date(startedDate);
    const now = Date.now();
    const timerMilliseconds = (parseInt(timerHours || 0) * 60 * 60 + parseInt(timerMinutes || 0) * 60 + parseInt(timerSeconds || 0)) * 1000;
    const elapsedTimeMilliseconds = now - started.getTime();
    const _remainingTime = Math.max(timerMilliseconds - elapsedTimeMilliseconds, 0);
    return _remainingTime;
};

const CountdownTimer = (props) => {
    const [owner, setOwner] = useState();
    const [showTimer, setShowTimer] = useState(null);
    const [additionalMinutes, setAdditionalMinutes] = useState(0);
    const [timer, setTimer] = useState(props.selectedAdminGame.timer);
    const [countdown, setCountdown] = useState(null);
    const [remainingTime, setRemainingTime] = useState(calcRemainingTime(props.selectedAdminGame.timer, props.selectedAdminGame.started_dt));

    useEffect(() => {
        setTimer(props.selectedAdminGame.timer);
        setOwner(props.selectedAdminGame.key);
    }, [props.selectedAdminGame]);

    useEffect(() => {
        if (countdown) {
            clearInterval(countdown);
        }
        setRemainingTime(calcRemainingTime(timer, props.selectedAdminGame.started_dt));
        var countdownTimer = null;
        const calculateRemainingTime = () => {
            if (remainingTime >= 0) {
                const _remainingTime = calcRemainingTime(timer, props.selectedAdminGame.started_dt);
                setRemainingTime(_remainingTime);
                if (_remainingTime <= 0) {
                    props.timerFinished();
                    clearInterval(countdownTimer);
                    return;
                }
                const rounded = Math.round(_remainingTime / 1000);
                if (rounded == 10 * 60) {
                    ShowToast({ icon: 'warning', heading: 'Timer Warning', message: '10 minutes remaining' });
                    return;
                }
                    
                if (rounded == 5 * 60) {
                    ShowToast({ icon: 'warning', heading: 'Timer Warning', message: '5 minutes remaining' });
                    return;
                }
        
                if (rounded == 2 * 60) {
                    ShowToast({ icon: 'warning', heading: 'Timer Warning', message: '2 minutes remaining' });
                    return;
                }
            }
        };

        calculateRemainingTime();

        countdownTimer = setInterval(() => {
            calculateRemainingTime();
        }, 1000);

        setCountdown(countdownTimer);

        return () => clearInterval(countdownTimer);
    }, [timer]);

    function formatTime(remainingTimeMilliseconds) {
        const remainingHours = Math.floor(remainingTimeMilliseconds / 3600000).toString().padStart(2, '0');
        const remainingMinutes = Math.floor((remainingTimeMilliseconds % 3600000) / 60000).toString().padStart(2, '0');
        const remainingSeconds = Math.floor((remainingTimeMilliseconds % 60000) / 1000).toString().padStart(2, '0');
        return `${remainingHours}:${remainingMinutes}:${remainingSeconds}`;
    }

    const changeTime = async () => {
        const _timer = await props.extendTime(additionalMinutes, showTimer);
        setShowTimer(null);
        setTimer(_timer);
    };

    return (
        <div>
            {showTimer ?
                <span>
                    <InputGroup className="mb-3">
                        <InputGroup.Text>minutes</InputGroup.Text>
                        <Form.Control
                            type="number"
                            defaultValue={0}
                            onChange={(e) => { setAdditionalMinutes(parseInt(e.target.value || 0)) }}
                            style={{ width: '100px' }}
                        />
                        <InputGroup.Text onClick={changeTime}>
                            <Icon name="save" />
                        </InputGroup.Text>
                        <InputGroup.Text onClick={() => {setShowTimer(null);}}>
                            <Icon name="close" />
                        </InputGroup.Text>
                    </InputGroup>
                </span>
                :
                <span>{formatTime(remainingTime)}</span>
            }
            {props.user && props.user.role != 'user' && !showTimer && 
                <>
                    <span onClick={() => { setShowTimer('increase') }}>
                        <Icon name="up" />
                    </span>
                    <span onClick={() => { setShowTimer('decrease') }}>
                        <Icon name="down" />
                    </span>
                </>
            }
        </div>
    );
};

export default CountdownTimer;
