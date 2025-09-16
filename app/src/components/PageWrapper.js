import React from 'react';
import { useState, useEffect, useRef } from "react";
import Spinner from 'react-bootstrap/Spinner';
import { post } from './utils/ServerCall';
import Sidebar from "./Sidebar";
import Header from "./Header";
import ContentPane from "./ContentPane";
import Footer from "./Footer";
import { serverHooks, _functions, formats } from '../context/hooks';
import gameConfig from '../gameConfig';
import ShowToast from './utils/ShowToast';

function PageWrapper(props) {
  const currentQuarter = props.user.role == 'user' ? props.selectedGame.game_data.current_quarter : 0;
  const [allQuartersData, setAllQuartersData] = useState(props.user.role == 'user' ? props.selectedGame.game_data.data : null);
  const [caseStudy, setCaseStudy] = useState(props.user.role == 'user' ? props.selectedGame.case_study : null);
  const [gameData, setGameData] = useState(props.user.role == 'user' ? props.selectedGame.game_data.data[props.selectedGame.game_data.current_quarter] : null);
  const [gameState, setGameState] = useState(props.user.role == 'user' ? props.selectedGame.game_state : null);
  const [readOnly, setReadOnly] = useState(props.user.role == 'user' ? (props.selectedGame.game_data.quarter_status == 'submitted' || props.selectedGame.game_data.quarter_status == 'timeout' || props.selectedGame.game_state.game_status == 'finished') : false);
  const [pageName, setPageName] = useState('');
  const [className, setClassName] = useState('');
  const [sidebarClass, setSidebarClass] = useState('');
  const [teams, setTeams] = useState([]);
  //const sidebar = useRef();

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top of the page when the component is mounted
  }, [pageName]);

  useEffect(() => {
    init();
    var _selected = sessionStorage.getItem("selected_page");
    _selected = _selected == 'null' || !_selected ? '' : _selected;

    if (_selected) {
      setPageName(_selected);
    }
    else {
      props.user && setPageName(gameConfig.defaultPage[props.user.role]);
    }

    var _class = sessionStorage.getItem('sidebar_class');
    if (!_class) {
      setSidebarClass('initial');
    }
    else
    {
      setSidebarClass(_class || '');
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('selected_page', pageName);
    setClassName("app_page " + pageName);
  }, [pageName]);

  const changePage = (_pageName) => {
    setPageName(_pageName);
  };

  const fetchGameData = async () => {
    if (!props.selectedGame || !props.selectedGame.key) {
      return;
    }
    const game = await post('user/get_game_data', props.user, { game_key: props.selectedGame.key });
    if (game && game.rc) {
      return;
    }

    if (!game) {
      return;
    }

    setReadOnly(game.game_data.quarter_status == 'submitted' || game.game_data.quarter_status == 'timeout' || game.game_state.game_status == 'finished');
    setAllQuartersData(game.game_data.data);
    setGameData(game.game_data.data[game.game_data.current_quarter]);
    setGameState(game.game_state);

    var teams = [];
    if (game.useMarkets) {
      const market = game.game_state.teams[game.game_data.team].market;
      for (var prop in game.game_state.teams) {
        if (game.game_state.teams[prop].market == market) {
          teams.push(game.game_state.teams[prop]);
        }
      }  
    }
    else
    {
      teams = Object.values(game.game_state.teams);
    }

    setTeams(teams);

    props.setGame(game);
  };

  const init = async () => {
    if (props.user.role == 'superadmin') {
      const caseStudyKey = sessionStorage.getItem('selected_case_study_key');
      if (caseStudyKey) {
        const _caseStudy = await post('admin/get_case_study', props.user, { key: caseStudyKey });
        if (_caseStudy && _caseStudy.rc) {
          setCaseStudy(null);
          return;
        }
        if (!_caseStudy) {
          setCaseStudy(null);
          return;
        }
        setCaseStudy(_caseStudy);  
      }
      else
      {
        setCaseStudy(null);
      }
      return;
    }
    else {
      await fetchGameData();
    }
  };

  const updateGameData = async (data) => {
    const response = await post('user/update_game_data', props.user, { quarter: currentQuarter, game_key: props.selectedGame.key, game_data: data });
    if (response && response.rc) {
      ShowToast({ icon: 'danger', message: response.rc });
      return;
    }
    await init();
  };

  const sideBarChanged = () => {
    //window.location.reload(false);
  };

  useEffect(() => {
    sessionStorage.setItem('sidebar_class', sidebarClass);
  }, [sidebarClass])

  const toggleSidebar = () => {
    if (sidebarClass == 'hide_sidebar') {
      setSidebarClass('show_sidebar');
      return;
    }

    if (sidebarClass == 'show_sidebar') {
      setSidebarClass('hide_sidebar');
      return;
    }

    if (sidebarClass == 'initial') {
      if (window.innerWidth <= 750) {
        setSidebarClass('show_sidebar');
      }
      else
      {
        setSidebarClass('hide_sidebar');
      }
    }
  };

  const updateData = async () => {
    await init();
  };

  return (
    <div style={{ position: 'relative' }}>
      <div className={className} style={{backgroundColor: 'white'}}>
        <div className={'sidebar ' + sidebarClass}>
          <Sidebar
            changePage={changePage}
            user={props.user}
            handleLogout={props.handleLogout}
            sideBarChanged={sideBarChanged}
            toggleSidebar={toggleSidebar}
            active={pageName}
            images={props.images}
            setDataLoading={props.setDataLoading}
            gotoHome={props.gotoHome}
          />
        </div>

        <div className="rightpanel">
          <div className="header">
            <Header
              user={props.user}
              currentQuarter={currentQuarter}
              quarterLabels={caseStudy ? caseStudy.quarters.labels : {}}
              handleLogout={props.handleLogout}
              gameFinished={props.gameFinished}
              setDataLoading={props.setDataLoading}
              socket={props.socket}
              selectedGame={props.selectedGame}
              updateTimer={props.updateTimer}
            />
          </div>
          {pageName || props.user.role == 'admin' || props.user.role == 'superadmin' ?
            <ContentPane
              game={props.selectedGame}
              teams={teams}
              caseStudy={caseStudy}
              gameData={gameData}
              gameState={gameState}
              allQuartersData={allQuartersData}
              currentQuarter={currentQuarter}
              teamName={props.selectedGame && props.selectedGame.game_data ? props.selectedGame.game_data.team : null}
              updateGameData={updateGameData}
              updateData={updateData}
              readOnly={readOnly}
              setReadOnly={setReadOnly}
              pageName={pageName}
              changePage={changePage}
              {...props}
            /> :
            <Spinner animation="border" />
          }
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PageWrapper;
