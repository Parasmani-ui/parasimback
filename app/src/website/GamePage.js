import React from 'react';
import { useState, useEffect } from "react";
import io from 'socket.io-client';
import LoginForm from "../components/LoginForm";
import AssignedGames from "../components/AssignedGames";
import PageWrapper from '../components/PageWrapper';
import { post } from '../components/utils/ServerCall';
import ShowToast from '../components/utils/ShowToast';
import gameConfig from '../gameConfig';

//const socket = io(gameConfig.SOCKET_URL, { cors: true });
const socket = gameConfig.DOMAIN == 'localhost' ? io(gameConfig.SOCKET_URL, { cors: true }) : io(gameConfig.SOCKET_URL);

const GamePage = (props) => {
  const _theme = { fontSize: '0.9rem' };
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState({ ..._theme, ...gameConfig.defaultColors, ...gameConfig.defaultStyles });
  const [images, setImages] = useState(gameConfig.defaultImages);
  const [selectedGame, setSelectedGame] = useState(null);

  //const [timers, setTimers] = useState(null);
  //const [selectedTimeDuration, setSelectedTimeDuration] = useState(null);

  const fetchData = async () => {
    var data = await post('system/get_all_styles', null, null);
    if (data && data.rc) {
      return;
    }
    if (!data) {
      return;
    }
    setTheme({ ...theme, ...data });
    await updateImages();
  };

  const timerChanged = (data, _user, _setDuration) => {
    if (!_user || !_user.games) {
      return;
    }
    if (!_user.games[data.game_key]) {
      return;
    }
    const _game = _user.games[data.game_key];
    if (!_game) {
      return;
    }
    if (!selectedGame) {
      return;
    }
    if (_game.game_key != selectedGame.key) {
      return;
    }
    /*
    _game.timer = data.timer;
    const _timers = timers ? { ...timers } : {};
    _timers[data.game_key] = data.timer;
    setTimers(_timers);
    setUser({ ..._user });
    const timer = getTimer(data.timer);
    */
    ShowToast({
      icon: 'info',
      header: 'Timer Changed',
      message: 'The timer has been changed for this game',
      done: () => { window.location.reload(false); }
    });
  };

  useEffect(() => {
    fetchData();

    const _check = async () => {
      const storedUser = sessionStorage.getItem("user");
      var _user = null;
      if (storedUser) {
        _user = JSON.parse(storedUser);
        if (!_user) {
          sessionStorage.clear();
          setUser(null);
          return;
        }
        const result = await post('guest/validate', null, _user);
        if (result && result.rc) {
          //ShowToast({icon: 'danger', heading: 'Please login again', message: result.rc});
          sessionStorage.clear();
          setUser(null);
          return;
        }
        setUser(_user);
      }  

      const storedGame = sessionStorage.getItem('selected_game');
      var game = null;
      if (storedGame) {
        game = JSON.parse(storedGame);
        setSelectedGame(game);
      }

      socket.on('user_login', (data) => {
        if (!_user) {
          return;
        }
        if (_user.key != data.key) {
          return;
        }

        /*
        if (data.auth_id == _user.auth_id) {
          setUser(_user);
          return;
        }
        */

        if (data.auth_id != _user.auth_id) {
          sessionStorage.removeItem('user');
          setUser(null);
          (async () => {
            //ShowToast({icon: 'danger', heading: 'You have been logged out', message: 'You logged in from another browser/device so you have been logged out from this browser/device'});
          })();
        }
      });

      socket.on('user_logout', (data) => {
        if (!_user) {
          setUser(null);
          return;
        }
        if (_user.key != data.key) {
          return;
        }
        setUser(null);
      });

      socket.on('game_reset', (data) => {
        if (!_user || !_user.games) {
          return;
        }
        if (!_user.games[data]) {
          return;
        }
        /*
        const _timers = timers ? { ...timers } : {};
        delete _timers[data];
        setTimers(_timers);
        */
        delete _user.games[data];
        _user.games = Object.keys(_user.games).length ? _user.games : null;
        setSelectedGame(null);
        setUser({ ..._user });
      });
  
      socket.on('game_started', (data) => {
        if (!_user || !_user.games) {
          return;
        }
        if (!_user.games[data.game_key]) {
          return;
        }
        const game = _user.games[data.game_key];
        if (!game) {
          return;
        }
        game.game_status = 'started';
        /*
        const _timers = timers ? { ...timers } : {};
        _timers[data.game_key] = data.timer;
        setTimers(_timers);
        */
        game.timer = data.timer;
        setUser({ ..._user });
        if (selectedGame && (selectedGame.key == data.game_key)) {
          selectedGame.timer = data.timer;
          setSelectedGame({...selectedGame});
        }  
      });
  
      socket.on('game_finished', (data) => {
        if (!_user || !_user.games) {
          return;
        }
        if (!_user.games[data.game_key]) {
          return;
        }
        const game = _user.games[data.game_key];
        if (!game) {
          return;
        }
        game.game_status = 'finished';
        setUser({ ..._user });
  
        if (selectedGame && selectedGame.key == data.game_key) {
          gotoHome();
        }
  
        const update = async () => {
          const assigned = await post('user/get_assigned_games', _user);
          if (assigned && assigned.rc) {
            return;
          }
          _user.games = assigned;
          setUser({ ..._user });
        };
  
        update();
      });
  
      socket.on('quarter_undo', (data) => {
        if (!_user || !_user.games) {
          return;
        }
  
        if (!_user.games[data.game_key]) {
          return;
        }
  
        setSelectedGame(null);
        const game = _user.games[data.game_key];
        game.quarter_status = 'playing';
        game.game_status = game.type == 'team_play' ? 'paused' : 'started';
        game.current_quarter = data.current_quarter;
        game.started_dt = data.started_dt;
  
        setUser({ ..._user });
      });

      socket.on('game_paused', (data) => {
        if (!_user || !_user.games) {
          return;
        }
  
        if (!_user.games[data.game_key]) {
          return;
        }
  
        const game = _user.games[data.game_key];
        game.quarter_status = 'playing';
        game.game_status = 'paused';
        game.current_quarter = data.current_quarter;
        game.started_dt = data.started_dt;
  
        setUser({ ..._user });
      });
  
      socket.on('quarter_processed', (data) => {
        if (!_user || !_user.games) {
          return;
        }
  
        if (!_user.games[data.game_key]) {
          return;
        }
  
        const game = _user.games[data.game_key];
        game.quarter_status = 'playing';
        game.game_status = 'started';
        game.current_quarter = data.current_quarter;
        game.started_dt = data.started_dt;
  
        setUser({ ..._user });
      });

      socket.on('quarter_reset', (data) => {
        if (!_user || !_user.games) {
          return;
        }
  
        if (!_user.games[data.game_key]) {
          return;
        }
  
        const game = _user.games[data.game_key];
        game.quarter_status = 'playing';
        game.game_status = game.type == 'team_play' ? 'paused' : 'started';
        game.current_quarter = data.current_quarter;
        game.started_dt = null;
  
        setUser({ ..._user });
      });
  
      socket.on('quarter_timeout', (data) => {
        if (!_user || !_user.games) {
          return;
        }
  
        if (!_user.games[data.game_key]) {
          return;
        }
  
        const update = async () => {
          const assigned = await post('user/get_assigned_games', _user);
          if (assigned && assigned.rc) {
            return;
          }
          _user.games = assigned;
          setUser({ ..._user });
        };
  
        setTimeout(() => {
          update();
        }, 1000);
      });
  
      socket.on('game_assigned', (data) => {
        if (!_user || data.users.indexOf(_user.key) == -1) {
          return;
        }
  
        const update = async () => {
          const assigned = await post('user/get_assigned_games', _user);
          if (assigned && assigned.rc) {
            return;
          }
          _user.games = assigned;
          setUser({ ..._user });
        };
  
        update();
      });
    };

    _check();

    return () => {
      socket.off('user_login');
      socket.off('user_logout');
      socket.off('game_reset');
      socket.off('game_started');
      socket.off('game_assigned');
      socket.off('game_paused');
      socket.off('quarter_processed');
      socket.off('quarter_reset');
      socket.off('quarter_undo');
      socket.off('game_finished');
      socket.off('quarter_timeout');
      //socket.off('timer_changed');
    };
  }, []);

  const handleComponentSelect = (_page) => {
    setPageName(_page);
  };

  const setUserData = (data) => {
    const _user = { ...user, ...data };
    setUser(_user);
  };

  const updateTheme = async () => {
    var data = await post('system/get_all_styles', null, null);
    if (data && data.rc) {
      return;
    }
    if (!data) {
      return;
    }
    setTheme({ ...theme, ...data });
  };

  const updateImages = async () => {
    const _images = { ...gameConfig.defaultImages };
    const _imageOverrides = await post('system/get_images', null, null);
    if (_imageOverrides && _imageOverrides.rc) {
      return;
    }
    if (!_imageOverrides) {
      return;
    }
    for (var prop in _imageOverrides) {
      _images[prop] = _imageOverrides[prop];
    }
    setImages(_images);
  };

  const handleLogin = async (user) => {
    setUser(user);
    const _user = user;
    const game = selectedGame;

    socket.on('user_login', (data) => {
      if (!_user) {
        return;
      }

      if (_user.key != data.key) {
        setUser(_user);
        return;
      }

      /*
      if (data.auth_id == _user.auth_id) {
        return;
      }
      */

      if (data.auth_id != _user.auth_id) {
        sessionStorage.removeItem('user');
        setUser(null);
        (async () => {
          //ShowToast({icon: 'danger', heading: 'You have been logged out', message: 'You logged in from another browser/device so you have been logged out from this browser/device'});
        })();
    }
    });

    socket.on('user_logout', (data) => {
      if (!_user) {
        setUser(null);
        return;
      }

      if (_user.key != data.key) {
        return;
      }
      setUser(null);
    });

    socket.on('game_reset', (data) => {
      if (!_user || !_user.games) {
        return;
      }
      if (!_user.games[data]) {
        return;
      }
      /*
      const _timers = timers ? { ...timers } : {};
      delete _timers[data];
      setTimers(_timers);
      */
      delete _user.games[data];
      _user.games = Object.keys(_user.games).length ? _user.games : null;
      setSelectedGame(null);
      setUser({ ..._user });
    });

    socket.on('game_started', (data) => {
      if (!_user || !_user.games) {
        return;
      }
      if (!_user.games[data.game_key]) {
        return;
      }

      const game = _user.games[data.game_key];
      if (!game) {
        return;
      }
      game.game_status = 'started';
      /*
      const _timers = timers ? { ...timers } : {};
      _timers[data.game_key] = data.timer;
      setTimers(_timers);
      */
      game.timer = data.timer;
      setUser({ ..._user });
      if (selectedGame && (selectedGame.key == data.game_key)) {
        //setSelectedTimeDuration(data.timer);
        selectedGame.timer = data.timer;
        setSelectedGame({...selectedGame});
      }  
    });

    socket.on('quarter_undo', (data) => {
      if (!_user || !_user.games) {
        return;
      }

      if (!_user.games[data.game_key]) {
        return;
      }

      setSelectedGame(null);
      const game = _user.games[data.game_key];
      game.quarter_status = 'playing';
      game.game_status = game.type == 'team_play' ? 'paused' : 'started';
      game.current_quarter = data.current_quarter;
      game.started_dt = data.started_dt;

      setUser({ ..._user });
    });

    socket.on('game_paused', (data) => {
      if (!_user || !_user.games) {
        return;
      }

      if (!_user.games[data.game_key]) {
        return;
      }

      const game = _user.games[data.game_key];
      game.quarter_status = 'playing';
      game.game_status = 'paused';
      game.current_quarter = data.current_quarter;
      game.started_dt = data.started_dt;

      setUser({ ..._user });
    });

    socket.on('quarter_processed', (data) => {
      if (!_user || !_user.games) {
        return;
      }

      if (!_user.games[data.game_key]) {
        return;
      }

      const game = _user.games[data.game_key];
      if (!game) {
        return;
      }
      game.quarter_status = 'playing';
      game.game_status = 'started';
      game.current_quarter = data.current_quarter;
      game.started_dt = data.started_dt;

      setUser({ ..._user });
    });

    socket.on('quarter_reset', (data) => {
      if (!_user || !_user.games) {
        return;
      }

      if (!_user.games[data.game_key]) {
        return;
      }

      const game = _user.games[data.game_key];
      if (!game) {
        return;
      }
      game.quarter_status = 'playing';
      game.game_status = game.type == 'team_play' ? 'paused' : 'started';
      game.current_quarter = data.current_quarter;
      game.started_dt = null;

      setUser({ ..._user });
    });

    socket.on('quarter_timeout', (data) => {
      if (!_user || !_user.games) {
        return;
      }

      if (!_user.games[data.game_key]) {
        return;
      }

      const update = async () => {
        const assigned = await post('user/get_assigned_games', _user);
        if (assigned && assigned.rc) {
          return;
        }
        _user.games = assigned;
        setUser({ ..._user });
      };

      setTimeout(() => {
        update();
      }, 1000);
  });

    socket.on('game_assigned', (data) => {
      if (!_user || data.users.indexOf(_user.key) == -1) {
        return;
      }

      const update = async () => {
        const assigned = await post('user/get_assigned_games', _user);
        if (assigned && assigned.rc) {
          return;
        }
        _user.games = assigned;
        setUser({ ..._user });
      };

      update();
    });

    socket.on('game_finished', (data) => {
      if (!_user || !_user.games) {
        return;
      }
      if (!_user.games[data.game_key]) {
        return;
      }
      const game = _user.games[data.game_key];
      if (!game) {
        return;
      }
      game.game_status = 'finished';
      setUser({ ..._user });

      if (selectedGame && selectedGame.key == data.game_key) {
        gotoHome();
      }

      const update = async () => {
        const assigned = await post('user/get_assigned_games', _user);
        if (assigned && assigned.rc) {
          return;
        }
        _user.games = assigned;
        setUser({ ..._user });
      };

      update();
    });
  };

  useEffect(() => {
    sessionStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    sessionStorage.setItem('selected_game', JSON.stringify(selectedGame));
    //setSelectedTimeDuration(getTimer());
    /*
    if (selectedGame) {
      socket.on('timer_changed', (data) => {
        timerChanged(data, user, setSelectedTimeDuration);
      });  
    }
    else
    {
      socket.off('timer_changed');
    }
    */
  }, [selectedGame]);

  const handleLogout = async () => {
    await post('auth/logout', props.user);
    sessionStorage.clear();
    setSelectedGame(null);
    setUser(null);
    //setTimers(null);
    socket.off('user_login');
    socket.off('user_logout');
    socket.off('game_reset');
    socket.off('game_started');
    socket.off('game_assigned');
    socket.off('game_paused');
    socket.off('quarter_processed');
    socket.off('quarter_reset');
    socket.off('quarter_undo');
    socket.off('quarter_submitted');
    socket.off('game_finished');
    socket.off('quarter_timeout');
    socket.off('self_play_finished');
    socket.off('timer_changed');
    socket.off('assessment_finished');
  };

  const gotoGame = async (gameKey) => {
    const game = await post('user/get_game_data', user, { game_key: gameKey });
    if (game && game.rc) {
      return;
    }
    if (!game) {
      return;
    }

    setSelectedGame(game);
  };

  const gotoHome = () => {
    setSelectedGame(null);
  };

  const setGame = (game) => {
    setSelectedGame(game);
    const _games = user.games;
    for (var prop in _games) {
      if (prop != game.key) {
        continue;
      }
      _games[prop].type = game.type;
      _games[prop].case_study_key = game.case_study_key;
      _games[prop].game_status = game.game_state.game_status;
      _games[prop].assigned = game.assigned;
    }
    setUser({ ...user });
  };

  const quarterSubmitted = (data) => {
    if (user.games[data.game_key]) {
      user.games[data.game_key].quarter_status = 'submitted';
      setUser({ ...user });
    }
  };

  const gameFinished = () => {
    setSelectedGame(null);
    const update = async () => {
      const assigned = await post('user/get_assigned_games', user);
      if (assigned && assigned.rc) {
        return;
      }
      user.games = assigned;
      setUser({ ...user });
    };

    update();
  };

  const assessmentSubmitted = (data) => {
    if (data.user_key != user.key) {
      return;
    }
    setSelectedGame(null);
    const _games = user.games;

    _games[data.game_state.game_key].current_quarter = data.game_state.current_quarter;
    _games[data.game_state.game_key].game_status = data.game_state.game_status;
    _games[data.game_state.game_key].quarter_status = data.game_state.quarter_status;

    setUser({ ...user });
  };

  const getTimer = (_timer, _game) => {
    const game = _game || selectedGame;

    if (!_timer && !game) {
      return null;
    }

    if (game.game_status == 'finished') {
      return null;
    }

    const type = game.type;
    if (type == 'self_play') {
      return null;
    }

    const gameStartDate = new Date(game.started_dt || game.game_state.started_dt);
    const currentDate = new Date();
    const timerValue = _timer || game.timer;
    var [timerHours, timerMinutes, timerSeconds] = timerValue ? timerValue.split(':') : [0, 0, 0];

    const timerMilliseconds = (parseInt(timerHours || 0) * 60 * 60 + parseInt(timerMinutes || 0) * 60 + parseInt(timerSeconds || 0)) * 1000;
    const elapsedTimeMilliseconds = currentDate.getTime() - gameStartDate.getTime();
    const remainingTimeMilliseconds = Math.max(timerMilliseconds - elapsedTimeMilliseconds, 0);

    const remainingHours = Math.floor(remainingTimeMilliseconds / 3600000).toString().padStart(2, '0');
    const remainingMinutes = Math.floor((remainingTimeMilliseconds % 3600000) / 60000).toString().padStart(2, '0');
    const remainingSeconds = Math.floor((remainingTimeMilliseconds % 60000) / 1000).toString().padStart(2, '0');
    const remainingTime = `${remainingHours}:${remainingMinutes}:${remainingSeconds}`;

    return remainingTime;
  };

  const updateTimer = (data) => {
    /*
    const _timers = timers ? { ...timers } : {};
    _timers[data.game_key] = data.timer;
    setTimers(_timers);
    */

    const _user = {...user};
    if (_user.games && _user.games[data.game_key]) {
      _user.games[data.game_key].timer = data.timer;
      setUser(_user);
    }
    if (selectedGame && (selectedGame.key == data.game_key)) {
      //setSelectedTimeDuration(data.timer);
      selectedGame.timer = data.timer;
      setSelectedGame({...selectedGame});
    }
  };

  let view;

  if (!user || !user.role) {
    view = <div style={theme} >
      <LoginForm backgroundImage={(images ? gameConfig.getImagePath(images['login_page_background']) : '')} handleLogin={handleLogin} />
    </div>;
  } else if (user && !selectedGame && user.role == 'user') {
    view = 
    <div style={theme} >
      <AssignedGames
        handleLogout={handleLogout}
        user={user}
        images={images}
        gotoGame={gotoGame}
      />
    </div>;
  } else {
    view = <div style={theme}>
      <PageWrapper
        handleLogout={handleLogout}
        user={user}
        setGame={setGame}
        selectedGame={selectedGame}
        updateTheme={updateTheme}
        images={images}
        updateImages={updateImages}
        setUserData={setUserData}
        socket={socket}
        gotoHome={gotoHome}
        quarterSubmitted={quarterSubmitted}
        updateTimer={updateTimer}
        gameFinished={gameFinished}
        assessmentSubmitted={assessmentSubmitted}
        {...props}
      />
    </div>;
  }

  return view;
};

export default GamePage;
