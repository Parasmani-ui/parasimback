import React, { useState, useEffect } from 'react';
import ShowToast from './ShowToast';

const calcRemainingTime = (timer, startedDate) => {
    var [timerHours, timerMinutes, timerSeconds] = timer ? timer.split(':') : [0, 0, 0];
    const started = new Date(startedDate);
    const now = Date.now();
    const timerMilliseconds = (parseInt(timerHours || 0) * 60 * 60 + parseInt(timerMinutes || 0) * 60 + parseInt(timerSeconds || 0)) * 1000;
    const elapsedTimeMilliseconds = now - started.getTime();
    const _remainingTime = Math.max(timerMilliseconds - elapsedTimeMilliseconds, 0);
    return _remainingTime;
};

const CountdownTimerHeader = (props) => {
    const [remainingTime, setRemainingTime] = useState(calcRemainingTime(props.selectedGame.timer, props.selectedGame.started_dt));
    const [timer, setTimer] = useState(props.selectedGame.timer);
    const [countdown, setCountdown] = useState(null);

    const timerChanged = (data) => {
        props.updateTimer(data);
        if (!props.selectedGame) {
            return;
        }
        if (data.game_key != props.selectedGame.key) {
            return;
        }

        setTimer(data.timer);

        const gameStartDate = new Date(props.selectedGame.game_state.started_dt);
        const currentDate = new Date();
        const timerValue = data.timer;
        var [timerHours, timerMinutes, timerSeconds] = timerValue ? timerValue.split(':') : [0, 0, 0];
    
        const timerMilliseconds = (parseInt(timerHours || 0) * 60 * 60 + parseInt(timerMinutes || 0) * 60 + parseInt(timerSeconds || 0)) * 1000;
        const elapsedTimeMilliseconds = currentDate.getTime() - gameStartDate.getTime();
        const remainingTimeMilliseconds = Math.max(timerMilliseconds - elapsedTimeMilliseconds, 0);
    
        const remainingHours = Math.floor(remainingTimeMilliseconds / 3600000).toString().padStart(2, '0');
        const remainingMinutes = Math.floor((remainingTimeMilliseconds % 3600000) / 60000).toString().padStart(2, '0');
        const remainingSeconds = Math.floor((remainingTimeMilliseconds % 60000) / 1000).toString().padStart(2, '0');
        const remainingTimeFormatted = `${remainingHours}:${remainingMinutes}:${remainingSeconds}`;

        ShowToast({
            icon: 'info', 
            heading: 'Timer Changed', 
            message: 'The timer has been changed for this game. Remaining time is ' + remainingTimeFormatted
        });
    };

    useEffect(() => {
        if (!props.socket) {
            return;
        }
        props.socket.off('timer_changed');
        props.socket.on('timer_changed', (data) => {
            timerChanged(data);
        });
        return () => props.socket.off('timer_changed');
    }, []);

    useEffect(() => {
        if (countdown) {
            clearInterval(countdown);
        }

        if (remainingTime <= 0) {
            return;
        }

        setRemainingTime(calcRemainingTime(timer, props.selectedGame.started_dt));

        var countdownTimer = null;
        const calculateRemainingTime = () => {
            if (remainingTime >= 0) {
                const _remainingTime = calcRemainingTime(timer, props.selectedGame.started_dt);
                setRemainingTime(_remainingTime);
                if (_remainingTime <= 0) {
                    clearInterval(countdownTimer);
                    ShowToast({ 
                        icon: 'info', 
                        heading: 'Timer Finished',
                        message: 'Timer has ended',
                        done: props.gameFinished
                    });
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

    return (
        <div>
            <span>{formatTime(remainingTime)}</span>
        </div>
    );
};

export default CountdownTimerHeader;
