import React from 'react';
import { useState, useEffect, useRef } from "react";
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Select from 'react-select';
import Container from 'react-bootstrap/Container';
import InstituteSelect from '../building_blocks/InstituteSelect';
import AutoSaveText from '../utils/AutoSaveText';
import AutoSaveInput from '../utils/AutoSaveInput';
import { post, upload } from '../utils/ServerCall';
import ShowModal from '../utils/ShowModal';
import db from '../utils/db';
import Icon from '../Icon';
import gameConfig from '../../gameConfig';
import AssignedPlay from '../building_blocks/AssignedPlay';
import { toCamelCase } from '../utils/common';
import ShowToast from '../utils/ShowToast';
import Confirm from '../utils/Confirm';

const Games = (props) => {
    const [caseStudy, setCaseStudy] = useState(null);
    const [institute, setInstitute] = useState();
    const [instituteKey, setInstituteKey] = useState(props.user.role == 'admin' ? props.user.institute_key : null);
    const [gamesList, setGamesList] = useState(null);
    const pageData = props.siteData && props.siteData[props.pageName] ? props.siteData[props.pageName] : {};
    const [pageNumber, setPageNumber] = useState(1);
    const [pageCount, setPageCount] = useState(1);
    const [selectedAdminGame, setSelectedAdminGame] = useState(null);
    const [teams, setTeams] = useState(null);
    const [teamOptions, setTeamOptions] = useState([]);
    const [marketOptions, setMarketOptions] = useState([]);
    const [options, setOptions] = useState([]);
    const [yearOptions, setYearOptions] = useState([]);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [gameUsers, setGameUsers] = useState(null);
    const [caseStudyList, setCaseStudyList] = useState();
    const [caseStudyOptions, setCaseStudyOptions] = useState([]);
    const [selectedCaseStudy, setSelectedCaseStudy] = useState(null);
    const [selectedAdminGameType, setSelectedAdminGameType] = useState(null);
    const [showFullScreen, setShowFullScreen] = useState(false);
    const [showAddPlayers, setShowAddPlayers] = useState(false);
    const [users, setUsers] = useState(null);
    const [gameState, setGameState] = useState(null);
    const [gameData, setGameData] = useState(null);
    const [npages, setNpages] = useState(1);
    const [page, setPage] = useState(1);
    const [showProductAdd, setShowProductAdd] = useState(false);
    const [showDemandRedistribution, setShowDemandRedistribution] = useState(false);
    const [allowProductAdd, setAllowProductAdd] = useState(false);
    const [allowRedistribution, setAllowRedistribution] = useState(false);
    const [running, setRunning] = useState(false);
    const [timer, setTimer] = useState(selectedAdminGame && running ? selectedAdminGame.timer : null);
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [operationInProgress, setOperationInProgress] = useState(false);
    const [markets, setMarkets] = useState({});
    const [unassigned, setUnassigned] = useState([]);
    const [uploadErrors, setUploadErrors] = useState(null);
    const uploadInput = useRef();

    const _props = { ...props };
    delete _props.selectedGame;
    delete _props.updateData;

    const userPageSize = 50;
    const gamesPageSize = 0;

    const fetchData = async (key, idx) => {
        const _key = key || instituteKey;
        const _pageNumber = idx || pageNumber;
        var data = await post('admin/games_list', props.user, { key: _key, pageNumber: _pageNumber, pageSize: gamesPageSize });
        if (data && data.rc) {
            return;
        }
        if (!data) {
            return;
        }
        setPageCount(data.pageCount);
        setGamesList(data.pageData);

        const _options = [];
        data.pageData.forEach((game) => {
            _options.push({
                label: game.name || game.key,
                value: game.key,
                game: game
            });
            if (selectedAdminGame && selectedAdminGame.key == game.key) {
                setSelectedAdminGame(game);
                setAllowProductAdd(game.allowProductAdd);
                setAllowRedistribution(game.allowRedistribution);
            }
        });
        setOptions(_options);

        data = await post('admin/user_list', props.user, { institute_key: _key, page: page || 1, page_size: userPageSize });
        if (data && data.rc) {
            return;
        }
        if (!data) {
            return;
        }
        if (data.npages < page) {
            setPage(data.npages || 1);
        }
        setNpages(data.npages);
        const _users = data.users;

        if (props.user.role == 'admin') {
            const inst = await post('admin/select_institute', props.user, { key: props.user.institute_key });
            if (inst && inst.rc) {
                return;
            }
            setInstitute(inst);
        }

        setUsers(_users);

        const list = await post('admin/case_study_list', props.user, null);
        if (list && list.rc) {
            return;
        }
        const indexed = {};
        list && list.forEach((cs) => {
            indexed[cs.key] = cs;
        });
        setCaseStudyList(indexed);
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!institute) {
            return;
        }
        const _opt = sessionStorage.getItem('selected_game_option');
        if (!_opt) {
            setSelectedOption(null);
            return;
        }

        const option = JSON.parse(_opt);
        if (!option) {
            setSelectedOption(null);
            return;
        }
        if (!option.game) {
            setSelectedOption(null);
            return;
        }
        if (option.game.institute != institute.key) {
            setSelectedOption(null);
            return;
        }

        // previous option seemed to have old values so it cannot be relied upon
        // get new values here
        var _option = null;
        for (var i = 0; i < options.length; i++) {
            if (options[i].value == option.value) {
                _option = options[i];
                break;
            }
        }
        setSelectedOption(_option);
    }, [institute]);

    useEffect(() => {
        const _read = async () => {
            const data = await post('admin/user_list', props.user, { institute_key: instituteKey, page: page || 1, page_size: userPageSize });
            if (data && data.rc) {
                return;
            }
            if (!data) {
                return;
            }
            if (data.npages < page) {
                setPage(data.npages);
            }
            setNpages(data.npages);
            const _users = data.users;
            setUsers(_users);
        };
        _read();
    }, [page]);

    useEffect(() => {
        if (selectedOption) {
            sessionStorage.setItem('selected_game_option', JSON.stringify(selectedOption));
            selectGame(selectedOption);
            setAllowProductAdd(selectedOption.game.allowProductAdd);
            setAllowRedistribution(selectedOption.game.allowRedistribution);
        }
    }, [selectedOption]);

    const updateInstitute = async (inst) => {
        var _key = props.user.role == 'superadmin' ? (inst ? inst.key : null) : props.user.institute_key;
        if (!_key) {
            return;
        }

        setInstituteKey(_key);
        setSelectedAdminGame(null);
        setAllowProductAdd(false);
        setAllowRedistribution(false);

        await fetchData(_key);

        const academicYears = await post('admin/academic_years_list', props.user, { institute_key: _key });
        if (academicYears && academicYears.rc) {
            return;
        }
        if (!academicYears) {
            return;
        }
        const _yearOpts = [];
        academicYears.forEach((year) => {
            _yearOpts.push({
                label: year,
                value: year
            });
        });
        setYearOptions(_yearOpts);
        setSelectedYear(_yearOpts[0]);
        setInstitute(inst);
    };

    const selectGame = async (option) => {
        //await fetchData();
        setSelectedAdminGame(option.game);
        setAllowProductAdd(option.game.allowProductAdd);
        setAllowRedistribution(option.game.allowRedistribution);
        const _gameUsers = await post('admin/game_users', props.user, { game_key: option.game.key });
        if (_gameUsers && _gameUsers.rc) {
            console.error('admin/game_users: ', _gameUsers.rc);
            return;
        }
        setGameUsers(Array.isArray(_gameUsers) ? _gameUsers.sort((a, b) => { return a.roll_no - b.roll_no }) : null);
        if (option.game.academic_year) {
            const _selectedYear = { label: option.game.academic_year, value: option.game.academic_year };
            setSelectedYear(_selectedYear);
        }

        if (option.game.game_status == 'created' && option.game.case_study_key) {
            const _caseStudy = await post('admin/get_case_study', props.user, { key: option.game.case_study_key });
            if (_caseStudy && _caseStudy.rc) {
                console.error('admin/get_case_study: ', _caseStudy.rc);
                return;
            }
            if (_caseStudy) {
                setCaseStudy(_caseStudy);
                setShowProductAdd(_caseStudy.product.allowAdd);
                setShowDemandRedistribution(_caseStudy.allowRedistribution);
            }
        }
        else if (option.game.game_status == 'assigned' || option.game.game_status == 'started' || option.game.game_status == 'finished') {
            const _caseStudy = await post('admin/get_case_study', props.user, { key: option.game.case_study_key });
            if (_caseStudy && _caseStudy.rc) {
                console.error('admin/get_case_study: ', _caseStudy.rc);
                return;
            }
            if (!_caseStudy) {
                return;
            }
            setCaseStudy(_caseStudy);
            setShowProductAdd(_caseStudy.product.allowAdd);
            setShowDemandRedistribution(_caseStudy.allowRedistribution);

            const data = await post('user/game_details', props.user, { game_key: option.game.key });
            if (data && data.rc) {
                console.error('user/game_details: ', data.rc);
                return;
            }
            if (!data) {
                return;
            }

            if (data.game.type == 'self_play') {
                if (data.game.game_status == 'started') {
                    setRunning(true);
                }
                else {
                    setRunning(false);
                }
            }
            else {
                if (data.game.game_status == 'started') {
                    setRunning(true);
                    setTimer(data.game.timer);
                }
                else {
                    setRunning(false);
                    setTimer(data.game.timer);
                }
            }

            setSelectedAdminGame(data.game);
            setAllowProductAdd(data.game.allowProductAdd);
            setAllowRedistribution(data.game.allowRedistribution);
            setGameState(data.game_state);
            setGameData(data.game_data);
        }
        else {
            //resetGame();
            //setSelectedAdminGame({...selectedAdminGame});
            setAllowProductAdd(option.game.allowProductAdd);
            setAllowRedistribution(option.game.allowRedistribution);
        }

        const csopts = [];

        institute && institute.case_studies && institute.case_studies.forEach((cskey) => {
            const _caseStudy = caseStudyList[cskey];
            csopts.push({ label: _caseStudy.name, value: _caseStudy.key, case_study: _caseStudy });
        });

        setCaseStudyOptions(csopts);

        switch (option.game.type) {
            case 'assessment':
                setSelectedAdminGameType({
                    label: "Assessment",
                    value: "assessment"
                });
                break;
            case 'self_play':
                setSelectedAdminGameType({
                    label: "Self Play",
                    value: "self_play"
                });
                break;
            case 'team_play':
                setSelectedAdminGameType({
                    label: "Team Play",
                    value: "team_play"
                });
                break;
            default:
                setSelectedAdminGameType(null);
        }

        setTeams(option.game.teams);

        if (option.game.useMarkets) {
            const _teams = option.game.teams;
            const _markets = {};
            const _unassigned = [];

            for (var teamName in _teams) {
                const teamMarket = _teams[teamName].market;
                if (!teamMarket) {
                    _unassigned.push(teamName);
                    continue;
                }

                if (!_markets[teamMarket]) {
                    _markets[teamMarket] = {};
                }
                _markets[teamMarket][teamName] = _teams[teamName];
            }

            setMarkets(_markets);
            setUnassigned(_unassigned);

            const nmarkets = parseInt(option.game.no_of_markets || 0);
            const opts = [];
            if (nmarkets) {
                for (var i = 1; i <= nmarkets; i++) {
                    const name = 'Market ' + i;
                    opts.push({
                        label: name,
                        value: name
                    });
                }
            }
            setMarketOptions(opts);
        }

        const opts = [];
        for (var prop in option.game.teams) {
            const name = prop;
            opts.push({
                label: name,
                value: name
            });
        }
        setTeamOptions(opts);
        //setSelectedAdminGame(option.game);
    };

    const updateGameTimer = (timer) => {
        const _game = { ...selectedAdminGame };
        _game.timer = timer;
        setSelectedAdminGame(_game);
        setTimer(timer);
    };

    useEffect(() => {
        if (caseStudyOptions.length && selectedAdminGame && selectedAdminGame.case_study_key) {
            for (var i = 0; i < caseStudyOptions.length; i++) {
                const opt = caseStudyOptions[i];
                if (selectedAdminGame.case_study_key == opt.value) {
                    setSelectedCaseStudy(opt);
                    break;
                }
            }
        }
        else {
            setSelectedCaseStudy(null);
        }
    }, [caseStudyOptions, selectedOption]);

    const updateData = async (obj) => {
        const _game = { ...selectedAdminGame };
        if (obj.saveKey == 'no_of_markets') {
            const nmarkets = parseInt(obj.value || 0);
            /*
            if (nmarkets < 2) {
                ShowToast({ icon: 'danger', heading: 'Invalid value', message: 'There should be at least 2 markets' });
                return false;
            }
            */
            setMarkets({});

            const _unassigned = [];
            for (var prop in teams) {
                _unassigned.push(prop);
            }
            setUnassigned(_unassigned);

            const opts = [];
            if (nmarkets) {
                for (var i = 1; i <= nmarkets; i++) {
                    const name = 'Market ' + i;
                    opts.push({
                        label: name,
                        value: name
                    });
                }
            }
            setMarketOptions(opts);

            const _teams = selectedAdminGame.teams;
            for (var prop in _teams) {
                _teams[prop].market = null;
            }

            const temp = { ..._props };
            temp.selectedAdminGame = selectedAdminGame;
            _game.teams = _teams;
            await db.saveGameState(temp, 'teams', _teams);
        }
        _game[obj.saveKey] = obj.value;
        var selected = null;
        for (var i = 0; i < options.length; i++) {
            if (options[i].value == selectedAdminGame.key) {
                options[i].game = _game;
                selected = { ...options[i] };
            }
        }
        setOptions([...options]);
        setSelectedAdminGame(_game);
        setAllowProductAdd(_game.allowProductAdd);
        setAllowRedistribution(_game.allowRedistribution);
        setSelectedOption(selected);
    };

    const updateName = async (obj) => {
        const _game = { ...selectedAdminGame };
        _game.name = obj.value;
        var selected = null;
        for (var i = 0; i < options.length; i++) {
            if (options[i].value == selectedAdminGame.key) {
                options[i].label = obj.value;
                options[i].game = _game;
                selected = { ...options[i] };
            }
        }
        setOptions([...options]);
        setSelectedAdminGame(_game);
        setAllowProductAdd(_game.allowProductAdd);
        setAllowRedistribution(_game.allowRedistribution);
        setSelectedOption(selected);
    };

    const updateTeams = async (obj) => {
        const noOfTeams = parseInt(obj.value);
        const opts = [];
        var _teams = {};
        if (noOfTeams) {
            const names = gameConfig.getRandomTeamNames(noOfTeams);
            names.forEach((name) => {
                _teams[name] = {
                    users: {}
                };
                opts.push({
                    label: name,
                    value: name
                })
            });
        }

        const temp = { ..._props };
        temp.selectedAdminGame = selectedAdminGame;
        await db.saveGameState(temp, 'teams', _teams);
        selectedAdminGame.no_of_teams = noOfTeams;
        selectedAdminGame.teams = _teams;
        setSelectedAdminGame({ ...selectedAdminGame });
        setAllowProductAdd(selectedAdminGame.allowProductAdd);
        setAllowRedistribution(selectedAdminGame.allowRedistribution);
        setTeams(_teams);

        if (selectedAdminGame.useMarkets) {
            const _markets = {};
            const _unassigned = [];

            for (var teamName in _teams) {
                const teamMarket = _teams[teamName].market;
                if (!teamMarket) {
                    _unassigned.push(teamName);
                    continue;
                }

                if (!_markets[teamMarket]) {
                    _markets[teamMarket] = {};
                }
                _markets[teamMarket][teamName] = _teams[teamName];
            }

            setMarkets(_markets);
            setUnassigned(_unassigned);
        }

        setTeamOptions(opts);
    };

    const getTeamOptionValue = (user) => {
        for (var name in teams) {
            if (teams[name].users[user.key]) {
                return {
                    label: name,
                    value: name
                }
            }
        }

        return null;
    };

    const getMarketOptionValue = (teamName) => {
        const market = teams[teamName].market;
        return market ?
            {
                label: market,
                value: market
            }
            :
            null;
    };

    const teamOptionChanged = async (opt, user) => {
        const _teams = { ...teams };
        for (var prop in _teams) {
            delete _teams[prop].users[user.key];
        }
        _teams[opt.value].users[user.key] = { key: user.key, name: user.name };

        const temp = { ..._props };
        temp.selectedAdminGame = selectedAdminGame;
        await db.saveGameState(temp, 'teams', _teams);
        selectedAdminGame.teams = _teams;
        setSelectedAdminGame({ ...selectedAdminGame });
        setAllowProductAdd(selectedAdminGame.allowProductAdd);
        setAllowRedistribution(selectedAdminGame.allowRedistribution);
        setTeams(_teams);

        if (selectedAdminGame.useMarkets) {
            const _markets = {};
            const _unassigned = [];

            for (var teamName in _teams) {
                const teamMarket = _teams[teamName].market;
                if (!teamMarket) {
                    _unassigned.push(teamName);
                    continue;
                }

                if (!_markets[teamMarket]) {
                    _markets[teamMarket] = {};
                }
                _markets[teamMarket][teamName] = _teams[teamName];
            }

            setMarkets(_markets);
            setUnassigned(_unassigned);
        }
    };

    const marketOptionChanged = async (opt, teamName) => {
        const _teams = { ...teams };

        const selectedMarket = opt.value;
        _teams[teamName].market = selectedMarket;

        const _markets = {};
        const _unassigned = [];

        for (var teamName in _teams) {
            const teamMarket = _teams[teamName].market;
            if (!teamMarket) {
                _unassigned.push(teamName);
                continue;
            }

            if (!_markets[teamMarket]) {
                _markets[teamMarket] = {};
            }
            _markets[teamMarket][teamName] = _teams[teamName];
        }

        setMarkets(_markets);
        setUnassigned(_unassigned);
        selectedAdminGame.teams = _teams;
        setSelectedAdminGame({ ...selectedAdminGame });
        const temp = { ..._props };
        temp.selectedAdminGame = selectedAdminGame;
        await db.saveGameState(temp, 'teams', _teams);
    };

    const newGame = async () => {
        if (operationInProgress) {
            return;
        }

        setButtonDisabled(true);
        setOperationInProgress(true);

        ShowModal({
            title: 'New Game',
            closeButtonText: 'Close',
            body: <Container style={{ minWidth: '300px' }}>
                <Form>
                    <Form.Label>Game Name</Form.Label>
                    <Form.Control type="text" name="name" placeholder="game name..." defaultValue={''}></Form.Control>
                    <span className="error"></span>
                </Form>
            </Container>,
            buttons: [
                {
                    text: 'Add New Game',
                    onClick: async (element) => {
                        const form = element.closest('.modal-content').getElementsByTagName('form')[0];
                        if (!form.elements.name.value) {
                            form.getElementsByClassName('error')[0].innerText = 'Please fill in the name of the game';
                            setButtonDisabled(false);
                            setOperationInProgress(false);
                            return false;
                        }

                        const result = await post('admin/new_game', props.user, { institute_key: instituteKey, name: form.elements.name.value });
                        if (result && result.rc) {
                            form.getElementsByClassName('error')[0].innerText = result.rc;
                            setButtonDisabled(false);
                            setOperationInProgress(false);
                            return false;
                        }
                        if (!result) {
                            setButtonDisabled(false);
                            setOperationInProgress(false);
                            return false;
                        }
                        setGamesList(result);
                        const _options = [];
                        var _selected = null;
                        result.forEach((game) => {
                            const opt = {
                                label: game.name || game.key,
                                value: game.key,
                                game: game
                            };
                            _options.push(opt);
                            if (game.name == form.elements.name.value) {
                                _selected = opt;
                            }
                        });
                        setOptions(_options);
                        //await selectGame(_selected);
                        setSelectedOption(_selected);
                        setRunning(false);
                        setTimer(null);

                        setButtonDisabled(false);
                        setOperationInProgress(false);
                        setAllowProductAdd(false);
                        setAllowRedistribution(false);
                        return true;
                    }
                }
            ]
        });
    };

    const selectYear = async (opt) => {
        setSelectedYear(opt);
        const temp = { ..._props };
        temp.selectedAdminGame = selectedAdminGame;
        await db.saveGameState(temp, "academic_year", opt.value);
    };

    const changeCaseStudy = async (opt) => {
        setSelectedCaseStudy(opt);
        selectedAdminGame.case_study_key = opt.value;
        const temp = { ..._props };
        temp.selectedAdminGame = selectedAdminGame;
        await db.saveGameState(temp, "case_study_key", opt.value);
        setSelectedAdminGame({ ...selectedAdminGame });
        setAllowProductAdd(selectedAdminGame.allowProductAdd);
        setAllowRedistribution(selectedAdminGame.allowRedistribution);

        const _caseStudy = await post('admin/get_case_study', props.user, { key: opt.value });
        if (_caseStudy && _caseStudy.rc) {
            return;
        }
        if (!_caseStudy) {
            return;
        }
        setCaseStudy(_caseStudy);
        setShowProductAdd(_caseStudy.product.allowAdd);
        setShowDemandRedistribution(_caseStudy.allowRedistribution);
    };

    const selectGameType = async (opt) => {
        setSelectedAdminGameType(opt);
        selectedAdminGame.type = opt.value;
        const temp = { ..._props };
        temp.selectedAdminGame = selectedAdminGame;
        await db.saveGameState(temp, "type", opt.value);
        setSelectedAdminGame({ ...selectedAdminGame });
        setAllowProductAdd(selectedAdminGame.allowProductAdd);
        setAllowRedistribution(selectedAdminGame.allowRedistribution);
    };

    const selectAssessmentPlayers = async (list) => {
        const _game = { ...selectedAdminGame };
        _game.users = list;

        for (var team in _game.teams) {
            var keysToDelete = [];
            const _users = _game.teams[team].users;
            for (var ukey in _users) {
                if (!_game.users.hasOwnProperty(ukey)) {
                    keysToDelete.push(ukey);
                }
            }
            for (var i = 0; i < keysToDelete.length; i++) {
                delete _users[keysToDelete[i]];
            }
        }
        const temp = { ..._props };
        temp.selectedAdminGame = _game;
        await db.saveGameState(temp, "users", list, null, false);
        await db.saveGameState(temp, "teams", _game.teams);
        setSelectedAdminGame(_game);
        setAllowProductAdd(_game.allowProductAdd);
        setAllowRedistribution(_game.allowRedistribution);
        setTeams(_game.teams);
        const gameUsers = await post('admin/game_users', props.user, { game_key: _game.key });
        if (gameUsers && gameUsers.rc) {
            return;
        }
        setGameUsers(Array.isArray(gameUsers) ? gameUsers.sort((a, b) => { return a.roll_no - b.roll_no }) : null);
        setShowFullScreen(false);
        if (selectedAdminGame.type == 'self_play' && (selectedAdminGame.game_status == 'assigned' || selectedAdminGame.game_status == 'started')) {
            location.reload();
        }
    };

    const addMorePlayers = async (list) => {
        if (selectedAdminGame.type != 'self_play') {
            return;
        }

        const _game = { ...selectedAdminGame };
        const _list = Object.values(list);
        _game.users = _game.users.concat(_list);

        const result = await post('admin/add_more_game_users', props.user, { key: _game.key, users: _list });
        if (result && result.rc) {
            ShowToast({ icon: 'danger', heading: 'Error Adding User', message: result.rc });
            return;
        }

        const temp = { ..._props };
        temp.selectedAdminGame = _game;
        setSelectedAdminGame(_game);
        setAllowProductAdd(_game.allowProductAdd);
        setAllowRedistribution(_game.allowRedistribution);
        const gameUsers = await post('admin/game_users', props.user, { game_key: _game.key });
        if (gameUsers && gameUsers.rc) {
            return;
        }
        setGameUsers(Array.isArray(gameUsers) ? gameUsers.sort((a, b) => { return a.roll_no - b.roll_no }) : null);
        location.reload();
    };

    const assignPlayers = () => {
        setShowFullScreen(true);
    };

    const downloadUserList = async () => {
        const input = props.user;
        input.game_key = selectedAdminGame.key;
        const params = new URLSearchParams(input);
        fetch(`${gameConfig.GET_URL}/download_user_list?${params.toString()}`, {
            method: 'GET',
        }).then(async (response) => {
            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(errorMessage || `HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'student_list.xlsx');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        })
        .catch((error) => {
            console.error(error);
            ShowToast({
                icon: 'danger',
                heading: 'Download Failed',
                message: 'An error occurred while downloading the file. Please try again.',
            });
        });
    };

    const uploadTeamAllocation = async (e) => {
        setUploadErrors(null);
        if (!e.target.files) {
            return;
        }
        const file = e.target.files[0];
        e.target.value = null;
        const result = await upload('admin/upload_game_students', props.user, { game_key: selectedAdminGame.key }, file);
        if (result && result.rc) {
            ShowToast({ icon: 'danger', heading: 'Error in uploading', message: result.rc });
            return;
        }

        setGameUsers(Array.isArray(result.users) ? result.users.sort((a, b) => { return a.roll_no - b.roll_no }) : null);
        setTeams(result.teams);

        if (result.errors) {
            setUploadErrors(result.errors);
            ShowToast({
                icon: 'warning', heading: 'Errors in the file',
                message: <>
                    <div style={{ color: 'red', fontWeight: 'bold' }}>Errors in  {result.errors.length} records.</div>
                </>
            });
        }
        else {
            ShowToast({
                icon: 'success', heading: 'Success',
                message: 'Player allocation successful'
            });
        }
    };

    const uploadClicked = (e) => {
        uploadInput.current.click();
    };
    
    const closeClicked = () => {
        setShowFullScreen(false);
    };

    const openAddPlayers = () => {
        setShowAddPlayers(true);
    };

    const closeAddPlayers = () => {
        setShowAddPlayers(false);
    };

    const saveGame = async () => {
        if (!selectedAdminGame) {
            ShowToast({ icon: 'danger', heading: 'No game selected', message: 'Please select a game before saving' });
            return;
        }

        if (!selectedAdminGame.name) {
            ShowToast({ icon: 'danger', heading: 'Incomplete game data', small: (pageData.game_name_label || 'Name'), message: 'Please fill in all the data' });
            return;
        }

        if (!selectedYear) {
            ShowToast({ icon: 'danger', heading: 'Incomplete game data', small: (pageData.game_year_label || 'Academic Year'), message: 'Please fill in all the data' });
            return;
        }

        if (!selectedAdminGameType) {
            ShowToast({ icon: 'danger', heading: 'Incomplete game data', small: (pageData.game_type_label || 'Game Type'), message: 'Please fill in all the data' });
            return;
        }

        if (!selectedAdminGame.users || !selectedAdminGame.users.length) {
            ShowToast({ icon: 'danger', heading: 'No users assigned', small: (pageData.case_study_select_label || 'Case Study'), message: 'To start a game assign users first' });
            return;
        }

        if (parseInt(selectedAdminGame.no_of_qtrs || 0) <= 1) {
            ShowToast({ icon: 'danger', heading: 'Incomplete game data', small: (pageData.no_of_qtrs_label || 'Number of Quarters'), message: 'Number of quarters should be greater than 1' });
            return;
        }

        if (parseInt(selectedAdminGame.no_of_teams || 0) <= 1) {
            const label = selectedAdminGameType == 'assessment' || selectedAdminGameType == 'self_play' ? (pageData.no_of_bots_label || 'Number of Players') : (pageData.no_of_teams_label || 'Number of Teams');
            ShowToast({ icon: 'danger', heading: 'Incomplete game data', small: label, message: 'No of teams should be greater than 1' });
            return;
        }

        if (!selectedCaseStudy) {
            ShowToast({ icon: 'danger', heading: 'Incomplete game data', small: (pageData.case_study_select_label || 'Case Study'), message: 'Please fill in all the data' });
            return;
        }

        if (selectedAdminGame.type == 'team_play') {
            var assigned = 0;
            for (var prop in teams) {
                assigned += Object.keys(teams[prop].users).length;
            }

            if (assigned != selectedAdminGame.users.length) {
                ShowToast({ icon: 'danger', heading: 'Users not assigned', message: 'Please assign all users before saving game' });
                return;
            }
        }

        const _gameState = await post('admin/save_game', props.user, { key: selectedAdminGame.key });
        if (_gameState && _gameState.rc) {
            ShowToast({ icon: 'danger', heading: 'Error saving game', small: 'incomplete case study', message: _gameState.rc });
            return;
        }
        setSelectedAdminGame(_gameState);
        setAllowProductAdd(_gameState.allowProductAdd);
        setAllowRedistribution(_gameState.allowRedistribution);

        const _caseStudy = await post('admin/get_case_study', props.user, { key: _gameState.case_study_key });
        if (_caseStudy && _caseStudy.rc) {
            ShowToast({ icon: 'danger', heading: 'Case Study Not Found', message: _caseStudy.rc + _gameState.case_study_key });
            return;
        }

        if (!_caseStudy) {
            ShowToast({ icon: 'danger', heading: 'Case Study Not Found', message: 'Invalid case study key ' + _gameState.case_study_key });
            return;
        }

        setCaseStudy(_caseStudy);
        setShowProductAdd(_caseStudy.product.allowAdd);
        setShowDemandRedistribution(_caseStudy.allowRedistribution);

        const data = await post('user/game_details', props.user, { game_key: _gameState.key });
        if (data && data.rc) {
            return;
        }
        if (!data) {
            return;
        }

        if (data.game.timer && data.game.game_status == 'started') {
            setRunning(true);
            setTimer(data.game.timer);
        }
        else {
            setRunning(false);
            setTimer(data.game.timer || null);
        }

        setSelectedAdminGame(data.game);
        setAllowProductAdd(data.game.allowProductAdd);
        setAllowRedistribution(data.game.allowRedistribution);
        setGameState(data.game_state);
        setGameData(data.game_data);

        options.forEach((opt) => {
            if (opt.game.key == _gameState.key) {
                opt.game = _gameState;
                setSelectedOption(opt);
                return;
            }
        });
    };

    const undoQuarter = async () => {
        const data = await post('user/game_details', props.user, { game_key: selectedAdminGame.key });
        if (data && data.rc) {
            setRunning(false);
            setTimer(null);
            return;
        }
        if (!data) {
            setRunning(false);
            setTimer(null);
            return;
        }

        if (data.game.timer && data.game.game_status == 'started') {
            setRunning(true);
            setTimer(data.game.timer);
        }
        else {
            setRunning(false);
            setTimer(data.game.timer || null);
        }

        setSelectedAdminGame(data.game);
        setAllowProductAdd(data.game.allowProductAdd);
        setAllowRedistribution(data.game.allowRedistribution);
        setGameState(data.game_state);
        setGameData(data.game_data);
    };

    const resetGame = (_game) => {
        //setCaseStudy(null);
        setGameState(null);
        setGameData(null);
        if (_game) {
            options.forEach((opt) => {
                if (opt.game.key == _game.key) {
                    opt.game = _game;
                    setSelectedOption(opt);
                    setAllowProductAdd(opt.game.allowProductAdd);
                    setAllowRedistribution(opt.game.allowRedistribution);
                    return;
                }
            });
        }
        setShowProductAdd(caseStudy.product.allowAdd);
        setShowDemandRedistribution(caseStudy.allowRedistribution);

        setAllowProductAdd(_game.allowProductAdd);
        setAllowRedistribution(_game.allowRedistribution);
    };

    const changeGame = (game) => {
        options.forEach((opt) => {
            if (opt.game.key == game.key) {
                opt.game = game;
                setSelectedOption(opt);
                return;
            }
        });
    };

    const reloadGame = (data) => {
        const gs = { ...gameState };
        const gd = { ...gameData };
        gs[data.user_key] = data.game_state;
        gd[data.user_key] = data.game_data;
        setGameState(gs);
        setGameData(gd);
    };

    const endGame = (_game, _gameState) => {
        setGameState(_gameState);
    };

    const reloadGameData = async (gameKey) => {
        const data = await post('user/game_details', props.user, { game_key: gameKey });
        if (data && data.rc) {
            return;
        }
        if (!data) {
            return;
        }

        if (data.game.timer && data.game.game_status == 'started') {
            setRunning(true);
            setTimer(data.game.timer);
        }
        else {
            setRunning(false);
            setTimer(data.game.timer || null);
        }

        setSelectedAdminGame(data.game);
        setAllowProductAdd(data.game.allowProductAdd);
        setAllowRedistribution(data.game.allowRedistribution);
        setGameState(data.game_state);
        setGameData(data.game_data);
    };

    const updateSelectedAdminGame = (game) => {
        setSelectedAdminGame(game);
        setAllowProductAdd(game.allowProductAdd);
        setAllowRedistribution(game.allowRedistribution);
    };

    const getTeamName = (teamName) => {
        if (!gameState.teamNames || !teamName) {
            return teamName;
        }
        const key = teamName.trim().toLowerCase().replace(/[ ]+/, '_');
        return gameState.teamNames[key] || teamName;
    };

    const handleDebugClick = (e) => {
        const _update = async () => {
            const { checked } = e.target;
            const _props = { ...props };
            _props.selectedGame = selectedAdminGame;
            await db.saveGameState(_props, 'debug', checked);
            await updateData({ saveKey: 'debug', checked });
        };
        _update();
    };

    const handleTraceClick = (e) => {
        const _update = async () => {
            const { checked } = e.target;
            const _props = { ...props };
            _props.selectedGame = selectedAdminGame;
            await db.saveGameState(_props, 'trace', checked);
            await updateData({ saveKey: 'trace', checked });
        };
        _update();
    };

    const deleteGame = (e) => {
        const _update = async () => {
            await post('sadmin/delete_game ', props.user, { key: selectedAdminGame.key });
            var idx = -1;
            for (var i = 0; i < options.length; i++) {
                if (options[i].value == selectedAdminGame.key) {
                    idx = i;
                    break;
                }
            }
            if (idx != -1) {
                options.splice(idx, 1);
                setOptions([...options]);
            }
            setSelectedOption(null);
            setSelectedAdminGame(null);
            setAllowProductAdd(false);
            setAllowRedistribution(false);
        };

        Confirm({
            body: 'Do you want to delete the game ' + selectedAdminGame.name + '?',
            callback: () => {
                _update();
            },
            buttonText: 'Delete'
        });
    };

    const timerFinished = () => {
        if (!selectedAdminGame) {
            return;
        }

        if (selectedAdminGame.game_status == 'finished' || gameState.game_status == 'paused' || !gameState.started_dt) {
            return;
        }

        if (selectedAdminGame.type == 'team_play') {
            const _update = async () => {
                for (var team in gameData) {
                    if (gameData[team].quarter_status == 'submitted' || gameData[team].quarter_status == 'paused') {
                        continue;
                    }

                    const result = await post('admin/quarter_timeout', props.user, { game_key: selectedAdminGame.key });
                    if (result && result.rc) {
                        ShowToast({ icon: 'danger', heading: 'Error submitting data', message: result.rc });
                        return;
                    }
                    if (!result) {
                        return;
                    }

                    //setSelectedAdminGame(result.game);
                    setGameState(result.game_state);
                    setGameData(result.game_data);
                    var selected = null;
                    for (var i = 0; i < options.length; i++) {
                        if (options[i].value == result.game.key) {
                            options[i].game = result.game;
                            selected = { ...options[i] };
                        }
                    }
                    setOptions([...options]);
                    //setSelectedOption(selected);
                }
            }
            _update();
        }
        else if (selectedAdminGame.type == 'assessment') {
            const assessmentFinished = async () => {
                const output = await post('admin/assessment_timeout', props.user, { game_key: selectedAdminGame.key });
                if (output && output.rc) {
                    ShowToast({ icon: 'danger', heading: 'System Error', message: output.rc });
                    return;
                }
            };

            assessmentFinished();
        }
    };

    const handleProductCheckboxChange = (e) => {
        const { checked } = e.target;
        selectedAdminGame.allowProductAdd = checked;
        setSelectedAdminGame({ ...selectedAdminGame });
        setAllowProductAdd(checked);

        const _update = async () => {
            const _props = { ...props };
            _props.selectedGame = selectedAdminGame;
            await db.saveGameState(_props, 'allowProductAdd', checked);
        };
        _update();
    };

    const handleRedistributionCheckboxChange = (e) => {
        const { checked } = e.target;
        selectedAdminGame.allowRedistribution = checked;
        setSelectedAdminGame({ ...selectedAdminGame });
        setAllowRedistribution(checked);

        const _update = async () => {
            const _props = { ...props };
            _props.selectedGame = selectedAdminGame;
            await db.saveGameState(_props, 'allowRedistribution', checked);
        };
        _update();
    };

    const handleUseMarketCheckbox = (e) => {
        const { checked } = e.target;
        selectedAdminGame.useMarkets = checked;
        setSelectedAdminGame({ ...selectedAdminGame });
        setMarkets({});

        const _unassigned = [];
        const _teams = {...teams};
        for (var prop in _teams) {
            const team = _teams[prop];
            team.market = null;
            _unassigned.push(prop);
        }
        setUnassigned(_unassigned);
        setTeams(_teams);

        const _update = async () => {
            const _props = { ...props };
            _props.selectedGame = selectedAdminGame;
            await db.saveGameState(_props, 'useMarkets', checked);
        };
        _update();
    };

    return (
        <Card className="container-card">
            <Card.Header>
                <AutoSaveText
                    saveKey="games_heading"
                    text={pageData.games_heading || 'Games'}
                    saveFn="saveSiteData"
                    {..._props}
                />
            </Card.Header>
            <Card.Body style={{ minHeight: '900px' }}>
                {props.user.role == 'superadmin' &&
                    <InstituteSelect
                        {..._props}
                        updateInstitute={updateInstitute}
                    />
                }
                {instituteKey &&
                    <>
                        <div style={{ height: '15px' }}></div>
                        <Card>
                            <Card.Header>
                                <AutoSaveText
                                    saveKey="select_game_heading"
                                    text={pageData.select_game_heading || 'Select Game'}
                                    saveFn="saveSiteData"
                                    {..._props}
                                />
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col>
                                        <Select
                                            className="games_select"
                                            name="games_select"
                                            options={options}
                                            value={selectedOption}
                                            onChange={async (option) => { setSelectedOption(option) }}
                                        />
                                    </Col>
                                    <Col>
                                    </Col>
                                    <Col>
                                        <Button name="new_game" onClick={newGame} disabled={buttonDisabled}>New Game</Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </>
                }
                {selectedAdminGame && (!selectedAdminGame.game_status || selectedAdminGame.game_status == 'created') &&
                    <>
                        <div style={{ height: '15px' }}></div>
                        <Card>
                            <Card.Header>
                                <AutoSaveText
                                    saveKey="game_settings_heading"
                                    text={pageData.game_settings_heading || 'Game Settings'}
                                    saveFn="saveSiteData"
                                    {..._props}
                                />
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col style={{ paddingRight: '10px' }}>
                                        <Card.Text>
                                            <AutoSaveText
                                                saveKey="game_name_label"
                                                text={pageData.game_name_label || 'Name'}
                                                saveFn="saveSiteData"
                                                {..._props} />
                                            &nbsp;*
                                        </Card.Text>
                                        <AutoSaveInput
                                            type="alphanum"
                                            saveKey="name"
                                            value={selectedAdminGame.name || ''}
                                            saveFn="saveGameState"
                                            selectedAdminGame={selectedAdminGame}
                                            caseStudy={caseStudy}
                                            updateData={updateName}
                                            owner={instituteKey + '||' + (selectedAdminGame ? selectedAdminGame.key : '')}
                                            {..._props}
                                        />
                                    </Col>
                                    <Col>
                                        <Card.Text>
                                            <AutoSaveText
                                                saveKey="game_year_label"
                                                text={pageData.game_year_label || 'Academic Year'}
                                                saveFn="saveSiteData"
                                                {..._props}
                                            />
                                            &nbsp;*
                                        </Card.Text>
                                        <Select
                                            className="years_select"
                                            name="years_select"
                                            options={yearOptions}
                                            value={selectedYear}
                                            onChange={selectYear}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col style={{ paddingRight: '10px' }}>
                                        <Card.Text>
                                            <AutoSaveText
                                                saveKey="no_of_qtrs_label"
                                                text={pageData.no_of_qtrs_label || 'Number of Quarters'}
                                                saveFn="saveSiteData"
                                                {..._props} />
                                            &nbsp;*
                                        </Card.Text>
                                        <AutoSaveInput
                                            type="int_pos"
                                            saveKey="no_of_qtrs"
                                            value={selectedAdminGame.no_of_qtrs || ''}
                                            saveFn="saveGameState"
                                            selectedAdminGame={selectedAdminGame}
                                            caseStudy={caseStudy}
                                            updateData={updateData}
                                            owner={instituteKey + '||' + (selectedAdminGame ? selectedAdminGame.key : 'null')}
                                            {..._props}
                                        />
                                    </Col>
                                    <Col style={{ paddingRight: '10px' }}>
                                        <Card.Text>
                                            {selectedAdminGame && (selectedAdminGame.type == 'assessment' || selectedAdminGame.type == 'self_play') &&
                                                <AutoSaveText
                                                    saveKey="no_of_players_label"
                                                    text={pageData.no_of_bots_label || 'Number of Players'}
                                                    saveFn="saveSiteData"
                                                    {..._props}
                                                />
                                            }
                                            {selectedAdminGame && selectedAdminGame.type == 'team_play' &&
                                                <AutoSaveText
                                                    saveKey="no_of_teams_label"
                                                    text={pageData.no_of_teams_label || 'Number of Teams'}
                                                    saveFn="saveSiteData"
                                                    {..._props}
                                                />
                                            }
                                            {!selectedAdminGame.type &&
                                                <AutoSaveText
                                                    saveKey="no_of_teams_bots_label"
                                                    text={pageData.no_of_teams_bots_label || 'Number of Teams or Players'}
                                                    saveFn="saveSiteData"
                                                    {..._props}
                                                />
                                            }
                                            &nbsp;*
                                        </Card.Text>
                                        <AutoSaveInput
                                            {..._props}
                                            type="int_pos"
                                            saveKey="no_of_teams"
                                            value={selectedAdminGame.no_of_teams || ''}
                                            saveFn="saveGameState"
                                            selectedAdminGame={selectedAdminGame}
                                            caseStudy={caseStudy}
                                            updateData={updateTeams}
                                            owner={instituteKey + '||' + (selectedAdminGame ? selectedAdminGame.key : '')}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Card.Text>
                                            <AutoSaveText
                                                saveKey="case_study_select_label"
                                                text={pageData.case_study_select_label || 'Case Study'}
                                                saveFn="saveSiteData"
                                                {..._props}
                                            />
                                            &nbsp;*
                                        </Card.Text>
                                        <Select
                                            className="case_studies_select"
                                            name="case_studies_select"
                                            options={caseStudyOptions}
                                            value={selectedCaseStudy}
                                            onChange={changeCaseStudy}
                                        />
                                    </Col>
                                    <Col>
                                        <Card.Text>
                                            <AutoSaveText
                                                saveKey="game_type_label"
                                                text={pageData.game_type_label || 'Game Type'}
                                                saveFn="saveSiteData"
                                                {..._props}
                                            />
                                            &nbsp;*
                                        </Card.Text>
                                        <Select
                                            className="game_type_select"
                                            name="game_type_select"
                                            options={[
                                                {
                                                    label: "Assessment",
                                                    value: "assessment"
                                                },
                                                {
                                                    label: "Self Play",
                                                    value: "self_play"
                                                },
                                                {
                                                    label: "Team Play",
                                                    value: "team_play"
                                                }
                                            ]}
                                            value={selectedAdminGameType}
                                            onChange={selectGameType}
                                        />
                                    </Col>
                                </Row>
                                <Row style={{ marginTop: '20px' }}>
                                    <Col>
                                        {caseStudy && showProductAdd &&
                                            <Row>
                                                <Col>
                                                    <Card.Text>
                                                        <span>Allow Product Add</span>
                                                    </Card.Text>
                                                </Col>
                                                <Col>
                                                    <input
                                                        type="checkbox"
                                                        id="product_add_checkbox"
                                                        checked={allowProductAdd}
                                                        onChange={handleProductCheckboxChange}
                                                    />
                                                </Col>
                                            </Row>
                                        }
                                    </Col>
                                    <Col>
                                        {caseStudy && showDemandRedistribution && selectedAdminGame &&
                                            <Row>
                                                <Col>
                                                    <Card.Text>
                                                        <span>Enabled Demand Redistribution</span>
                                                    </Card.Text>
                                                </Col>
                                                <Col>
                                                    <input
                                                        type="checkbox"
                                                        id="demand_redistribution_checkbox"
                                                        checked={allowRedistribution}
                                                        onChange={handleRedistributionCheckboxChange}
                                                    />
                                                </Col>
                                            </Row>
                                        }
                                    </Col>
                                </Row>
                                {caseStudy && selectedAdminGame && selectedAdminGame.type == 'team_play' &&
                                    <Row style={{ marginTop: '20px' }}>
                                        <Col>
                                            <Row>
                                                <Col>
                                                    <Card.Text>
                                                        <span>Use Markets</span>
                                                    </Card.Text>
                                                </Col>
                                                <Col>
                                                    <input
                                                        type="checkbox"
                                                        id="use_markets"
                                                        checked={selectedAdminGame.useMarkets}
                                                        onChange={handleUseMarketCheckbox}
                                                    />
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col>
                                            {selectedAdminGame && selectedAdminGame.useMarkets &&
                                                <Row>
                                                    <Col>
                                                        <Card.Text>
                                                            <AutoSaveText
                                                                saveKey="no_of_markets_label"
                                                                text={pageData.no_of_markets_label || 'Number of Markets'}
                                                                saveFn="saveSiteData"
                                                                {..._props} />
                                                            &nbsp;
                                                        </Card.Text>
                                                    </Col>
                                                    <Col>
                                                        <AutoSaveInput
                                                            type="int_pos"
                                                            saveKey="no_of_markets"
                                                            value={selectedAdminGame.no_of_markets || ''}
                                                            saveFn="saveGameState"
                                                            selectedAdminGame={selectedAdminGame}
                                                            caseStudy={caseStudy}
                                                            updateData={updateData}
                                                            owner={instituteKey + '||' + (selectedAdminGame ? selectedAdminGame.key : 'null')}
                                                            {..._props}
                                                        />
                                                    </Col>
                                                </Row>
                                            }
                                        </Col>
                                    </Row>
                                }
                            </Card.Body>
                        </Card>
                        <div style={{ height: '15px' }}></div>
                        <Card>
                            <Card.Body>
                                <Row>
                                    <Col><Button onClick={downloadUserList}>Download User List</Button></Col>
                                    <Col style={{textAlign: 'center'}}><Button onClick={assignPlayers}>Assign Players</Button></Col>
                                    <Col style={{textAlign: 'right'}}>
                                        <Button onClick={uploadClicked}>Upload Team Allocation</Button>
                                        <input ref={uploadInput} style={{ display: 'none' }} accept=".xls, .xlsx" type="file" onChange={uploadTeamAllocation} />
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                        {uploadErrors &&
                            <>
                                <div style={{ height: '15px' }}></div>
                                <Card>
                                    <Card.Header>Error Records</Card.Header>
                                    <Card.Body>
                                        <Table className="user_list">
                                            <thead>
                                                <tr>
                                                    <th>Row</th>
                                                    <th>Roll No</th>
                                                    <th>User Name</th>
                                                    <th>User Email</th>
                                                    <th>Error Message</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {uploadErrors.map((_error, idx) => (
                                                    <tr key={idx}>
                                                        <td>{_error.row}</td>
                                                        <td>{_error.record.roll_no}</td>
                                                        <td>{_error.record.name}</td>
                                                        <td>{_error.record.email}</td>
                                                        <td style={{ color: 'red' }}>{_error.message}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </>
                        }
                    </>
                }
                {selectedAdminGame && (!selectedAdminGame.game_status || selectedAdminGame.game_status == 'created') &&
                    <>
                        <div style={{ height: '15px' }}></div>
                        <Card>
                            <Card.Header>
                                <AutoSaveText
                                    saveKey="game_users_heading"
                                    text={pageData.game_users_heading || 'Game Users'}
                                    saveFn="saveSiteData"
                                    {..._props}
                                />
                                &nbsp;*
                            </Card.Header>
                            <Card.Body>
                                <Table>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Roll No</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Program</th>
                                            {selectedAdminGame.type == 'team_play' && <th>Team</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {gameUsers && gameUsers.map((user, idx) => (
                                            <tr key={idx}>
                                                <td style={{ backgroundColor: selectedAdminGame.type == 'self_play' && parseInt(institute.max_self_play_games || 0) && parseInt(user.self_play_games || 0) >= parseInt(institute.max_self_play_games || 0) ? 'red' : 'initial' }}>{idx + 1}</td>
                                                <td>{user.roll_no}</td>
                                                <td>{user.name}</td>
                                                <td>{user.email}</td>
                                                <td>{user.program}</td>
                                                {selectedAdminGame.type == 'team_play' &&
                                                    <td>
                                                        <Select
                                                            name="team_options"
                                                            className="team_options"
                                                            options={teamOptions}
                                                            value={getTeamOptionValue(user)}
                                                            onChange={async (opt) => { await teamOptionChanged(opt, user) }}
                                                        />
                                                    </td>
                                                }
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </>
                }
                {selectedAdminGame && (!selectedAdminGame.game_status || selectedAdminGame.game_status == 'created') && selectedAdminGame.type == 'team_play' && !selectedAdminGame.useMarkets &&
                    <>
                        <div style={{ height: '15px' }}></div>
                        <Card>
                            <Card.Header>
                                <AutoSaveText
                                    saveKey="teams_heading"
                                    text={pageData.teams_heading || 'Teams'}
                                    saveFn="saveSiteData"
                                    {..._props}
                                />
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    {teams && Object.keys(teams).map((teamName, idx) => (
                                        <Col md={4} key={idx}>
                                            <Card>
                                                <Card.Header>
                                                    {teamName}
                                                </Card.Header>
                                                <Card.Body>
                                                    {Object.keys(teams[teamName].users).map((userKey, uidx) => (
                                                        <Card.Text key={idx + '-' + uidx}>{teams[teamName].users[userKey].name}</Card.Text>
                                                    ))}
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </Card.Body>
                        </Card>
                    </>
                }
                {selectedAdminGame && (!selectedAdminGame.game_status || selectedAdminGame.game_status == 'created') && selectedAdminGame.type == 'team_play' && selectedAdminGame.useMarkets &&
                    <>
                        <Card>
                            <Card.Header>
                                Unassigned Market
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    {unassigned.map((teamName) => (
                                        <Col md={4} key={teamName}>
                                            <Card>
                                                <Card.Header>
                                                    {teamName}
                                                </Card.Header>
                                                <Card.Body>
                                                    <Select
                                                        name="market_options"
                                                        className="market_options"
                                                        options={marketOptions}
                                                        value={getMarketOptionValue(teamName)}
                                                        onChange={async (opt) => { await marketOptionChanged(opt, teamName) }}
                                                    />
                                                    {
                                                        teams[teamName] && teams[teamName].users && Object.keys(teams[teamName].users).length &&
                                                        Object.keys(teams[teamName].users).map((userKey, uidx) => (
                                                            <Card.Text key={uidx}>{teams[teamName].users[userKey].name}</Card.Text>
                                                        ))
                                                    }
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </Card.Body>
                        </Card>

                        {Object.keys(markets).map((marketName) => (
                            <Card key={marketName}>
                                <Card.Header>
                                    {marketName}
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        {markets[marketName] && Object.keys(markets[marketName]).map((teamName, idx) => (
                                            <Col md={4} key={idx}>
                                                <Card>
                                                    <Card.Header>
                                                        {teamName}
                                                    </Card.Header>
                                                    <Card.Body>
                                                        <div style={{ marginBottom: '30px' }}>
                                                            <Card.Text>Market</Card.Text>
                                                            <Select
                                                                name="market_options"
                                                                className="market_options"
                                                                options={marketOptions}
                                                                value={getMarketOptionValue(teamName)}
                                                                onChange={async (opt) => { await marketOptionChanged(opt, teamName) }}
                                                            />
                                                        </div>
                                                        {
                                                            markets[marketName][teamName] && markets[marketName][teamName].users && Object.keys(markets[marketName][teamName].users).length &&
                                                            Object.keys(markets[marketName][teamName].users).map((userKey, uidx) => (
                                                                <Card.Text key={idx + '-' + uidx}>{markets[marketName][teamName].users[userKey].name}</Card.Text>
                                                            ))
                                                        }
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                </Card.Body>
                            </Card>
                        ))}
                    </>
                }
                {selectedAdminGame && (!selectedAdminGame.game_status || selectedAdminGame.game_status == 'created') &&
                    <>
                        <div style={{ height: '15px' }}></div>
                        <Card style={{ textAlign: 'center' }}>
                            <Card.Body>
                                <Button onClick={saveGame}>Save Game</Button>
                            </Card.Body>
                        </Card>
                    </>
                }
                {selectedAdminGame && gameUsers && gameData && (selectedAdminGame.game_status == 'assigned' || selectedAdminGame.game_status == 'started' || selectedAdminGame.game_status == 'finished') &&
                    <>
                        <div style={{ height: '15px' }}></div>
                        <AssignedPlay
                            selectedAdminGame={selectedAdminGame}
                            pageData={pageData}
                            setSelectedAdminGame={updateSelectedAdminGame}
                            setAllowProductAdd={setAllowProductAdd}
                            setAllowRedistribution={setAllowRedistribution}
                            institute={institute}
                            caseStudyList={caseStudyList}
                            gameUsers={gameUsers}
                            gameCaseStudy={caseStudy}
                            allGameData={gameData}
                            allGameState={gameState}
                            setGameState={setGameState}
                            resetGame={resetGame}
                            changeGame={changeGame}
                            undoQuarter={undoQuarter}
                            reloadGame={reloadGame}
                            reloadGameData={reloadGameData}
                            setAllGameData={setGameData}
                            endGame={endGame}
                            timerFinished={timerFinished}
                            running={running}
                            setRunning={setRunning}
                            timer={timer}
                            setTimer={setTimer}
                            updateGameTimer={updateGameTimer}
                            markets={markets}
                            {..._props}
                        />
                        {selectedAdminGame.type == 'self_play' && (selectedAdminGame.game_status == 'assigned' || selectedAdminGame.game_status == 'started') &&
                            <>
                                <div style={{ height: '15px' }}></div>
                                <Card style={{ textAlign: 'center' }}>
                                    <Card.Body>
                                        <Button onClick={openAddPlayers}>Add Players</Button>
                                    </Card.Body>
                                </Card>
                            </>
                        }
                    </>
                }
                {props.user.role == 'superadmin' && selectedAdminGame &&
                    <>
                        <div style={{ height: '15px' }}></div>
                        <Card>
                            <Card.Header>
                                debug game
                            </Card.Header>
                            <Card.Body>
                                <Row style={{ margin: '10px 0', fontWeight: 'lighter' }}>
                                    <Col>
                                        <span>game key: <span >{selectedAdminGame.key}</span></span>
                                    </Col>
                                    {selectedAdminGame.game_status != 'finished' &&
                                        <Col md={2}>
                                            <span style={{ display: 'inline-block', marginRight: '10px' }}>
                                                <Form.Check
                                                    type="checkbox"
                                                    onChange={handleDebugClick}
                                                    checked={selectedAdminGame.debug}
                                                />
                                            </span>
                                            <span>debug</span>

                                        </Col>
                                    }
                                    {selectedAdminGame.game_status != 'finished' &&
                                        <Col md={2}>
                                            <span style={{ display: 'inline-block', marginRight: '10px' }}>
                                                <Form.Check
                                                    type="checkbox"
                                                    onChange={handleTraceClick}
                                                    checked={selectedAdminGame.trace}
                                                />
                                            </span>
                                            <span>trace</span>
                                        </Col>
                                    }
                                    <Col md={2}>
                                        <Button name="delete_game" onClick={deleteGame}>Delete Game</Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </>
                }
            </Card.Body>
            {selectedAdminGame && institute &&
                <SelectPlayers
                    showFullScreen={showFullScreen}
                    closeClicked={closeClicked}
                    game={selectedAdminGame}
                    users={users}
                    gameUsers={gameUsers}
                    setAssessmentPlayers={selectAssessmentPlayers}
                    page={page}
                    setPage={setPage}
                    pageSize={userPageSize}
                    npages={npages}
                    maxGames={selectedAdminGame.type == 'self_play' ? parseInt(institute.max_self_play_games) : 0}
                />
            }
            {selectedAdminGame && institute && selectedAdminGame.type == 'self_play' &&
                <AddPlayers
                    showAddPlayers={showAddPlayers}
                    closeAddPlayers={closeAddPlayers}
                    game={selectedAdminGame}
                    users={users}
                    gameUsers={gameUsers}
                    pageSize={userPageSize}
                    addMorePlayers={addMorePlayers}
                    maxGames={selectedAdminGame.type == 'self_play' ? parseInt(institute.max_self_play_games) : 0}
                />
            }
        </Card>
    );
};

export default Games;

const SelectPlayers = (props) => {
    const [selectedPlayers, setSelectedPlayers] = useState({});

    const paginatorStyle = { margin: '2px', border: '1px solid black', width: '35px', height: '35px', backgroundColor: 'white', fontSize: '0.8rem', color: 'black' };
    const paginatorStyleActive = { ...paginatorStyle, fontWeight: 'bold', border: '2px solid black', backgroundColor: '#eeeeee' };

    useEffect(() => {
        if (props.gameUsers) {
            const _gusers = props.gameUsers.sort((a, b) => { return a.roll_no - b.roll_no });
            const _users = {};
            props.gameUsers.forEach((user) => {
                _users[user.key] = user;
            });
            setSelectedPlayers(_users);
        }
        else {
            setSelectedPlayers({});
        }
    }, [props.gameUsers]);

    const checkAll = (e) => {
        if (props.npages > 1) {
            return;
        }
        const { checked } = e.target;
        if (checked) {
            const _users = {};
            props.users.forEach((_user) => {
                _users[_user.key] = _user;
            });
            setSelectedPlayers(_users);
        }
        else {
            setSelectedPlayers({});
        }
    };

    const allChecked = () => {
        return Object.keys(selectedPlayers).length == Object.keys(props.users).length;
    };

    const checkUser = (e, user) => {
        const { checked } = e.target;
        const _users = { ...selectedPlayers };

        if (checked) {
            _users[user.key] = user;
        }
        else {
            delete _users[user.key];
        }

        setSelectedPlayers(_users);
    };

    const resetPlayers = () => {
        if (props.gameUsers) {
            const _users = {};
            props.gameUsers.forEach((user) => {
                _users[user.key] = user;
            });
            setSelectedPlayers(_users);
        }
        else {
            setSelectedPlayers({});
        }
    };

    const selectPlayers = async () => {
        await props.setAssessmentPlayers(Object.keys(selectedPlayers));
    };

    return props.showFullScreen &&
        <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '100%' }}>
            <Card style={{ height: '100%' }}>
                <Card.Header>
                    Select Players - {toCamelCase(props.game.type)}
                    <CloseToolbar closeClicked={props.closeClicked} />
                </Card.Header>
                <Card.Body style={{ overflowY: 'scroll' }}>
                    <Row>
                        <Col><Button onClick={resetPlayers}>Reset</Button></Col>
                        <Col><Button onClick={selectPlayers}>Select Players</Button></Col>
                    </Row>
                    {props.npages > 1 &&
                        <div className="paginator" style={{ textAlign: 'center' }}>
                            {Array.from(Array(props.npages).keys()).map((idx) => (
                                <button style={(idx + 1) == props.page ? paginatorStyleActive : paginatorStyle} onClick={() => { props.setPage(idx + 1) }}>{idx + 1}</button>
                            ))}
                        </div>
                    }
                    <Table>
                        <thead>
                            <tr>
                                <th>{props.npages == 1 && <Form.Check onChange={checkAll} checked={allChecked()} />}</th>
                                <th>#</th>
                                <th>Roll No</th>
                                <th>User Name</th>
                                <th>Email</th>
                                {!!props.maxGames && <th>Self Play Games <br />Max Allowed: <span>{props.maxGames}</span></th>}
                                <th>Program</th>
                            </tr>
                        </thead>
                        <tbody>
                            {props.users && props.users.map((_user, idx) => (
                                <tr key={_user.key + idx}>
                                    <td>
                                        {!!props.maxGames && parseInt(_user.self_play_games || 0) >= props.maxGames ?
                                            <span>X</span>
                                            :
                                            <Form.Check onChange={(e) => { checkUser(e, _user) }} checked={!!selectedPlayers[_user.key]} />
                                        }
                                    </td>
                                    <td>{(((props.page || 1) - 1) * props.pageSize) + idx + 1}</td>
                                    <td>{_user.roll_no}</td>
                                    <td>{_user.name}</td>
                                    <td>{_user.email}</td>
                                    {!!props.maxGames && <td>{_user.self_play_games}</td>}
                                    <td>{_user.program}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>;
};

const AddPlayers = (props) => {
    const [selectedPlayers, setSelectedPlayers] = useState({});
    const [userList, setUserList] = useState([]);
    const [npages, setNpages] = useState(1);
    const [page, setPage] = useState(1);

    const paginatorStyle = { margin: '2px', border: '1px solid black', width: '35px', height: '35px', backgroundColor: 'white', fontSize: '0.8rem', color: 'black' };
    const paginatorStyleActive = { ...paginatorStyle, fontWeight: 'bold', border: '2px solid black', backgroundColor: '#eeeeee' };

    useEffect(() => {
        if (!props.gameUsers) {
            return;
        }

        const _gulist = {};
        props.gameUsers.forEach((_gu) => {
            _gulist[_gu.key] = _gu;
        });

        const _ulist = [];
        props.users.forEach((_user) => {
            if (!_gulist[_user.key]) {
                _ulist.push(_user);
            }
        });

        setUserList(_ulist.sort((a, b) => { return a.roll_no - b.roll_no }));

        const _npages = Math.ceil(Object.keys(_ulist).length / props.pageSize);
        setNpages(_npages);
    }, [props.gameUsers]);

    const checkAll = (e) => {
        if (npages > 1) {
            return;
        }
        const { checked } = e.target;
        if (checked) {
            const _users = {};
            userList.forEach((_user) => {
                _users[_user.key] = _user;
            });
            setSelectedPlayers(_users);
        }
        else {
            setSelectedPlayers({});
        }
    };

    const allChecked = () => {
        return Object.keys(selectedPlayers).length == Object.keys(userList).length;
    };

    const checkUser = (e, user) => {
        const { checked } = e.target;
        const _users = { ...selectedPlayers };

        if (checked) {
            _users[user.key] = user;
        }
        else {
            delete _users[user.key];
        }

        setSelectedPlayers(_users);
    };

    const selectPlayers = async () => {
        await props.addMorePlayers(selectedPlayers);
        props.closeAddPlayers();
    };

    return props.showAddPlayers &&
        <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '100%' }}>
            <Card style={{ height: '100%' }}>
                <Card.Header>
                    Add Players - {toCamelCase(props.game.type)}
                    <CloseToolbar closeClicked={props.closeAddPlayers} />
                </Card.Header>
                <Card.Body style={{ overflowY: 'scroll' }}>
                    {userList.length > 0 &&
                        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                            <Button onClick={selectPlayers}>Add Players</Button>
                        </div>
                    }
                    {props.npages > 1 &&
                        <div className="paginator" style={{ textAlign: 'center' }}>
                            {Array.from(Array(npages).keys()).map((idx) => (
                                <button style={(idx + 1) == page ? paginatorStyleActive : paginatorStyle} onClick={() => { setPage(idx + 1) }}>{idx + 1}</button>
                            ))}
                        </div>
                    }
                    {
                        !userList.length ?
                            <Card.Subtitle>No More Players to Add</Card.Subtitle>
                            :
                            <Table>
                                <thead>
                                    <tr>
                                        <th>{npages == 1 && <Form.Check onChange={checkAll} checked={allChecked()} />}</th>
                                        <th>#</th>
                                        <th>Roll No</th>
                                        <th>User Name</th>
                                        <th>Email</th>
                                        {!!props.maxGames && <th>Self Play Games</th>}
                                        <th>Program</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userList && userList.map((_user, idx) => (
                                        <tr key={_user.key + idx}>
                                            {!!props.maxGames && parseInt(_user.self_play_games || 0) >= props.maxGames ?
                                                <span>X</span>
                                                :
                                                <Form.Check onChange={(e) => { checkUser(e, _user) }} checked={!!selectedPlayers[_user.key]} />
                                            }
                                            <td>{((page - 1) * props.pageSize) + idx + 1}</td>
                                            <td>{_user.roll_no}</td>
                                            <td>{_user.name}</td>
                                            <td>{_user.email}</td>
                                            {!!props.maxGames && <td>{_user.self_play_games}</td>}
                                            <td>{_user.program}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                    }
                </Card.Body>
            </Card>
        </div>;
};

const CloseToolbar = (props) => {
    const toolbarStyle = {
        display: 'flex',
        position: 'absolute',
        right: 0,
        top: '-25px',
        textAlign: 'right',
        zIndex: 1
    };

    return (
        <span className='editable_wrapper list_row_toolbar' style={{ position: 'relative', display: 'block' }} >
            <span className="toolbar" style={toolbarStyle}>
                <span className="toolbar_button list_add_button" onClick={props.closeClicked} ><Icon name="close" /></span>
            </span>
        </span>
    );
};
