import React from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Icon from './Icon.js';
import CountdownTimerHeader from './utils/CountdownTimerHeader';
import gameConfig from '../gameConfig.js';

const Header = (props) => {
  const handleLogoutClick = () => {
    props.handleLogout();
  };

  const game = props.selectedGame;
  var remainingTime = 0;
  if (game) {
    const gameStartDate = new Date(game.started_dt);
    const currentDate = new Date();
    var [timerHours, timerMinutes, timerSeconds] = game.timer ? game.timer.split(':') : [0, 0, 0];

    const timerMilliseconds = (parseInt(timerHours || 0) * 60 * 60 + parseInt(timerMinutes || 0) * 60 + parseInt(timerSeconds || 0)) * 1000;
    const elapsedTimeMilliseconds = currentDate.getTime() - gameStartDate.getTime();
    remainingTime = Math.max(timerMilliseconds - elapsedTimeMilliseconds, 0);
  }

  const showTimer =
    props.mode != 'edit' &&
    game &&
    (game.type == 'team_play' || game.type == 'assessment') &&
    game.timer &&
    game.game_status == 'started' &&
    game.quarter_status != 'finished' && game.quarter_status != 'timeout' &&
    remainingTime;

  const label = props.currentQuarter && props.quarterLabels ? props.quarterLabels[props.currentQuarter] : '';

  return (
    <Row style={{height: '60px', paddingLeft: '60px', fontSize: '0.9em'}}>
      {!!showTimer &&
      <Col className="nav_col">
          <Row style={{ height: '100%' }}>
            <Col md={2} className="align_center">{props.selectedGame && <Icon name="timer" />}</Col>
            <Col className="header_label">
              <CountdownTimerHeader
                gameFinished={props.gameFinished}
                socket={props.socket}
                updateTimer={props.updateTimer}
                selectedGame={props.selectedGame}
              />
            </Col>
          </Row>
      </Col>
      }
      <Col className="nav_col">
      {!!props.currentQuarter && props.quarterLabels &&
          <Row style={{ height: '100%' }}>
            <Col md={2} className="align_center"><Icon name="quarter" /></Col>
            <Col className="header_label">{label}</Col>
          </Row>
      }
      </Col>
      <Col className="nav_col">
      {props.user.institute &&
          <Row style={{ height: '100%' }}>
            <Col md={5} className="align_center" style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <img style={{maxHeight: '100%', height: 'auto', width: '100%'}} src={gameConfig.GET_URL + '/' + props.user.institute.logo} alt="" />
            </Col>
            <Col className="header_label">{props.user.institute.name}</Col>
          </Row>
      }
      </Col>
      <Col className="nav_col" style={{ cursor: 'default' }}>
      {game && game.type == 'team_play' && 
        <Col className="nav_col">
          <Row style={{ height: '100%' }}>
            <Col md={2} className="align_center"><Icon name="team" /></Col>
            <Col className="header_label">
              {game.game_data.team}
            </Col>
          </Row>
          </Col>
      }
      </Col>
      <Col className="nav_col" style={{ cursor: 'default' }}>
        <Row style={{ height: '100%' }}>
          <Col md={1} className="align_center"><Icon name="user" /></Col>
          <Col className="header_label">{props.user.name}</Col>
        </Row>
      </Col>
      <Col className="nav_col" onClick={() => handleLogoutClick()} style={{ cursor: 'pointer' }}>
        <Row style={{ height: '100%' }}>
          <Col md={1} className="align_center"><Icon name="logout" /></Col>
          <Col className="header_label">Logout</Col>
        </Row>
      </Col>
    </Row>
  );
};

export default Header;
