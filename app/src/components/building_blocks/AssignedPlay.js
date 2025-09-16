import React, { useState, useEffect, useRef } from "react";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Card from 'react-bootstrap/Card';
import AutoSaveText from '../utils/AutoSaveText';
import AutoSaveInput from '../utils/AutoSaveInput';
import { post, upload } from '../utils/ServerCall';
import ShowModal from '../utils/ShowModal';
import db from '../utils/db';
import AutoSaveTime from '../utils/AutoSaveTime';
import CountdownTimer from '../utils/CountdownTimer';
import Icon from '../Icon';
import { toCamelCase } from '../utils/common';
import DecisionsSummary from '../pages/DecisionsSummary';
import ResultsSummary from '../pages/ResultsSummary';
import IncomeStatement from '../pages/IncomeStatement';
import CashflowStatement from '../pages/CashflowStatement';
import BalanceSheet from '../pages/BalanceSheet';
import FinancialRatios from '../pages/FinancialRatios';
import Competition from '../pages/Competition';
import ShowToast from '../utils/ShowToast';
import FormatData from '../FormatData';
import Form from 'react-bootstrap/Form';

const AssignedPlay = (props) => {
    const caseStudyList = props.caseStudyList;
    const selectedAdminGame = props.selectedAdminGame;
    const pageData = props.pageData;
    const institute = props.institute;
    const teams = selectedAdminGame.teams;
    const users = selectedAdminGame.users;
    const caseStudyKey = selectedAdminGame.case_study_key;
    const caseStudyName = caseStudyList[selectedAdminGame.case_study_key].name;
    const gameType = toCamelCase(selectedAdminGame.type);
    const caseStudy = props.gameCaseStudy;
    const gameState = props.allGameState;
    const gameData = props.allGameData;
    const running = props.running;
    const timer = props.timer;
    const markets = props.markets;
    const [decisionsProps, setDecisionsProps] = useState(null);
    const [resultsProps, setResultsProps] = useState(null);
    const [accountsProps, setAccountsProps] = useState(null);
    const [competitionProps, setCompetitionProps] = useState(null);
    const [allSubmitted, setAllSubmitted] = useState(false);
    //const [gameUsers, setGameUsers] = useState(null);
    const [processButtonDisabled, setProcessButtonDisabled] = useState(false);
    const [processInProgress, setProcessInProgress] = useState(false);
    const [resetQuarterButtonDisabled, setResetQuarterButtonDisabled] = useState(false);
    const [resetQuarterInProgress, setResetQuarterInProgress] = useState(false);
    const [nextButtonDisabled, setNextButtonDisabled] = useState(false);
    const [nextInProgress, setNextInProgress] = useState(false);
    const [undoButtonDisabled, setUndoButtonDisabled] = useState(false);
    const [undoInProgress, setUndoInProgress] = useState(false);
    const [startButtonDisabled, setStartButtonDisabled] = useState(false);
    const [startInProgress, setStartInProgress] = useState(false);
    const [resetButtonDisabled, setResetButtonDisabled] = useState(false);
    const [resetInProgress, setResetInProgress] = useState(false);
    const competitionRef = useRef(null);

    const list = {};

    props.gameUsers && props.gameUsers.forEach((user) => {
        list[user.key] = user;
        if (!selectedAdminGame.users.includes(user.key)) {
            console.error(user.key, ' not found in admin game');
        }
        if (!gameData[user.key]) {
            console.error(user.key, ' not found in gameData');
        }
    });
    const gameUsers = list;

    useEffect(() => {
        /*
        const fetch = async () => {
            //setGameUsers(null);
            console.log('getting game users Assigned Play');
            const _gameUsers = await post('admin/game_users', props.user, { game_key: props.selectedAdminGame.key });
            if (_gameUsers && _gameUsers.rc) {
                console.error('admin/game_users: ', _gameUsers.rc);
                return;
            }

            if (!_gameUsers) {
                return;
            }

            const list = {};

            _gameUsers && _gameUsers.forEach((user) => {
                list[user.key] = user;
            });
            setGameUsers(list);
        };
        fetch();
        */

        var _submitted = true;
        for (var prop in gameData) {
            if (!gameData[prop]) {
                break;
            }
            if (gameData[prop].quarter_status == 'submitted' || gameData[prop].quarter_status == 'timeout') {
                continue;
            }
            _submitted = false;
            break;
        }
        setAllSubmitted(_submitted);

        props.setRunning(selectedAdminGame.game_status == 'started' && !_submitted);

        props.socket.on('game_reload', (data) => {
            if (selectedAdminGame.key == data.game_key) {
                props.reloadGameData(selectedAdminGame.key);
            }
        });

        props.socket.on('quarter_submitted', (data) => {
            if (selectedAdminGame.key == data.game_key) {
                if (selectedAdminGame.type == 'team_play') {
                    const _gameData = data.game_data;
                    var submitted = true;
                    for (var prop in _gameData) {
                        if (_gameData[prop].quarter_status == 'submitted' || _gameData[prop].quarter_status == 'timeout') {
                            continue;
                        }
                        submitted = false;
                        break;
                    }
                    setAllSubmitted(submitted);
                    if (submitted) {
                        props.setRunning(false);
                    }
                    props.setAllGameData(_gameData);
                }
                else if (selectedAdminGame.type == 'assessment' || selectedAdminGame.type == 'self_play') {
                    props.reloadGameData(selectedAdminGame.key);
                }
            }
        });

        props.socket.on('self_play_finished', (data) => {
            if (selectedAdminGame.key == data.game_key) {
                props.reloadGameData(selectedAdminGame.key);
            }
        });

        props.socket.on('assessment_finished', (data) => {
            if (selectedAdminGame.key == data.game_key) {
                props.reloadGameData(selectedAdminGame.key);
            }
        });

        return () => {
            props.socket.off('game_reload');
            props.socket.off('quarter_submitted');
            props.socket.off('self_play_finished');
            props.socket.off('assessment_finished');
        };
    }, []);

    const updateTime = (obj) => {
        if (selectedAdminGame.key == obj.key) {
            props.updateTimer(obj.value);
        }
    };

    const extendTime = async (mins, incDec) => {
        const timerValue = timer;
        var [timerHours, timerMinutes, timerSeconds] = timerValue ? timerValue.split(':') : [0, 0, 0];

        var timerMilliseconds = (parseInt(timerHours || 0) * 60 * 60 + parseInt(timerMinutes || 0) * 60 + parseInt(timerSeconds || 0)) * 1000;
        if (incDec == 'increase') {
            timerMilliseconds += mins * 60 * 1000;
        }
        else {
            timerMilliseconds -= mins * 60 * 1000;
        }

        const newHours = Math.floor(timerMilliseconds / 3600000).toString().padStart(2, '0');
        const newMinutes = Math.floor((timerMilliseconds % 3600000) / 60000).toString().padStart(2, '0');
        const newSeconds = Math.floor((timerMilliseconds % 60000) / 1000).toString().padStart(2, '0');
        const newTimerValue = `${newHours}:${newMinutes}:${newSeconds}`;

        const _props = { ...props };
        _props.selectedGame = selectedAdminGame;
        await db.saveGameState(_props, 'timer', newTimerValue);

        props.updateGameTimer(newTimerValue);

        return newTimerValue;
    };

    const startGame = async () => {
        if (startInProgress) {
            return;
        }

        setStartButtonDisabled(true);
        setStartInProgress(true);

        if (selectedAdminGame.type != 'self_play') {
            if (!selectedAdminGame.timer) {
                ShowToast({ icon: 'danger', heading: 'Missing timer', message: 'Please set timer before starting the game' });
                setStartButtonDisabled(false);
                setStartInProgress(false);
                return;
            }

            props.setTimer(selectedAdminGame.timer);
            const [_hours, _minutes, _seconds] = timer ? timer.split(':') : [0, 0, 0];
            const seconds = parseInt(_hours || 0) * 3600 + parseInt(_minutes || 0) * 60 + parseInt(_seconds || 0)
            /*
            if (seconds <= 900) {
                ShowToast({ icon: 'danger', heading: 'Timer too small', message: 'Please set timer for at least 15 minutes' });
                return;
            }
            */
        }

        const output = await post('admin/start_game', props.user, { game_key: selectedAdminGame.key });
        if (output && output.rc) {
            ShowToast({ icon: 'danger', heading: 'Error starting the game', message: output.rc });
            setStartButtonDisabled(false);
            setStartInProgress(false);
            return;
        }
        if (!output) {
            setStartButtonDisabled(false);
            setStartInProgress(false);
            return;
        }
        if (output.rejects) {
            ShowToast({ message: 'There are users which exceed the maximum number of self play games. Please remove them before starting the game.' })
            setStartButtonDisabled(false);
            setStartInProgress(false);
            return;
        }

        const _game = { ...selectedAdminGame };
        _game.game_status = 'started';
        _game.started_dt = output.started_dt;
        props.setSelectedAdminGame(_game);
        props.setAllowProductAdd(_game.allowProductAdd);
        props.setAllowRedistribution(_game.allowRedistribution);
        props.changeGame(_game);

        props.setRunning(true);
        setStartButtonDisabled(false);
        setStartInProgress(false);
    };

    const resetGame = async () => {
        if (resetInProgress) {
            return;
        }

        setResetButtonDisabled(true);
        setResetInProgress(true);

        const _game = await post('admin/reset_game', props.user, { key: selectedAdminGame.key });
        if (_game && _game.rc) {
            ShowToast({ icon: 'danger', heading: 'Cannot Reset', message: _game.rc });
            setResetButtonDisabled(false);
            setResetInProgress(false);
            return;
        }
        if (!_game) {
            setResetButtonDisabled(false);
            setResetInProgress(false);
            return;
        }
        props.setSelectedAdminGame(_game);
        props.resetGame(_game);
        setResetButtonDisabled(false);
        setResetInProgress(false);
    };

    const seeDecisions = (_caseStudy, _gameData, _gameState, teamOrUser) => {
        const _props = { ...props };
        _props.caseStudy = _caseStudy;
        _props.gameState = _gameState;
        _props.gameData = _gameData[teamOrUser];
        _props.selectedGame = selectedAdminGame;
        _props.isAdmin = true;
        setDecisionsProps(_props);
    };

    const seeResults = (_caseStudy, _gameData, _gameState, teamOrUser) => {
        const gdall = JSON.parse(JSON.stringify(_gameData[teamOrUser].data));
        const _gameDataObject = JSON.parse(JSON.stringify(_gameData[teamOrUser]));
        const key = Object.keys(gdall).pop();
        const gd = gdall[key];
        const _props = { ...props };
        _props.caseStudy = _caseStudy;
        _props.gameState = _gameState;
        _props.gameData = gd;
        _props.gameDataObject = _gameDataObject;
        _props.selectedGame = selectedAdminGame;
        _props.allQuartersData = gdall;
        _props.nteams = Object.keys(_gameData).length;
        setResultsProps(_props);
    };

    const seeAccounts = (_caseStudy, _gameData, _gameState, teamOrUser) => {
        const gdall = JSON.parse(JSON.stringify(_gameData[teamOrUser].data));
        const key = Object.keys(gdall).pop();
        const gd = gdall[key];
        const _props = { ...props };
        _props.caseStudy = _caseStudy;
        _props.gameState = _gameState;
        _props.gameData = gd;
        _props.selectedGame = selectedAdminGame;
        _props.allQuartersData = gdall;
        setAccountsProps(_props);
    };

    const seeCompetition = (_caseStudy, _gameData, _gameState, teamOrUser) => {
        const gdall = JSON.parse(JSON.stringify(_gameData[teamOrUser].data));
        const key = Object.keys(gdall).pop();
        const gd = gdall[key];
        const _props = { ...props };
        _props.caseStudy = _caseStudy;
        _props.gameState = selectedAdminGame.type == 'team_play' ? _gameState : _gameState[teamOrUser];
        _props.gameData = gd;
        _props.selectedGame = selectedAdminGame;
        _props.allQuartersData = gdall;
        var teams = [];

        _props.competitionRef = competitionRef;

        if  (selectedAdminGame.type == 'team_play') {
            if (selectedAdminGame.useMarkets) {
                const market = _gameState.teams[teamOrUser].market;
                for (var prop in _gameState.teams) {
                    if (_gameState.teams[prop].market == market) {
                        teams.push(_gameState.teams[prop]);
                    }
                }
            }
            else
            {
                teams = Object.values(_gameState.teams);
            }
        }
        else
        {
            teams = Object.values(_gameState[teamOrUser].teams);
        }

        _props.teams = teams;
    
        setCompetitionProps(_props);
    };

    const closeDecisions = () => {
        setDecisionsProps(null);
    };

    const closeResults = () => {
        setResultsProps(null);
    };

    const closeAccounts = () => {
        setAccountsProps(null);
    };

    const closeCompetition = () => {
        setCompetitionProps(null);
    };

    const undoQuarter = async () => {
        if (undoInProgress) {
            return;
        }

        setUndoButtonDisabled(true);
        setUndoInProgress(true);

        props.setRunning(false);
        const output = await post('admin/undo_quarter', props.user, { key: selectedAdminGame.key });
        if (output && output.rc) {
            ShowToast({ icon: 'danger', heading: 'Cannot undo', message: output.rc });
            setUndoButtonDisabled(false);
            setUndoInProgress(false);
            return;
        }
        if (!output) {
            setUndoButtonDisabled(false);
            setUndoInProgress(false);
            return;
        }
        props.setAllGameData(output.game_data);
        const _game = { ...selectedAdminGame };
        _game.game_status = 'started';
        _game.started_dt = output.started_dt;
        _game.current_quarter = output.game_state.current_quarter;
        props.setSelectedAdminGame(_game);
        props.setGameState(output.game_state);
        props.setAllowProductAdd(_game.allowProductAdd);
        props.setAllowRedistribution(_game.allowRedistribution);
        props.changeGame(_game);

        setAllSubmitted(true);
        props.setRunning(false);
        setUndoButtonDisabled(false);
        setUndoInProgress(false);
    };

    const undoSelfPlay = async (_caseStudy, _gameData, _gameState, userKey) => {
        if (undoInProgress) {
            return;
        }

        setUndoButtonDisabled(true);
        setUndoInProgress(true);

        const output = await post('admin/undo_quarter', props.user, { key: selectedAdminGame.key, game_state_key: _gameState[userKey].key });
        if (output && output.rc) {
            ShowToast({ icon: 'danger', heading: 'Cannot undo', message: output.rc });
            setUndoButtonDisabled(false);
            setUndoInProgress(false);
            return;
        }
        if (!output) {
            setUndoButtonDisabled(false);
            setUndoInProgress(false);
            return;
        }
        const gd = { ...gameData };
        gd[userKey] = output.game_data;
        props.setAllGameData(gd);
        setUndoButtonDisabled(false);
        setUndoInProgress(false);
    };

    const processQuarter = async () => {
        if (processInProgress) {
            return;
        }

        setProcessButtonDisabled(true);
        setProcessInProgress(true);

        const output = await post('admin/process_quarter', props.user, { key: selectedAdminGame.key });
        if (output && output.rc) {
            ShowToast({ icon: 'danger', heading: 'Error Processing Quarter', message: output.rc });
            setProcessButtonDisabled(false);
            setProcessInProgress(false);
            return;
        }
        if (!output) {
            setProcessButtonDisabled(false);
            setProcessInProgress(false);
            return;
        }
        Object.keys(selectedAdminGame.teams).map((teamName, idx) => {
            if (gameData[teamName]) {
                gameData[teamName] = output.game_data[teamName];
                props.setAllGameData({ ...gameData });
            }
        });

        props.setSelectedAdminGame(output.game);
        props.setGameState(output.game_state);
        props.setAllowProductAdd(output.game.allowProductAdd);
        props.setAllowRedistribution(output.game.allowRedistribution);

        props.setRunning(false);
        setProcessButtonDisabled(false);
        setProcessInProgress(false);
    };

    const resetQuarter = async () => {
        if (resetInProgress) {
            return;
        }

        setResetQuarterButtonDisabled(true);
        setResetQuarterInProgress(true);

        const output = await post('admin/reset_quarter', props.user, { key: selectedAdminGame.key });
        if (output && output.rc) {
            ShowToast({ icon: 'danger', heading: 'Error Reseting Quarter', message: output.rc });
            setResetQuarterButtonDisabled(false);
            setResetQuarterInProgress(false);
            return;
        }
        if (!output) {
            setResetQuarterButtonDisabled(false);
            setResetQuarterInProgress(false);
            return;
        }
        Object.keys(selectedAdminGame.teams).map((teamName, idx) => {
            if (gameData[teamName]) {
                gameData[teamName] = output.game_data[teamName];
                props.setAllGameData({ ...gameData });
            }
        });

        props.setSelectedAdminGame(output.game);
        props.setGameState(output.game_state);
        props.setAllowProductAdd(output.game.allowProductAdd);
        props.setAllowRedistribution(output.game.allowRedistribution);


        props.setRunning(false);
        setResetQuarterButtonDisabled(false);
        setResetQuarterInProgress(false);
    };

    const startNextQuarter = async () => {
        if (nextInProgress) {
            return;
        }

        setNextButtonDisabled(true);
        setNextInProgress(true);

        const output = await post('admin/start_next_quarter', props.user, { key: selectedAdminGame.key });
        if (output && output.rc) {
            ShowToast({ icon: 'danger', heading: 'Error Starting Next Quarter', message: output.rc });
            setNextButtonDisabled(false);
            setNextInProgress(false);
            return;
        }
        if (!output) {
            setNextButtonDisabled(false);
            setNextInProgress(false);
            return;
        }
        Object.keys(selectedAdminGame.teams).map((teamName, idx) => {
            if (gameData[teamName]) {
                gameData[teamName] = output.game_data[teamName];
                props.setAllGameData({ ...gameData });
            }
        });

        setAllSubmitted(false);

        props.setSelectedAdminGame(output.game);
        props.setGameState(output.game_state);
        props.setAllowProductAdd(output.game.allowProductAdd);
        props.setAllowRedistribution(output.game.allowRedistribution);

        props.setRunning(output.game.game_status == 'started');

        setNextButtonDisabled(false);
        setNextInProgress(false);
    };

    return (
        <>
            <Card>
                <Card.Header>{selectedAdminGame.name}</Card.Header>
                <Card.Body>
                    {selectedAdminGame.game_status == 'finished' &&
                        <Card.Subtitle>Game Finished</Card.Subtitle>
                    }
                    {selectedAdminGame.game_status != 'finished' &&
                        <>
                            <Row>
                                <Col>
                                    {selectedAdminGame.game_status != 'finished' && selectedAdminGame.type != 'self_play' &&
                                        <Card.Text>
                                            <AutoSaveText
                                                saveKey="game_time_label"
                                                text={pageData.game_time_label || 'Game Timer'}
                                                saveFn="saveSiteData"
                                                {...props}
                                            />
                                            &nbsp;*
                                        </Card.Text>
                                    }
                                </Col>
                                <Col></Col>
                                <Col md={3}></Col>
                                <Col md={3}></Col>
                            </Row>
                            <Row>
                                <Col>
                                    <>
                                        {selectedAdminGame && selectedAdminGame.game_status == 'finished' &&
                                            <span style={{ fontWeight: 'bold' }}>Game Finished</span>
                                        }
                                        {selectedAdminGame && selectedAdminGame.game_status == 'started' && selectedAdminGame.type == 'self_play' &&
                                            <span style={{ fontWeight: 'bold' }}>Game in progress</span>
                                        }
                                        {selectedAdminGame && selectedAdminGame.game_status == 'assigned' && selectedAdminGame.type == 'self_play' &&
                                            <span style={{ fontWeight: 'bold' }}>Game not started</span>
                                        }
                                        {selectedAdminGame && (selectedAdminGame.game_status == 'started' && gameState.game_status != 'paused') && selectedAdminGame.type != 'self_play' &&
                                            <CountdownTimer
                                                selectedAdminGame={selectedAdminGame}
                                                user={props.user}
                                                extendTime={extendTime}
                                                timerFinished={props.timerFinished}
                                            />
                                        }
                                        {selectedAdminGame && (selectedAdminGame.game_status == 'assigned' || gameState.game_status == 'paused') && selectedAdminGame.type != 'self_play' &&
                                            <AutoSaveTime
                                                saveKey="timer"
                                                value={timer || ''}
                                                saveFn="saveGameState"
                                                selectedAdminGame={selectedAdminGame}
                                                updateGameTimer={props.updateGameTimer}
                                                owner={selectedAdminGame.key}
                                                {...props}
                                            />
                                        }
                                    </>
                                </Col>
                                <Col md={2} style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContents: 'flex-start' }}>
                                    {selectedAdminGame && selectedAdminGame.game_status == 'assigned' && <Button onClick={startGame} disabled={startButtonDisabled}>Start Game</Button>}
                                    </Col>
                                <Col md={2} style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContents: 'flex-start' }}>
                                    {selectedAdminGame && selectedAdminGame.type == 'team_play' && gameState && gameState.current_quarter > 1 && <Button onClick={undoQuarter} disabled={undoButtonDisabled}>Undo Quarter</Button>}
                                </Col>
                                <Col md={2} style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContents: 'flex-start' }}>
                                    {selectedAdminGame && selectedAdminGame.game_status != 'finished' && <Button onClick={resetGame} disabled={resetButtonDisabled}>Reset Game</Button>}
                                </Col>
                            </Row>
                        </>
                    }
                    <Row style={{paddingTop: '5px'}}>
                        <Col style={{ paddingRight: '10px' }}>
                            <Card.Text>
                                <AutoSaveText
                                    saveKey="game_name_label"
                                    text={pageData.game_name_label || 'Name'}
                                    saveFn="saveSiteData"
                                    {...props} />
                            </Card.Text>
                        </Col>
                        <Col>
                            {selectedAdminGame.name || ''}
                        </Col>
                        <Col>
                            <Card.Text>
                                <AutoSaveText
                                    saveKey="game_year_label"
                                    text={pageData.game_year_label || 'Academic Year'}
                                    saveFn="saveSiteData"
                                    {...props}
                                />
                            </Card.Text>
                        </Col>
                        <Col>
                            {selectedAdminGame.academic_year}
                        </Col>
                    </Row>
                    <Row style={{paddingTop: '5px'}}>
                        <Col>
                            <Card.Text>
                                <AutoSaveText
                                    saveKey="no_of_qtrs_label"
                                    text={pageData.no_of_qtrs_label || 'Number of Quarters'}
                                    saveFn="saveSiteData"
                                    {...props} />
                            </Card.Text>
                        </Col>
                        <Col>
                            {selectedAdminGame.no_of_qtrs || ''}
                        </Col>
                        <Col>
                            <Card.Text>
                                <AutoSaveText
                                    saveKey="no_of_teams_label"
                                    text={pageData.no_of_teams_label || 'Number of Teams'}
                                    saveFn="saveSiteData"
                                    {...props}
                                />
                            </Card.Text>
                        </Col>
                        <Col>
                            {selectedAdminGame.no_of_teams || ''}
                        </Col>
                    </Row>
                    <Row style={{paddingTop: '5px'}}>
                        <Col>
                            <Card.Text>
                                <AutoSaveText
                                    saveKey="case_study_select_label"
                                    text={pageData.case_study_select_label || 'Case Study'}
                                    saveFn="saveSiteData"
                                    {...props}
                                />
                            </Card.Text>
                        </Col>
                        <Col>
                            {caseStudyName}
                        </Col>
                        <Col>
                            <Card.Text>
                                <AutoSaveText
                                    saveKey="game_type_label"
                                    text={pageData.game_type_label || 'Game Type'}
                                    saveFn="saveSiteData"
                                    {...props}
                                />
                            </Card.Text>
                        </Col>
                        <Col>
                            {gameType}
                        </Col>
                    </Row>
                    <Row style={{paddingTop: '5px'}}>
                        <Col>
                            {caseStudy && caseStudy.product.allowAdd && selectedAdminGame.allowProductAdd &&
                                <Card.Text style={{ textAlign: 'center', margin: '10px', fontWeight: 'bold', }}>
                                    <span>Product Add Allowed</span>
                                </Card.Text>
                            }
                        </Col>
                        <Col>
                            {caseStudy && caseStudy.allowRedistribution && selectedAdminGame.allowRedistribution &&
                                <Card.Text style={{ textAlign: 'center', margin: '10px', fontWeight: 'bold', }}>
                                    <span>Demand Redistribution Enabled</span>
                                </Card.Text>
                            }
                        </Col>
                    </Row>
                    {caseStudy && selectedAdminGame && selectedAdminGame.useMarkets &&
                        <Card.Text style={{ textAlign: 'center', padding: '10px', fontWeight: 'bold', border: '1px solid grey' }}>
                            {selectedAdminGame.no_of_markets} Markets
                        </Card.Text>
                    }
                </Card.Body>
            </Card>
            <div style={{ height: '15px' }}></div>
            <Card>
                <Card.Header>
                    {selectedAdminGame.type == 'assessment' || selectedAdminGame.type == 'self_play' ?
                        <AutoSaveText
                            saveKey="users_heading"
                            text={pageData.users_heading || 'Users'}
                            saveFn="saveSiteData"
                            {...props}
                        />
                        :
                        <AutoSaveText
                            saveKey="teams_heading"
                            text={pageData.teams_heading || 'Teams'}
                            saveFn="saveSiteData"
                            {...props}
                        />
                    }
                </Card.Header>
                <Card.Body>
                    <Table bordered hover style={{ fontSize: '0.8rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#efefef', borderColor: 'darkgrey' }}>
                                <th style={{ textAlign: 'center', width: '50px' }}>
                                    <Icon name="hash" />
                                    <div style={{ fontSize: '0.6rem' }}>Sr No</div>
                                </th>
                                {/*(selectedAdminGame.type == 'assessment' || selectedAdminGame.type == 'self_play') &&
                                    <th style={{ textAlign: 'center', width: '60px' }}>
                                        <Icon name="rankings" />
                                        <div style={{ fontSize: '0.6rem' }}>Game Ranking</div>
                                    </th>
                                */}
                                <th style={{ textAlign: 'center', width: '60px' }}>
                                    <Icon name="rankings" />
                                    <div style={{ fontSize: '0.6rem' }}>
                                        Ranking
                                    </div>
                                </th>
                                <th style={{ textAlign: 'center' }}>
                                    <Icon name={selectedAdminGame.type == 'assessment' || selectedAdminGame.type == 'self_play' ? 'player' : 'team'} />
                                    <div style={{ fontSize: '0.6rem' }}>{selectedAdminGame.type == 'assessment' || selectedAdminGame.type == 'self_play' ? 'Player' : 'Team'}</div>
                                </th>
                                <th style={{ textAlign: 'center', width: '80px' }}>
                                    <Icon name="quarter" />
                                    <div style={{ fontSize: '0.6rem' }}>Quarter</div>
                                </th>
                                <th style={{ textAlign: 'center' }}>
                                    <Icon name="milestone" /><Icon name="quarter" />
                                    <div style={{ fontSize: '0.6rem' }}>Quarter Status</div>
                                </th>
                                <th style={{ textAlign: 'center' }}><Icon name="milestone" />
                                    <Icon name="games" />
                                    <div style={{ fontSize: '0.6rem' }}>Game Status</div>
                                </th>
                                <th style={{ textAlign: 'center' }}>
                                    <Icon name="treasure" />
                                    <div style={{ fontSize: '0.6rem' }}>Profit</div>
                                    <div><Icon name="dollar" /></div>
                                </th>
                                <th style={{ textAlign: 'center', width: '80px' }}>
                                    <Icon name="market_share" />
                                    <div style={{ fontSize: '0.6rem' }}>Market Share</div>
                                    <div>%</div>
                                </th>
                                <th style={{ textAlign: 'center', width: '80px' }}>
                                    <Icon name="score" />
                                    <div style={{ fontSize: '0.6rem' }}>Score</div>
                                </th>
                                <th style={{ textAlign: 'center', width: '80px' }}>
                                    <Icon name="decisions" />
                                    <div style={{ fontSize: '0.6rem' }}>Decisions</div>
                                </th>
                                <th style={{ textAlign: 'center', width: '80px' }}>
                                    <Icon name="results" />
                                    <div style={{ fontSize: '0.6rem' }}>Dashboard</div>
                                </th>
                                <th style={{ textAlign: 'center', width: '80px' }}>
                                    <Icon name="accounts" />
                                    <div style={{ fontSize: '0.6rem' }}>Accounts</div>
                                </th>
                                <th style={{ textAlign: 'center', width: '80px' }}>
                                    <Icon name="competition" />
                                    <div style={{ fontSize: '0.6rem' }}>Competition</div>
                                </th>
                                {(selectedAdminGame.type == 'assessment' || selectedAdminGame.type == 'self_play') &&
                                    <th style={{ textAlign: 'center', width: '80px' }}>
                                        <Icon name="undo" />
                                        <div style={{ fontSize: '0.6rem' }}>Undo</div>
                                    </th>
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {selectedAdminGame && selectedAdminGame.type == 'team_play' && !selectedAdminGame.useMarkets && caseStudy && gameData && teams && Object.keys(teams).map((teamName, idx) => (
                                <tr key={idx}>
                                    <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                                    {gameData[teamName] && gameData[teamName].game_status == 'finished' ?
                                        <td>{gameData[teamName] ? gameData[teamName].rank : ''}</td>
                                        :
                                        <td>{gameData[teamName] ? gameData[teamName].data[gameData[teamName].current_quarter - 1].scores.rank : ''}</td>
                                    }
                                    <td style={{ textAlign: 'center' }}>
                                        <Card.Subtitle>{teamName}</Card.Subtitle>
                                        {Object.keys(teams[teamName].users).map((userKey, uidx) => (
                                            <div key={idx + '-' + uidx} style={{ fontSize: '0.8em' }}>
                                                <>
                                                    <div>{teams[teamName].users[userKey].name}</div>
                                                    {/*<div>({teams[teamName].users[userKey].email})</div>*/}
                                                </>
                                            </div>
                                        ))}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span>
                                            {gameData[teamName] ?
                                                (caseStudy.quarters.labels[gameData[teamName].current_quarter] || 'Q' + gameData[teamName].current_quarter)
                                                :
                                                ''
                                            }
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>{gameData[teamName] ? gameData[teamName].quarter_status : ''}</td>
                                    <td style={{ textAlign: 'center' }}>{gameData[teamName] ? gameData[teamName].status_label || gameData[teamName].game_status : ''}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        {gameData[teamName] ?
                                            gameState.game_status == 'finished' ?
                                                <FormatData
                                                    caseStudy={caseStudy}
                                                    format="thousands_indicator_int"
                                                    name="profit"
                                                    value={gameData[teamName].profit}
                                                />
                                                :
                                                <FormatData
                                                    caseStudy={caseStudy}
                                                    format="thousands_indicator_int"
                                                    name="profit"
                                                    value={gameData[teamName].data[gameData[teamName].current_quarter - 1].financials.profit}
                                                />
                                            : ''}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        {gameData[teamName] ?
                                            gameState.game_status == 'finished' ?
                                                gameData[teamName].marketShare
                                                :
                                                gameData[teamName].data[gameData[teamName].current_quarter - 1].financials.marketShare
                                            : ''}</td>
                                    {gameData[teamName] && gameData[teamName].game_status == 'finished' ?
                                        <td>{gameData[teamName] ? gameData[teamName].score : ''}</td>
                                        :
                                        <td>{gameData[teamName] ? gameData[teamName].data[gameData[teamName].current_quarter - 1].scores.score : ''}</td>
                                    }
                                    <td style={{ textAlign: 'center' }} onClick={() => { seeDecisions(caseStudy, gameData, gameState, teamName) }}><Icon name="decisions" /></td>
                                    <td style={{ textAlign: 'center' }} onClick={() => { seeResults(caseStudy, gameData, gameState, teamName) }}><Icon name="results" /></td>
                                    <td style={{ textAlign: 'center' }} onClick={() => { seeAccounts(caseStudy, gameData, gameState, teamName) }}><Icon name="accounts" /></td>
                                    <td style={{ textAlign: 'center' }} onClick={() => { seeCompetition(caseStudy, gameData, gameState, teamName) }}><Icon name="competition" /></td>
                                </tr>
                            ))}
                            {selectedAdminGame && selectedAdminGame.type == 'team_play' && selectedAdminGame.useMarkets && caseStudy && gameData && teams && Object.keys(markets).map((marketName, idx) => (
                                <React.Fragment key={marketName}>
                                    <tr key={marketName}><td colSpan="13" style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '15px', backgroundColor: '#efefef' }}>{marketName}</td></tr>
                                    {markets[marketName] && Object.keys(markets[marketName]).map((teamName, idx) => (
                                        <tr key={teamName}>
                                            <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                                            {gameData[teamName] && gameData[teamName].game_status == 'finished' ?
                                                <td>{gameData[teamName] ? gameData[teamName].rank : ''}</td>
                                                :
                                                <td>{gameData[teamName] ? gameData[teamName].data[gameData[teamName].current_quarter - 1].scores.rank : ''}</td>
                                            }
                                            <td style={{ textAlign: 'center' }}>
                                                <Card.Subtitle>{teamName}</Card.Subtitle>
                                                {Object.keys(teams[teamName].users).map((userKey, uidx) => (
                                                    <div key={idx + '-' + uidx} style={{ fontSize: '0.8em' }}>
                                                        <>
                                                            <div>{teams[teamName].users[userKey].name}</div>
                                                        </>
                                                    </div>
                                                ))}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span>
                                                    {gameData[teamName] ?
                                                        (caseStudy.quarters.labels[gameData[teamName].current_quarter] || 'Q' + gameData[teamName].current_quarter)
                                                        :
                                                        ''
                                                    }
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>{gameData[teamName] ? gameData[teamName].quarter_status : ''}</td>
                                            <td style={{ textAlign: 'center' }}>{gameData[teamName] ? gameData[teamName].status_label || gameData[teamName].game_status : ''}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                {gameData[teamName] ?
                                                    gameState.game_status == 'finished' ?
                                                        <FormatData
                                                            caseStudy={caseStudy}
                                                            format="thousands_indicator_int"
                                                            name="profit"
                                                            value={gameData[teamName].profit}
                                                        />
                                                        :
                                                        <FormatData
                                                            caseStudy={caseStudy}
                                                            format="thousands_indicator_int"
                                                            name="profit"
                                                            value={gameData[teamName].data[gameData[teamName].current_quarter - 1].financials.profit}
                                                        />
                                                    : ''}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {gameData[teamName] ?
                                                    gameState.game_status == 'finished' ?
                                                        gameData[teamName].marketShare
                                                        :
                                                        gameData[teamName].data[gameData[teamName].current_quarter - 1].financials.marketShare
                                                    : ''}</td>
                                            {gameData[teamName] && gameData[teamName].game_status == 'finished' ?
                                                <td>{gameData[teamName] ? gameData[teamName].score : ''}</td>
                                                :
                                                <td>{gameData[teamName] ? gameData[teamName].data[gameData[teamName].current_quarter - 1].scores.score : ''}</td>
                                            }
                                            <td style={{ textAlign: 'center' }} onClick={() => { seeDecisions(caseStudy, gameData, gameState, teamName) }}><Icon name="decisions" /></td>
                                            <td style={{ textAlign: 'center' }} onClick={() => { seeResults(caseStudy, gameData, gameState, teamName) }}><Icon name="results" /></td>
                                            <td style={{ textAlign: 'center' }} onClick={() => { seeAccounts(caseStudy, gameData, gameState, teamName) }}><Icon name="accounts" /></td>
                                            <td style={{ textAlign: 'center' }} onClick={() => { seeCompetition(caseStudy, gameData, gameState, teamName) }}><Icon name="competition" /></td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                            {(selectedAdminGame.type == 'assessment' || selectedAdminGame.type == 'self_play') && gameUsers && caseStudy && gameData && users && users.map((userKey, idx) => (
                                <tr key={idx}>
                                    <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                                    {/*<td>{gameData[userKey] ? gameData[userKey].game_rank : ''}</td>*/}
                                    {gameData[userKey] && gameData[userKey].game_status == 'finished' ?
                                        <td>{gameData[userKey].rank}</td>
                                        :
                                        <td></td>
                                    }
                                    <td style={{ textAlign: 'center' }}>
                                        {gameUsers[userKey] &&
                                            <>
                                                <div>{gameUsers[userKey].name}</div>
                                                <div>({gameUsers[userKey].email})</div>
                                            </>
                                        }
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span>
                                            {gameData[userKey] ?
                                                (caseStudy.quarters.labels[gameData[userKey].current_quarter] || 'Q' + gameData[userKey].current_quarter)
                                                :
                                                ''
                                            }
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>{gameData[userKey] ? gameData[userKey].quarter_status : ''}</td>
                                    <td style={{ textAlign: 'center' }}>{gameData[userKey] ? gameData[userKey].status_label || gameData[userKey].game_status : ''}</td>
                                    <td style={{ textAlign: 'center' }}>{
                                        gameData[userKey] ?
                                            gameData[userKey].game_status == 'finished' ?
                                                <FormatData
                                                    caseStudy={caseStudy}
                                                    format="thousands_indicator_int"
                                                    name="profit"
                                                    value={gameData[userKey].profit}
                                                />
                                                :
                                                <FormatData
                                                    caseStudy={caseStudy}
                                                    format="thousands_indicator_int"
                                                    name="profit"
                                                    value={gameData[userKey].data[gameData[userKey].current_quarter - 1].financials.profit}
                                                />
                                            : ''}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        {gameData[userKey] ?
                                            gameData[userKey].game_status == 'finished' ?
                                                gameData[userKey].marketShare
                                                :
                                                gameData[userKey].data[gameData[userKey].current_quarter - 1].financials.marketShare
                                            :
                                            ''
                                        }
                                    </td>
                                    {gameData[userKey] && gameData[userKey].game_status == 'finished' ?
                                        <td style={{ textAlign: 'center' }}>{gameData[userKey] ? gameData[userKey].score : ''}</td>
                                        :
                                        <td style={{ textAlign: 'center' }}>{gameData[userKey] ? gameData[userKey].data[gameData[userKey].current_quarter - 1].scores.score : ''}</td>
                                    }
                                    <td style={{ textAlign: 'center' }} onClick={() => { seeDecisions(caseStudy, gameData, gameState, userKey) }}><Icon name="decisions" /></td>
                                    <td style={{ textAlign: 'center' }} onClick={() => { seeResults(caseStudy, gameData, gameState, userKey) }}><Icon name="results" /></td>
                                    <td style={{ textAlign: 'center' }} onClick={() => { seeAccounts(caseStudy, gameData, gameState, userKey) }}><Icon name="accounts" /></td>
                                    <td style={{ textAlign: 'center' }} onClick={() => { seeCompetition(caseStudy, gameData, gameState, userKey) }}><Icon name="competition" /></td>
                                    <td style={{ textAlign: 'center' }} onClick={() => { undoSelfPlay(caseStudy, gameData, gameState, userKey) }}><Icon name="undo" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
            {selectedAdminGame && gameState && selectedAdminGame.type == 'team_play' &&
                <Card style={{ textAlign: 'center' }}>
                    <Card.Body>
                        <Row>
                            <Col>
                                {selectedAdminGame.game_status != 'finished' &&
                                    <>
                                        {(!selectedAdminGame.game_status || selectedAdminGame.game_status == 'started') && gameState.game_status != 'paused' &&
                                            <Button onClick={processQuarter} disabled={processButtonDisabled}>Process Quarter</Button>
                                        }
                                        {selectedAdminGame.game_status == 'started' && gameState.game_status == 'paused' &&
                                            <Button onClick={startNextQuarter} disabled={nextButtonDisabled}>Start Next Quarter</Button>
                                        }
                                    </>
                                }
                            </Col>
                            <Col>
                                <Button onClick={resetQuarter} disabled={resetQuarterButtonDisabled}>Reset Quarter</Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            }
            {decisionsProps &&
                <div style={{ position: 'fixed', top: 0, right: 0, left: 0, bottom: 0, height: '100vh', overflowY: 'scroll', zIndex: 1 }}>
                    <span onClick={closeDecisions} style={{ position: 'absolute', top: '5px', right: 0, display: 'block', width: '30px', zIndex: 1 }}><Icon name="close" /></span>
                    <DecisionsSummary {...decisionsProps} cardStyle={{ height: '100%' }} />
                </div>
            }
            {resultsProps &&
                <div style={{ position: 'fixed', top: 0, right: 0, left: 0, bottom: 0, height: '100vh', overflowY: 'scroll', zIndex: 1 }}>
                    <span onClick={closeResults} style={{ position: 'absolute', top: '5px', right: 0, display: 'block', width: '30px', zIndex: 1 }}><Icon name="close" /></span>
                    <ResultsSummary {...resultsProps} />
                </div>
            }
            {accountsProps &&
                <div style={{ position: 'fixed', top: 0, right: 0, left: 0, bottom: 0, height: '100vh', overflowY: 'scroll', zIndex: 1 }}>
                    <span onClick={closeAccounts} style={{ position: 'absolute', top: '5px', right: 0, display: 'block', width: '30px', zIndex: 1 }}><Icon name="close" /></span>
                    <Card.Header>Income Statement</Card.Header>
                    <IncomeStatement {...accountsProps} />
                    <Card.Header>Cashflow Statement</Card.Header>
                    <CashflowStatement {...accountsProps} />
                    <Card.Header>Balance Sheet</Card.Header>
                    <BalanceSheet {...accountsProps} />
                    <Card.Header>Financial Ratios</Card.Header>
                    <FinancialRatios {...accountsProps} />
                </div>
            }
            {competitionProps &&
                <div  ref={competitionRef} style={{ position: 'fixed', top: 0, right: 0, left: 0, bottom: 0, height: '100vh', overflowY: 'scroll', zIndex: 1, backgroundColor: 'white' }}>
                    <span onClick={closeCompetition} style={{ position: 'absolute', top: '5px', right: 0, display: 'block', width: '30px', zIndex: 1 }}><Icon name="close" /></span>
                    <Competition {...competitionProps} />
                </div>
            }
        </>
    );
};

export default AssignedPlay;
