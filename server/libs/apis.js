var fs = require('fs');
const _uuid = require('uuid');
const crypt = require('./crypt');
const security = require('./security');
const _data_folder = '../data/';
const _case_studies_folder = '../public/case_studies/';
const _caseStudyTemplate = 'case_study_template.json';

const logFileName = () => {
    const now = new Date();
    return './logs/log-' + now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + '.log'
};

const minScale = 0;
const maxScale = 100;

const uuid = () => {
    const now = new Date();
    return _uuid.v4() + '-' + Date.now() + '-' + Math.round(Math.random() * 10000);
};

const randomColor = () => {
    // Generate random values for red, green, and blue (RGB) components
    const r = Math.floor(Math.random() * 128 + 128);
    const g = Math.floor(Math.random() * 128 + 128);
    const b = Math.floor(Math.random() * 128 + 128);

    // Construct the color string in the format #RRGGBB
    const color = `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;

    return color;
};

//const _gameData = require('./edit_mode_dummy_game_data');

function _updateDB(db) {
    //_init(db);
}

function _init(db) {
    var coll, selector;

    //coll = db.collection('case_studies');
    //coll = db.collection('game_data');
    const institutes = db.collection('institutes');
    const users = db.collection('users');

    (async () => {
        const list = await institutes.find({ }, { projection: { _id: 0 } }).toArray();
        list.forEach(async (inst) => {
            const licenses = inst.licenses;
            var current = null;
            for (var i = 0; i < licenses.length; i++) {
                if (licenses[i].status == 'deleted') {
                    continue;
                }

                if (new Date(licenses[i].start_date) <= new Date()) {
                    current = licenses[i];
                    break;
                }
            }
            if (!current) {
                return;
            }

            await users.updateMany({institute_key: inst.key}, { $set: {licenses: [current.key]} });
        });
    })();

    /*
    const allQuartersData = {
        '0': _gameData,
        '1': _gameData,
        '2': _gameData
    };
    */    
}

class CustomException extends Error {
    constructor(message) {
        super(message);
        this.name = 'CustomException';
    }
}

const trace = (_trace, name, arg) => {
    if (_trace) {
        //const line = (new Error()).stack[1];
        console.info(name, ':', typeof arg, ':', arg);
    }
    fs.appendFileSync(logFileName(), name + ':' + JSON.stringify(arg) + '\n');
};

const info = (_trace, text, color) => {
    if (_trace) {
        const textColorYellow = color || "\x1b[33m"; // Yellow color
        const textColorReset = "\x1b[0m";   // Reset color to default
        const coloredMessage = textColorYellow + '\n==>> ' + text + ' <<==\n' + textColorReset;
        console.info(coloredMessage);
    }
    fs.appendFileSync(logFileName(), text + '\n');
};

const isNaN = (value) => {

};

const getUserGames = async (db, userKey) => {
    const cscoll = db.collection('case_studies');
    const gdcoll = db.collection('game_data');
    const gscoll = db.collection('game_state');
    const gcoll = db.collection('games');

    const games = await gcoll.find({ users: userKey }, { projection: { _id: 0 } }).toArray();
    const userGames = {};

    for (var i = 0; i < games.length; i++) {
        const game = games[i];
        const caseStudy = await cscoll.findOne({ key: game.case_study_key }, { projection: { _id: 0 } });
        if (!caseStudy) {
            console.error('case study not found: ' + game.case_study_key + ' for game ' + game.key);
            continue;
        }

        game.case_study_key = caseStudy.key;
        game.case_study_name = caseStudy.name;
        game.quarter_labels = caseStudy.quarters.labels;
        const gameState = await gscoll.findOne({ users: userKey, game_key: game.key }, { projection: { _id: 0 } });
        if (!gameState) {
            continue;
        }

        const gameData = await gdcoll.findOne({ users: userKey, game_key: game.key }, { projection: { _id: 0 } });
        if (!gameData) {
            continue;
        }

        game.current_quarter = gameData.current_quarter;
        game.game_status = gameData.game_status;
        game.quarter_status = gameData.quarter_status || 'not started';
        userGames[game.key] = game;
    }

    return userGames;
};

const apis = {
    'validate': async (txn, db, input) => {
        return security.validate(txn, db, input);
    },

    '/auth/login': async (txn, db, socket, input) => {
        _updateDB(db); // needed in case there is an update required to db
        const users = db.collection('users');
        const _user = await users.findOne({ email: input.data.email }, { projection: { _id: 0 } });
        if (!_user) {
            return ({ rc: '[' + txn + ']: Invalid email or password' });
        }

        if (!_user.password && _user.role == 'user') {
            _user.password = crypt.hash(input.data.password);
            await users.updateOne({ email: input.data.email }, { $set: { password: _user.password } });
        }

        const match = crypt.compare(input.data.password, _user.password);
        if (!match) {
            return ({ rc: '[' + txn + ']: Invalid email or password' });
        }

        _user.auth_id = uuid();
        _user.auth = security.token(_user);
        await users.updateOne({ email: input.data.email }, { $set: { auth: _user.auth, auth_id: _user.auth_id } });

        const coll = db.collection('institutes');
        _user.institute = await coll.findOne({ key: _user.institute_key }, { projection: { _id: 0 } });

        _user.games = await getUserGames(db, _user.key);

        delete _user._id;
        delete _user.password;
        await socket.emit('user_login', { key: _user.key, auth_id: _user.auth_id });
        return ({ rc: 'success', data: _user });
    },

    '/guest/validate': async (txn, db, socket, input) => {
        const ucoll = db.collection('users');
        const user = input.data;
        if (!user) {
            return ({ rc: 'not-logged-in' });
        }

        if (!user.key) {
            return ({ rc: 'invalid user record' });
        }

        const auth = await ucoll.findOne({ key: user.key }, { projection: { auth: 1 } });
        if (auth.auth != user.auth) {
            return ({ rc: 'old login data' });
        }

        return ({ rc: 'success' });
    },

    '/auth/logout': async (txn, db, socket, input) => {
        if (!input.user) {
            return ({ rc: 'success' });
        }
        await socket.emit('user_logout', { key: input.user.key });
        return ({ rc: 'success' });
    },

    '/guest/national_leaderboard': async (txn, db, socket, input) => {
        const gdcoll = db.collection('game_data');
        const ucoll = db.collection('users');
        const gcoll = db.collection('games');
        const icoll = db.collection('institutes');
        const cscoll = db.collection('case_studies');

        const page = parseInt(input.data.page || 1);
        const selector = { type: 'self_play', game_status: 'finished', users: { $ne: [] } };
        const count = await gdcoll.countDocuments(selector);
        const npages = Math.ceil(count / input.data.page_size);
        const options = { skip: (page - 1) * input.data.page_size, limit: input.data.page_size, sort: { "score": -1, "profit": -1, "revenue": -1, "marketShare": -1, "unitsSold": -1 } };
        const list = await gdcoll.find(selector, options, { projection: { _id: 0 } }).toArray();
        const recs = [];
        for (var i = 0; i < list.length; i++) {
            const gd = list[i];
            const ukey = gd.users[0];
            const user = await ucoll.findOne({ key: ukey });
            const game_key = gd.game_key;
            const game = await gcoll.findOne({ key: game_key });
            const ikey = game.institute;
            const institute = await icoll.findOne({ key: ikey });
            const cskey = game.case_study_key;
            const caseStudy = await cscoll.findOne({ key: cskey });

            const data = gd.data[Object.keys(gd.data).length - 1];
            const financials = data.financials;

            const _rec = {
                name: user.name,
                rank: (page - 1) * input.data.page_size + i + 1,
                institute: institute.name,
                state: institute.state,
                case_study: caseStudy.name,
                qtrs: game.no_of_qtrs,
                score: gd.score,
                revenue: financials.revenue,
                profit: financials.profit,
                unitsSold: financials.unitsSold,
                marketShare: financials.marketShare
            };
            recs.push(_rec);
        }

        return ({ rc: 'success', data: { recs: recs, npages: npages } });
    },

    '/user/state_leaderboard': async (txn, db, socket, input) => {
        const gdcoll = db.collection('game_data');
        const ucoll = db.collection('users');
        const gcoll = db.collection('games');
        const icoll = db.collection('institutes');
        const cscoll = db.collection('case_studies');

        if (!input.user.institute_key) {
            return { rc: 'success', data: { state: null, recs: [], npages: 0 } };
        }

        const _institute = await icoll.findOne({ key: input.user.institute_key });
        const _instList = await icoll.find({ state: _institute.state }).toArray();

        const keys = _instList.map((a) => { return a.key });

        const page = parseInt(input.data.page || 1);

        const selector = { type: 'self_play', institute: { $in: keys }, game_status: 'finished', users: { $exists: true, $ne: [] } };
        const count = await gdcoll.countDocuments(selector);
        const npages = Math.ceil(count / input.data.page_size);
        const options = { skip: (page - 1) * input.data.page_size, limit: input.data.page_size, sort: { "score": -1, "profit": -1, "revenue": -1, "marketShare": -1 } };
        const list = await gdcoll.find(selector, options, { projection: { _id: 0 } }).toArray();

        const recs = [];
        for (var i = 0; i < list.length; i++) {
            const gd = list[i];
            const ukey = gd.users[0];
            const user = await ucoll.findOne({ key: ukey });
            const game_key = gd.game_key;
            const game = await gcoll.findOne({ key: game_key });
            const ikey = game.institute;
            const institute = await icoll.findOne({ key: ikey });
            const cskey = game.case_study_key;
            const caseStudy = await cscoll.findOne({ key: cskey });

            const data = gd.data[Object.keys(gd.data).length - 1];
            const financials = data.financials;

            const _rec = {
                name: user.name,
                rank: (page - 1) * input.data.page_size + i + 1,
                institute: institute.name,
                state: institute.state,
                case_study: caseStudy.name,
                qtrs: game.no_of_qtrs,
                score: gd.score,
                revenue: financials.revenue,
                profit: financials.profit,
                unitsSold: financials.unitsSold,
                marketShare: financials.marketShare
            };
            recs.push(_rec);
        }

        return ({ rc: 'success', data: { state: _institute.state, recs: recs, npages: npages } });
    },

    '/user/institute_leaderboard': async (txn, db, socket, input) => {
        const gdcoll = db.collection('game_data');
        const ucoll = db.collection('users');
        const gcoll = db.collection('games');
        const icoll = db.collection('institutes');
        const cscoll = db.collection('case_studies');

        if (!input.user.institute_key) {
            return { rc: 'success', data: { institute: null, recs: [], npages: 0 } };
        }

        const institute = await icoll.findOne({ key: input.user.institute_key });

        const page = parseInt(input.data.page || 1);
        const selector = { type: 'self_play', game_status: 'finished', institute: input.user.institute_key, users: { $exists: true, $ne: [] } };
        const count = await gdcoll.countDocuments(selector);
        const npages = Math.ceil(count / input.data.page_size);
        const options = { skip: (page - 1) * input.data.page_size, limit: input.data.page_size, sort: { "scores.score": -1, "financials.profit": -1, "fianancials.revenue": -1, "financials.marketShare": -1 } };
        const list = await gdcoll.find(selector, options, { projection: { _id: 0 } }).toArray();

        const recs = [];
        for (var i = 0; i < list.length; i++) {
            const gd = list[i];
            const ukey = gd.users[0];
            const user = await ucoll.findOne({ key: ukey });
            const game_key = gd.game_key;
            const game = await gcoll.findOne({ key: game_key });
            const ikey = game.institute;
            const institute = await icoll.findOne({ key: ikey });
            const cskey = game.case_study_key;
            const caseStudy = await cscoll.findOne({ key: cskey });

            const data = gd.data[Object.keys(gd.data).length - 1];
            const financials = data.financials;

            const _rec = {
                name: user.name,
                rank: (page - 1) * input.data.page_size + i + 1,
                institute: institute.name,
                state: institute.state,
                case_study: caseStudy.name,
                qtrs: game.no_of_qtrs,
                score: gd.score,
                revenue: financials.revenue,
                profit: financials.profit,
                unitsSold: financials.unitsSold,
                marketShare: financials.marketShare
            };
            recs.push(_rec);
        }

        return ({ rc: 'success', data: { institute: institute.name, recs: recs, npages: npages } });
    },

    '/user/get_game_data': async (txn, db, socket, input) => {
        const user = input.user;
        const gameKey = input.data.game_key;

        const cscoll = db.collection('case_studies');
        const gcoll = db.collection('games');
        const gscoll = db.collection('game_state');
        const gdcoll = db.collection('game_data');

        const game = await gcoll.findOne({ key: gameKey }, { projection: { _id: 0 } });
        game.case_study = await cscoll.findOne({ key: game.case_study_key }, { projection: { _id: 0 } });
        game.game_state = await gscoll.findOne({ users: user.key, game_key: gameKey }, { projection: { _id: 0 } });
        game.game_data = await gdcoll.findOne({ users: user.key, game_key: gameKey }, { projection: { _id: 0 } });

        return ({ rc: 'success', data: game });
    },

    '/website/site_data': async (txn, db, socket, input) => {
        const coll = db.collection('website');
        const output = await coll.find({}, { projection: { _id: 0 } }).toArray();
        return ({ rc: 'success', data: output });
    },

    '/sadmin/save_website_data': async (txn, db, socket, input) => {
        $set = {};
        $set[input.data.save_key] = input.data.value;
        const filters = { arrayFilters: input.data.filters } || {};
        filters.upsert = true;

        const coll = db.collection('website');
        await coll.updateOne({ key: input.data.obj_key }, { $set: $set }, filters);

        return ({ rc: 'success' });
    },

    '/admin/games_list': async (txn, db, socket, input) => {
        const user = input.user;
        const role = input.user.role;
        const pageNumber = parseInt(input.data.pageNumber || 0);
        const pageSize = parseInt(input.data.pageSize || 0);

        const coll = db.collection('games');
        const data = await coll.find({ institute: input.data.key }, { projection: { _id: 0 } }, pageSize ? { skip: (pageNumber - 1) * pageSize, limit: pageSize, sort: { created: -1 } } : { sort: { created: -1 } }).toArray();
        const count = await coll.countDocuments({ institute: input.data.key });

        return ({ rc: 'success', data: { pageCount: Math.ceil(count / pageSize), pageData: data } });
    },

    '/admin/new_game': async (txn, db, socket, input) => {
        const user = input.user;
        const role = input.user.role;

        const coll = db.collection('games');
        const count = await coll.countDocuments({ institute: input.data.institute_key, name: input.data.name });
        if (count) {
            return ({ rc: 'A game with the name ' + input.data.name + ' already exists.' });
        }

        const result = await apis['/admin/academic_years_list']('/admin/academic_years_list', db, socket, input);
        if (result.rc != 'success') {
            return (result);
        }

        const icoll = db.collection('users');
        const institute = icoll.findOne({ key: input.data.institute_key });

        await coll.insertOne({
            key: uuid(),
            name: input.data.name,
            institute: input.data.institute_key,
            state: institute.state,
            academic_year: result.data[0],
            game_status: 'created',
            created: new Date()
        });

        const games = await coll.find({ institute: input.data.institute_key }, { projection: { _id: 0 } }, { sort: { created: -1 } }).toArray();

        return ({ rc: 'success', data: games });
    },

    '/admin/reset_game': async (txn, db, socket, input) => {
        const coll = db.collection('games');
        const ucoll = db.collection('users');

        var game = await coll.findOne({ key: input.data.key }, { projection: { _id: 0 } });

        if (game.game_status == 'finished') {
            return ({ rc: 'Cannot reset finished game' });
        }

        await coll.updateOne({ key: input.data.key }, { $set: { game_status: 'created' } });

        const gdcoll = db.collection('game_data');
        const gscoll = db.collection('game_state');

        await gdcoll.deleteMany({ game_key: input.data.key });
        await gscoll.deleteMany({ game_key: input.data.key });

        game = await coll.findOne({ key: input.data.key }, { projection: { _id: 0 } });

        if (game.type == 'self_play') {
            for (var i = 0; i < game.users.length; i++) {
                const user = await ucoll.findOne({ key: game.users[i] });
                const ngames = parseInt(user.self_play_games || 0);
                var value = ngames - 1 < 0 ? 0 : ngames - 1;
                await ucoll.updateOne({ key: user.key }, { $set: { self_play_games: value } });
            }
        }

        await socket.emit('game_reset', input.data.key);
        await socket.emit('game_reload', { game_key: input.data.key });
        return ({ rc: 'success', data: game });
    },

    '/sadmin/delete_game': async (txn, db, socket, input) => {
        const gcoll = db.collection('games');
        const gdcoll = db.collection('game_data');
        const gscoll = db.collection('game_state');
        const ucoll = db.collection('users');

        const game = await gcoll.findOne({ key: input.data.key }, { projection: { _id: 0 } });

        if (game.type == 'self_play') {
            if (game.users) {
                for (var i = 0; i < game.users.length; i++) {
                    const user = await ucoll.findOne({ key: game.users[i] });
                    const ngames = parseInt(user.self_play_games || 0);
                    var value = ngames - 1 < 0 ? 0 : ngames - 1;
                    await ucoll.updateOne({ key: user.key }, { $set: { self_play_games: value } });
                }
            }
        }

        await gcoll.deleteOne({ key: input.data.key });
        await gdcoll.deleteMany({ game_key: input.data.key });
        await gscoll.deleteMany({ game_key: input.data.key });

        await socket.emit('game_deleted', input.data.key);
        return ({ rc: 'success' });
    },

    '/user/get_assigned_games': async (txn, db, socket, input) => {
        const users = db.collection('users');
        const _user = await users.findOne({ key: input.user.key }, { projection: { _id: 0, password: 0 } });
        if (!_user) {
            return ({ rc: '[' + txn + ']: Invalid user key' });
        }

        const games = await getUserGames(db, input.user.key);
        return ({ rc: 'success', data: games });
    },

    '/admin/game_users': async (txn, db, socket, input) => {
        const gameKey = input.data.game_key;
        const role = input.user.role;
        const pageNumber = parseInt(input.data.pageNumber || 0);
        const pageSize = parseInt(input.data.pageSize || 0);

        const coll = db.collection('games');
        const game = await coll.findOne({ key: gameKey }, { projection: { _id: 0 } });
        if (!game) {
            return ({ rc: 'game not found' });
        }
        const _users = game.users;
        var users = null;
        if (_users && _users.length) {
            const ucoll = db.collection('users');
            users = await ucoll.find({ key: { $in: _users } }, { projection: { _id: 0, password: 0 } }).toArray();
        }

        return ({ rc: 'success', data: users });
    },

    '/user/game_details': async (txn, db, socket, input) => {
        const gcoll = db.collection('games');
        const gscoll = db.collection('game_state');
        const gdcoll = db.collection('game_data');

        const game = await gcoll.findOne({ key: input.data.game_key }, { projection: { _id: 0 } });
        if (game.type == 'team_play') {
            const gameData = {};
            const gameState = await gscoll.findOne({ game_key: input.data.game_key }, { projection: { _id: 0 } });

            /*
            const teams = game.teams;
            
            for (var prop in teams) {
                gameData[prop] = await gdcoll.findOne({ team: prop, game_key: input.data.game_key }, { projection: { _id: 0 } });
            }
            */

            const list = await gdcoll.find({ game_key: input.data.game_key }, { projection: { _id: 0 } }).toArray();
            list.forEach(_gd => {
                gameData[_gd.team] = _gd;
            });

            return ({ rc: 'success', data: { game: game, game_state: gameState, game_data: gameData } });
        }

        if (game.type == 'assessment' || game.type == 'self_play') {
            const gameState = {};
            const gameData = {};

            /*
            for (var i = 0; i < game.users.length; i++) {
                const userKey = game.users[i];
                gameState[userKey] = await gscoll.findOne({ users: userKey, game_key: input.data.game_key }, { projection: { _id: 0 } });
                gameData[userKey] = await gdcoll.findOne({ users: userKey, game_key: input.data.game_key }, { projection: { _id: 0 } });
            }
            */

            const gslist = await gscoll.find({ game_key: input.data.game_key }, { projection: { _id: 0 } }).toArray();
            gslist.forEach(_gs => {
                if (!_gs.users.length) {
                    return;
                }

                const userKey = _gs.users[0];
                gameState[userKey] = _gs;
            });

            const gdlist = await gdcoll.find({ game_key: input.data.game_key }, { projection: { _id: 0 } }).toArray();
            gdlist.forEach(_gd => {
                if (!_gd.users.length) {
                    return;
                }

                const userKey = _gd.users[0];
                gameData[userKey] = _gd;
            });

            return ({ rc: 'success', data: { game: game, game_state: gameState, game_data: gameData } });
        }

        return ({ rc: 'invalid game type: ' + game.type });
    },

    '/user/update_game_data': async (txn, db, socket, input) => {
        const user = input.user;
        const gameData = input.data.game_data;
        const quarter = input.data.quarter;
        const gameKey = input.data.game_key;

        const coll = db.collection('game_data');
        const $set = {};
        $set["data." + quarter] = gameData;

        const result = await coll.updateOne(
            { users: user.key, game_key: gameKey },
            { $set: $set }
        );

        return ({ rc: 'success' });
    },

    '/admin/case_study_list': async (txn, db, socket, input) => {
        const coll = db.collection('case_studies');
        const result = await coll.find({}, { projection: { _id: 0, name: 1, key: 1 } }).toArray();
        return ({ rc: 'success', data: result });
    },

    '/sadmin/case_study_add': async (txn, db, socket, input) => {
        const name = input.data.name.trim().replace(/[ ]+/g, ' ').trim();
        if (!name) {
            return ({ rc: 'Invalid name' });
        }

        if (!/^[a-zA-Z0-9 \-\_]+$/i.test(name)) {
            return ({ rc: 'Please only enter alphanumeric string' });
        }

        const coll = db.collection('case_studies');
        const key = uuid();
        let count;

        count = await coll.countDocuments({ name: name });
        if (count) {
            return ({ rc: 'The case study with this name already exists: (' + name + ').' });
        }

        count = await coll.countDocuments({ key: key });
        if (count) {
            return ({ rc: 'The case study with the generated key exists: (' + key + ').' });
        }

        const exists = fs.existsSync(_case_studies_folder + key);
        if (exists) {
            return ({ rc: 'The folder for the case study already exists: (' + key + ').' });
        }

        const caseStudy = JSON.parse(fs.readFileSync(_data_folder + _caseStudyTemplate));
        caseStudy.accounts_updated = false;
        caseStudy.key = key;
        caseStudy.name = name;
        await coll.insertOne(caseStudy);

        fs.cpSync(_case_studies_folder + '_template', _case_studies_folder + key, { recursive: true });

        const result = await coll.find({}, { projection: { _id: 0, name: 1, key: 1 } }).toArray();
        return ({ rc: 'success', data: result });
    },

    '/sadmin/case_study_remove': async (txn, db, socket, input) => {
        const key = input.data.key ? input.data.key.trim() : null;
        if (!key) {
            return ({ rc: 'Missing case study key for deletion' });
        }

        const coll = db.collection('case_studies');
        await coll.deleteOne({ key: key });

        const dir = _case_studies_folder + key;
        fs.rmSync(dir, { recursive: true, force: true });

        const icoll = db.collection('institutes');
        const institutes = await icoll.find({ case_studies: key }).toArray();
        for (var i = 0; i < institutes.length; i++) {
            const list = institutes[i].case_studies;
            const index = list.indexOf(key);
            if (index > -1) {
                list.splice(index, 1);
            }
            await icoll.updateOne({ key: institutes[i].key }, { $set: { case_studies: list } });
        }

        const gcoll = db.collection('games');
        const gscoll = db.collection('game_state');
        const gdcoll = db.collection('game_data');
        const ucoll = db.collection('users');

        const games = await gcoll.find({ case_study_key: key }).toArray();
        for (var i = 0; i < games.length; i++) {
            const users = games[i].users;

            await gdcoll.deleteMany({ game_key: games[i].key });
            await gscoll.deleteMany({ game_key: games[i].key });
            await gcoll.deleteOne({ key: games[i].key });

            await socket.emit('game_reset', games[i].key);
        }

        const result = await coll.find({}, { projection: { name: 1, key: 1 } }).toArray();

        return ({ rc: 'success', data: result });
    },

    '/sadmin/change_case_study_name': async (txn, db, socket, input) => {
        const key = input.data.key;
        const name = input.data.name.trim().replace(/[ ]+/g, ' ').trim();
        if (!name) {
            return ({ rc: 'Invalid name' });
        }

        if (!/^[a-zA-Z0-9 \-\_]+$/i.test(name)) {
            return ({ rc: 'Please only enter alphanumeric string' });
        }

        const coll = db.collection('case_studies');
        let count;

        count = await coll.countDocuments({ name: name });
        if (count) {
            return ({ rc: 'The case study with this name already exists: (' + name + ').' });
        }

        await coll.updateOne({ key: key }, { $set: { name: name } });

        const result = await coll.find({}, { projection: { _id: 0, name: 1, key: 1 } }).toArray();
        return ({ rc: 'success', data: result });
    },

    '/sadmin/select_case_study': async (txn, db, socket, input) => {
        const coll = db.collection('users');
        await coll.updateOne({ key: input.user.key }, { $set: { case_study: input.data.key } });
        const cscoll = db.collection('case_studies');
        const csdata = await cscoll.findOne({ key: input.data.key }, { projection: { _id: 0 } });
        return ({ rc: 'success', data: csdata });
    },

    '/admin/get_case_study': async (txn, db, socket, input) => {
        const cscoll = db.collection('case_studies');
        const csdata = await cscoll.findOne({ key: input.data.key }, { projection: { _id: 0 } });
        return ({ rc: 'success', data: csdata });
    },

    '/sadmin/institute_list': async (txn, db, socket, input) => {
        const coll = db.collection('institutes');
        const result = await coll.find({}, { projection: { _id: 0 } }).sort({ name: 1 }).toArray();
        return ({ rc: 'success', data: result });
    },

    '/website/institute_list': async (txn, db, socket, input) => {
        const coll = db.collection('institutes');
        const result = await coll.find({ showOnWebsite: true }, { projection: { _id: 0, name: 1, logo: 1, description: 1, state: 1 } }).sort({ name: 1 }).toArray();

        return ({ rc: 'success', data: result });
    },

    '/website/faculty_list': async (txn, db, socket, input) => {
        const coll = db.collection('institutes');
        const result = await coll.find({}).toArray();
        const output = [];
        result.forEach((inst) => {
            if (!inst.faculty) {
                return;
            }

            inst.faculty.forEach((fac) => {
                if (fac.showOnWebsite) {
                    const _fac = {};
                    _fac.institute_name = inst.name;
                    _fac.name = fac.name;
                    _fac.image = fac.image;
                    _fac.title = fac.title;
                    output.push(_fac);
                }
            });
        });

        return ({ rc: 'success', data: output });
    },

    '/website/leaderboard': async (txn, db, socket, input) => {
        const gdcoll = db.collection('game_data');
        const ucoll = db.collection('users');
        const gcoll = db.collection('games');
        const icoll = db.collection('institutes');
        const selector = { type: 'self_play', game_status: 'finished', users: { $ne: [] } };
        const options = { limit: 10, sort: { "score": -1, "profit": -1, "revenue": -1, "marketShare": -1, "unitsSold": -1 } };
        const list = await gdcoll.find(selector, options, { projection: { _id: 0 } }).toArray();
        const recs = [];

        for (var i = 0; i < list.length; i++) {
            const gd = list[i];
            const ukey = gd.users[0];
            const user = await ucoll.findOne({ key: ukey });
            const game_key = gd.game_key;
            const game = await gcoll.findOne({ key: game_key });
            const ikey = game.institute;
            const institute = await icoll.findOne({ key: ikey });

            const _rec = {
                name: user.name,
                rank: i + 1,
                institute: institute.name,
                score: gd.score
            };
            recs.push(_rec);
        }

        return ({ rc: 'success', data: recs });
    },

    '/admin/institute_admins': async (txn, db, socket, input) => {
        const coll = db.collection('users');
        const users = await coll.find({ institute_key: input.data.institute_key, role: 'admin' }, { projection: { _id: 0 } }).toArray();
        users.forEach((user) => {
            delete user.password;
        });
        return ({ rc: 'success', data: users });
    },

    '/admin/institute_admin_add': async (txn, db, socket, input) => {
        const coll = db.collection('users');
        if (input.data.admin.password) {
            input.data.admin.password = crypt.hash(input.data.admin.password);
        }
        else {
            delete input.data.admin.password;
        }

        const count = await coll.countDocuments({ email: input.data.admin.email });
        if (count) {
            return ({ rc: 'User with email id ' + input.data.admin.email + ' already Exists' });
        }

        if (input.data.admin.key) {
            delete input.data.admin._id;
            await coll.updateOne({ key: input.data.admin.key }, { $set: input.data.admin });
        } else {
            input.data.admin.key = uuid();
            input.data.admin.role = 'admin';
            input.data.admin.institute_key = input.data.institute_key;
            await coll.insertOne(input.data.admin);
        }

        const users = await coll.find({ institute_key: input.data.institute_key, role: 'admin' }, { projection: { _id: 0 } }).toArray();
        users.forEach((user) => {
            delete user.password;
        });
        return ({ rc: 'success', data: users });
    },

    '/admin/delete_admin_user': async (txn, db, socket, input) => {
        const coll = db.collection('users');
        const userKey = input.data.user_key;

        await coll.deleteOne({ key: input.data.user_key });

        const users = await coll.find({ institute_key: input.data.institute_key, role: 'admin' }, { projection: { _id: 0 } }).toArray();
        users.forEach((user) => {
            delete user.password;
        });
        return ({ rc: 'success', data: users });
    },

    '/sadmin/institute_add': async (txn, db, socket, input) => {
        const name = input.data.name.trim().replace(/[ ]+/g, ' ').trim();
        if (!name) {
            return ({ rc: 'Invalid name' });
        }

        if (!/^[a-zA-Z0-9 \-\_\.]+$/i.test(name)) {
            return ({ rc: 'Please only enter alphanumeric string' });
        }

        const coll = db.collection('institutes');
        const key = uuid();
        let count;

        count = await coll.countDocuments({ name: name });
        if (count) {
            return ({ rc: 'The institute with this name already exists: (' + name + ').' });
        }

        count = await coll.countDocuments({ key: key });
        if (count) {
            return ({ rc: 'The institute with the generated key exists: (' + key + ').' });
        }

        const institute = {};
        institute.key = key;
        institute.name = name;
        await coll.insertOne(institute);

        const result = await coll.find({}, { projection: { _id: 0, name: 1, key: 1 } }).toArray();
        return ({ rc: 'success', data: result });
    },

    '/sadmin/institute_remove': async (txn, db, socket, input) => {
        const key = input.data.key ? input.data.key.trim() : null;
        if (!key) {
            return ({ rc: 'Missing institute key for deletion' });
        }

        const coll = db.collection('institutes');
        await coll.deleteOne({ key: key });

        const gcoll = db.collection('games');
        const gscoll = db.collection('game_state');
        const gdcoll = db.collection('game_data');
        const ucoll = db.collection('users');

        const games = await gcoll.find({ institute: key }).toArray();
        for (var i = 0; i < games.length; i++) {
            const game = games[i];
            await gdcoll.deleteMany({ game_key: game.key });
            await gscoll.deleteMany({ game_key: game.key });
        }
        await gcoll.deleteMany({ institute: key });

        await ucoll.deleteMany({ institute_key: key });

        const result = await coll.find({}, { projection: { _id: 0, name: 1, key: 1 } }).toArray();
        return ({ rc: 'success', data: result });
    },

    '/sadmin/change_institute_name': async (txn, db, socket, input) => {
        const key = input.data.key;
        const name = input.data.name.trim().replace(/[ ]+/g, ' ').trim();
        if (!name) {
            return ({ rc: 'Invalid name' });
        }

        if (!/^[a-zA-Z0-9 \-\_\.]+$/i.test(name)) {
            return ({ rc: 'Please only enter alphanumeric string' });
        }

        const coll = db.collection('institutes');
        let count;

        count = await coll.countDocuments({ name: name });
        if (count) {
            return ({ rc: 'The institute with this name already exists: (' + name + ').' });
        }

        await coll.updateOne({ key: key }, { $set: { name: name } });

        const result = await coll.find({}, { projection: { _id: 0, name: 1, key: 1 } }).toArray();
        return ({ rc: 'success', data: result });
    },

    '/admin/select_institute': async (txn, db, socket, input) => {
        const coll = db.collection('institutes');
        const data = await coll.findOne({ key: input.data.key }, { projection: { _id: 0 } });

        return ({ rc: 'success', data: data });
    },

    '/sadmin/add_license': async (txn, db, socket, input) => {
        const coll = db.collection('institutes');
        const ucoll = db.collection('users');

        //const inst = await coll.findOne({key: input.data.institute_key});

        if (input.data.status == 'current') {
            input.data.license.used = await ucoll.countDocuments({ institute_key: input.data.institute_key });
        }

        if (input.data.license.key) {
            await coll.updateOne({ key: input.data.institute_key }, { $set: { "licenses.$[i]": input.data.license } }, { arrayFilters: [{ "i.key": input.data.license.key }] });
        } else {
            input.data.license.key = uuid();
            await coll.updateOne({ key: input.data.institute_key }, { $push: { licenses: input.data.license } });
        }
        const result = await coll.findOne({ key: input.data.institute_key }, { projection: { _id: 0 } });
        return ({ rc: 'success', data: result.licenses });
    },

    '/sadmin/delete_license': async (txn, db, socket, input) => {
        const coll = db.collection('institutes');
        const users = db.collection('users');

        const licenseKey = input.data.license_key;

        const inst = await coll.findOne({ key: input.data.institute_key });
        const licenses = inst.licenses;

        const _licenses = [];
        for (var i = 0; i < licenses.length; i++) {
            if (licenses[i].key == licenseKey) {
                continue;
            }
            _licenses.push(licenses[i]);
        }

        await coll.updateOne({ key: input.data.institute_key }, { $set: { licenses: _licenses } });
        await users.updateMany({ institute_key: input.data.institute_key, licenses: licenseKey }, { $pull: { licenses: licenseKey } });

        return ({ rc: 'success', data: _licenses });
    },

    '/admin/academic_years_list': async (txn, db, socket, input) => {
        const coll = db.collection('institutes');
        const institute = await coll.findOne({ key: input.data.institute_key }, { projection: { _id: 0 } });
        const licenses = institute.licenses;
        var years = {};
        licenses && licenses.forEach((lic) => {
            years[lic.academic_year] = lic.academic_year;
        });
        years = Object.keys(years);
        years = years.sort((a, b) => { return parseInt(b.split('-')[0]) - parseInt(a.split('-')[0]); });
        return ({ rc: 'success', data: years });
    },

    '/admin/add_faculty': async (txn, db, socket, input) => {
        const coll = db.collection('institutes');
        const institute = await coll.findOne({ key: input.data.institute_key }, { projection: { _id: 0 } });
        const list = institute.faculty || [];
        list.push({ idx: list.length });
        await coll.updateOne({ key: input.data.institute_key }, { $set: { faculty: list } });
        return ({ rc: 'success', data: list });
    },

    '/admin/delete_faculty': async (txn, db, socket, input) => {
        const coll = db.collection('institutes');
        const institute = await coll.findOne({ key: input.data.institute_key }, { projection: { _id: 0 } });
        const list = institute.faculty || [];
        const _list = [];
        const idx = parseInt(input.data.idx);
        for (var i = 0; i < list.length; i++) {
            if (i == idx) {
                continue;
            }
            _list.push(list[i]);
        }

        for (var i = 0; i < _list.length; i++) {
            _list[i].idx = i;
        }

        await coll.updateOne({ key: input.data.institute_key }, { $set: { faculty: _list } });
        return ({ rc: 'success', data: _list });
    },

    '/system/get_all_styles': async (txn, db, socket, input) => {
        var colors = {};
        if (fs.existsSync(input.data_folder + 'colors.json')) {
            colors = JSON.parse(fs.readFileSync(input.data_folder + 'colors.json', { encoding: 'utf8' }));
        }
        var styles = {};
        if (fs.existsSync(input.data_folder + 'styles.json')) {
            styles = JSON.parse(fs.readFileSync(input.data_folder + 'styles.json', { encoding: 'utf8' }));
        }
        return ({ rc: 'success', data: { ...colors, ...styles } });
    },

    '/system/get_images': async (txn, db, socket, input) => {
        var images = {};
        if (fs.existsSync(input.data_folder + 'images.json')) {
            images = JSON.parse(fs.readFileSync(input.data_folder + 'images.json', { encoding: 'utf8' }));
        }
        return ({ rc: 'success', data: images });
    },

    '/sadmin/get_colors': async (txn, db, socket, input) => {
        var colors = {};
        if (fs.existsSync(input.data_folder + 'colors.json')) {
            colors = JSON.parse(fs.readFileSync(input.data_folder + 'colors.json', { encoding: 'utf8' }));
        }
        return ({ rc: 'success', data: colors });
    },

    '/sadmin/save_colors': async (txn, db, socket, input) => {
        const data = JSON.stringify(input.data, null, 4);
        fs.writeFileSync(input.data_folder + 'colors.json', data, { encoding: 'utf8' });
        return ({ rc: 'success' });
    },

    '/sadmin/get_styles': async (txn, db, socket, input) => {
        var styles = {};
        if (fs.existsSync(input.data_folder + 'styles.json')) {
            styles = JSON.parse(fs.readFileSync(input.data_folder + 'styles.json', { encoding: 'utf8' }));
        }
        return ({ rc: 'success', data: styles });
    },

    '/sadmin/save_styles': async (txn, db, socket, input) => {
        const data = JSON.stringify(input.data, null, 4);
        fs.writeFileSync(input.data_folder + 'styles.json', data, { encoding: 'utf8' });
        return ({ rc: 'success' });
    },

    '/sadmin/remove_image_override': async (txn, db, socket, input) => {
        var images = {};
        if (fs.existsSync(input.data_folder + 'images.json')) {
            images = JSON.parse(fs.readFileSync(input.data_folder + 'images.json', { encoding: 'utf8' }));
        }
        delete images[input.data.name];
        const data = JSON.stringify(images, null, 4);
        fs.writeFileSync(input.data_folder + 'images.json', data, { encoding: 'utf8' });
        return ({ rc: 'success' });
    },

    '/sadmin/save_case_study_data': async (txn, db, socket, input) => {
        const _safeList = [
            'name',
            'currency',
            'text',
            'defaults',
            'demand',
            'exp',
            'initial',
            'initial',
            'quarters',
            'special_projects_template',
            'options_template',
            '_',
            'progressBar',
            'accounts_updated'
        ];

        const safe = (() => {
            for (var i = 0; i < _safeList.length; i++) {
                const _pattern = _safeList[i];
                const len = _pattern.length;
                if (input.data.save_key.substring(0, len) == _pattern) {
                    return true;
                }
            }
            return false;
        })();

        $set = {};
        $set[input.data.save_key] = input.data.value;
        if (!safe) {
            const gcoll = db.collection('games');
            const count = await gcoll.countDocuments({ case_study_key: input.data.obj_key, game_status: { $in: ['started', 'finished', 'assigned'] } })
            if (count) {
                return ({ rc: 'There are ' + count + ' games which are assigned, started or finished for this case study' });
            }
            $set.accounts_updated = false;
        }
        const filters = { arrayFilters: input.data.filters } || {};

        const coll = db.collection('case_studies');
        await coll.updateOne({ key: input.data.obj_key }, { $set: $set }, filters);

        return ({ rc: 'success' });
    },

    '/user/save_game_data': async (txn, db, socket, input) => {
        const user = input.user;
        const gameData = input.data.game_data;
        const quarter = input.data.quarter;

        const $set = {};
        $set["data." + quarter + '.' + input.data.save_key] = input.data.value;
        const filters = { arrayFilters: input.data.filters } || {};

        const coll = db.collection('game_data');
        await coll.updateOne({ users: input.user.key, game_key: input.data.obj_key }, { $set: $set }, filters);

        return ({ rc: 'success' });
    },

    '/admin/save_game_state_data': async (txn, db, socket, input) => {
        $set = {};
        $set[input.data.save_key] = input.data.value;
        const filters = { arrayFilters: input.data.filters } || {};

        const coll = db.collection('games');
        await coll.updateOne({ key: input.data.obj_key }, { $set: $set }, filters);

        if (input.data.save_key == 'timer') {
            const gscoll = db.collection('game_state');
            await gscoll.updateMany({ game_key: input.data.obj_key }, { $set: { timer: input.data.value } });
            await socket.emit('timer_changed', { game_key: input.data.obj_key, timer: input.data.value });
        }

        await socket.emit('game_reload', { game_key: input.data.obj_key });

        return ({ rc: 'success' });
    },

    '/admin/save_user_data': async (txn, db, socket, input) => {
        const $set = {};
        $set[input.data.save_key] = input.data.value;
        const filters = { arrayFilters: input.data.filters } || {};

        const coll = db.collection('users');
        await coll.updateOne({ key: input.data.obj_key }, { $set: $set }, filters);

        return ({ rc: 'success' });
    },

    '/admin/user_list': async (txn, db, socket, input) => {
        const coll = db.collection('users');
        const institutes = db.collection('institutes');
        const inst = await institutes.findOne({ key: input.data.institute_key }, { projection: { _id: 0 } });

        const licenses = inst.licenses;
        var current = null;
        for (var i = 0; i < licenses.length; i++) {
            if (licenses[i].status == 'deleted') {
                continue;
            }

            if (new Date(licenses[i].start_date) <= new Date()) {
                current = licenses[i];
                break;
            }
        }

        const selector = { institute_key: input.data.institute_key, licenses: current.key, role: 'user' };

        const count = await coll.countDocuments(selector);
        const npages = Math.ceil(count / input.data.page_size);
        const options = { skip: (input.data.page - 1) * input.data.page_size || 0, limit: input.data.page_size };
        const users = await coll.find(selector, options, { projection: { _id: 0, password: 0 } }).sort({ name: 1 }).toArray();
        return ({ rc: 'success', data: { users: users, npages: npages } });
    },

    '/admin/user_save': async (txn, db, socket, input) => {
        const coll = db.collection('users');
        const loggedUser = input.user;
        var authorised = loggedUser.role == 'superadmin' || (input.data.institute_key && input.data.institute_key.trim() == loggedUser.institute_key);
        if (!authorised) {
            return ({ rc: 'Not authorised to update this user' });
        }

        const user = input.data.user;

        const institutes = db.collection('institutes');
        const inst = await institutes.findOne({ key: input.data.institute_key }, { projection: { _id: 0 } });

        const $set = {};

        for (var prop in user) {
            if (user[prop] && user[prop].toString().trim().length) {
                $set[prop] = user[prop];
            }
        }

        if (!$set.email) {
            return ({ rc: 'email is mandatory' });
        }

        delete $set._id;
        delete $set.key;
        delete $set.password;
        delete $set.auth;

        const userKey = input.data.key;
        var dbuser = null;
        if ($set.email != null) {
            dbuser = await coll.findOne({ email: $set.email });
        }

        var current = null;
        const licenses = inst.licenses;

        for (var i = 0; i < licenses.length; i++) {
            if (licenses[i].status == 'deleted') {
                continue;
            }

            if (new Date(licenses[i].start_date) <= new Date()) {
                current = licenses[i];
                break;
            }
        }

        if (!current) {
            return ({ rc: 'No current license available for this institute' });
        }

        if (!user.licenses) {
            user.licenses = [];
        }

        if (dbuser) {
            if (dbuser.institute_key != input.data.institute_key) {
                return ({ rc: 'User is already linked to another institute' });
            }

            const email = $set.email;
            delete $set.email;
            
            await coll.updateOne({ email: email }, { $set: $set });
        }
        else {
            if (!$set.name) {
                return ({ rc: 'name is mandatory' });
            }

            user.role = 'user';
            user.institute_key = input.data.institute_key;

            if (user.licenses.indexOf(current.key) == -1) {
                user.licenses.push(current.key);
            }

            const lic = parseInt(current.no_of_licenses || 0);
            const used = parseInt(current.used || 0);
            if (lic < 0 || lic > used) {
                current.used = used + 1;
                await institutes.updateOne({ key: inst.key }, { $set: { licenses: licenses } });
            }
            else {
                return ({ rc: 'All licenses are used for this institute' });
            }

            user.key = uuid();

            await coll.insertOne(user);
        }

        const selector = { institute_key: input.data.institute_key, licenses: current.key, role: 'user' };

        const count = await coll.countDocuments(selector);
        const npages = Math.ceil(count / input.data.page_size);
        const options = { skip: (input.data.page - 1) * input.data.page_size || 0, limit: input.data.page_size };
        const users = await coll.find(selector, options, { projection: { _id: 0, password: 0 } }).toArray();

        return ({ rc: 'success', data: { users: users, npages: npages } });
    },

    '/admin/user_save_password': async (txn, db, socket, input) => {
        const coll = db.collection('users');
        const loggedUser = input.user;
        var authorised = false;
        if (loggedUser.role == 'superadmin') {
            authorised = true;
        }
        else if (loggedUser.role == 'admin') {
            const dbuser = await coll.findOne({ key: input.data.key });
            if (!dbuser) {
                authorised = false;
            }
            else {
                authorised = dbuser.institute_key && dbuser.institute_key.trim() && dbuser.institute_key.trim() == loggedUser.institute_key;
            }
        }
        if (!authorised) {
            return ({ rc: 'Not authorised to update this user' });
        }

        const password = input.data.password;
        const $set = { password: crypt.hash(password) };

        await coll.updateOne({ key: input.data.key }, { $set: $set });

        return ({ rc: 'success' });
    },

    '/admin/user_reset_password': async (txn, db, socket, input) => {
        const coll = db.collection('users');
        const loggedUser = input.user;
        var authorised = false;
        if (loggedUser.role == 'superadmin') {
            authorised = true;
        }
        else if (loggedUser.role == 'admin') {
            const dbuser = await coll.findOne({ key: input.data.key });
            if (!dbuser) {
                authorised = false;
            }
            else {
                authorised = dbuser.institute_key && dbuser.institute_key.trim() && dbuser.institute_key.trim() == loggedUser.institute_key;
            }
        }
        if (!authorised) {
            return ({ rc: 'Not authorised to update this user' });
        }

        await coll.updateOne({ key: input.data.key }, { $set: { password: null } });

        return ({ rc: 'success' });
    },

    '/admin/user_remove': async (txn, db, socket, input) => {
        const coll = db.collection('users');
        const loggedUser = input.user;
        var authorised = false;
        if (loggedUser.role == 'superadmin') {
            authorised = true;
        }
        else if (loggedUser.role == 'admin') {
            const dbuser = await coll.findOne({ key: input.data.key });
            if (!dbuser) {
                authorised = false;
            }
            else {
                authorised = dbuser.institute_key && dbuser.institute_key.trim() == dbuser.institute_key && dbuser.institute_key == loggedUser.institute_key;
            }
        }
        if (!authorised) {
            return ({ rc: 'Not authorised to update this user' });
        }

        const userKey = input.data.key ? input.data.key.trim() : null;
        const user = coll.findOne({ key: userKey });

        const gcoll = db.collection('games');
        const gcount = await gcoll.countDocuments({ users: userKey });
        if (gcount) {
            return ({ rc: 'User is already assigned to games.' });
        }

        const institutes = db.collection('institutes');
        const inst = await institutes.findOne({ key: input.data.institute_key }, { projection: { _id: 0 } });

        var current = null;
        const licenses = inst.licenses;

        for (var i = 0; i < licenses.length; i++) {
            if (licenses[i].status == 'deleted') {
                continue;
            }

            if (new Date(licenses[i].start_date) <= new Date()) {
                current = licenses[i];
                break;
            }
        }

        if (current) {
            const lic = parseInt(current.no_of_licenses || 0);
            const used = parseInt(current.used || 0);
            if (lic < 0 || lic > used) {
                current.used = used - 1;
                await institutes.updateOne({ key: inst.key }, { $set: { licenses: licenses } });
            }
        }

        const currentUser = await coll.findOne({key: input.data.key});
        if (!currentUser.licenses || !currentUser.licenses.indexOf(current.key) == -1) {
            await coll.deleteOne({ key: input.data.key });
        }
        else
        {
            await users.updateOne({ key: input.data.key }, { $pull: { licenses: current.key } });
        }

        const selector = { institute_key: input.data.institute_key, role: 'user' };

        const count = await coll.countDocuments(selector);
        const npages = Math.ceil(count / input.data.page_size);
        const options = { skip: (input.data.page - 1) * input.data.page_size || 0, limit: input.data.page_size };
        const users = await coll.find(selector, options, { projection: { _id: 0, password: 0 } }).toArray();

        return ({ rc: 'success', data: { users: users, npages: npages } });
    },

    '/admin/save_institute_data': async (txn, db, socket, input) => {
        const loggedUser = input.user;
        var authorised = loggedUser.role == 'superadmin' || (input.data.institute_key && input.data.institute_key.trim() == loggedUser.institute_key);
        if (!authorised) {
            return ({ rc: 'Not authorised to update this user' });
        }

        $set = {};
        $set[input.data.save_key] = input.data.value;
        const filters = { arrayFilters: input.data.filters } || {};

        const coll = db.collection('institutes');
        await coll.updateOne({ key: input.data.obj_key }, { $set: $set }, filters);

        return ({ rc: 'success' });
    },

    '/sadmin/remove_case_study_value': async (txn, db, socket, input) => {
        $set = {};
        $set[input.data.text_key] = '';
        $set.accounts_updated = false;
        const filters = { arrayFilters: input.data.filters } || {};

        const coll = db.collection('case_studies');
        await coll.updateOne({ key: input.data.case_study }, { $unset: $set }, filters);

        return ({ rc: 'success' });
    },

    '/admin/quarter_timeout': async (txn, db, socket, input) => {
        const gcoll = db.collection('games');
        const gscoll = db.collection('game_state');
        const gdcoll = db.collection('game_data');

        const gameKey = input.data.game_key;

        const game = await gcoll.findOne({ key: gameKey });
        if (!game) {
            return ({ rc: 'error in game. game not found for user ' + input.user.key + ' game ' + gameKey });
        }

        await gdcoll.updateMany({ game_key: gameKey, quarter_status: { $ne: 'submitted' } }, { $set: { quarter_status: 'timeout' } });
        const data = await gdcoll.find({ game_key: gameKey }, { projection: { _id: 0 } }).toArray();
        const gameData = {};
        data.forEach((gd) => {
            gameData[gd.team] = gd;
        });

        const _game = await gcoll.findOne({ key: gameKey });
        const _gameState = await gscoll.findOne({ game_key: gameKey });

        await socket.emit('quarter_submitted', { game_key: gameKey, game_data: gameData });
        await socket.emit('quarter_timeout', { game_key: gameKey });
        return ({ rc: 'success', data: { game: _game, game_state: _gameState, game_data: gameData } });
    },

    '/admin/assessment_timeout': async (txn, db, socket, input) => {
        const coll = db.collection('games');
        const gdcoll = db.collection('game_data');
        const gscoll = db.collection('game_state');
        const users = db.collection('users');

        const game = await coll.findOne({ key: input.data.game_key }, { projection: { _id: 0 } });

        const dt = new Date();
        await coll.updateOne({ key: input.data.game_key }, { $set: { game_status: 'finished' } });
        await gscoll.updateMany({ game_key: input.data.game_key }, { $set: { game_status: 'finished' } });

        const nqtrs = parseInt(game.no_of_qtrs || 1);

        const scores = [];
        const gameDataList = await gdcoll.find({ game_key: input.data.game_key }, { projection: { _id: 0 } }).toArray();
        for (var i = 0; i < gameDataList.length; i++) {
            const gd = gameDataList[i];

            var score = 0;
            for (var q = 1; q < gd.data.length - 1; q++) {
                score += gd.data[q].scores.score;
            }
            gd.score = Math.round(score) / nqtrs;
            gd.marketShare = gd.data[nqtrs] ? gd.data[nqtrs].financials.marketShare : 0;
            gd.profit = gd.data[nqtrs] ? gd.data[nqtrs].financials.profit : 0;
            gd.revenue = gd.data[nqtrs] ? gd.data[nqtrs].financials.marketShare : 0;
            gd.unitsSold = gd.data[nqtrs] ? gd.data[nqtrs].financials.unitsSold : 0;
            gd.game_status = gd.current_quarter < nqtrs ? 'incomplete' : 'finished';
        }

        selfPlayRank(gameDataList, nqtrs);

        for (var i = 0; i < gameDataList.length; i++) {
            const gd = gameDataList[i];
            await gdcoll.updateOne({ key: gd.key },
                {
                    $set: {
                        score: gd.score,
                        rank: gd.rank,
                        marketShare: gd.marketShare,
                        profit: gd.profit,
                        revenue: gd.revenue,
                        game_status: gd.game_status,
                    }
                });
        }

        await socket.emit('game_finished', { users: game.users, game_key: input.data.game_key });
        await socket.emit('assessment_finished', { game_key: input.data.game_key });

        return ({ rc: 'success' });
    },

    '/admin/start_game': async (txn, db, socket, input) => {
        const coll = db.collection('games');
        const gdcoll = db.collection('game_data');
        const gscoll = db.collection('game_state');
        const icoll = db.collection('institutes');
        const ucoll = db.collection('users');

        const game = await coll.findOne({ key: input.data.game_key }, { projection: { _id: 0 } });

        const dt = new Date();
        await coll.updateOne({ key: input.data.game_key }, { $set: { game_status: 'started', started_dt: dt } });
        await gscoll.updateMany({ game_key: input.data.game_key }, { $set: { game_status: 'started', started_dt: dt, timer: game.timer } });
        await gdcoll.updateMany({ game_key: input.data.game_key }, { $set: { game_status: 'started' } });
        const gameState = await gscoll.findOne({ game_key: input.data.game_key }, { projection: { _id: 0 } });

        $set = {};
        $set['games.' + input.data.game_key + '.game_status'] = 'started';
        await ucoll.updateMany({ key: { $in: gameState.users } }, { $set: $set });

        await socket.emit('game_started', { game_key: input.data.game_key, timer: game.timer, started_dt: dt });
        await socket.emit('game_reload', { game_key: input.data.game_key });
        return ({ rc: 'success', data: { timer: game.timer, started_dt: dt } });
    },

    '/admin/save_game': async (txn, db, socket, input) => {
        const coll = db.collection('games');
        const game = await coll.findOne({ key: input.data.key }, { projection: { _id: 0 } });

        if (!game.case_study_key) {
            return ({ rc: 'case study not selected ' + game.case_study_key });
        }

        const cscoll = db.collection('case_studies');
        const caseStudy = await cscoll.findOne({ key: game.case_study_key }, { projection: { _id: 0 } });
        if (!caseStudy) {
            return ({ rc: 'case study not found. key: ' + game.case_study_key });
        }

        const teams = game.teams;

        const nteams = parseInt(game.no_of_teams || 0);
        if (nteams < 2) {
            return ({ rc: 'You must have a minimum of 2 teams/players in a game' });
        }

        const markets = {};

        if (game.useMarkets) {
            if (parseInt(game.no_of_markets || 0) < 2) {
                return ({ rc: 'There must be minimum of 2 markets.' });
            }

            for (var prop in teams) {
                const market = teams[prop].market;
                if (!market) {
                    return ({ rc: 'Team ' + prop + ' does not have a market assigned.' });
                }

                if (!markets[market]) {
                    markets[market] = 0;
                }
                markets[market]++;
            }

            for (var prop in markets) {
                if (markets[prop] < 2) {
                    return ({ rc: 'Market ' + prop + ' should have at least 2 teams.' });
                }
            }
        }

        /*
        if (nteams > 18) {
            return ({ rc: 'You can have maximum of 18 teams/players in a game' });
        }
        */

        const nqtrs = parseInt(game.no_of_qtrs || 0);
        if (nqtrs < 2) {
            return ({ rc: 'You must have a minimum of 2 quarters in a game' });
        }

        if (nqtrs >= Object.keys(caseStudy.quarters.labels).length) {
            return ({ rc: 'There are not enough labels defined for ' + nqtrs + ' quarters' });
        }

        const segments = caseStudy.market.segments;
        if (!segments) {
            return ({ rc: 'The market segments are mandatory' });
        }

        const nsegs = segments.length;
        if (nsegs < 2) {
            return ({ rc: 'You must have a minimum of 2 market segments in a game' });
        }

        const productManpower = parseFloat(caseStudy.product.product_manpower || 0);
        if (productManpower <= 0) {
            return ({ rc: 'Product manpower cannot be 0 or negative' });
        }

        const minVariance = parseInt(caseStudy.demand_change_criteria.demand_variance_min || 0);
        const maxVariance = parseInt(caseStudy.demand_change_criteria.demand_variance_max || 0);
        const minNatural = parseInt(caseStudy.demand_change_criteria.min_natural_variance || 0);
        const maxNatural = parseInt(caseStudy.demand_change_criteria.max_natural_variance || 0);

        if (!minVariance || !maxVariance || !minNatural || !maxNatural) {
            return ({ rc: 'The minimum and maximum demand variance need to be defined' });
        }

        if (!parseInt(caseStudy.financials.labour_cost_pct || 0)) {
            return ({ rc: 'labour cost percentage cannot be 0' });
        }

        if (!parseInt(caseStudy.financials.investment_plant || 0)) {
            return ({ rc: 'plant value cannot be 0' });
        }

        if (!parseInt(caseStudy.financials.capacity || 0)) {
            return ({ rc: 'plant capacity cannot be 0' });
        }

        if (!parseFloat(caseStudy.financials.depreciation_rate_plant || 0)) {
            return ({ rc: 'plant depreciation rate cannot be 0' });
        }

        if (!parseFloat(caseStudy.financials.depreciation_rate_projects || 0)) {
            return ({ rc: 'projects depreciation rate cannot be 0' });
        }

        if (!parseFloat(caseStudy.financials.depreciation_rate_research || 0)) {
            return ({ rc: 'research depreciation rate cannot be 0' });
        }

        if (!parseFloat(caseStudy.financials.emergency_loan_int_pct || 0)) {
            return ({ rc: 'emergency loan interest rate cannot be 0' });
        }

        if (!parseFloat(caseStudy.financials.interest_rate || 0)) {
            return ({ rc: 'debt duration cannot be 0' });
        }

        if (!parseFloat(caseStudy.financials.shares_facevalue || 0)) {
            return ({ rc: 'share facevalue cannot be 0' });
        }

        if (!parseInt(caseStudy.financials.shares_issued || 0)) {
            return ({ rc: 'shares issued cannot be 0' });
        }

        if (!parseInt(caseStudy.financials.max_shares_issue_pct || 0)) {
            return ({ rc: 'max shares issued cannot be 0' });
        }

        if (!parseFloat(caseStudy.financials.investment_interest_rate || 0)) {
            return ({ rc: 'investment interest rate cannot be 0' });
        }

        if (!parseInt(caseStudy.financials.min_cash_balance_required || 0)) {
            return ({ rc: 'minimum cash balance required cannot be 0' });
        }

        if (!parseInt(caseStudy.financials.max_debt_borrow_pct || 0)) {
            return ({ rc: 'max debt borrow pct cannot be 0' });
        }

        if (parseFloat(caseStudy.financials.pratio || 0) <= 0) {
            return ({ rc: 'pratio cannot be 0 or negative' });
        }

        for (var prop in caseStudy.kpi_criteria) {
            if (!parseInt(caseStudy.kpi_criteria[prop] || 0)) {
                return ({ rc: 'kpi criteria ' + prop + '  cannot be 0' });
            }
        }

        if (!caseStudy.market.channels || !caseStudy.market.channels.length) {
            return ({ rc: 'you must have minimum of 2 market channels' });
        }

        if (!caseStudy.product.specs || !caseStudy.product.specs.length) {
            return ({ rc: 'product specs are mandatory' });
        }

        if (!caseStudy.price_constants || !Object.keys(caseStudy.price_constants).length) {
            return ({ rc: 'price constants are mandatory' });
        }

        if (!parseInt(caseStudy.price_constants.advertising_constant || 0)) {
            return ({ rc: 'advertising constant is mandatory' });
        }

        if (!parseInt(caseStudy.price_constants.promotions_constant || 0)) {
            return ({ rc: 'promotions constant is mandatory' });
        }

        if (!parseInt(caseStudy.demand_change_criteria.demand_for_target_segment || 0)) {
            return ({ rc: 'demand factor for target segment is mandatory' });
        }

        if (!parseInt(caseStudy.financials.existing_workforce || 0)) {
            return ({ rc: 'existing workforce is mandatory' });
        }

        if (!parseInt(caseStudy.financials.required_workforce || 0)) {
            return ({ rc: 'required workforce is mandatory' });
        }

        if (!parseInt(caseStudy.financials.avg_salary || 0)) {
            return ({ rc: 'average salary is mandatory' });
        }

        if (!parseInt(caseStudy.financials.innovation_budget_max || 0)) {
            return ({ rc: 'max innovation budget is mandatory' });
        }

        if (!parseInt(caseStudy.financials.training_budget_max || 0)) {
            return ({ rc: 'max training budget is mandatory' });
        }

        if (!parseInt(caseStudy.financials.productivity_improvement_max || 0)) {
            return ({ rc: 'max productivity improvement is mandatory' });
        }

        if (!parseInt(caseStudy.financials.sales_effectiveness_max || 0)) {
            return ({ rc: 'max sales effectiveness is mandatory' });
        }

        const products = JSON.parse(JSON.stringify(caseStudy.products)).sort((a, b) => { return a.idx - b.idx });
        if (!products || products.length < 2) {
            return ({ rc: 'there must be minimum of 2 products to sell' });
        }

        if (segments.length != products.length) {
            return ({ rc: 'number of segments should be same as number of products' });
        }

        const segmentNames = [];
        segments.forEach((segment) => {
            segmentNames.push(segment.name);
        });

        const channels = caseStudy.market.channels;
        const channelNames = [];
        channels.forEach((channel) => {
            channelNames.push(channel.name);
        });

        const _segs = {};
        for (var i = 0; i < products.length; i++) {
            if (segmentNames.indexOf(products[i].target) == -1) {
                return ({ rc: 'product target segment is not defined ' + products[i].target });
            }

            if (_segs[products[i].target]) {
                return ({ rc: 'each product can only be assigned to one market segment' });
            }
            _segs[products[i].target] = products[i];

            for (var prop in products[i].channelDistribution) {
                if (channelNames.indexOf(prop) == -1) {
                    return ({ rc: 'channel not found in case study ' + prop + ' product name ' + product.name });
                }
            }
        }

        if (Object.keys(_segs).length != segments.length) {
            return ({ rc: 'each segment can only be assigned to one product' });
        }

        if (!caseStudy.financials.liability_plus_equity || !caseStudy.financials.total_assets) {
            return ({ rc: 'accounts have not been updated in case study' });
        }

        if (!caseStudy.accounts_updated) {
            return ({ rc: 'accounts have not been updated in case study' });
        }

        if (caseStudy.financials.liability_plus_equity != caseStudy.financials.total_assets) {
            return ({ rc: 'balance sheet does not match' });
        }

        if (caseStudy.special_projects) {
            for (var i = 0; i < caseStudy.special_projects.length; i++) {
                const sp = caseStudy.special_projects[i];
                if (!sp.type) {
                    return ({ rc: 'special projects type is mandatory for project ' + sp.name });
                }

                if (!sp.options || !sp.options.length) {
                    return ({ rc: 'there should be at least 1 option other than None in project ' + sp.name });
                }

                if (!sp.selectedOption || !sp.selectedOption.value) {
                    return ({ rc: 'improve or upgrade impact is mandatory in project ' + sp.name });
                }

                for (var j = 0; j < sp.options.length; j++) {
                    const opt = sp.options[j];
                    if (!opt.minLevel || !opt.maxLevel) {
                        return ({ rc: 'project option min and max levels are mandatory for project ' + sp.name });
                    }
                }
            }
        }

        const specValues = {};
        caseStudy.product.specs.forEach((spec) => {
            specValues[spec.feature] = {};
            spec.values.forEach((val) => {
                specValues[spec.feature][val.value] = { ...val };
            });
        });

        var error = null;

        for (var i = 0; i < caseStudy.products.length; i++) {
            const product = caseStudy.products[i];
            var featureCost = 0;
            for (var prop in product.specs) {
                const val = product.specs[prop];
                if (!specValues[prop] || !specValues[prop][val]) {
                    error = 'spec ' + prop + ' value ' + val + ' not found in product ' + product.name;
                    break;
                }
            }
            if (error) {
                break;
            }
        }

        if (error) {
            return ({ rc: error });
        }

        for (var i = 0; i < caseStudy.product.specs.length; i++) {
            const spec = caseStudy.product.specs[i];
            if (!spec.values || !spec.values.length) {
                return ({ rc: 'each product specification must have some values' });
            }

            for (var j = 0; j < spec.values.length; j++) {
                const weight = parseInt(spec.values[j].weight || 0);
                if (!weight) {
                    return ({ rc: 'product spec weight cannot be 0 ' + spec.feature + ':' + spec.values[j].value });
                }
                const cost = parseInt(spec.values[j].cost || 0);
                if (!cost) {
                    return ({ rc: 'product spec cost cannot be 0 ' + spec.feature + ':' + spec.values[j].value });
                }
            }
        }

        const financials = JSON.parse(JSON.stringify(caseStudy.financials));

        var revenue = 0;
        var unitsSold = 0;
        var plannedProduction = 0;

        const distVarMin = parseInt(caseStudy.distribution_variance_min || 0);
        const distVarMax = parseInt(caseStudy.distribution_variance_max || 0);

        for (var i = 0; i < products.length; i++) {
            const product = products[i];
            if (!product.target) {
                return ({ rc: 'product must have a target segment defined ' + product.name });
            }

            product.unitsSold = parseInt(product.unitsSold || 0);
            if (!product.unitsSold) {
                return ({ rc: 'units sold cannot be 0 for product ' + product.name });
            }

            unitsSold += product.unitsSold;

            product.salesPrice = parseInt(product.salesPrice || 0);
            if (!product.salesPrice) {
                return ({ rc: 'sales price cannot be 0 for product ' + product.name });
            }

            product.revenue = product.unitsSold * product.salesPrice;
            revenue += product.revenue;

            product.plannedProduction = parseInt(product.plannedProduction || 0);
            if (!product.plannedProduction) {
                return ({ rc: 'planned production cannot be 0 for product ' + product.name });
            }
            plannedProduction += product.plannedProduction;

            product.potential_sales_demand = product.unitsSold;
            product.potential_sales_supply = product.unitsSold;
            product.actualProduction = product.plannedProduction;

            product.idealDistribution = [];
            product.idealDistribution[0] = {};

            const distribution = { ...product.channelDistribution };
            var totalDist = 0;
            for (var prop in distribution) {
                distribution[prop] = parseFloat(distribution[prop] || 0);
                totalDist += distribution[prop];
            }

            for (var prop in distribution) {
                distribution[prop] = distribution[prop] * 100 / totalDist;
            }

            totalDist = 0;
            var totalIdeal = 0;

            for (var prop in product.channelDistribution) {
                if (product.channelDistribution[prop] < 0) {
                    return ({ rc: 'channel distribution cannot be < 0 for product ' + product.name + ' channel ' + prop });
                }
                product.channelDistribution[prop] = parseInt(100 / caseStudy.market.channels.length);
                totalDist += product.channelDistribution[prop];
                product.idealDistribution[0][prop] = distribution[prop] * (1 + (Math.random() * (distVarMax - distVarMin) + distVarMin) / 100);
                if (product.idealDistribution[0][prop] < 0) {
                    return ({ rc: 'calculated ideal distribution < 0 for product ' + product.name + ' channel ' + prop });
                }
                totalIdeal += product.idealDistribution[0][prop];
            }

            for (var prop in product.channelDistribution) {
                product.idealDistribution[0][prop] = product.idealDistribution[0][prop] * 100 / totalIdeal;
                if (product.idealDistribution[0][prop] < 0) {
                    return ({ rc: 'calculated ideal distribution < 0 for product ' + product.name + ' channel ' + prop });
                }
            }

            if (totalDist != 100) {
                const keys = Object.keys(distribution);
                const diff = 100 - totalDist;

                var key = keys.pop();
                while ((product.channelDistribution[key] + diff) < 0) {
                    key = keys.pop();
                }

                product.channelDistribution[key] += 100 - totalDist;

                if (product.channelDistribution[key] < 0) {
                    return ({ rc: 'calculated product channel distribution is < 0 for product ' + product.name });
                }
            }

            for (var j = 1; j <= nqtrs; j++) {
                const prev = product.idealDistribution[j - 1];
                product.idealDistribution[j] = {};
                totalIdeal = 0;
                for (var prop in product.channelDistribution) {
                    product.idealDistribution[j][prop] = prev[prop] * (1 + (Math.random() * (distVarMax - distVarMin) + distVarMin) / 100);
                    if (product.idealDistribution[j][prop] < 0) {
                        return ({ rc: 'calculated product channel distribution is < 0 for product ' + product.name + ' channel ' + prop });
                    }
                    totalIdeal += product.idealDistribution[j][prop];
                }

                for (var prop in product.channelDistribution) {
                    product.idealDistribution[j][prop] = product.idealDistribution[j][prop] * 100 / totalIdeal;
                    if (product.idealDistribution[j][prop] < 0) {
                        return ({ rc: 'calculated ideal distribution < 0 for product ' + product.name + ' channel ' + prop });
                    }
                }
            }
        }

        if (plannedProduction > parseInt(caseStudy.financials.capacity || 0)) {
            return ({ rc: 'Planned production cannot exceed plant capacity' });
        }

        for (var i = 0; i < products.length; i++) {
            products[i].marketShare = Math.round((products[i].unitsSold * 100 / (unitsSold * nteams)) * 100) / 100;
            products[i].revenueShare = Math.round((products[i].revenue * 100 / (revenue * nteams)) * 100) / 100;
            products[i].marketShareSegment = Math.round(10000 / nteams) / 100;
            products[i].revenueShareSegment = Math.round(10000 / nteams) / 100;
        }

        financials.unitsSold = unitsSold;
        financials.revenue = revenue;
        financials.marketShare = Math.round((financials.unitsSold * 100 / (unitsSold * nteams) * 100)) / 100;
        financials.revenueShare = Math.round((financials.revenue * 100 / (revenue * nteams) * 100)) / 100;

        financials.required_workforce = Math.ceil(plannedProduction * productManpower);
        financials.existing_workforce = parseInt(financials.existing_workforce || 0);
        if (!financials.existing_workforce) {
            financials.existing_workforce = financials.required_workforce;
        }

        financials.innovation_budget = 0;
        financials.training_budget = 0;

        const marketShare = Math.round(100 / nteams);

        const _products = [];
        _products[0] = JSON.parse(JSON.stringify(products)).sort((a, b) => { return a.idx - b.idx });

        const totalUnitsSold = unitsSold * nteams;

        if (!caseStudy.demand_criteria) {
            return ({ rc: 'The sales projection criteria must be defined ' });
        }

        const distribution = {};
        var totalDistribution = 0;
        for (var i = 0; i < segments.length; i++) {
            const segment = segments[i];
            distribution[segment.name] = parseInt(segment.demand_distribution || 0);

            if (!distribution[segment.name]) {
                return ({ rc: 'The segment distribution ratio cannot be 0 for segment ' + segment.name });
            }

            if (!parseInt(segment.ideal_price || 0)) {
                return ({ rc: 'The ideal price cannot be 0 for segment ' + segment.name });
            }

            totalDistribution += distribution[segment.name];

            if (!caseStudy.demand_criteria[segment.idx]) {
                return ({ rc: 'The sales projection criteria must be defined for ' + segment.name });
            }

            if (!parseInt(caseStudy.demand_criteria[segment.idx].features || 0)) {
                return ({ rc: 'The sales projection criteria features is mandatory for ' + segment.name });
            }
            if (!parseInt(caseStudy.demand_criteria[segment.idx].price || 0)) {
                return ({ rc: 'The sales projection criteria price is mandatory for ' + segment.name });
            }
            if (!parseInt(caseStudy.demand_criteria[segment.idx].advertisement || 0)) {
                return ({ rc: 'The sales projection criteria advertisement is mandatory for ' + segment.name });
            }
            if (!parseInt(caseStudy.demand_criteria[segment.idx].promotions || 0)) {
                return ({ rc: 'The sales projection criteria promotions is mandatory for ' + segment.name });
            }
            if (!caseStudy.price_constants[segment.idx] ||
                !parseInt(caseStudy.price_constants[segment.idx].lower || 0) ||
                !parseInt(caseStudy.price_constants[segment.idx].higher || 0)) {
                return ({ rc: 'The price constants are mandatory for ' + segment.name });
            }
        }

        if (!game.institute) {
            return ({ rc: 'The game must have an institute ' });
        }

        for (var name in distribution) {
            distribution[name] /= totalDistribution;
        }

        const demand = {};
        const production = {};
        const sales = {};

        if (game.type == 'team_play' && game.useMarkets) {
            for (var prop in markets) {
                demand[prop] = {};
                production[prop] = {};
                sales[prop] = {};

                const mteams = markets[prop];
                const nteams = parseInt(game.no_of_teams || 0);
                const _unitsSold = totalUnitsSold * mteams / nteams;

                segments.forEach((segment) => {
                    demand[prop][segment.name] = [];
                    demand[prop][segment.name][0] = Math.round(_unitsSold * distribution[segment.name]);
                    production[prop][segment.name] = [];
                    production[prop][segment.name][0] = demand[prop][segment.name][0];
                    sales[prop][segment.name] = [];
                    sales[prop][segment.name][0] = demand[prop][segment.name][0];

                    for (var i = 1; i <= nqtrs; i++) {
                        const prevDemand = demand[prop][segment.name][i - 1];
                        const randomValue = (Math.random() * (maxVariance - minVariance)) + minVariance;
                        demand[prop][segment.name][i] = Math.floor(prevDemand + (prevDemand * randomValue / 100));
                    }
                });
            }
        } else {
            segments.forEach((segment) => {
                demand[segment.name] = [];
                demand[segment.name][0] = Math.round(totalUnitsSold * distribution[segment.name]);
                production[segment.name] = [];
                production[segment.name][0] = demand[segment.name][0];
                sales[segment.name] = [];
                sales[segment.name][0] = demand[segment.name][0];

                for (var i = 1; i <= nqtrs; i++) {
                    const prevDemand = demand[segment.name][i - 1];
                    const randomValue = (Math.random() * (maxVariance - minVariance)) + minVariance;
                    demand[segment.name][i] = Math.floor(prevDemand + (prevDemand * randomValue / 100));
                }
            });
        }

        if (!caseStudy.demandMessages.general || !caseStudy.demandMessages.general.length) {
            return ({ rc: 'demand messages - general need to be defined' });
        }

        if (!caseStudy.demandMessages.neutral || !caseStudy.demandMessages.neutral.length) {
            return ({ rc: 'demand messages - neutral need to be defined' });
        }

        if (!caseStudy.demandMessages.increase || !caseStudy.demandMessages.increase.length) {
            return ({ rc: 'demand messages - increase need to be defined' });
        }

        if (!caseStudy.demandMessages.decrease || !caseStudy.demandMessages.decrease.length) {
            return ({ rc: 'demand messages - decrease need to be defined' });
        }

        if (game.type == 'team_play') {
            for (var prop in game.teams) {
                const list = Object.keys(game.teams[prop].users);
                if (!list.length) {
                    return ({ rc: 'team ' + prop + ' should have some users assigned to it' });
                }
            }
        }

        const ucoll = db.collection('users');

        if (game.type == 'self_play') {
            const icoll = db.collection('institutes');
            const institute = await icoll.findOne({ key: game.institute });
            const maxGames = parseInt(institute.max_self_play_games || 0);

            if (maxGames) {
                for (var i = 0; i < game.users.length; i++) {
                    const user = await ucoll.findOne({ key: game.users[i] });
                    const ngames = parseInt(user.self_play_games || 0);
                    if (ngames >= maxGames) {
                        return { rc: 'Max Self Play Games exceeded for user: ' + user.email };
                    }
                }
            }

            for (var i = 0; i < game.users.length; i++) {
                const user = await ucoll.findOne({ key: game.users[i] });
                $set = {};
                $set['games.' + input.data.game_key + '.game_status'] = 'started';
                const ngames = parseInt(user.self_play_games || 0);
                $set.self_play_games = ngames + 1;
                await ucoll.updateOne({ key: user.key }, { $set: $set });
            }
        }

        var now = 0;
        var prev = 0;

        // ### messages should be based on markets

        for (var prop in demand) {
            now += parseInt(demand[prop][1] || 0);
            prev += parseInt(demand[prop][0] || 0);
        }

        var type = 'neutral';
        const diff = Math.round((now - prev) * 100 / prev);
        if (diff > 3) {
            type = 'increase';
        }
        else if (diff < -3) {
            type = 'decrease';
        }

        const gidx = Math.round(Math.random() * (caseStudy.demandMessages.general.length - 1));
        const midx = Math.round(Math.random() * (caseStudy.demandMessages[type].length - 1));

        const news = [];
        caseStudy.demandMessages.general[gidx].type = 'news';
        news.push(caseStudy.demandMessages.general[gidx]);
        caseStudy.demandMessages[type][midx].type = 'news';
        news.push(caseStudy.demandMessages[type][midx]);

        //calculateScores(gameData, caseStudy, gameDataList);

        const initialState = {
            game_key: input.data.key,
            game_status: 'assigned',
            demand: demand,
            production: production,
            sales: sales,
            distribution: distribution,
            assigned: new Date(),
            current_quarter: 1,
            institute: game.institute,
            state: game.state
        };

        /*
        const userGame = {
            game_key: input.data.key,
            game_type: game.type,
            case_study_key: caseStudy.key,
            game_status: 'assigned',
            assigned: new Date()
        };
        */

        const quarterData = {
            financials: financials,
            products: products,
            scores: { ...caseStudy.initial_scores },
            special_projects: {},
            news: news,
            specs: [...caseStudy.product.specs]
        };

        quarterData.financials.marketShare = marketShare;
        quarterData.financials.shareRevenue = marketShare;

        const gameData = {
            users: [],
            game_key: input.data.key,
            current_quarter: 1,
            game_status: 'assigned',
            data: {
                '0': quarterData,
                '1': quarterData
            },
            created: new Date(),
            institute: game.institute,
            state: game.state
        };

        const gdcoll = db.collection('game_data');
        const gscoll = db.collection('game_state');

        await gdcoll.deleteMany({ game_key: input.data.key });
        await gscoll.deleteMany({ game_key: input.data.key });

        switch (game.type) {
            case 'assessment':
            case 'self_play':
                for (var i = 0; i < game.users.length; i++) {
                    const gameStateKey = uuid();
                    const userKey = game.users[i];
                    const _user = await ucoll.findOne({ key: userKey }, { projection: { _id: 0, password: 0 } });
                    const _teams = {};
                    _teams[_user.name] = { name: _user.name, users: {} };
                    _teams[_user.name].users[userKey] = { key: userKey, name: _user.name, email: _user.email };

                    const keys = Object.keys(teams);
                    for (var j = 1; j < keys.length; j++) {
                        _teams[keys[j]] = teams[keys[j]];
                    }

                    for (var prop in _teams) {
                        gameData.key = uuid();
                        gameData.game_state_key = gameStateKey;
                        if (_user.name == prop) {
                            gameData.users = [userKey];
                        }
                        else {
                            gameData.users = [];
                        }
                        gameData.team = prop;
                        await gdcoll.insertOne(gameData);
                        delete gameData._id;

                        const team = _teams[prop];
                        team.name = prop;
                        team.rank = 0;
                        team.market_rank = 0;
                        team.score = 0;
                        team.profit = caseStudy.financials.profit;
                        team.revenue = caseStudy.financials.revenue;
                        team.unitsSold = unitsSold;
                        team.capacity = caseStudy.financials.capacity;
                        team.products = _products;
                        team.color = randomColor();
                        team.marketShare = financials.marketShare;
                        team.revenueShare = financials.revenueShare;
                    }

                    initialState.key = gameStateKey;
                    initialState.teams = _teams;
                    initialState.users = [userKey];
                    await gscoll.insertOne(initialState);
                    delete initialState._id;
                }
                break;
            case 'team_play':
                const gameStateKey = uuid();
                for (var prop in game.teams) {
                    const list = Object.keys(game.teams[prop].users);
                    gameData.key = uuid();
                    gameData.game_state_key = gameStateKey;
                    gameData.users = list;
                    gameData.team = prop;
                    await gdcoll.insertOne(gameData);
                    delete gameData._id;

                    const team = game.teams[prop];
                    team.name = prop;
                    team.rank = 0;
                    team.market_rank = 0;
                    team.score = 0;
                    team.profit = caseStudy.financials.profit;
                    team.revenue = caseStudy.financials.revenue;
                    team.unitsSold = unitsSold;
                    team.capacity = caseStudy.financials.capacity;
                    team.products = _products;
                    team.color = randomColor();
                    team.marketShare = financials.marketShare;
                    team.revenueShare = financials.revenueShare;
                }

                initialState.key = gameStateKey;
                initialState.teams = game.teams;
                initialState.users = game.users;
                await gscoll.insertOne(initialState);
                delete initialState._id;
                break;

            default:
                return ({ rc: 'invalid game type ' + game.type });
        }

        await coll.updateOne({ key: input.data.key }, { $set: { game_status: 'assigned', assigned: new Date() } });
        const _game = await coll.findOne({ key: input.data.key }, { projection: { _id: 0 } });
        await socket.emit('game_assigned', { users: game.users, game: input.data.key });
        return ({ rc: 'success', data: _game });
    },

    '/admin/add_more_game_users': async (txn, db, socket, input) => {
        const coll = db.collection('games');
        const game = await coll.findOne({ key: input.data.key }, { projection: { _id: 0 } });

        const ucoll = db.collection('users');

        if (game.type == 'self_play') {
            const icoll = db.collection('institutes');
            const institute = await icoll.findOne({ key: game.institute });
            const maxGames = parseInt(institute.max_self_play_games || 0);

            if (maxGames) {
                for (var i = 0; i < game.users.length; i++) {
                    const user = await ucoll.findOne({ key: game.users[i] });
                    const ngames = parseInt(user.self_play_games || 0);
                    if (ngames >= maxGames) {
                        return { rc: 'Max Self Play Games exceeded for user: ' + user.email };
                    }
                }
            }

            for (var i = 0; i < game.users.length; i++) {
                const user = await ucoll.findOne({ key: game.users[i] });
                $set = {};
                $set['games.' + input.data.game_key + '.game_status'] = 'started';
                const ngames = parseInt(user.self_play_games || 0);
                $set.self_play_games = ngames + 1;
                await ucoll.updateOne({ key: user.key }, { $set: $set });
            }
        }

        const _gusers = game.users;
        const list = input.data.users;
        list.forEach((u) => {
            _gusers.push(u.key);
        });

        await coll.updateOne({ key: input.data.key }, { $set: { users: _gusers } });

        const gdcoll = db.collection('game_data');
        const gscoll = db.collection('game_state');

        const cscoll = db.collection('case_studies');
        const caseStudy = await cscoll.findOne({ key: game.case_study_key }, { projection: { _id: 0 } });

        const teams = game.teams;

        const gslist = await gscoll.find({ game_key: input.data.key }).toArray();
        const gstate = gslist.pop();

        const gdlist = await gdcoll.find({ game_key: input.data.key }).toArray();
        const gdata = gdlist.pop();
        const qdata = gdata.data['0'];

        const initialState = {
            game_key: input.data.key,
            game_status: 'assigned',
            demand: gstate.demand,
            production: gstate.production,
            sales: gstate.sales,
            distribution: gstate.distribution,
            assigned: new Date(),
            current_quarter: 1,
            institute: game.institute,
            state: game.state
        };

        const financials = qdata.financials;
        const products = qdata.products;

        const quarterData = {
            financials: financials,
            products: products,
            scores: { ...caseStudy.initial_scores },
            special_projects: {},
            news: qdata.news,
            specs: [...caseStudy.product.specs]
        };

        const gameData = {
            users: [],
            game_key: input.data.key,
            current_quarter: 1,
            game_status: 'assigned',
            data: {
                '0': quarterData,
                '1': quarterData
            },
            created: new Date(),
            institute: game.institute,
            state: game.state
        };

        for (var i = 0; i < list.length; i++) {
            const gameStateKey = uuid();
            const userKey = list[i].key;
            const _user = await ucoll.findOne({ key: userKey }, { projection: { _id: 0, password: 0 } });
            const _teams = {};
            _teams[_user.name] = { name: _user.name, users: {} };
            _teams[_user.name].users[userKey] = { key: userKey, name: _user.name, email: _user.email };

            const keys = Object.keys(teams);
            for (var j = 1; j < keys.length; j++) {
                _teams[keys[j]] = teams[keys[j]];
            }

            for (var prop in _teams) {
                gameData.key = uuid();
                gameData.game_state_key = gameStateKey;
                if (_user.name == prop) {
                    gameData.users = [userKey];
                }
                else {
                    gameData.users = [];
                }
                gameData.team = prop;
                await gdcoll.insertOne(gameData);
                delete gameData._id;

                const team = _teams[prop];
                team.name = prop;
                team.rank = 0;
                team.market_rank = 0;
                team.score = 0;
                team.profit = caseStudy.financials.profit;
                team.revenue = caseStudy.financials.revenue;
                team.unitsSold = qdata.unitsSold;
                team.capacity = caseStudy.financials.capacity;
                team.products = qdata.products;
                team.color = randomColor();
                team.marketShare = financials.marketShare;
                team.revenueShare = financials.revenueShare;
            }

            initialState.key = gameStateKey;
            initialState.teams = _teams;
            initialState.users = [userKey];
            await gscoll.insertOne(initialState);
            delete initialState._id;
        }

        const _game = await coll.findOne({ key: input.data.key }, { projection: { _id: 0 } });
        await socket.emit('game_assigned', { users: list, game: input.data.key });
        return ({ rc: 'success', data: _game });
    },

    '/admin/undo_quarter': async (txn, db, socket, input) => {
        const gameKey = input.data.key;

        const gcoll = db.collection('games');
        const gscoll = db.collection('game_state');
        const gdcoll = db.collection('game_data');

        const game = await gcoll.findOne({ key: gameKey }, { projection: { _id: 0 } });
        if (game.type == 'team_play') {
            var gameState = await gscoll.findOne({ game_key: gameKey }, { projection: { _id: 0 } });
            const currentQuarter = gameState.current_quarter;
            if (currentQuarter <= 1) {
                return ({ rc: 'Cannot undo game which is on first quarter' });
            }

            const prevQuarter = currentQuarter - 1;

            const gameDataList = await gdcoll.find({ game_key: gameKey }).toArray();
            const nqtrs = parseInt(game.no_of_qtrs || 1);

            const dt = new Date();

            for (var i = 0; i < gameDataList.length; i++) {
                const _gameData = gameDataList[i];
                delete _gameData.data[currentQuarter];
                _gameData.current_quarter = prevQuarter;
                _gameData.data[prevQuarter] = _gameData.data[prevQuarter - 1];
                _gameData.game_status = 'paused';
                _gameData.quarter_status = 'playing';
                await gdcoll.updateOne({ key: _gameData.key }, { $set: { current_quarter: prevQuarter, data: _gameData.data, game_status: 'paused', quarter_status: 'playing', started_dt: dt } });
            }

            await gcoll.updateOne({ key: gameKey }, { $set: { game_status: 'started' } });
            await gscoll.updateOne({ game_key: gameKey }, { $set: { current_quarter: prevQuarter, game_status: 'paused', started_dt: '', timer: game.timer } });

            const data = await gdcoll.find({ game_key: gameKey }, { projection: { _id: 0 } }).toArray();
            const gameData = {};
            data.forEach((gd) => {
                gameData[gd.team] = gd;
            });

            gameState = await gscoll.findOne({ game_key: gameKey }, { projection: { _id: 0 } });
            await socket.emit('quarter_undo', { game_key: gameState.game_key, current_quarter: prevQuarter, started_dt: null });
            return ({ rc: 'success', data: { game_data: gameData, game_state: gameState, started_dt: dt } });
        }

        if (game.type == 'assessment' || game.type == 'self_play') {
            const gameStateKey = input.data.game_state_key;
            var gameState = await gscoll.findOne({ key: gameStateKey }, { projection: { _id: 0 } });
            const currentQuarter = gameState.current_quarter;
            if (currentQuarter <= 1) {
                return ({ rc: 'Cannot undo game which is on first quarter' });
            }

            const prevQuarter = currentQuarter - 1;

            const gameDataList = await gdcoll.find({ game_state_key: gameStateKey }, { projection: { _id: 0 } }).toArray();
            const nqtrs = parseInt(game.no_of_qtrs || 1);

            const dt = new Date();

            for (var i = 0; i < gameDataList.length; i++) {
                const _gameData = gameDataList[i];
                delete _gameData.data[currentQuarter];
                _gameData.current_quarter = prevQuarter;
                _gameData.data[prevQuarter] = _gameData.data[prevQuarter - 1];
                _gameData.game_status = 'started';
                _gameData.quarter_status = 'playing';
                _gameData.game_rank = '';
                await gdcoll.updateOne({ key: _gameData.key }, { $set: { current_quarter: prevQuarter, data: _gameData.data, game_status: 'started', quarter_status: 'playing' } });
            }

            await gscoll.updateOne({ key: gameStateKey }, { $set: { current_quarter: prevQuarter, game_status: 'started' } });

            const data = await gdcoll.find({ game_state_key: gameStateKey }, { projection: { _id: 0 } }).toArray();
            var gameData = null;
            data.forEach((gd) => {
                if (gd.users && gd.users.length) {
                    gameData = gd;
                }
            });

            gameState = await gscoll.findOne({ key: gameStateKey }, { projection: { _id: 0 } });
            await socket.emit('quarter_undo', { game_key: gameState.game_key, current_quarter: prevQuarter });
            await socket.emit('game_reload', { game_key: gameState.game_key });
            return ({ rc: 'success', data: { game_data: gameData, game_state: gameState } });
        }

        return ({ rc: 'invalid game type' });
    },

    '/user/submit_data': async (txn, db, socket, input) => {
        const gcoll = db.collection('games');
        const gdcoll = db.collection('game_data');

        const gameKey = input.data.obj_key;

        const game = await gcoll.findOne({ users: input.user.key, key: gameKey });
        if (!game) {
            return ({ rc: 'error in game. game not found for user ' + input.user.key + ' game ' + gameKey });
        }

        if (game.type == 'team_play') {
            await gdcoll.updateOne({ users: input.user.key, game_key: gameKey }, { $set: { quarter_status: input.data.method || 'submitted' } });
            const data = await gdcoll.find({ game_key: gameKey }, { projection: { _id: 0 } }).toArray();
            const gameData = {};
            data.forEach((gd) => {
                gameData[gd.team] = gd;
            });

            await socket.emit('quarter_submitted', { user_key: input.user.key, team: input.data.team, game_key: gameKey, game_data: gameData });
            return ({ rc: 'success' });
        }
        else if (game.type == 'assessment' || game.type == 'self_play') {
            info(game.trace, '===>>> processing ' + game.type + ' quarter <<<===');
            const cscoll = db.collection('case_studies');
            const gscoll = db.collection('game_state');
            const caseStudy = await cscoll.findOne({ key: game.case_study_key }, { projection: { _id: 0 } });
            var _gameState = await gscoll.findOne({ users: input.user.key, game_key: gameKey }, { projection: { _id: 0 } });

            const gameDataList = await takeBotDecisions(db, input.user.key, game, _gameState, caseStudy);
            await gdcoll.updateOne({ users: input.user.key, game_key: gameKey }, { $set: { quarter_status: input.data.method || 'submitted' } });
            const ret = await processSelfPlay(db, socket, input.user.key, game, _gameState, gameDataList, caseStudy, game.type);
            if (ret) {
                await gdcoll.updateOne({ users: input.user.key, game_key: gameKey }, { $set: { quarter_status: 'playing' } });
                return ({ rc: ret });
            }

            _gameState = await gscoll.findOne({ users: input.user.key, game_key: gameKey }, { projection: { _id: 0 } });
            const _gameData = await gdcoll.findOne({ users: input.user.key, game_key: gameKey }, { projection: { _id: 0 } });

            await socket.emit('quarter_submitted', { user_key: input.user.key, team: input.data.team, game_key: gameKey, game_state: _gameState, game_data: _gameData });

            info(game.trace, 'completed self play processing');
            return ({ rc: 'success', data: { user_key: input.user.key, game_state: _gameState, game_data: _gameData } });
        }
    },

    '/admin/process_quarter': async (txn, db, socket, input) => {
        const gameKey = input.data.key;

        const cscoll = db.collection('case_studies');
        const gcoll = db.collection('games');
        const gscoll = db.collection('game_state');
        const gdcoll = db.collection('game_data');

        const game = await gcoll.findOne({ key: gameKey }, { projection: { _id: 0 } });

        info(game.trace, '===>>> processing quarter <<<===');
        trace(game.trace, 'input', input);

        const caseStudy = await cscoll.findOne({ key: game.case_study_key }, { projection: { _id: 0 } });

        const ret = await processTeamPlay(db, socket, gameKey, game, caseStudy);
        if (ret) {
            return ({ rc: ret });
        }

        const _gd = await gdcoll.find({ game_key: gameKey }, { projection: { _id: 0 } }).toArray();
        const gameData = {};
        _gd.forEach((gd) => {
            gameData[gd.team] = gd;
        });

        const _game = await gcoll.findOne({ key: gameKey }, { projection: { _id: 0 } });
        const gameState = await gscoll.findOne({ game_key: gameKey }, { projection: { _id: 0 } });

        info(game.trace, 'completed team play processing');
        await socket.emit('game_paused', { game_key: gameState.game_key, game_state_key: gameState.key, current_quarter: gameState.current_quarter, started_dt: '', game_status: gameState.game_status });
        await socket.emit('game_reload', { game_key: gameState.game_key });
        return ({ rc: 'success', data: { game: _game, game_data: gameData, game_state: gameState } });
    },

    '/admin/reset_quarter': async (txn, db, socket, input) => {
        const gameKey = input.data.key;

        const cscoll = db.collection('case_studies');
        const gcoll = db.collection('games');
        const gscoll = db.collection('game_state');
        const gdcoll = db.collection('game_data');

        const game = await gcoll.findOne({ key: gameKey }, { projection: { _id: 0 } });

        const dt = new Date();

        await gcoll.updateOne({ key: gameKey }, { $set: { game_status: 'started' } });
        await gscoll.updateOne({ game_key: gameKey }, { $set: { game_status: 'paused', started_dt: '' } });
        await gdcoll.updateMany({ game_key: gameKey }, { $set: { quarter_status: 'playing', game_status: 'paused', started_dt: '' } });

        const _gd = await gdcoll.find({ game_key: gameKey }, { projection: { _id: 0 } }).toArray();
        const gameData = {};
        _gd.forEach((gd) => {
            gd.started_dt = '';
            gameData[gd.team] = gd;
        });

        const _game = await gcoll.findOne({ key: gameKey }, { projection: { _id: 0 } });
        const gameState = await gscoll.findOne({ game_key: gameKey }, { projection: { _id: 0 } });

        await socket.emit('quarter_reset', { game_key: gameState.game_key, game_state_key: gameState.key, current_quarter: gameState.current_quarter, started_dt: null, game_status: gameState.game_status });
        await socket.emit('game_reload', { game_key: gameState.game_key });
        return ({ rc: 'success', data: { game: _game, game_data: gameData, game_state: gameState } });
    },

    '/admin/start_next_quarter': async (txn, db, socket, input) => {
        const gameKey = input.data.key;

        const cscoll = db.collection('case_studies');
        const gcoll = db.collection('games');
        const gscoll = db.collection('game_state');
        const gdcoll = db.collection('game_data');

        const game = await gcoll.findOne({ key: gameKey }, { projection: { _id: 0 } });

        const dt = new Date();

        await gcoll.updateOne({ key: gameKey }, { $set: { started_dt: dt } });
        await gscoll.updateOne({ game_key: gameKey }, { $set: { game_status: 'started', started_dt: dt } });
        await gdcoll.updateMany({ game_key: gameKey }, { $set: { quarter_status: 'playing', game_status: 'started', started_dt: dt } });

        const _gd = await gdcoll.find({ game_key: gameKey }, { projection: { _id: 0 } }).toArray();
        const gameData = {};
        _gd.forEach((gd) => {
            gameData[gd.team] = gd;
        });

        const _game = await gcoll.findOne({ key: gameKey }, { projection: { _id: 0 } });
        const gameState = await gscoll.findOne({ game_key: gameKey }, { projection: { _id: 0 } });

        await socket.emit('quarter_processed', { game_key: gameState.game_key, game_state_key: gameState.key, current_quarter: gameState.current_quarter, started_dt: dt, game_status: gameState.game_status });
        await socket.emit('game_reload', { game_key: gameState.game_key });
        return ({ rc: 'success', data: { game: _game, game_data: gameData, game_state: gameState } });
    },
};

const processValues = (game, currentQuarter, nqtrs, gameState, gameData, gameDataList, caseStudy) => {
    for (var i = 0; i < gameDataList.length; i++) {
        const _gameData = gameDataList[i];
        const gd = _gameData.data[currentQuarter];
        gameData[_gameData.team] = gd;
        gd.financials.cash_balance_open = _gameData.data[currentQuarter].financials.cash_balance;

        /*
        $set = {};
        $set.current_quarter = currentQuarter + 1;
        $set['data.' + (currentQuarter + 1)] = gdNext;

        await gdcoll.updateOne({game_key: gameKey, team: _gameData.team}, {$set: $set});
        */
    }

    const specValues = {};
    caseStudy.product.specs.forEach((spec) => {
        specValues[spec.feature] = {};
        spec.values.forEach((val) => {
            specValues[spec.feature][val.value] = { ...val };
        });
    });

    const nteams = gameDataList.length;

    var error = null;
    error = calculateDesirability(game, gameData, specValues);
    if (error) return error;
    error = probabilityOnPrice(game, gameData, caseStudy);
    if (error) return error;
    error = marketingProbability(game, gameData, caseStudy);
    if (error) return error;
    error = projectsProbability(game, gameData, caseStudy);
    if (error) return error;
    //marketReach(gameData, caseStudy);
    error = totalMarketSize(game, currentQuarter, gameData, gameState, caseStudy);
    if (error) return error;
    error = weightedProbability(game, gameData, caseStudy);
    if (error) return error;
    error = estimatedSales(game, currentQuarter, gameData, gameState, caseStudy);
    if (error) return error;
    error = redistributeUnmetDemand(game, gameData, gameState, caseStudy);
    if (error) return error;
    error = calculateDemand(game, nqtrs, nteams, currentQuarter, gameState, gameData, caseStudy);
    if (error) return error;
    error = calculateRevenue(game, currentQuarter, gameData, gameState, caseStudy);
    if (error) return error;
    error = calculateMarketShare(game, gameData, gameState);
    if (error) return error;
    error = calculateCosts(game, gameData, caseStudy, specValues);
    if (error) return error;
    error = calculateStockPrice(game, gameData, caseStudy);
    if (error) return error;
    error = calculateCompetition(game, gameState, gameData, caseStudy, gameDataList);
    if (error) return error;
    error = calculateScores(game, gameState, gameData, caseStudy, gameDataList);
    if (error) return error;
    error = calculateProjectImpact(game, gameData, caseStudy);
    if (error) return error;

    return null;
};

const processSelfPlay = async (db, socket, userKey, game, gameState, gameDataList, caseStudy, gameType) => {
    info(game.trace, 'processSelfPlay');

    const gameData = {};
    const nqtrs = parseInt(game.no_of_qtrs || 1);

    trace(game.trace, 'nqtrs', nqtrs);

    var currentQuarter = gameState.current_quarter || 1;

    trace(game.trace, 'currentQuarter', currentQuarter);

    const error = processValues(game, currentQuarter, nqtrs, gameState, gameData, gameDataList, caseStudy);
    if (!error) {
        await updateSelfPlayData(db, socket, nqtrs, currentQuarter, game, gameData, gameState, gameDataList, gameType);
    }

    return error;
};

const processTeamPlay = async (db, socket, gameKey, game, caseStudy) => {
    info(game.trace, 'processTeamPlay');

    debug = game.debug;

    const gcoll = db.collection('games');
    const gscoll = db.collection('game_state');
    const gdcoll = db.collection('game_data');

    const gameState = await gscoll.findOne({ game_key: gameKey }, { projection: { _id: 0 } });
    const gameDataList = await gdcoll.find({ game_key: gameKey }, { projection: { _id: 0 } }).toArray();
    const nqtrs = parseInt(game.no_of_qtrs || 1);

    trace(game.trace, 'nqtrs', nqtrs);

    var currentQuarter = gameState.current_quarter || 1;

    trace(game.trace, 'currentQuarter', currentQuarter);

    var error = null;

    if (game.useMarkets) {
        const gdi = {};
        for (var i = 0; i < gameDataList.length; i++) {
            const _gameData = gameDataList[i];
            gdi[_gameData.team] = gameDataList[i];
        }

        const teams = game.teams;
        const markets = {};

        for (var teamName in teams) {
            const teamMarket = teams[teamName].market;
            if (!markets[teamMarket]) {
                markets[teamMarket] = {};
            }
            markets[teamMarket][teamName] = gdi[teamName];
        }

        const gameData = {};
        for (var marketName in markets) {
            const _gameData = {};
            const _gameDataList = Object.values(markets[marketName]);
            trace(game.trace, 'processing market', marketName);

            error = processValues(game, currentQuarter, nqtrs, gameState, _gameData, _gameDataList, caseStudy);
            if (error) {
                return error;
            }
            trace(game.trace, 'finished processing market', marketName);
            for (var prop in _gameData) {
                gameData[prop] = _gameData[prop];
            }
        }

        await updateData(db, socket, nqtrs, currentQuarter, game, gameData, gameState, gameDataList);
    }
    else {
        const gameData = {};
        error = processValues(game, currentQuarter, nqtrs, gameState, gameData, gameDataList, caseStudy);
        if (!error) {
            await updateData(db, socket, nqtrs, currentQuarter, game, gameData, gameState, gameDataList);
        }
    }

    return error;
};

const scaleValue = (value, min, max, newMin, newMax) => {
    if (max == min) {
        return value;
    }
    const normalizedValue = (value - min) / (max - min);
    const scaledValue = normalizedValue * (newMax - newMin) + newMin;
    return scaledValue;
}

const calculateDesirability = (game, gameData, specValues) => {
    info(game.trace, 'calculateDesirability');
    var max = null;

    for (var team in gameData) {
        const gd = gameData[team];
        for (var i = 0; i < gd.products.length; i++) {
            const product = gd.products[i];
            var desirability = 0;
            for (var prop in product.specs) {
                const value = product.specs[prop];
                if (game.debug && parseInt(specValues[prop][value].weight || 0) <= 0) {
                    return 'weight is <= 0 for spec ' + prop + ':' + value + ' for product ' + product.name;
                }
                desirability += parseInt(specValues[prop][value].weight || 0);
            }
            if (game.debug && desirability < 0) {
                return 'desirability is < 0 for product ' + product.name;
            }
            product.desirability = desirability;
            if (max === null || product.desirability >= max) {
                max = product.desirability;
            }
        }
    }

    for (var team in gameData) {
        const gd = gameData[team];
        for (var i = 0; i < gd.products.length; i++) {
            const product = gd.products[i];
            product.desirability = max ? product.desirability * 100 / max : 0;
            if (game.debug && product.desirability < 0) {
                return 'product.desirability is < 0 for ' + product.name;
            }
            trace(game.trace, 'team', team);
            trace(game.trace, 'product.name', product.name);
            trace(game.trace, 'product.desirability', product.desirability);
        }
    }

    return null;
};

const probabilityOnPrice = (game, gameData, caseStudy) => {
    const calculateProbability = (k, price, idealPrice) => {
        //trace(game.trace, 'k', k);
        trace(game.trace, 'idealPrice', idealPrice);
        trace(game.trace, 'price', price);
        const effectiveness = k * idealPrice / price;
        return (idealPrice / price) < 0.01 || effectiveness < 0.01 ? 0 : effectiveness;
        //return idealPrice / price;
    };

    var total = 0;

    const segmentTotals = {};

    info(game.trace, 'probabilityOnPrice');

    for (var team in gameData) {
        const gd = gameData[team];
        trace(game.trace, 'team', team);
        for (var i = 0; i < gd.products.length; i++) {
            const product = gd.products[i];
            trace(game.trace, 'product.name', product.name);
            product.priceProbability = {};
            const price = parseInt(product.salesPrice || 0);
            for (var j = 0; j < caseStudy.market.segments.length; j++) {
                const segment = caseStudy.market.segments[j];
                trace(game.trace, 'segment.name', segment.name);
                const lowerConst = parseFloat(caseStudy.price_constants ? caseStudy.price_constants[segment.idx].lower : 1);
                const higherConst = parseFloat(caseStudy.price_constants ? caseStudy.price_constants[segment.idx].higher : 1);
                const idealPrice = parseInt(segment.ideal_price || 0);
                product.priceProbability[segment.idx] = calculateProbability(price < idealPrice ? lowerConst : higherConst, price, idealPrice);
                if (game.debug && product.priceProbability[segment.idx] < 0) {
                    return 'product.priceProbability[segment.idx] is < 0 for ' + segment.name;
                }
                total += product.priceProbability[segment.idx];
                if (!segmentTotals[segment.idx]) {
                    segmentTotals[segment.idx] = 0;
                }

                segmentTotals[segment.idx] += product.priceProbability[segment.idx];
            }

            trace(game.trace, 'product.priceProbability', product.priceProbability);
        }
    }

    for (var team in gameData) {
        const gd = gameData[team];
        trace(game.trace, 'team', team);
        gd.products.forEach((product) => {
            trace(game.trace, 'product.name', product.name);
            caseStudy.market.segments.forEach((segment) => {
                trace(game.trace, 'segment.name', segment.name);
                product.priceProbability[segment.idx] = product.priceProbability[segment.idx] * 100 / segmentTotals[segment.idx];
            });

            trace(game.trace, 'product.priceProbability', product.priceProbability);
        });
    }

    return null;
};

const marketingProbability = (game, gameData, caseStudy) => {
    info(game.trace, 'marketingProbability');
    var maxad = null;
    var maxprom = null;

    for (var team in gameData) {
        const gd = gameData[team];
        for (var i = 0; i < gd.products.length; i++) {
            const product = gd.products[i];
            trace(game.trace, 'caseStudy.price_constants.advertising_constant', caseStudy.price_constants.advertising_constant);
            trace(game.trace, 'caseStudy.price_constants.promotions_constant', caseStudy.price_constants.promotions_constant);
            trace(game.trace, 'product.marketing.advertising_budget', product.marketing.advertising_budget);
            trace(game.trace, 'product.marketing.promotions_budget', product.marketing.promotions_budget);

            product.advertisingProbability = parseFloat(caseStudy.price_constants.advertising_constant || 1) * parseInt(product.marketing.advertising_budget || 0);
            if (maxad === null || product.advertisingProbability >= maxad) {
                maxad = product.advertisingProbability;
            }

            if (game.debug && product.advertisingProbability < 0) {
                return 'product.advertisingProbability is < 0 for ' + product.name;
            }

            product.promotionsProbability = parseFloat(caseStudy.price_constants.promotions_constant || 1) * parseInt(product.marketing.promotions_budget || 0);
            if (maxprom === null || product.promotionsProbability >= maxprom) {
                maxprom = product.promotionsProbability;
            }

            if (game.debug && product.promotionsProbability < 0) {
                return 'product.promotionsProbability is < 0 for ' + product.name;
            }
        }
    }

    for (var team in gameData) {
        trace(game.trace, 'team', team);
        const gd = gameData[team];
        for (var i = 0; i < gd.products.length; i++) {
            const product = gd.products[i];
            trace(game.trace, 'product.name', product.name);
            product.advertisingProbability = maxad ? product.advertisingProbability * 100 / maxad : 0;
            if (game.debug && product.advertisingProbability < 0) {
                return 'product.advertisingProbability is < 0 for ' + product.name;
            }
            product.promotionsProbability = maxprom ? product.promotionsProbability * 100 / maxprom : 0;
            if (game.debug && product.promotionsProbability < 0) {
                return 'product.promotionsProbability is < 0 for ' + product.name;
            }
            trace(game.trace, 'product.advertisingProbability', product.advertisingProbability);
            trace(game.trace, 'product.promotionsProbability', product.promotionsProbability);
        }
    }

    return null;
};

const projectsProbability = (game, gameData, caseStudy) => {
    info(game.trace, 'projectsProbability');
    const projects = {};

    caseStudy.special_projects && caseStudy.special_projects.forEach((project) => {
        projects[project.key] = project;
        projects[project.key].optidx = {};
        project.options.forEach((opt) => {
            projects[project.key].optidx[opt.label] = opt;
        });
    });

    var maxTeam = 0;
    var maxProject = {};

    var projectInvestment = {};

    for (var team in gameData) {
        const gd = gameData[team];
        projectInvestment[team] = 0;
        var teamTotal = 0;
        for (var key in gd.special_projects) {
            const option = gd.special_projects[key];
            const project = projects[key];
            const investment = project.optidx[option] ? parseInt(project.optidx[option].investment || 0) : 0;
            projectInvestment[team] += investment;
            if (!maxProject[key]) {
                maxProject[key] = 0;
            }
            if (!maxProject[key] || investment > maxProject[key]) {
                const _criteriaKey = Object.keys(caseStudy.demand_criteria).pop();
                const criteria = caseStudy.demand_criteria[_criteriaKey];
                maxProject[key] = investment * parseInt(criteria[key] || 0) / 100;
            }
            teamTotal += maxProject[key];
        }

        gd.financials.projectProbability = teamTotal;

        if (!maxTeam || teamTotal > maxTeam) {
            maxTeam = teamTotal;
        }
    }

    for (var team in gameData) {
        const gd = gameData[team];
        gd.financials.projectsProbability = maxTeam ? gd.financials.projectsProbability * 100 / maxTeam : 0;
        if (game.debug && gd.financials.projectsProbability < 0) {
            return 'gd.financials.projectsProbability is < 0';
        }
        trace(game.trace, 'team', team);
        trace(game.trace, 'projectInvestment[team]', projectInvestment[team]);
        trace(game.trace, 'gd.financials.projectsProbability', gd.financials.projectsProbability);
    }

    return null;
};

const totalMarketSize = (game, currentQuarter, gameData, gameState, caseStudy) => {
    if (gameState['market_size_evaluated_' + currentQuarter]) {
        return null;
    }

    if (game.type == 'team_play' && game.useMarkets) {
        const markets = {};
        for (team in gameState.teams) {
            const market = gameState.teams[team].market;
            markets[market] = market;
        }

        gameState.evaluatedDemand = {};

        for (var prop in markets) {
            const gameStateDemand = gameState.demand[prop];
            gameState.evaluatedDemand[prop] = {};

            for (var segment in gameStateDemand) {
                var demand = gameStateDemand[segment][currentQuarter] ? parseInt(gameStateDemand[segment][currentQuarter]) : 0;

                const minVariance = parseInt(caseStudy.demand_change_criteria.min_natural_variance || 0);
                const maxVariance = parseInt(caseStudy.demand_change_criteria.max_natural_variance || 0);

                const randomValue = Math.random() * (maxVariance - minVariance) + minVariance;
                demand = Math.floor(demand + (demand * randomValue / 100));

                gameState.evaluatedDemand[prop][segment] = demand;
                if (game.debug && demand <= 0) {
                    return 'demand <= 0';
                }
            }
        }
    }
    else {
        const gameStateDemand = gameState.demand;
        gameState.evaluatedDemand = {};
        for (var segment in gameStateDemand) {
            var demand = gameStateDemand[segment][currentQuarter] ? parseInt(gameStateDemand[segment][currentQuarter]) : 0;

            const minVariance = parseInt(caseStudy.demand_change_criteria.min_natural_variance || 0);
            const maxVariance = parseInt(caseStudy.demand_change_criteria.max_natural_variance || 0);

            const randomValue = Math.random() * (maxVariance - minVariance) + minVariance;
            demand = Math.floor(demand + (demand * randomValue / 100));

            gameState.evaluatedDemand[segment] = demand;
            if (game.debug && demand <= 0) {
                return 'demand <= 0';
            }
        }
    }

    trace(game.trace, 'gameState.evaluatedDemand', gameState.evaluatedDemand);
    gameState['market_size_evaluated_' + currentQuarter] = true;

    return null;
};

const weightedProbability = (game, gameData, caseStudy) => {
    info(game.trace, 'weightedProbability');
    var sumTotal = 0;
    var prodTotal = 0;

    const targetFactor = parseInt(caseStudy.demand_change_criteria.demand_for_target_segment || 1);
    const nonTargetFactor = parseInt(caseStudy.demand_change_criteria.demand_for_non_target || 0);
    const maxSegment = {};

    for (var team in gameData) {
        trace(game.trace, 'team', team);
        const gd = gameData[team];
        for (var i = 0; i < gd.products.length; i++) {
            const product = gd.products[i];
            trace(game.trace, 'product.name', product.name);
            product.weightedProbability = {};

            for (var j = 0; j < caseStudy.market.segments.length; j++) {
                const segment = caseStudy.market.segments[j];
                trace(game.trace, 'segment.name', segment.name);
                const segmentFactor = product.target == segment.name ? targetFactor : nonTargetFactor;
                var featureFactor = parseInt(caseStudy.demand_criteria[segment.idx].features || 0) / 100;
                var priceFactor = parseInt(caseStudy.demand_criteria[segment.idx].price || 0) / 100;
                var advertisementFactor = parseInt(caseStudy.demand_criteria[segment.idx].advertisement || 0) / 100;
                var promotionsFactor = parseInt(caseStudy.demand_criteria[segment.idx].promotions || 0) / 100;

                trace(game.trace, 'featureFactor', featureFactor);
                trace(game.trace, 'priceFactor', priceFactor);
                trace(game.trace, 'advertisementFactor', advertisementFactor);
                trace(game.trace, 'promotionsFactor', promotionsFactor);
                trace(game.trace, 'gd.financials.projectsProbability', gd.financials.projectsProbability);

                featureFactor *= product.desirability;
                priceFactor *= product.priceProbability[segment.idx];
                advertisementFactor *= (product.advertisingProbability || 0);
                promotionsFactor *= (product.promotionsProbability || 0);
                const projectFactor = (gd.financials.projectsProbability || 0);

                trace(game.trace, 'featureFactor', featureFactor);
                trace(game.trace, 'priceFactor', priceFactor);
                trace(game.trace, 'advertisementFactor', advertisementFactor);
                trace(game.trace, 'promotionsFactor', promotionsFactor);
                trace(game.trace, 'projectFactor', projectFactor);

                const total = priceFactor * (featureFactor + advertisementFactor + promotionsFactor + projectFactor);
                product.weightedProbability[segment.name] = segmentFactor * total;

                if (!maxSegment[segment.name]) {
                    maxSegment[segment.name] = 0;
                }
                if (!maxSegment || product.weightedProbability[segment.name] > maxSegment[segment.name]) {
                    maxSegment[segment.name] = product.weightedProbability[segment.name];
                }

                if (game.debug && product.weightedProbability[segment.name] < 0) {
                    return 'product.weightedProbability[segment.name] < 0';
                }

                sumTotal += product.weightedProbability[segment.name];
            }
            trace(game.trace, 'product.weightedProbability', product.weightedProbability);
        }
    }

    for (var team in gameData) {
        trace(game.trace, 'team', team);
        const gd = gameData[team];
        for (var i = 0; i < gd.products.length; i++) {
            const product = gd.products[i];
            trace(game.trace, 'product.name', product.name);
            for (var j = 0; j < caseStudy.market.segments.length; j++) {
                const segment = caseStudy.market.segments[j];
                product.weightedProbability[segment.name] = maxSegment[segment.name] ? product.weightedProbability[segment.name] * 100 / maxSegment[segment.name] : 0;

                if (game.debug && product.weightedProbability[segment.name] < 0) {
                    return 'product.weightedProbability[segment.name] < 0';
                }
            }
            trace(game.trace, 'product.weightedProbability', product.weightedProbability);
        }
    }

    return null;
};

const estimatedSales = (game, currentQuarter, gameData, gameState, caseStudy) => {
    info(game.trace, 'estimatedSales');

    const segmentTotals = {};
    for (var team in gameData) {
        trace(game.trace, 'team', team);
        const gd = gameData[team];
        for (var i = 0; i < gd.products.length; i++) {
            const product = gd.products[i];
            for (var j = 0; j < caseStudy.market.segments.length; j++) {
                const segment = caseStudy.market.segments[j];
                if (!segmentTotals[segment.name]) {
                    segmentTotals[segment.name] = 0;
                }
                segmentTotals[segment.name] += product.weightedProbability[segment.name];
            }
        }
    }

    const segmentSales = {};
    for (var team in gameData) {
        const gd = gameData[team];
        segmentSales[team] = {};
        for (var i = 0; i < gd.products.length; i++) {
            const product = gd.products[i];
            segmentSales[team][product.name] = {};
            for (var j = 0; j < caseStudy.market.segments.length; j++) {
                var evaluatedDemand = null;
                if (game.useMarkets && game.type == 'team_play') {
                    const market = gameState.teams[team].market;
                    evaluatedDemand = gameState.evaluatedDemand[market];
                }
                else {
                    evaluatedDemand = gameState.evaluatedDemand;
                }

                const segment = caseStudy.market.segments[j];
                segmentSales[team][product.name][segment.name] = evaluatedDemand[segment.name] * product.weightedProbability[segment.name] / segmentTotals[product.target];
                if (game.debug && segmentSales[team][segment.name] < 0) {
                    return 'segmentSales[team][segment.name] < 0';
                }
            }
        }
    }

    trace(game.trace, 'segmentSales', segmentSales);

    const productSales = {};
    const productTotals = {};
    for (var team in gameData) {
        productSales[team] = {};
        productTotals[team] = {};
        const gd = gameData[team];
        const salesIncrease = 1 + (parseInt(gd.financials.sales_effectiveness_impact || 0) + parseInt(gd.financials.efficiency_increase)) / 100;

        for (var j = 0; j < caseStudy.market.segments.length; j++) {
            const segment = caseStudy.market.segments[j];
            productSales[team][segment.name] = {};

            for (var i = 0; i < gd.products.length; i++) {
                const product = gd.products[i];

                productSales[team][segment.name][product.name] = Math.round(segmentSales[team][product.name][segment.name] * salesIncrease);

                if (game.debug && productSales[team][segment.name][product.name] < 0) {
                    return 'productSales[team][segment.name][product.name] < 0';
                }

                if (!product.segmentDemand) {
                    product.segmentDemand = {};
                }
                product.segmentDemand[segment.name] = productSales[team][segment.name][product.name];

                if (!productTotals[team][product.name]) {
                    productTotals[team][product.name] = productSales[team][segment.name][product.name];
                }
                else {
                    productTotals[team][product.name] += productSales[team][segment.name][product.name];
                }
            }
        }
    }

    const _demand = {};
    for (var team in productSales) {
        const gd = gameData[team];
        for (var i = 0; i < gd.products.length; i++) {
            const product = gd.products[i];
            var totalDemand = 0;
            for (var seg in product.segmentDemand) {
                totalDemand += product.segmentDemand[seg];
            }
            product.potential_sales_demand = totalDemand;
        }
    }

    trace(game.trace, 'productSales', productSales);
    trace(game.trace, 'productTotals', productTotals);

    for (var team in gameData) {
        trace(game.trace, 'team', team);
        const gd = gameData[team];
        var unitsSold = 0;
        var potentialDemand = 0;
        var potentialSupply = 0;
        var plannedTotal = 0;
        var actualTotal = 0;

        var production = 0;
        gd.products.forEach((product) => {
            production += parseInt(product.plannedProduction || 0);
        });

        const productivityIncrease = 1 + (parseInt(gd.financials.productivity_increase || 0) / 100 + parseInt(gd.financials.productivity_impact || 0)) / 100;
        const existingWorkforce = parseInt(gd.financials.existing_workforce || 0);
        const plannedWorkforce = parseInt(gd.financials.planned_workforce || 0);
        const productManpower = parseFloat(caseStudy.product.product_manpower || 0);
        const requiredWorkforce = Math.ceil(production * productManpower / productivityIncrease);
        gd.financials.required_workforce = requiredWorkforce;
        const actualWorkforce = plannedWorkforce || existingWorkforce;

        trace(game.trace, 'existingWorkforce', existingWorkforce);
        trace(game.trace, 'plannedWorkforce', plannedWorkforce);
        trace(game.trace, 'gd.financials.required_workforce', gd.financials.required_workforce);
        trace(game.trace, 'actualWorkforce', actualWorkforce);

        gd.financials.existing_workforce = actualWorkforce;
        gd.financials.planned_workforce = actualWorkforce;

        for (var i = 0; i < gd.products.length; i++) {
            const product = gd.products[i];
            trace(game.trace, 'product.name', product.name);
            const plannedProduction = parseInt(product.plannedProduction || 0);
            trace(game.trace, 'plannedProduction', plannedProduction);

            var actualProduction = Math.floor((plannedProduction * actualWorkforce / requiredWorkforce) * (1 + parseFloat(gd.financials.productivity_increase) / 100));
            actualProduction = Math.min(actualProduction, plannedProduction);

            trace(game.trace, 'actualProduction', actualProduction);

            trace(game.trace, 'product.idealDistribution', product.idealDistribution);
            if (game.debug && product.idealDistribution.length < (parseInt(gameState.current_quarter || 0) + 1)) {
                return 'ideal distribution length is ' + product.idealDistribution.length + '. accessing ' + parseInt(gameState.current_quarter || 0);
            }

            const idealDistribution = { ...product.idealDistribution[parseInt(gameState.current_quarter || 0)] };
            const distribution = { ...product.channelDistribution };

            var totalDist = 0;
            var totalIdeal = 0;
            for (var prop in distribution) {
                if (parseFloat(distribution[prop] < 0)) {
                    return 'channel distribution for channel ' + prop + ' cannot be < 0';
                }
                if (game.debug && parseFloat(idealDistribution[prop] < 0)) {
                    return 'distribution for channel ' + prop + ' is < 0';
                }
                totalDist += Math.abs(parseFloat(distribution[prop] || 0));
                totalIdeal += Math.abs(parseFloat(idealDistribution[prop] || 0));
            }

            for (var prop in distribution) {
                distribution[prop] = Math.abs(parseFloat(distribution[prop] || 0)) / totalDist;
                idealDistribution[prop] = Math.abs(parseFloat(idealDistribution[prop] || 0)) / totalIdeal;
            }

            const inventory = product.channelInventory;

            trace(game.trace, 'idealDistribution', idealDistribution);
            trace(game.trace, 'distribution', distribution);
            trace(game.trace, 'inventory', inventory);

            var productInventory = 0;
            var unitsSoldUpdated = 0;
            var totalSupply = 0;
            product.channelDemand = {};

            for (var channel in distribution) {
                trace(game.trace, 'channel', channel);
                trace(game.trace, 'distribution[channel]', distribution[channel]);
                trace(game.trace, 'idealDistribution[channel]', idealDistribution[channel]);
                const supply = Math.floor(actualProduction * distribution[channel]) + parseInt(inventory[channel] || 0);
                const sold = Math.round(productTotals[team][product.name] * idealDistribution[channel]);
                product.channelDemand[channel] = sold;

                if (game.debug && supply < 0) {
                    return 'supply < 0';
                }

                if (game.debug && sold < 0) {
                    return 'sold < 0';
                }

                trace(game.trace, 'sold', sold);
                trace(game.trace, 'supply', supply);

                if (sold > supply) {
                    unitsSoldUpdated += supply;
                    inventory[channel] = 0;
                }
                else {
                    unitsSoldUpdated += sold;
                    inventory[channel] = supply - sold;
                }
                productInventory += inventory[channel];
                totalSupply += supply;
            }
            if (game.debug && unitsSoldUpdated < 0) {
                return 'unitsSoldUpdated < 0';
            }
            product.unitsSold = unitsSoldUpdated;
            product.potential_sales_supply = totalSupply;
            product.actualProduction = actualProduction;
            product.channelInventory = inventory;
            potentialDemand += product.potential_sales_demand;
            potentialSupply += product.potential_sales_supply;
            plannedTotal += plannedProduction;
            actualTotal += actualProduction;

            if (game.debug && plannedProduction < 0) {
                return 'plannedProduction < 0';
            }

            if (game.debug && actualProduction < 0) {
                return 'actualProduction < 0';
            }

            unitsSold += product.unitsSold;
            product.inventory = productInventory;

            trace(game.trace, 'product.unitsSold', product.unitsSold);
            trace(game.trace, 'product.potential_sales_demand', product.potential_sales_demand);
            trace(game.trace, 'product.potential_sales_supply', product.potential_sales_supply);
            trace(game.trace, 'product.actualProduction', product.actualProduction);
            trace(game.trace, 'product.inventory', product.inventory);
        }

        gd.financials.unitsSold = unitsSold;
        gd.financials.fulfilment = Math.round(gd.financials.unitsSold * 100 / potentialSupply);
        gd.financials.potential_sales_demand = potentialDemand;
        gd.financials.potential_sales_supply = potentialSupply;
        gd.financials.plannedProduction = plannedTotal;
        gd.financials.production = actualTotal;

        trace(game.trace, 'gd.financials.unitsSold', gd.financials.unitsSold);
        trace(game.trace, 'gd.financials.fulfilment', gd.financials.fulfilment);
        trace(game.trace, 'gd.financials.potential_sales_demand', gd.financials.potential_sales_demand);
        trace(game.trace, 'gd.financials.potential_sales_supply', gd.financials.potential_sales_supply);
        trace(game.trace, 'gd.financials.plannedProduction', gd.financials.plannedProduction);
        trace(game.trace, 'gd.financials.production', gd.financials.production);
    }

    return null;
};

const redistributeUnmetDemand = (game, gameData, gameState, caseStudy) => {
    if (!game.allowRedistribution) {
        return null;
    }

    const level = parseInt(caseStudy.redistribution_level || 0);

    if (game.useMarkets && game.type == 'team_play') {
        const markets = {};
        for (team in gameState.teams) {
            const market = gameState.teams[team].market;
            if (!markets[market]) {
                markets[market] = {};
            }
            markets[market][team] = team;
        }
    
        for (var prop in markets) {
            const evaluatedDemand = gameState.evaluatedDemand[prop];
            var demand = 0;
            for (var prop in evaluatedDemand) {
                demand += parseInt(evaluatedDemand[prop]);
            }

            var sold = 0;

            for (var team in markets[prop]) {
                const gd = gameData[team];

                for (var i = 0; i < gd.products.length; i++) {
                    const product = gd.products[i];
                    sold += product.unitsSold;
                }
            }

            if (sold >= demand) {
                return null;
            }

            const unmet = demand - sold;
            const pct = unmet * 100 / demand;
            if (pct < level) {
                return null;
            }

            const segmentTotals = {};

            for (var team in markets[prop]) {
                const gd = gameData[team];
                for (var i = 0; i < gd.products.length; i++) {
                    const product = gd.products[i];
                    for (var seg in product.segmentDemand) {
                        if (!segmentTotals[seg]) {
                            segmentTotals[seg] = 0;
                        }
                        segmentTotals[seg] += product.segmentDemand[seg];
                    }
                }
            }

            for (var team in markets[prop]) {
                const gd = gameData[team];
                var potentialSupply = 0;

                for (var i = 0; i < gd.products.length; i++) {
                    const product = gd.products[i];

                    for (var seg in product.segmentDemand) {
                        const segmentSales = Math.round(product.segmentDemand[seg] * unmet / segmentTotals[seg]);
                        const idealDistribution = { ...product.idealDistribution[parseInt(gameState.current_quarter || 0)] };

                        for (var channel in product.channelDistribution) {
                            const supply = parseInt(product.channelInventory[channel] || 0);
                            if (!supply) {
                                continue;
                            }

                            const sold = Math.round(segmentSales * idealDistribution[channel] / 100);
                            if (!sold) {
                                continue;
                            }

                            if (sold >= supply) {
                                product.unitsSold += supply;
                                product.channelInventory[channel] = 0;
                                product.inventory -= supply;
                                gd.financials.unitsSold += supply;
                            }
                            else if (sold < supply) {
                                product.unitsSold += sold;
                                product.channelInventory[channel] -= sold;
                                product.inventory -= sold;
                                gd.financials.unitsSold += sold;
                            }
                        }
                    }
                    potentialSupply += product.potential_sales_supply;
                }
                gd.financials.fulfilment = Math.round(gd.financials.unitsSold * 100 / potentialSupply);
            }
        }
    }
    else {
        const evaluatedDemand = gameState.evaluatedDemand;
        var demand = 0;
        for (var prop in evaluatedDemand) {
            demand += parseInt(evaluatedDemand[prop]);
        }

        var sold = 0;

        for (var team in gameData) {
            const gd = gameData[team];

            for (var i = 0; i < gd.products.length; i++) {
                const product = gd.products[i];
                sold += product.unitsSold;
            }
        }

        if (sold >= demand) {
            return null;
        }

        const unmet = demand - sold;
        const pct = unmet * 100 / demand;
        if (pct < level) {
            return null;
        }

        const segmentTotals = {};

        for (var team in gameData) {
            const gd = gameData[team];
            for (var i = 0; i < gd.products.length; i++) {
                const product = gd.products[i];
                for (var seg in product.segmentDemand) {
                    if (!segmentTotals[seg]) {
                        segmentTotals[seg] = 0;
                    }
                    segmentTotals[seg] += product.segmentDemand[seg];
                }
            }
        }

        for (var team in gameData) {
            const gd = gameData[team];
            var potentialSupply = 0;

            for (var i = 0; i < gd.products.length; i++) {
                const product = gd.products[i];

                for (var seg in product.segmentDemand) {
                    const segmentSales = Math.round(product.segmentDemand[seg] * unmet / segmentTotals[seg]);
                    const idealDistribution = { ...product.idealDistribution[parseInt(gameState.current_quarter || 0)] };

                    for (var channel in product.channelDistribution) {
                        const supply = parseInt(product.channelInventory[channel] || 0);
                        if (!supply) {
                            continue;
                        }

                        const sold = Math.round(segmentSales * idealDistribution[channel] / 100);
                        if (!sold) {
                            continue;
                        }

                        if (sold >= supply) {
                            product.unitsSold += supply;
                            product.channelInventory[channel] = 0;
                            product.inventory -= supply;
                            gd.financials.unitsSold += supply;
                        }
                        else if (sold < supply) {
                            product.unitsSold += sold;
                            product.channelInventory[channel] -= sold;
                            product.inventory -= sold;
                            gd.financials.unitsSold += sold;
                        }
                    }
                }
                potentialSupply += product.potential_sales_supply;
            }
            gd.financials.fulfilment = Math.round(gd.financials.unitsSold * 100 / potentialSupply);
        }
    }

    return null;
};

const calculateDemand = (game, nqtrs, nteams, currentQuarter, gameState, gameData, caseStudy) => {
    if (gameState['demand_updated_' + currentQuarter]) {
        return null;
    }

    info(game.trace, 'calculateDemand');

    if (game.type == 'team_play' && game.useMarkets) {
        const markets = {};
        for (team in gameState.teams) {
            const market = gameState.teams[team].market;
            if (!markets[market]) {
                markets[market] = {};
            }
            markets[market][team] = team;
        }

        for (var market in markets) {
            var demand = gameState.demand[market];
            for (var prop in demand) {
                for (var i = 0; i < nqtrs; i++) {
                    if (i < currentQuarter) {
                        continue;
                    }

                    if (i == currentQuarter) {
                        demand[prop][i] = gameState.evaluatedDemand[market][prop];
                        continue;
                    }

                    var _demand = demand[prop][i - 1] ? parseInt(demand[prop][i - 1]) : 0;

                    const minVariance = caseStudy.demand_change_criteria.demand_variance_min ? parseInt(caseStudy.demand_change_criteria.demand_variance_min) : 0;
                    const maxVariance = caseStudy.demand_change_criteria.demand_variance_max ? parseInt(caseStudy.demand_change_criteria.demand_variance_max) : 0;

                    const randomValue = Math.random() * (maxVariance - minVariance) + minVariance;

                    _demand = _demand * (1 + randomValue / 100);
                    demand[prop][i] = Math.floor(_demand);

                    if (game.debug && demand[prop][i] <= 0) {
                        return 'demand[prop][i] <= 0';
                    }    
                }
            }    
        }
        gameState.demand[market] = demand;

        var now = 0;
        var prev = 0;
        for (var prop in demand) {
            now += parseInt(demand[prop][1] || 0);
            prev += parseInt(demand[prop][0] || 0);
        }

        var type = null;
        const diff = Math.round((now - prev) * 100 / prev);
        if (diff >= -3 && diff <= 3) {
            type = 'neutral';
        }
        else if (diff > 3) {
            type = 'increase';
        }
        else if (diff < -3) {
            type = 'decrease';
        }

        const gidx = Math.round(Math.random() * (caseStudy.demandMessages.general.length - 1));
        const midx = Math.round(Math.random() * (caseStudy.demandMessages[type].length - 1));

        const news = [];
        caseStudy.demandMessages.general[gidx].type = 'news';
        news.push(caseStudy.demandMessages.general[gidx]);
        caseStudy.demandMessages[type][midx].type = 'news';
        news.push(caseStudy.demandMessages[type][midx]);

        for (var team in markets[market]) {
            const gd = gameData[team];
            if (!gd) {
                continue;
            }
            gd.news = [...news];
        }
    } else {
        var demand = gameState.demand;
        for (var prop in demand) {
            for (var i = 0; i < nqtrs; i++) {
                if (i < currentQuarter) {
                    continue;
                }

                if (i == currentQuarter) {
                    demand[prop][i] = gameState.evaluatedDemand[prop];
                    continue;
                }

                var _demand = demand[prop][i - 1] ? parseInt(demand[prop][i - 1]) : 0;

                const minVariance = caseStudy.demand_change_criteria.demand_variance_min ? parseInt(caseStudy.demand_change_criteria.demand_variance_min) : 0;
                const maxVariance = caseStudy.demand_change_criteria.demand_variance_max ? parseInt(caseStudy.demand_change_criteria.demand_variance_max) : 0;

                const randomValue = Math.random() * (maxVariance - minVariance) + minVariance;

                _demand = _demand * (1 + randomValue / 100);
                demand[prop][i] = Math.floor(_demand);

                if (game.debug && demand[prop][i] <= 0) {
                    return 'demand[prop][i] <= 0';
                }

            }
        }
        gameState.demand = demand;

        var now = 0;
        var prev = 0;
        for (var prop in demand) {
            now += parseInt(demand[prop][1] || 0);
            prev += parseInt(demand[prop][0] || 0);
        }

        var type = null;
        const diff = Math.round((now - prev) * 100 / prev);
        if (diff >= -3 && diff <= 3) {
            type = 'neutral';
        }
        else if (diff > 3) {
            type = 'increase';
        }
        else if (diff < -3) {
            type = 'decrease';
        }

        const gidx = Math.round(Math.random() * (caseStudy.demandMessages.general.length - 1));
        const midx = Math.round(Math.random() * (caseStudy.demandMessages[type].length - 1));

        const news = [];
        caseStudy.demandMessages.general[gidx].type = 'news';
        news.push(caseStudy.demandMessages.general[gidx]);
        caseStudy.demandMessages[type][midx].type = 'news';
        news.push(caseStudy.demandMessages[type][midx]);    

        for (var team in gameData) {
            const gd = gameData[team];
            gd.news = [...news];
        }
    }
};

const calculateRevenue = (game, currentQuarter, gameData, gameState, caseStudy) => {
    info(game.trace, 'calculateRevenue');
    const unitsSoldTeamSegment = {};

    for (var team in gameData) {
        var totalRevenue = 0;
        trace(game.trace, 'team', team);
        const gd = gameData[team];

        for (var i = 0; i < gd.products.length; i++) {
            const product = gd.products[i];
            var unitsSoldProduct = product.unitsSold;
            trace(game.trace, 'unitsSoldProduct', unitsSoldProduct);
            const salesPrice = parseInt(product.salesPrice || 0);
            trace(game.trace, 'salesPrice', salesPrice);
            product.revenue = salesPrice * product.unitsSold;
            trace(game.trace, 'product.revenue', product.revenue);
            totalRevenue += product.revenue;
        }

        if (totalRevenue <= 0) {
            return 'The given values would result in total revenue to be less than or equal to 0';
        }

        gd.financials.revenue = totalRevenue;
        gd.financials.administrative_costs = Math.round((gd.financials.revenue * parseInt(gd.financials.admin_overhead || 0) / 100) + parseInt(gd.financials.fixed_admin_cost || 0));

        trace(game.trace, 'gd.financials.revenue', gd.financials.revenue);

        const taxRate = parseInt(caseStudy.financials.sales_tax_rate || 0);
        gd.financials.sales_tax = Math.floor(totalRevenue * taxRate / 100);

        if (game.debug && gd.financials.sales_tax < 0) {
            return 'gd.financials.sales_tax < 0';
        }

        gameState.teams[team].unitsSold = gd.financials.unitsSold;
        gameState.teams[team].revenue = totalRevenue;
    }
    return null;
};

const calculateMarketShare = (game, gameData, gameState) => {
    info(game.trace, 'calculateMarketShare');
    var totalUnitsSold = 0;
    var totalRevenue = 0;
    for (var team in gameData) {
        const gd = gameData[team];
        totalUnitsSold += gd.financials.unitsSold;
        totalRevenue += gd.financials.revenue;
    }

    const totals = {};
    const totalRevenues = {};

    for (var team in gameData) {
        const gd = gameData[team];
        gd.products.forEach((product) => {
            totals[product.target] = parseInt(totals[product.target] || 0) + product.unitsSold;
            totalRevenues[product.target] = parseInt(totalRevenues[product.target] || 0) + (product.unitsSold * parseInt(product.salesPrice || 0));
        });
    }

    for (var team in gameData) {
        const gd = gameData[team];
        for (var i = 0; i < gd.products.length; i++) {
            const product = gd.products[i];

            product.marketShare = Math.round(product.unitsSold * 10000 / totalUnitsSold) / 100;
            if (game.debug && product.marketShare < 0) {
                return 'product.marketShare < 0';
            }

            product.revenueShare = Math.round(product.revenue * 10000 / totalRevenue) / 100;
            if (game.debug && product.marketShare < 0) {
                return 'product.marketShare < 0';
            }

            product.marketShareSegment = Math.round(product.unitsSold * 10000 / totals[product.target]) / 100;
            if (game.debug && product.marketShareSegment < 0) {
                return 'product.marketShare < 0';
            }

            product.revenueShareSegment = Math.round(product.revenue * 10000 / totalRevenues[product.target]) / 100;
            if (game.debug && product.revenueShareSegment < 0) {
                return 'product.revenueShare < 0';
            }
        }
        gd.financials.marketShare = Math.round(gd.financials.unitsSold * 10000 / totalUnitsSold) / 100;
        if (game.debug && gd.financials.marketShare < 0) {
            return 'gd.financials.marketShare < 0';
        }

        gd.financials.revenueShare = Math.round(gd.financials.revenue * 10000 / totalRevenue) / 100;
        if (game.debug && gd.financials.revenueShare < 0) {
            return 'gd.financials.revenueShare < 0';
        }

        gameState.teams[team].marketShare = gd.financials.marketShare;
        gameState.teams[team].revenueShare = gd.financials.revenueShare;
        gameState.teams[team].potential_sales_demand = gd.financials.potential_sales_demand;
        gameState.teams[team].potential_sales_supply = gd.financials.potential_sales_supply;
        trace(game.trace, 'team', team);
        trace(game.trace, 'gd.financials.marketShare', gd.financials.marketShare);
    }
    return null;
};

const calculateCosts = (game, gameData, caseStudy, specValues) => {
    var error = null;
    for (var team in gameData) {
        trace(game.trace, 'team', team);
        const gd = gameData[team];
        error = calculateProductCost(game, gd, specValues, caseStudy);
        if (error) return error;
        error = calculateManpowerCost(game, gd, caseStudy);
        if (error) return error;
        error = processInvestments(game, gd, caseStudy);
        if (error) return error;
        error = processInventory(game, gd, caseStudy);
        if (error) return error;
        error = processSharesIssue(game, gd, caseStudy);
        if (error) return error;
        error = processLoans(game, gd, caseStudy);
        if (error) return error;
        error = calculatePromotionsCost(game, gd, caseStudy);
        if (error) return error;
        error = processIncome(game, gd, caseStudy);
        if (error) return error;
        error = processDividend(game, gd, caseStudy);
        if (error) return error;
        error = processCash(game, gd, caseStudy);
        if (error) return error;
        error = processEmergencyLoan(game, gd, caseStudy);
        if (error) return error;
        error = processBalanceSheet(game, gd, caseStudy);
        if (error) return error;
        error = calculateFinancialRatios(game, gd, caseStudy);
        if (error) return error;
    }

    return null;
};

const calculateProductCost = (game, gd, specValues, caseStudy) => {
    info(game.trace, 'calculateProductCost');

    const materialCostReduction = 1 - parseInt(gd.financials.material_cost_impact || 0) / 100;
    const productOverhead = parseInt(caseStudy.product.overhead_cost || 0);

    var materialCost = 0;

    for (var i = 0; i < gd.products.length; i++) {
        const product = gd.products[i];
        var featureCost = 0;
        for (var prop in product.specs) {
            const val = product.specs[prop];
            featureCost += parseInt(specValues[prop][val].cost || 0);
        }

        product.cost = featureCost + productOverhead;
        if (game.debug && product.cost <= 0) {
            return 'product.cost <= 0';
        }

        materialCost += Math.round(product.cost * parseInt(product.actualProduction || 0) * materialCostReduction);
    }

    gd.financials.material_cost = materialCost;
    if (game.debug && gd.financials.material_cost < 0) {
        return 'gd.financials.material_cost < 0';
    }

    trace(game.trace, 'gd.financials.material_cost', gd.financials.material_cost);

    return null;
};

const calculateManpowerCost = (game, gd, caseStudy) => {
    info(game.trace, 'calculateManpowerCost');
    const existing = parseInt(gd.financials.existing_workforce || 0);
    const planned = parseInt(gd.financials.planned_workforce || gd.financials.existing_workforce || 0);
    const salary = parseInt(gd.financials.avg_salary || 0);
    gd.financials.salary_cost = planned * salary;
    if (game.debug && gd.financials.salary_cost < 0) {
        return 'gd.financials.salary_cost < 0';
    }

    if (existing > planned) {
        const diff = existing - planned;
        const firingCost = parseInt(gd.financials.avg_firing_cost || 0);
        gd.financials.recruitment_cost = firingCost * diff;
        if (game.debug && gd.financials.recruitment_cost < 0) {
            return 'gd.financials.recruitment_cost < 0';
        }
    }
    else if (existing < planned) {
        const diff = planned - existing;
        const hiringCost = parseInt(gd.financials.avg_hiring_cost || 0);
        gd.financials.recruitment_cost = hiringCost * diff;
        if (game.debug && gd.financials.recruitment_cost < 0) {
            return 'gd.financials.recruitment_cost < 0';
        }
    }
    else {
        gd.financials.recruitment_cost = 0;
    }

    gd.financials.employment_cost = gd.financials.salary_cost + gd.financials.recruitment_cost;
    gd.financials.existing_workforce = planned;
    gd.financials.planned_workforce = planned;

    if (game.debug && planned < 0) {
        return 'planned < 0';
    }
    if (game.debug && gd.financials.employment_cost < 0) {
        return 'gd.financials.employment_cost < 0';
    }

    trace(game.trace, 'gd.financials.salary_cost', gd.financials.salary_cost);
    trace(game.trace, 'gd.financials.recruitment_cost', gd.financials.recruitment_cost);
    trace(game.trace, 'gd.financials.employment_cost', gd.financials.employment_cost);
    trace(game.trace, 'gd.financials.existing_workforce', gd.financials.existing_workforce);
    trace(game.trace, 'gd.financials.planned_workforce', gd.financials.planned_workforce);

    const labourPct = parseInt(caseStudy.financials.labour_cost_pct || 0);
    const salesPct = 100 - labourPct;
    const fixedLabourCost = parseInt(caseStudy.financials.fixed_labour_cost || 0);
    const fixedSalesCost = parseInt(caseStudy.financials.fixed_sales_cost || 0);

    gd.financials.labour_cost = Math.round(fixedLabourCost + (gd.financials.employment_cost * labourPct / 100));
    gd.financials.sales_force = Math.round(fixedSalesCost + (gd.financials.employment_cost * salesPct / 100));

    if (game.debug && gd.financials.labour_cost < 0) {
        return 'gd.financials.labour_cost < 0';
    }

    if (game.debug && gd.financials.sales_force < 0) {
        return 'gd.financials.employment_cost < 0';
    }

    trace(game.trace, 'gd.financials.labour_cost', gd.financials.labour_cost);
    trace(game.trace, 'gd.financials.sales_force', gd.financials.sales_force);

    return null;
};

const processInvestments = (game, gd, caseStudy) => {
    info(game.trace, 'processInvestments');
    const prevProjectInvestment = parseInt(gd.financials.investment_projects || 0);
    const projDepRate = parseFloat(caseStudy.financials.depreciation_rate_projects || 0);
    const projDep = parseInt(gd.financials.depreciation_projects || 0);

    const projects = {};

    caseStudy.special_projects && caseStudy.special_projects.forEach((project) => {
        projects[project.key] = project;
        projects[project.key].optidx = {};
        project.options.forEach((opt) => {
            projects[project.key].optidx[opt.label] = opt;
        });
    });

    var investmentProjects = 0;

    for (var key in gd.special_projects) {
        const option = gd.special_projects[key];
        investmentProjects += projects[key].optidx[option] ? parseInt(projects[key].optidx[option].investment) : 0;
    }

    gd.financials.investment_projects = prevProjectInvestment + investmentProjects;
    gd.financials.current_depreciation_projects = Math.floor(gd.financials.investment_projects * projDepRate / 100);
    gd.financials.depreciation_projects = projDep + gd.financials.current_depreciation_projects;
    gd.financials.cashflow_projects = investmentProjects;

    trace(game.trace, 'gd.financials.investment_projects', gd.financials.investment_projects);
    trace(game.trace, 'gd.financials.depreciation_projects', gd.financials.depreciation_projects);
    trace(game.trace, 'gd.financials.cashflow_projects', gd.financials.cashflow_projects);

    const prevResearchInvestment = parseInt(gd.financials.investment_research || 0);
    const researchDepRate = parseFloat(caseStudy.financials.depreciation_rate_research || 0);
    const newInvestmentResearch = parseInt(gd.financials.innovation_budget || 0);
    const resdep = parseInt(gd.financials.depreciation_research || 0);

    gd.financials.investment_research = prevResearchInvestment + newInvestmentResearch;
    gd.financials.cashflow_research = newInvestmentResearch;
    gd.financials.current_depreciation_research = parseInt(gd.financials.investment_research * researchDepRate / 100);
    gd.financials.depreciation_research = resdep + gd.financials.current_depreciation_research;

    trace(game.trace, 'gd.financials.depreciation_research', gd.financials.depreciation_research);
    trace(game.trace, 'gd.financials.investment_research', gd.financials.investment_research);
    trace(game.trace, 'gd.financials.cashflow_research', gd.financials.cashflow_research);

    const prevValue = parseInt(gd.financials.investment_plant || 0);
    var capacity = parseInt(gd.financials.capacity || 0);
    const cumdep = parseInt(gd.financials.depreciation_plant || 0);
    const plantDepRate = parseFloat(caseStudy.financials.depreciation_rate_plant || 0);
    var newInvestment = 0;

    if (gd.selectedPlant && gd.selectedPlant != 'None') {
        var found = false;
        for (var i = 0; i < caseStudy.plants.options.length; i++) {
            const plant = caseStudy.plants.options[i];
            if (plant.label == gd.selectedPlant) {
                newInvestment = parseInt(plant.investment || 0);
                capacity += parseInt(plant.capacity || 0);
                break;
            }
        }
    }

    gd.selectedPlant = 'None';

    gd.financials.investment_plant = prevValue + newInvestment;
    gd.financials.capacity = capacity;
    gd.financials.cashflow_plant = newInvestment;

    gd.financials.current_depreciation_plant = Math.floor(prevValue * plantDepRate / 100);
    gd.financials.depreciation_plant = cumdep + gd.financials.current_depreciation_plant;
    gd.financials.investment_total = gd.financials.investment_plant + gd.financials.investment_research + gd.financials.investment_projects;
    gd.financials.depreciation_total = gd.financials.depreciation_plant + gd.financials.depreciation_research + gd.financials.depreciation_projects;

    trace(game.trace, 'gd.financials.depreciation_plant', gd.financials.depreciation_plant);
    trace(game.trace, 'gd.financials.investment_plant', gd.financials.investment_plant);
    trace(game.trace, 'gd.financials.cashflow_plant', gd.financials.cashflow_plant);
    trace(game.trace, 'gd.financials.investment_total', gd.financials.investment_total);

    const investment = parseInt(gd.financials.invest || 0);
    const withdraw = parseInt(gd.financials.withdraw || 0);
    const prevInvestment = parseInt(gd.financials.investment_amount || 0);

    gd.financials.cashflow_investment = investment - withdraw;
    gd.financials.investment_amount = prevInvestment + gd.financials.cashflow_investment;

    const irate = parseFloat(gd.financials.investment_interest_rate || 0);
    const interest = Math.round(gd.financials.investment_amount * irate / 100);
    gd.financials.interest_income = interest;

    trace(game.trace, 'gd.financials.interest_income', gd.financials.interest_income);
    trace(game.trace, 'gd.financials.investment_amount', gd.financials.investment_amount);
    trace(game.trace, 'gd.financials.cashflow_investment', gd.financials.cashflow_investment);

    return null;
};

const processInventory = (game, gd, caseStudy) => {
    info(game.trace, 'processInventory');
    var prevInventory = 0;
    var newInventory = 0;
    var cost = 0;
    //const openingInventory = gd.financials.inventory;
    const openingInventoryCost = parseInt(gd.financials.inventory_cost || 0);
    //var closingInventory = 0;
    gd.products.forEach((product) => {
        prevInventory += parseInt(product.prev_inventory || 0);
        newInventory += parseInt(product.inventory || 0);
        cost += product.cost * parseInt(product.inventory || 0);
    });

    gd.financials.change_in_inventory = prevInventory - newInventory;
    gd.financials.opening_inventory_cost = openingInventoryCost;
    gd.financials.inventory_cost = cost;
    gd.financials.change_in_inventory_cost = gd.financials.opening_inventory_cost - gd.financials.inventory_cost;

    trace(game.trace, 'gd.financials.change_in_inventory', gd.financials.change_in_inventory);
    trace(game.trace, 'gd.financials.opening_inventory_cost', gd.financials.opening_inventory_cost);
    trace(game.trace, 'gd.financials.inventory_cost', gd.financials.inventory_cost);
    trace(game.trace, 'gd.financials.change_in_inventory_cost', gd.financials.change_in_inventory_cost);
};

const processSharesIssue = (game, gd, caseStudy) => {
    info(game.trace, 'processSharesIssue');
    const stockPrice = parseFloat(gd.financials.stock_price || 0);
    const sharesIssued = parseInt(gd.financials.shares_issued || 0);
    const issueShares = parseInt(gd.financials.issue_shares || 0);

    var sharePremium = parseInt(gd.financials.share_premium || 0);

    if (issueShares) {
        gd.financials.stock_sale = issueShares * stockPrice;
        gd.financials.shares_issued = sharesIssued + issueShares;

        sharePremium += parseInt((stockPrice - parseFloat(gd.financials.shares_facevalue || 0)) * parseInt(issueShares || 0));

        trace(game.trace, 'gd.financials.stock_sale', gd.financials.stock_sale);
        trace(game.trace, 'gd.financials.shares_issued', gd.financials.shares_issued);
    }
    else {
        gd.financials.stock_sale = 0;
        gd.financials.issue_shares = 0;
    }

    gd.financials.share_premium = sharePremium;
};

const processLoans = (game, gd, caseStudy) => {
    info(game.trace, 'processLoans');
    gd.financials.emergency_loan_paid = parseInt(gd.financials.emergency_loan_taken || 0);
    gd.financials.emergency_loan_taken = 0;

    const duration = parseInt(caseStudy.financials.debt_duration || 0);
    if (!gd.financials.debt) {
        gd.financials.debt = [];
    }

    if (gd.financials.borrow_debt) {
        gd.financials.debt.push({
            amount: parseInt(gd.financials.borrow_debt || 0),
            periods_serviced: 0
        });
    }

    var totalDebt = 0;
    var debtDue = 0;
    var installment = 0;
    var next = 0;

    gd.financials.debt.forEach((_debt) => {
        _debt.periods_serviced = parseInt(_debt.periods_serviced || 0);
        _debt.amount = parseInt(_debt.amount || 0);

        if ((_debt.periods_serviced + 1) < duration) {
            const _next = _debt.amount && duration ? Math.round(_debt.amount / duration) : 0;
            next += _next;
        }

        if (_debt.periods_serviced < duration) {
            const _installment = _debt.amount && duration ? Math.round(_debt.amount / duration) : 0;
            installment += _installment;

            _debt.periods_serviced = _debt.periods_serviced + 1;
            debtDue += _debt.amount - (_installment * _debt.periods_serviced);
            totalDebt += _debt.amount;
        }
    });

    gd.financials.debt_due = debtDue;
    gd.financials.installment = installment;
    const x = parseInt(gd.financials.borrow_debt || 0) / duration;
    //gd.financials.prev_loan_repayment = Math.round(gd.financials.installment - x);
    const irate = parseFloat(caseStudy.financials.interest_rate || 0);
    gd.financials.interest = Math.round((gd.financials.debt_due + gd.financials.installment) * irate / 100);
    gd.financials.next_installment = next;
    gd.financials.long_term_debt = gd.financials.debt_due - gd.financials.next_installment;
    gd.financials.cashflow_debt = parseInt(gd.financials.borrow_debt || 0);

    trace(game.trace, 'gd.financials.debt', gd.financials.debt);
    trace(game.trace, 'gd.financials.debt_due', gd.financials.debt_due);
    trace(game.trace, 'gd.financials.interest', gd.financials.interest);
    trace(game.trace, 'gd.financials.installment', gd.financials.installment);
    trace(game.trace, 'gd.financials.next_installment', gd.financials.next_installment);

    const eloanRate = parseFloat(gd.financials.emergency_loan_int_pct || 0);
    const eloanP = parseInt(gd.financials.emergency_loan_paid || 0);

    gd.financials.emergency_loan_interest = eloanP * eloanRate / 100;
    trace(game.trace, 'gd.financials.emergency_loan_interest', gd.financials.emergency_loan_interest);

    gd.financials.total_debt = parseInt(gd.financials.debt_due || 0);
    trace(game.trace, 'gd.financials.total_debt', gd.financials.total_debt);

    return null;
};

const calculatePromotionsCost = (game, gd, caseStudy) => {
    info(game.trace, 'calculatePromotionsCost');
    var promotions = 0;
    var advertising = 0;

    gd.products.forEach((product) => {
        promotions += parseInt(product.marketing.promotions_budget || 0);
        advertising += parseInt(product.marketing.advertising_budget || 0);
    });

    gd.financials.promotions = promotions;
    gd.financials.advertising = advertising;

    trace(game.trace, 'gd.financials.promotions', gd.financials.promotions);
    trace(game.trace, 'gd.financials.advertising', gd.financials.advertising);

    return null;
};

const processIncome = (game, gd, caseStudy) => {
    info(game.trace, 'processIncome');

    const income = gd.financials.revenue + gd.financials.interest_income;
    if (game.debug && income < 0) {
        return 'income < 0';
    }

    const openingInventoryCost = parseInt(gd.financials.opening_inventory_cost || 0);
    const closingInventoryCost = parseInt(gd.financials.inventory_cost || 0);
    gd.financials.change_in_inventory_cost = openingInventoryCost - closingInventoryCost;

    trace(game.trace, 'gd.financials.revenue', gd.financials.revenue);
    trace(game.trace, 'gd.financials.interest_income', gd.financials.interest_income);
    trace(game.trace, 'openingInventoryCost', openingInventoryCost);
    trace(game.trace, 'closingInventoryCost', closingInventoryCost);
    trace(game.trace, 'gd.financials.change_in_inventory_cost', gd.financials.change_in_inventory_cost);

    trace(game.trace, 'gd.financials.material_cost', gd.financials.material_cost);
    trace(game.trace, 'gd.financials.labour_cost', gd.financials.labour_cost);
    trace(game.trace, 'gd.financials.sales_force', gd.financials.sales_force);
    trace(game.trace, 'gd.financials.promotions', gd.financials.promotions);
    trace(game.trace, 'gd.financials.advertising', gd.financials.advertising);
    trace(game.trace, 'gd.financials.administrative_costs', gd.financials.administrative_costs);
    trace(game.trace, 'gd.financials.current_depreciation_plant', gd.financials.current_depreciation_plant);
    trace(game.trace, 'gd.financials.current_depreciation_research', gd.financials.current_depreciation_research);
    trace(game.trace, 'gd.financials.current_depreciation_projects', gd.financials.current_depreciation_projects);
    trace(game.trace, 'gd.financials.interest', gd.financials.interest);
    trace(game.trace, 'gd.financials.emergency_loan_interest', gd.financials.emergency_loan_interest);
    trace(game.trace, 'gd.financials.sales_tax', gd.financials.sales_tax);

    const costs =
        gd.financials.material_cost +
        gd.financials.labour_cost +
        parseInt(gd.financials.training_budget || 0) +
        gd.financials.change_in_inventory_cost +
        gd.financials.current_depreciation_plant +
        gd.financials.current_depreciation_research +
        gd.financials.current_depreciation_projects +
        gd.financials.promotions +
        gd.financials.advertising +
        gd.financials.sales_force +
        gd.financials.administrative_costs +
        parseInt(gd.financials.overheads || 0) +
        parseInt(gd.financials.miscellaneous_cost_1 || 0) +
        parseInt(gd.financials.miscellaneous_cost_2 || 0) +
        parseInt(gd.financials.miscellaneous_cost_3 || 0) +
        parseInt(gd.financials.miscellaneous_cost_4 || 0) +
        parseInt(gd.financials.miscellaneous_cost_5 || 0) +
        gd.financials.interest +
        gd.financials.emergency_loan_interest +
        gd.financials.sales_tax;

    if (game.debug && costs <= 0) {
        return 'costs <= 0';
    }

    trace(game.trace, 'costs', costs);

    gd.financials.gross_profit = income - costs;

    trace(game.trace, 'gd.financials.gross_profit', gd.financials.gross_profit);

    const corpTaxRate = parseFloat(caseStudy.financials.corporate_tax_rate || 0);
    gd.financials.corporate_tax = gd.financials.gross_profit > 0 ? parseInt(gd.financials.gross_profit * corpTaxRate / 100) : 0;
    gd.financials.profit = gd.financials.gross_profit - gd.financials.corporate_tax;

    if (game.debug && gd.financials.corporate_tax < 0) {
        return 'gd.financials.corporate_tax < 0';
    }

    trace(game.trace, 'corpTaxRate', corpTaxRate);
    trace(game.trace, 'gd.financials.corporate_tax', gd.financials.corporate_tax);
    trace(game.trace, 'gd.financials.profit', gd.financials.profit);

    return null;
};

const processDividend = (game, gd, caseStudy) => {
    const dividendRate = parseFloat(caseStudy.financials.dividend_rate || 0);
    gd.financials.dividend = gd.financials.profit > 0 ? parseInt(gd.financials.profit * dividendRate / 100) : 0;
    if (game.debug && gd.financials.dividend < 0) {
        return 'gd.financials.dividend < 0';
    }

    const prevRE = parseInt(gd.financials.total_retained_earnings || 0);
    gd.financials.retained_earnings = gd.financials.profit - gd.financials.dividend;
    gd.financials.total_retained_earnings = prevRE + gd.financials.retained_earnings;
    gd.financials.gross_contribution =
        gd.financials.revenue +
        gd.financials.interest_income -
        gd.financials.material_cost -
        gd.financials.labour_cost; // -
    //parseInt(gd.financials.opening_inventory_cost || 0) +
    //parseInt(gd.financials.inventory_cost || 0);

    return null;
};

const processCash = (game, gd, caseStudy) => {
    info(game.trace, 'processCash');
    const open = parseInt(gd.financials.cash_balance_open || 0);
    trace(game.trace, 'open', open);

    trace(game.trace, 'gd.financials.revenue', gd.financials.revenue);
    trace(game.trace, 'gd.financials.borrow_debt', gd.financials.borrow_debt);
    trace(game.trace, 'gd.financials.stock_sale', gd.financials.stock_sale);
    trace(game.trace, 'gd.financials.interest_income', gd.financials.interest_income);
    trace(game.trace, 'gd.financials.cashflow_investment', gd.financials.cashflow_investment);

    const cashIn =
        gd.financials.revenue +
        parseInt(gd.financials.cashflow_debt || 0) +
        parseInt(gd.financials.stock_sale || 0) +
        gd.financials.interest_income;

    if (game.debug && cashIn < 0) {
        return 'cashIn < 0';
    }

    trace(game.trace, 'cashIn', cashIn);
    trace(game.trace, 'gd.financials.material_cost', gd.financials.material_cost);
    trace(game.trace, 'gd.financials.labour_cost', gd.financials.labour_cost);
    trace(game.trace, 'gd.financials.sales_force', gd.financials.sales_force);
    trace(game.trace, 'gd.financials.promotions', gd.financials.promotions);
    trace(game.trace, 'gd.financials.advertising', gd.financials.advertising);
    trace(game.trace, 'gd.financials.administrative_costs', gd.financials.administrative_costs);
    trace(game.trace, 'gd.financials.cashflow_plant', gd.financials.cashflow_plant);
    trace(game.trace, 'gd.financials.cashflow_research', gd.financials.cashflow_research);
    trace(game.trace, 'gd.financials.cashflow_projects', gd.financials.cashflow_projects);
    trace(game.trace, 'gd.financials.interest', gd.financials.interest);
    trace(game.trace, 'gd.financials.emergency_loan_paid', gd.financials.emergency_loan_paid);
    trace(game.trace, 'gd.financials.sales_tax', gd.financials.sales_tax);
    trace(game.trace, 'gd.financials.corporate_tax', gd.financials.corporate_tax);
    trace(game.trace, 'gd.financials.dividend', gd.financials.dividend);

    const cashOut =
        gd.financials.material_cost +
        gd.financials.labour_cost +
        gd.financials.sales_force +
        gd.financials.promotions +
        gd.financials.advertising +
        gd.financials.administrative_costs +
        parseInt(gd.financials.training_budget || 0) +
        gd.financials.cashflow_plant +
        gd.financials.cashflow_research +
        gd.financials.cashflow_projects +
        gd.financials.cashflow_investment +
        parseInt(gd.financials.overheads || 0) +
        parseInt(gd.financials.miscellaneous_cost_1 || 0) +
        parseInt(gd.financials.miscellaneous_cost_2 || 0) +
        parseInt(gd.financials.miscellaneous_cost_3 || 0) +
        parseInt(gd.financials.miscellaneous_cost_4 || 0) +
        parseInt(gd.financials.miscellaneous_cost_5 || 0) +
        gd.financials.interest +
        gd.financials.installment +
        gd.financials.emergency_loan_interest +
        gd.financials.emergency_loan_paid +
        gd.financials.sales_tax +
        gd.financials.corporate_tax +
        gd.financials.dividend;

    if (game.debug && cashOut <= 0) {
        return 'cashOut <= 0';
    }

    trace(game.trace, 'cashOut', cashOut);

    gd.financials.cash_balance = open + cashIn - cashOut;
    trace(game.trace, 'gd.financials.cash_balance', gd.financials.cash_balance);
    return null;
};

const processEmergencyLoan = (game, gd, caseStudy) => {
    info(game.trace, 'processEmergencyLoan');
    const minbal = parseInt(caseStudy.financials.min_cash_balance_required || 0);
    const amount = parseInt(caseStudy.financials.emergency_loan_amount || 0);

    if (gd.financials.cash_balance < minbal) {
        gd.financials.emergency_loan_taken = amount || (minbal - gd.financials.cash_balance);
        gd.financials.cash_balance += gd.financials.emergency_loan_taken;

        trace(game.trace, 'gd.financials.emergency_loan_taken', gd.financials.emergency_loan_taken);
        trace(game.trace, 'gd.financials.cash_balance', gd.financials.cash_balance);

        gd.financials.total_debt += gd.financials.emergency_loan_taken;
        trace(game.trace, 'gd.financials.total_debt', gd.financials.total_debt);
    }

    return null;
};

const processBalanceSheet = (game, gd, caseStudy) => {
    info(game.trace, 'processBalanceSheet');
    gd.financials.total_depreciation =
        gd.financials.depreciation_research +
        gd.financials.depreciation_plant +
        gd.financials.depreciation_projects;

    if (game.debug && gd.financials.total_depreciation < 0) {
        return 'gd.financials.total_depreciation < 0';
    }

    trace(game.trace, 'gd.financials.total_depreciation', gd.financials.total_depreciation);

    gd.financials.total_assets =
        parseInt(gd.financials.cash_balance || 0) +
        parseInt(gd.financials.investment_amount || 0) +
        parseInt(gd.financials.investment_plant || 0) +
        parseInt(gd.financials.investment_research || 0) +
        parseInt(gd.financials.investment_projects || 0) +
        parseInt(gd.financials.inventory_cost || 0) -
        parseInt(gd.financials.depreciation_plant || 0) -
        parseInt(gd.financials.depreciation_research || 0) -
        parseInt(gd.financials.depreciation_projects || 0);

    trace(game.trace, 'gd.financials.total_assets', gd.financials.total_assets);

    gd.financials.share_capital = parseInt(
        parseFloat(gd.financials.shares_facevalue || 0) *
        parseInt(gd.financials.shares_issued || 0)
    );

    if (game.debug && gd.financials.share_capital <= 0) {
        return 'gd.financials.share_capital <= 0';
    }

    trace(game.trace, 'gd.financials.emergency_loan_taken', gd.financials.emergency_loan_taken);
    trace(game.trace, 'gd.financials.next_installment', gd.financials.next_installment);
    trace(game.trace, 'gd.financials.total_retained_earnings', gd.financials.total_retained_earnings);
    trace(game.trace, 'gd.financials.total_retained_earnings', gd.financials.total_retained_earnings);
    trace(game.trace, 'gd.financials.share_premium', gd.financials.share_premium);
    trace(game.trace, 'gd.financials.long_term_debt', gd.financials.long_term_debt);
    trace(game.trace, 'gd.financials.share_capital', gd.financials.share_capital);

    gd.financials.total_liabilities = parseInt(
        parseInt(gd.financials.emergency_loan_taken || 0) +
        parseInt(gd.financials.next_installment || 0) +
        parseInt(gd.financials.total_retained_earnings || 0) +
        parseInt(gd.financials.share_premium || 0) +
        parseInt(gd.financials.long_term_debt || 0)
        // -
        //parseInt(gd.financials.prev_loan_repayment || 0)
    );

    trace(game.trace, 'gd.financials.total_liabilities', gd.financials.total_liabilities);

    gd.financials.liability_plus_equity = parseInt(gd.financials.total_liabilities + gd.financials.share_capital);

    /*
    if (game.debug && Math.abs(gd.financials.liability_plus_equity - gd.financials.total_assets) > 2) {
        return 'balance sheet does not match';
    }
    */

    trace(game.trace, 'gd.financials.liability_plus_equity', gd.financials.liability_plus_equity);
    return null;
};

const calculateFinancialRatios = (game, gd, caseStudy) => {
    info(game.trace, 'calculateFinancialRatios');
    gd.financials.profitMargin = gd.financials.profit * 100 / gd.financials.revenue;
    trace(game.trace, 'gd.financials.profitMargin', gd.financials.profitMargin);
    gd.financials.return_on_assets = gd.financials.profit * 100 / gd.financials.total_assets;
    trace(game.trace, 'gd.financials.return_on_assets', gd.financials.return_on_assets);
    gd.financials.return_on_equity = gd.financials.profit * 100 / gd.financials.share_capital;
    trace(game.trace, 'gd.financials.return_on_equity', gd.financials.return_on_equity);
    gd.financials.return_on_investment = gd.financials.profit * 100 / gd.financials.investment_total;
    trace(game.trace, 'gd.financials.return_on_investment', gd.financials.return_on_investment);
    gd.financials.current_ratio = gd.financials.total_liabilities ? gd.financials.total_assets / gd.financials.total_liabilities : 'NA';
    trace(game.trace, 'gd.financials.current_ratio', gd.financials.current_ratio);
    gd.financials.quick_ratio = gd.financials.total_liabilities ? (gd.financials.total_assets - gd.financials.inventory_cost) / gd.financials.total_liabilities : 'NA';
    trace(game.trace, 'gd.financials.quick_ratio', gd.financials.quick_ratio);
    gd.financials.debt_to_equity_ratio = gd.financials.total_debt / gd.financials.share_capital;
    trace(game.trace, 'gd.financials.debt_to_equity_ratio', gd.financials.debt_to_equity_ratio);
    gd.financials.gross_margin = gd.financials.gross_profit * 100 / gd.financials.revenue;
    trace(game.trace, 'gd.financials.gross_margin', gd.financials.gross_margin);

    return null;
};

const calculateStockPrice = (game, gameData, caseStudy) => {
    info(game.trace, 'calculateStockPrice');

    for (var team in gameData) {
        const gd = gameData[team];
        const pratio = parseFloat(gd.financials.pratio || 100);
        const eps = gd.financials.profit / parseInt(gd.financials.shares_issued || 0);
        var stockPriceEPS = eps * pratio;
        if (eps <= 0.09 && eps > -0.1) {
            stockPriceEPS = 0.8 * parseFloat(gd.financials.shares_facevalue || 10);
        } else if (eps <= -0.1 && eps > -0.6) {
            stockPriceEPS = 0.6 * parseFloat(gd.financials.shares_facevalue || 10);
        } else if (eps <= -0.6 && eps > -0.95) {
            stockPriceEPS = 0.4 * parseFloat(gd.financials.shares_facevalue || 10);
        } else if (eps <= -0.95) {
            stockPriceEPS = 0.2 * parseFloat(gd.financials.shares_facevalue || 10);
        }

        const prevStockPrice = parseFloat(gd.financials.stock_price || 0);
        gd.financials.stock_price = Math.max(parseInt(stockPriceEPS * 100) / 100, 0.1);
        gd.financials.changeInStockPrice = gd.financials.stock_price - prevStockPrice;
        gd.financials.changePctStockPrice = parseInt((gd.financials.changeInStockPrice * 100 / prevStockPrice) * 100) / 100;

        if (game.debug && gd.financials.stock_price <= 0) {
            return 'gd.financials.stock_price <= 0';
        }

        trace(game.trace, 'team', team);
        trace(game.trace, 'gd.financials.stock_price', gd.financials.stock_price);
        trace(game.trace, 'gd.financials.changeInStockPrice', gd.financials.changeInStockPrice);
        trace(game.trace, 'gd.financials.changePctStockPrice', gd.financials.changePctStockPrice);
    };
    return null;
};

const calculateCompetition = (game, gameState, gameData, caseStudy, gameDataList) => {
    for (var i = 0; i < gameDataList.length; i++) {
        const data = gameDataList[i].data;
        trace(game.trace, 'gameDataList[i]', gameDataList[i]);
        gameState.teams[gameDataList[i].team].products = [];
        for (var qtr in data) {
            const _q = parseInt(qtr || 0);
            gameState.teams[gameDataList[i].team].products[_q] = JSON.parse(JSON.stringify(data[_q].products));
        }
    }

    trace(game.trace, 'gameState.teams', gameState.teams);
    return null;
};

const getProjectInvestment = (specialProjects, project) => {
    if (!specialProjects) {
        return 0;
    }

    const value = specialProjects[project.key];
    if (!value) {
        return 0;
    }

    for (var i = 0; i < project.options.length; i++) {
        if (project.options[i].label == value) {
            return parseInt(project.options[i].investment || 0);
        }
    }

    return 0;
};

const calculateScores = (game, gameState, gameData, caseStudy, gameDataList) => {
    info(game.trace, 'calculateScores');

    const nteams = Object.keys(gameData).length;
    var maxStockPrice = parseFloat(caseStudy.kpi_criteria.stock_price_benchmark || 0);
    var maxProfit = parseInt(caseStudy.kpi_criteria.profit_benchmark || 0);
    var maxService = parseInt(caseStudy.kpi_criteria.service_benchmark || 0);
    var maxMarketShare = (100 / nteams) * (1 + parseFloat(caseStudy.kpi_criteria.market_share_benchmark || 0) / 100);
    var maxUtilisation = parseFloat(caseStudy.kpi_criteria.utilisation_benchmark || 0);
    var maxFulfilment = parseFloat(caseStudy.kpi_criteria.fulfilment_benchmark || 0);
    var maxInnovation = parseFloat(caseStudy.kpi_criteria.innovation_benchmark || 0);
    var minCI = parseFloat(caseStudy.kpi_criteria.ci_benchmark || 0);

    trace(game.trace, 'maxStockPrice', maxStockPrice);
    trace(game.trace, 'maxProfit', maxProfit);
    trace(game.trace, 'maxMarketShare', maxMarketShare);
    trace(game.trace, 'maxService', maxService);
    trace(game.trace, 'maxUtilisation', maxUtilisation);
    trace(game.trace, 'maxFulfilment', maxFulfilment);
    trace(game.trace, 'maxInnovation', maxInnovation);
    trace(game.trace, 'minCI', minCI);

    const list = {};
    const ciScore = {};

    for (var team in gameData) {
        const gd = gameData[team];

        for (var i = 0; i < gameDataList.length; i++) {
            const _gameData = gameDataList[i];
            if (team == _gameData.team) {
                const currentQuarter = _gameData.current_quarter;

                var innovationCount = 0;
                for (var j = currentQuarter; j > 0; j--) {
                    const _gd = _gameData.data[j];
                    var innovation = parseInt(_gd.financials.innovation_budget || 0);

                    if (innovation > minCI) {
                        innovationCount++;
                    }
                    else {
                        break;
                    }
                }

                var serviceCount = 0;
                for (var j = currentQuarter; j > 0; j--) {
                    const _gd = _gameData.data[j];
                    var service = parseInt(_gd.financials.training_budget || 0);

                    if (service > minCI) {
                        serviceCount++;
                    }
                    else {
                        break;
                    }
                }

                var projectCount = {};
                caseStudy.special_projects.forEach((project) => {
                    projectCount[project.name] = 0;
                    for (var j = currentQuarter; j > 0; j--) {
                        const _gd = _gameData.data[j];
                        const investment = getProjectInvestment(_gd.special_projects, project);
                        if (investment) {
                            projectCount[project.name]++;
                        }
                        else {
                            break;
                        }
                    }
                });

                var score = 0;
                const innScore = innovationCount ? (innovationCount + 1) * 3 + 2 : 0;
                const serScore = serviceCount ? (serviceCount + 1) * 3 + 2 : 0;
                score = innScore + serScore;

                for (var prop in projectCount) {
                    score += projectCount[prop] ? projectCount[prop] * 3 : 0;
                }

                if (score > 100) {
                    score = 100;
                }

                ciScore[_gameData.team] = score;
                break;
            }
        }

        maxStockPrice = Math.max(maxStockPrice, gd.financials.stock_price);
        maxProfit = Math.max(maxProfit, gd.financials.profit);
        maxMarketShare = Math.max(maxMarketShare, gd.financials.marketShare);
        maxUtilisation = Math.max(maxUtilisation, gd.financials.utilisation);
        maxFulfilment = Math.max(maxFulfilment, gd.financials.fulfilment);

        var innovation = parseInt(gd.financials.innovation_budget || 0);
        var service = parseInt(gd.financials.training_budget || 0);

        caseStudy.special_projects.forEach((project) => {
            const investment = getProjectInvestment(gd.special_projects, project);
            if (project.type == 'innovation') {
                innovation += investment;
            }
            else {
                service += investment;
            }
        });

        maxInnovation = Math.max(maxInnovation, innovation);
        maxService = Math.max(maxService, service);

        list[team] = {
            innovation: innovation,
            service: service
        };
    }

    const ranks = [];

    for (var team in gameData) {
        trace(game.trace, 'team', team);
        const gd = gameData[team];

        trace(game.trace, 'gd.financials.marketShare', gd.financials.marketShare);
        trace(game.trace, 'gd.financials.utilisation', gd.financials.utilisation);
        trace(game.trace, 'gd.financials.fulfilment', gd.financials.fulfilment);

        gd.scores.stock_price = Math.round(gd.financials.stock_price * 100 / maxStockPrice);
        gd.scores.profits = gd.financials.profit > 0 ? Math.round(gd.financials.profit * 100 / maxProfit) : 0;
        gd.scores.marketShare = Math.round(gd.financials.marketShare * 100 / maxMarketShare);
        gd.scores.customerService = Math.round(list[team].service * 100 / maxService);
        gd.scores.utilization = Math.round(gd.financials.utilisation * 100 / maxUtilisation);
        gd.scores.fulfilment = Math.round(gd.financials.fulfilment * 100 / maxFulfilment);
        gd.scores.continuousImprovement = ciScore[team];
        gd.scores.innovation = Math.round(list[team].innovation * 100 / maxInnovation);

        gd.scores.score = Math.round(
            (
                gd.scores.stock_price * parseInt(caseStudy.kpi_criteria.stock_price || 0) +
                gd.scores.profits * parseInt(caseStudy.kpi_criteria.profits || 0) +
                gd.scores.marketShare * parseInt(caseStudy.kpi_criteria.market_share || 0) +
                gd.scores.customerService * parseInt(caseStudy.kpi_criteria.customer_service_level || 0) +
                gd.scores.utilization * parseInt(caseStudy.kpi_criteria.utilization || 0) +
                gd.scores.fulfilment * parseInt(caseStudy.kpi_criteria.fulfilment || 0) +
                gd.scores.continuousImprovement * parseInt(caseStudy.kpi_criteria.continuous_improvement || 0) +
                gd.scores.innovation * parseInt(caseStudy.kpi_criteria.innovation || 0)
            ) / (
                parseInt(caseStudy.kpi_criteria.stock_price || 0) +
                parseInt(caseStudy.kpi_criteria.profits || 0) +
                parseInt(caseStudy.kpi_criteria.market_share || 0) +
                parseInt(caseStudy.kpi_criteria.customer_service_level || 0) +
                parseInt(caseStudy.kpi_criteria.utilization || 0) +
                parseInt(caseStudy.kpi_criteria.fulfilment || 0) +
                parseInt(caseStudy.kpi_criteria.continuous_improvement || 0) +
                parseInt(caseStudy.kpi_criteria.innovation || 0)
            ));

        if (game.debug && gd.financials.stock_price < 0) {
            return 'gd.financials.stock_price < 0';
        }
        if (game.debug && gd.scores.profits < 0) {
            return 'gd.scores.profits < 0';
        }
        if (game.debug && gd.scores.marketShare < 0) {
            return 'gd.scores.marketShare < 0';
        }
        if (game.debug && gd.scores.customerService < 0) {
            return 'gd.scores.customerService < 0';
        }
        if (game.debug && gd.scores.utilization < 0) {
            return 'gd.scores.utilization < 0';
        }
        if (game.debug && gd.scores.fulfilment < 0) {
            return 'gd.scores.fulfilment < 0';
        }
        if (game.debug && gd.scores.continuousImprovement < 0) {
            return 'gd.scores.continuousImprovement < 0';
        }
        if (game.debug && gd.scores.innovation < 0) {
            return 'gd.scores.innovation < 0';
        }
        if (game.debug && gd.scores.score < 0) {
            return 'gd.scores.score < 0';
        }

        trace(game.trace, 'gd.scores', gd.scores);
        ranks.push({
            team: team,
            score: gd.scores.score,
            stock_price: gd.financials.stock_price,
            profit: gd.financials.profit,
            marketShare: gd.financials.marketShare,
            revenue: gd.financials.revenue
        });
    }

    ranks.sort((a, b) => {
        if (a.score !== b.score) {
            return b.score - a.score;
        }
        else if (b.profit != a.profit) {
            return b.profit - a.profit;
        }
        else if (b.revenue != a.revenue) {
            return b.revenue - a.revenue;
        }
        else if (a.marketShare !== b.marketShare) {
            return b.marketShare - a.marketShare;
        }
        return b.unitsSold - a.unitsSold;
    });

    if (game.type == 'team_play' && game.useMarkets) {
        const markets = {};
        for (team in gameState.teams) {
            const market = gameState.teams[team].market;
            if (!markets[market]) {
                markets[market] = {};
            }
            markets[market][team] = team;
        }

        for (var prop in markets) {
            const _ranks = {};

            for (var i = 0; i < ranks.length; i++) {
                const team = ranks[i].team;
                const market = gameState.teams[team];
                if (!_ranks[market]) {
                    _ranks[market] = [];
                }
                _ranks[market].push(team);
            }

            for (var prop in _ranks) {
                for (var i = 0; i < _ranks[prop].length; i++) {
                    const team = _ranks[prop][i];
                    const gd = gameData[team];
                    gd.scores.rank = i + 1;
                    gameState.teams[team].rank = _ranks[team];
                    gameState.teams[team].score = gd.scores.score;
                    gameState.teams[team].profit = gd.financials.profit;
                    gameState.teams[team].marketShare = gd.financials.marketShare;
                    gameState.teams[team].revenue = gd.financials.revenue;
                    gameState.teams[team].capacity = gd.financials.capacity;
                }
            }
        }
    } else {
        const _ranks = {};

        for (var i = 0; i < ranks.length; i++) {
            _ranks[ranks[i].team] = i + 1;
        }            

        for (var team in gameData) {
            const gd = gameData[team];
            gd.scores.rank = _ranks[team];
            gameState.teams[team].rank = _ranks[team];
            gameState.teams[team].score = gd.scores.score;
            gameState.teams[team].profit = gd.financials.profit;
            gameState.teams[team].marketShare = gd.financials.marketShare;
            gameState.teams[team].revenue = gd.financials.revenue;
            gameState.teams[team].capacity = gd.financials.capacity;
        }
    }

    return null;
};

const calculateProjectImpact = (game, gameData, caseStudy) => {
    for (var team in gameData) {
        const gd = gameData[team];
        if (!gd.special_projects) {
            continue;
        }
        caseStudy.special_projects.forEach((project) => {
            const value = gd.special_projects[project.key];
            if (!value) {
                return;
            }

            var option = null;
            project.options.forEach((opt) => {
                if (opt.label == value) {
                    option = opt;
                }
            });

            if (!option || option.label == 'Dont Invest') {
                return;
            }

            if (Math.random() < parseInt(option.failure_risk || 0) / 100) {
                gd.news.push({
                    title: 'Project failed!',
                    type: 'special_project',
                    project_key: project.key,
                    text: 'Unfortunately the project ' + project.name + ' failed. You did not get any benefit from that project.'
                });
                return;
            }

            var title = null;
            var text = null;

            if (project.type == 'innovation') {
                const min = parseInt(option.minLevel.value || 0);
                const max = parseInt(option.maxLevel.value || 0);
                var level = Math.round(min == max ? min : Math.round(Math.random() * (max - min) + min));
                const feature = project.selectedOption.value;
                for (var i = 0; i < gd.specs.length; i++) {
                    const spec = gd.specs[i];
                    if (spec.feature == feature) {
                        var locked = -1;
                        for (var j = 0; j < spec.values.length; j++) {
                            if (!spec.values[j].locked) {
                                continue;
                            }

                            locked = j;
                            break;
                        }

                        if (locked == -1) {
                            level = 0;
                            break;
                        }
                        var unlocked = 0;
                        for (var k = locked; k < spec.values.length && k < locked + level; k++) {
                            spec.values[k].locked = false;
                            unlocked++;
                        }
                        level = unlocked;
                        break;
                    }
                }
                if (level) {
                    title = 'Project succeeded!';
                    text = 'Congratulations! The project ' + project.name + ' succeeded. You have unlocked ' +
                        level + ' level' + (level == 1 ? '' : 's') + ' of ' + feature + ' features.';
                }
                else {
                    title = 'Project results not satisfactory!';
                    text = 'The project ' + project.name + ' succeeded but there were no more levels to unlock so it had no impact.';
                }
            }
            else {
                const min = parseInt(option.minLevel || 0);
                const max = parseInt(option.maxLevel || 0);

                var level = min == max ? min : Math.round(Math.random() * (max - min) + min);
                const impact = project.selectedOption.value;
                const prevImpact = parseInt(gd.financials[impact] || 0);
                gd.financials[impact] = prevImpact + level;
                title = 'Project succeeded!';
                if (!prevImpact) {
                    text = 'Congratulations! The project ' + project.name + ' succeeded. You have achieved ' +
                        project.selectedOption.label + ' of ' + level + ' %.';
                }
                else {
                    text = 'Congratulations! The project ' + project.name + ' succeeded. You have achieved additional ' +
                        project.selectedOption.label + ' of ' + level + ' %. Combined with previous project impact now your total ' +
                        project.selectedOption.label + ' is ' + gd.financials[impact] + ' %.';
                }
            }
            gd.news.push({
                title: title,
                type: 'special_project',
                project_key: project.key,
                text: text
            });
        });
    }

    return null;
};

const selfPlayRank = (list, nqtrs) => {
    const output = list.sort((a, b) => {
        if (a.score != b.score) {
            return b.score - a.score;
        }
        if ((a.profit || 0) != (b.profit || 0)) {
            return (b.profit || 0) - (a.profit || 0);
        }
        if ((b.revenue || 0) != (a.revenue || 0)) {
            return (b.revenue || 0) - (a.revenue || 0);
        }
        if ((b.marketShare || 0) != (a.marketShare || 0)) {
            return (b.marketShare || 0) - (a.marketShare || 0);
        }
        return (b.unitsSold || 0) - (a.unitsSold || 0);
    });

    var rank = 1;
    for (var i = 0; i < output.length; i++) {
        if (output[i].current_quarter == nqtrs) {
            if (output[i].users.length) {
                output[i].game_rank = rank++;
            }
        }
        else {
            output[i].game_rank = '';
        }
    }

    return output;
};

const gameDataRank = (list, nqtrs) => {
    const output = list.sort((a, b) => {
        if (a.score != b.score) {
            return b.score - a.score;
        }

        if (a.current_quarter < nqtrs && b.current_quarter < nqtrs) {
            return 0;
        }

        if (b.current_quarter < nqtrs) {
            return 0 - a.score;
        }

        if (a.current_quarter < nqtrs) {
            return a.score;
        }

        if ((a.profit || 0) != (b.profit || 0)) {
            return (b.profit || 0) - (a.profit || 0);
        }
        if ((b.revenue || 0) != (a.revenue || 0)) {
            return (b.revenue || 0) - (a.revenue || 0);
        }
        if ((b.marketShare || 0) != (a.marketShare || 0)) {
            return (b.marketShare || 0) - (a.marketShare || 0);
        }
        return (b.unitsSold || 0) - (a.unitsSold || 0);
    });

    var rank = 1;
    for (var i = 0; i < output.length; i++) {
        output[i].rank = rank++;
    }

    return output;
};

const marketRank = (gameState, list, nqtrs) => {
    const markets = {};
    for (team in gameState.teams) {
        const market = gameState.teams[team].market;
        if (!markets[market]) {
            markets[market] = {};
        }
        markets[market][team] = team;
    }

    const _ranks = {};

    for (var i = 0; i < list.length; i++) {
        const team = list[i].team;
        const market = gameState.teams[team].market;
        if (!_ranks[market]) {
            _ranks[market] = [];
        }
        _ranks[market].push(list[i]);
    }

    for (var prop in markets) {
        const _output = _ranks[prop].sort((a, b) => {
            if (a.score != b.score) {
                return b.score - a.score;
            }
    
            if (a.current_quarter < nqtrs && b.current_quarter < nqtrs) {
                return 0;
            }
    
            if (b.current_quarter < nqtrs) {
                return 0 - a.score;
            }
    
            if (a.current_quarter < nqtrs) {
                return a.score;
            }
    
            if ((a.profit || 0) != (b.profit || 0)) {
                return (b.profit || 0) - (a.profit || 0);
            }
            if ((b.revenue || 0) != (a.revenue || 0)) {
                return (b.revenue || 0) - (a.revenue || 0);
            }
            if ((b.marketShare || 0) != (a.marketShare || 0)) {
                return (b.marketShare || 0) - (a.marketShare || 0);
            }
            return (b.unitsSold || 0) - (a.unitsSold || 0);
        });

        for (var i = 0; i < _output.length; i++) {
            _output[i].rank = i + 1;
        }
    }
};

const updateData = async (db, socket, nqtrs, currentQuarter, game, gameData, gameState, gameDataList) => {
    info(game.trace, 'updateData');
    const gcoll = db.collection('games');
    const gdcoll = db.collection('game_data');
    const gscoll = db.collection('game_state');

    var quarter = currentQuarter;
    const dt = new Date();

    for (var i = 0; i < gameDataList.length; i++) {
        const _gameData = gameDataList[i];
        _gameData.current_quarter = currentQuarter + 1;
        _gameData.data[currentQuarter + 1] = JSON.parse(JSON.stringify(_gameData.data[currentQuarter]));
        _gameData.data[currentQuarter + 1].special_projects = {};
        _gameData.data[currentQuarter + 1].financials.issue_shares = 0;
        _gameData.data[currentQuarter + 1].financials.stock_sale = 0;
        _gameData.data[currentQuarter + 1].financials.borrow_debt = 0;
        _gameData.data[currentQuarter + 1].financials.invest = 0;
        _gameData.data[currentQuarter + 1].financials.withdraw = 0;
        _gameData.data[currentQuarter + 1].financials.innovation_budget = 0;
        _gameData.data[currentQuarter + 1].financials.training_budget = 0;
        _gameData.data[currentQuarter + 1].financials.planned_workforce = 0;

        if (currentQuarter == nqtrs) {
            gameState.game_status = 'finished';
            _gameData.game_status = 'finished';
            _gameData.quarter_status = 'finished';
            _gameData.current_quarter = currentQuarter;
            _gameData.type = 'team_play';

            var score = 0;
            for (var q = 1; q <= nqtrs; q++) {
                score += _gameData.data[q].scores.score;
            }
            _gameData.score = Math.round(score / nqtrs);
            _gameData.marketShare = _gameData.data[currentQuarter].financials.marketShare;
            _gameData.profit = _gameData.data[currentQuarter].financials.profit;
            _gameData.revenue = _gameData.data[currentQuarter].financials.marketShare;
            _gameData.unitsSold = _gameData.data[currentQuarter].financials.unitsSold;
        }
        else {
            _gameData.quarter_status = 'submitted';
            _gameData.game_status = 'started';
            gameState.game_status = 'paused';
            gameState.started_dt = '';
            _gameData.started_dt = '';
        }
    }

    if (gameState.game_status == 'finished') {
        if (game.type == 'team_play' && game.useMarkets) {
            marketRank(gameState, gameDataList, nqtrs);
        }
        else
        {
            gameDataRank(gameDataList, nqtrs);
        }
    }

    for (var i = 0; i < gameDataList.length; i++) {
        const _gameData = gameDataList[i];
        delete _gameData._id;
        await gdcoll.updateOne({ game_state_key: gameState.key, team: _gameData.team }, { $set: _gameData });
    }

    gameState.current_quarter = currentQuarter + 1;
    if (gameState.game_status == 'finished') {
        delete gameState._id;

        for (var i = 0; i < gameDataList.length; i++) {
            const gd = gameDataList[i];
            if (gd.current_quarter < nqtrs) {
                await gdcoll.updateOne({ key: gd.key }, { status_label: 'incomplete' });
            }
        }

        await gcoll.updateOne({ key: game.key }, { $set: { game_status: 'finished' } });
        await gscoll.updateOne({ key: gameState.key }, { $set: gameState });
        await socket.emit('game_finished', { game_key: gameState.game_key, game_state_key: gameState.key, game_status: 'finished' });
    }
    else {
        gameState.started_dt = '';

        delete gameState._id;
        await gcoll.updateOne({ key: gameState.game_key }, { $set: { started_dt: '' } });
        await gscoll.updateOne({ key: gameState.key }, { $set: gameState });
        //await socket.emit('quarter_processed', { game_key: gameState.game_key, game_state_key: gameState.key, current_quarter: quarter + 1, started_dt: dt, game_status: gameState.game_status });
    }

    info(game.trace, 'finished updateData');
};

const selfPlayAllFinished = (game) => {

};

const updateSelfPlayData = async (db, socket, nqtrs, currentQuarter, game, gameData, gameState, gameDataList, gameType) => {
    info(game.trace, 'updateSelfPlayData');
    const gcoll = db.collection('games');
    const gdcoll = db.collection('game_data');
    const gscoll = db.collection('game_state');

    for (var i = 0; i < gameDataList.length; i++) {
        const _gameData = gameDataList[i];
        _gameData.current_quarter = currentQuarter + 1;
        _gameData.data[currentQuarter + 1] = JSON.parse(JSON.stringify(_gameData.data[currentQuarter]));
        _gameData.data[currentQuarter + 1].special_projects = {};
        _gameData.data[currentQuarter + 1].financials.issue_shares = 0;
        _gameData.data[currentQuarter + 1].financials.stock_sale = 0;
        _gameData.data[currentQuarter + 1].financials.borrow_debt = 0;
        _gameData.data[currentQuarter + 1].financials.invest = 0;
        _gameData.data[currentQuarter + 1].financials.withdraw = 0;
        _gameData.data[currentQuarter + 1].financials.innovation_budget = 0;
        _gameData.data[currentQuarter + 1].financials.training_budget = 0;
        _gameData.data[currentQuarter + 1].financials.planned_workforce = 0;

        if (currentQuarter >= nqtrs) {
            gameState.game_status = 'finished';
            _gameData.game_status = 'finished';
            _gameData.quarter_status = 'finished';
            _gameData.current_quarter = currentQuarter;
            _gameData.type = gameType;

            var score = 0;
            for (var q = 1; q <= nqtrs; q++) {
                score += _gameData.data[q].scores.score;
            }
            _gameData.score = Math.round(score / nqtrs);
            _gameData.marketShare = _gameData.data[currentQuarter].financials.marketShare;
            _gameData.profit = _gameData.data[currentQuarter].financials.profit;
            _gameData.revenue = _gameData.data[currentQuarter].financials.marketShare;
            _gameData.unitsSold = _gameData.data[currentQuarter].financials.unitsSold;
        }
        else {
            _gameData.quarter_status = 'playing';
        }
    }

    if (gameState.game_status == 'finished') {
        gameDataRank(gameDataList, nqtrs);
    }

    for (var i = 0; i < gameDataList.length; i++) {
        const _gameData = gameDataList[i];
        delete _gameData._id;
        await gdcoll.updateOne({ game_state_key: gameState.key, team: _gameData.team }, { $set: _gameData });
    }

    const allGD = await gdcoll.find({ game_key: game.key, game_status: 'finished', users: { $exists: true, $ne: [] } }).toArray();
    selfPlayRank(allGD, nqtrs);
    for (var i = 0; i < allGD.length; i++) {
        const gd = allGD[i];

        const _set = { game_rank: gd.game_rank };

        await gdcoll.updateOne({ key: gd.key }, { $set: _set });
    }

    const count = await gdcoll.countDocuments({ game_key: game.key, game_status: { $ne: 'finished' } });
    if (count == 0) {
        await gcoll.updateOne({ key: game.key }, { $set: { game_status: 'finished' } });
        await socket.emit('self_play_finished', { game_key: game.key });
    }

    gameState.current_quarter = currentQuarter + 1;
    delete gameState._id;
    await gscoll.updateOne({ key: gameState.key }, { $set: gameState });

    info(game.trace, 'finished updateSelfPlayData');
};

const takeBotDecisions = async (db, userKey, game, gameState, caseStudy) => {
    info(game.trace, 'taking bot decisions');
    const decisions = {};

    const gdcoll = db.collection('game_data');

    const gameDataList = await gdcoll.find({ game_state_key: gameState.key }).toArray();

    var userData = null;

    const currentQuarter = gameState.current_quarter;
    trace(game.trace, 'currentQuarter', currentQuarter);

    for (var i = 0; i < gameDataList.length; i++) {
        if (gameDataList[i].users.length && gameDataList[i].users[0] == userKey) {
            userData = gameDataList[i];
            break;
        }
    }

    trace(game.trace, 'userData', userData);

    for (var i = 0; i < gameDataList.length; i++) {
        if (gameDataList[i].users.length && gameDataList[i].users[0] == userKey) {
            continue;
        }
        gameDataList[i].data[currentQuarter.toString()] = await decide(db, gameDataList[i].key, currentQuarter, userData.data[(currentQuarter - 1).toString()], gameDataList[i].data[currentQuarter.toString()], caseStudy, gameState);
    }

    trace(game.trace, 'gameDataList', gameDataList);

    return gameDataList;
};

const indexSegments = (caseStudy) => {
    const segments = {};
    caseStudy.market.segments.forEach((seg) => {
        segments[seg.name] = seg;
    });
    return segments;
};

const minSegmentPrice = (products, segment) => {
    var _minAll = null;
    var _minSeg = null;
    products.forEach(prod => {
        const price = parseInt(prod.salesPrice || 0);
        if (_minAll === null || price < _minAll) {
            _minAll = price;
        }

        if (prod.target == segment && (_minSeg === null || price < _minSeg)) {
            _minSeg = price;
        }
    });

    return _minSeg || _minAll;
};

const promotionsBudget = (products, segment) => {
    var output = null;
    products.forEach(prod => {
        const budget = parseInt(prod.marketing.promotions_budget || 0);
        if (prod.target == segment && (output == null || budget > output)) {
            output = budget;
        }
    });

    return output;
};

const advertisingBudget = (products, segment) => {
    var output = null;
    products.forEach(prod => {
        const budget = parseInt(prod.marketing.advertising_budget || 0);
        if (prod.target == segment && (output == null || budget > output)) {
            output = budget;
        }
    });

    return output;
};

const decide = async (db, gdkey, currentQuarter, prevData, data, caseStudy, gameState) => {
    const decisions = {};
    decisions.key = uuid() + '-' + Math.round(Math.random() * 9999);
    decisions['game_key'] = gameState.game_key;
    decisions['game_state_key'] = gameState.key;
    decisions['game_data_key'] = gdkey;
    decisions['current_quarter'] = currentQuarter;

    const products = JSON.parse(JSON.stringify(data.products));
    const financials = JSON.parse(JSON.stringify(data.financials));
    const specValues = {};
    caseStudy.product.specs.forEach((spec) => {
        specValues[spec.feature] = {};
        spec.values.forEach((val) => {
            specValues[spec.feature][val.value] = { ...val };
        });
    });

    var plantCapacity = parseInt(financials.capacity || 0);

    var investments = 0;

    if (financials.productivity_increase < parseInt(caseStudy.financials.productivity_improvement_max || 0)) {
        const limit = parseInt(caseStudy.financials.innovation_budget_max || 0);
        const competition = parseInt(prevData.financials.innovation_budget || 0);
        if (competition) {
            financials.innovation_budget = Math.round(competition + (competition * Math.random() * 10 / 100));
        }
        else {
            financials.innovation_budget = Math.round(Math.random() * limit);
        }
        if (financials.innovation_budget > limit) {
            financials.innovation_budget = limit;
        }

        investments += financials.innovation_budget;
        decisions.innovation_budget = financials.innovation_budget;
    }

    if (financials.efficiency_increase < parseInt(caseStudy.financials.sales_effectiveness_max || 0)) {
        const limit = parseInt(caseStudy.financials.training_budget_max || 0);
        const competition = parseInt(prevData.financials.training_budget || 0);
        if (competition) {
            financials.training_budget = Math.round(competition + (competition * Math.random() * 10 / 100));
        }
        else {
            financials.training_budget = Math.round(Math.random() * limit);
        }

        if (financials.training_budget > limit) {
            financials.training_budget = limit;
        }

        investments += financials.training_budget;
        decisions.training_budget = financials.training_budget;
    }

    const promotionsLimit = 100000;
    const promotionsMin = 10000;

    var prevDemand = 0;

    for (var i = 0; i < products.length; i++) {
        const prod = products[i];
        prevDemand += parseInt(prod.potential_sales_demand || 0);
        decisions['prod_' + i + '_target'] = prod.target;

        const prevPromotions = promotionsBudget(prevData.products, segment);
        if (prevPromotions) {
            prod.marketing.promotions_budget = Math.round(prevPromotions + prevPromotions * Math.random() * 10);
        }
        else {
            prod.marketing.promotions_budget = Math.round(promotionsMin + Math.random() * (promotionsLimit - promotionsMin));
        }
        investments += prod.marketing.promotions_budget;
        decisions['prod_' + i + '_promotions_budget'] = prod.marketing.promotions_budget;

        const prevAdvertising = advertisingBudget(prevData.products, segment);
        if (prevAdvertising) {
            prod.marketing.advertising_budget = Math.round(prevAdvertising + prevAdvertising * Math.random() * 10);
        }
        else {
            prod.marketing.advertising_budget = Math.round(promotionsMin + Math.random() * (promotionsLimit - promotionsMin));
        }
        investments += prod.marketing.advertising_budget;
        decisions['prod_' + i + '_advertising_budget'] = prod.marketing.advertising_budget;
    }

    const demand = {};

    var totalDemand = 0;
    for (var segment in gameState.demand) {
        demand[segment] = {};
        demand[segment].demand = gameState.demand[segment][currentQuarter] ? parseInt(gameState.demand[segment][currentQuarter]) : 0;
        totalDemand += demand[segment].demand;
    }

    const productivityIncrease = 1 + (parseInt(financials.productivity_increase || 0) / 100 + parseInt(financials.productivity_impact || 0)) / 100;

    var totalProduction = 0;
    for (var segment in demand) {
        demand[segment].pct = demand[segment].demand * 100 / totalDemand;
        demand[segment].idealProduction = Math.round(plantCapacity * demand[segment].pct / 100);
        const random = Math.random() * 10 - 5;
        demand[segment].idealProduction += demand[segment].idealProduction * random / 100;
        demand[segment].idealProduction /= productivityIncrease;
        totalProduction += demand[segment].idealProduction;
    }

    for (var segment in demand) {
        demand[segment].idealProduction = Math.floor(plantCapacity * demand[segment].idealProduction / totalProduction);
    }

    const productManpower = parseFloat(caseStudy.product.product_manpower || 0);

    totalProduction = 0;
    var totalWorkforce = 0;

    for (var segment in demand) {
        totalProduction += demand[segment].idealProduction;
    }

    for (var i = 0; i < products.length; i++) {
        const prod = products[i];
        const segment = prod.target;

        prod.plannedProduction = demand[segment].idealProduction - prod.inventory;
        totalProduction += prod.plannedProduction;

        decisions['prod_' + i + '_planned_production'] = prod.plannedProduction;

        const requiredWorkforce = prod.plannedProduction * productManpower / productivityIncrease;
        totalWorkforce += requiredWorkforce;

        const productOverhead = parseInt(caseStudy.product.overhead_cost || 0);

        var featureCost = 0;
        var features = '';
        for (var prop in prod.specs) {
            const val = prod.specs[prop];
            featureCost += parseInt(specValues[prop][val].cost || 0);
            features += prop + ':' + val + '||';
        }

        decisions['prod_' + i + '_features'] = prod.plannedProduction;

        prod.cost = featureCost + productOverhead;

        const idealDistribution = prod.idealDistribution[currentQuarter];
        for (var channel in idealDistribution) {
            prod.channelDistribution[channel] = Math.round(idealDistribution[channel]);
        }
    }

    financials.planned_workforce = Math.ceil(totalWorkforce);

    const manpowerCost = financials.planned_workforce * parseInt(caseStudy.financials.avg_salary || 0);

    const costs = manpowerCost + investments +
        financials.current_depreciation_plant +
        financials.current_depreciation_research +
        financials.current_depreciation_projects +
        financials.sales_force +
        financials.administrative_costs +
        parseInt(financials.overheads || 0) +
        parseInt(financials.miscellaneous_cost_1 || 0) +
        parseInt(financials.miscellaneous_cost_2 || 0) +
        parseInt(financials.miscellaneous_cost_3 || 0) +
        parseInt(financials.miscellaneous_cost_4 || 0) +
        parseInt(financials.miscellaneous_cost_5 || 0) +
        financials.interest +
        financials.emergency_loan_interest;

    const additionalCosts = costs / (totalProduction * .7);

    const idealPrice = {};
    var _totalPrice = 0;
    for (var j = 0; j < caseStudy.market.segments.length; j++) {
        const segment = caseStudy.market.segments[j];
        idealPrice[segment.name] = parseInt(segment.ideal_price || 0);
        _totalPrice += idealPrice[segment.name];
    }

    for (var prop in idealPrice) {
        idealPrice[prop] = idealPrice[prop] * 100 / _totalPrice;
    }

    for (var i = 0; i < products.length; i++) {
        const prod = products[i];
        prod.total_product_cost = prod.cost + additionalCosts;
        const marginPct = Math.random() * 20 + 20 + parseInt(financials.sales_tax_rate || 0) + parseInt(financials.admin_overhead || 0);
        prod.salesPrice_on_margin = Math.round(prod.total_product_cost + (prod.total_product_cost * marginPct / 100));

        if (currentQuarter == 1) {
            if (prod.salesPrice > prod.salesPrice_on_margin) {
                prod.salesPrice = Math.round(Math.random() * (prod.salesPrice - prod.salesPrice_on_margin) + prod.salesPrice_on_margin);
            }
            else {
                prod.salesPrice = prod.salesPrice_on_margin;
            }
            decisions['prod_' + i + '_sales_price'] = prod.salesPrice;
            continue;
        }

        var competitionPrice = minSegmentPrice(prevData.products, prod.target);
        decisions['prod_' + i + '_competition_price'] = competitionPrice;

        if (competitionPrice < prod.total_product_cost) {
            prod.salesPrice = prod.salesPrice_on_margin;
            decisions['prod_' + i + '_sales_price'] = prod.salesPrice;
            continue;
        }

        if (competitionPrice > prod.total_product_cost && competitionPrice < prod.salesPrice_on_margin) {
            prod.salesPrice = Math.round(Math.random() * (competitionPrice - prod.total_product_cost) + prod.total_product_cost);
            decisions['prod_' + i + '_sales_price'] = prod.salesPrice;
            continue;
        }

        prod.salesPrice = Math.round(Math.random() * (competitionPrice - prod.salesPrice_on_margin) + prod.salesPrice_on_margin);
        decisions['prod_' + i + '_sales_price'] = prod.salesPrice;
    }

    var selected = 'None';
    var growth = 0;

    if (prevDemand > plantCapacity) {
        const shortfall = prevDemand - plantCapacity;

        var idx = -1;
        for (var i = 0; i < caseStudy.plants.options.length; i++) {
            const plant = caseStudy.plants.options[i];
            const capacity = parseInt(plant.capacity || 0);

            if (capacity > shortfall && Math.round(shortfall / capacity)) {
                idx = i;
                break;
            }
        }

        if (idx != -1) {
            const option = caseStudy.plants.options[i];
            selected = option.label;
            growth += parseInt(option.investment || 0);
            decisions.selected_plant = option.label;
        }
    }

    const specialProjects = {};
    const projectProbability = Math.round(2 * 100 / caseStudy.special_projects.length);
    var sp = '';

    for (var i = 0; i < caseStudy.special_projects.length; i++) {
        const invest = Math.round(Math.random() * 100) < projectProbability;
        if (!invest) {
            continue;
        }

        const project = caseStudy.special_projects[i];
        const idx = Math.round(Math.random() * (project.options.length - 1));
        const option = project.options[idx];
        specialProjects[project.key] = option.label;
        sp += i + ':' + option.label + '||';
        growth += parseInt(option.investment || 0);
    }

    decisions['special_projects'] = sp;

    if (growth < parseInt(financials.cash_balance || 0) && parseInt(financials.shares_facevalue || 0) > parseFloat(financials.stock_price)) {
        financials.issue_shares = Math.ceil(growth / parseInt(financials.stock_price || 0));
    }

    const coll = db.collection('decisions');
    await coll.insertOne(decisions);

    const _data = {
        financials: financials,
        products: products,
        scores: {},
        selectedPlant: selected,
        special_projects: specialProjects,
        news: {},
        specs: [...caseStudy.product.specs],
        decisions_key: decisions.key
    };

    return _data;
};

const takeRangeDecision = (val1, val2, range) => {
    const _val1 = parseInt(val1 || 0);
    const _val2 = parseInt(val2 || 0);
    const min = Math.round(Math.min(_val1, _val2) * (1 - range / 100));
    const max = Math.round(Math.max(_val1, _val2) * (1 + range / 100));

    return Math.round(Math.random() * Math.abs(max - min) + min);
};

module.exports = apis;

/* code for file locking

const fs = require('fs');
const fsExt = require('fs-ext');

async function saveFileWithLock(filePath, data) {
  return new Promise((resolve, reject) => {
    // Open the file for writing
    fs.open(filePath, 'w', (err, fd) => {
      if (err) {
        return reject(`Error opening file: ${err.message}`);
      }

      // Apply an exclusive lock
      fsExt.flock(fd, 'ex', (err) => {
        if (err) {
          fs.close(fd, () => {}); // Ensure the file descriptor is closed
          return reject(`Error locking file: ${err.message}`);
        }

        // Write the data to the file
        fs.write(fd, data, (err) => {
          if (err) {
            fsExt.flock(fd, 'un', () => fs.close(fd, () => {})); // Unlock and close
            return reject(`Error writing to file: ${err.message}`);
          }

          // Release the lock
          fsExt.flock(fd, 'un', (err) => {
            if (err) {
              fs.close(fd, () => {});
              return reject(`Error unlocking file: ${err.message}`);
            }

            // Close the file
            fs.close(fd, (err) => {
              if (err) {
                return reject(`Error closing file: ${err.message}`);
              }
              resolve('File saved successfully');
            });
          });
        });
      });
    });
  });
}

// Usage
saveFileWithLock('./example.txt', 'This is the new content')
  .then(console.log)
  .catch(console.error);
*/
