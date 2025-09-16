var fs = require('fs');
const xlsx = require('xlsx');
const crypt = require('./crypt');
const security = require('./security');
const _uuid = require('uuid');
const _data_folder = '../data/';

const uuid = () => {
    return _uuid.v4() + '-' + Math.round(Math.random() * 10000);
};

const _guests = [
];

const apis = {
    'validate': async (txn, db, input) => {
        return security.validate(txn, db, input);
    },

    '/sadmin/upload_system_image': async (txn, db, input, file) => {
        const varName = input.data.file_var;
        const tempFileName = file.path;
        const fileName = file.originalname.trim().toLowerCase().replace(/[^a-z0-9\.\_]+/g, '-');

        var images = {};
        if (fs.existsSync(_data_folder + 'images.json')) {
            images = JSON.parse(fs.readFileSync(_data_folder + 'images.json', { encoding: 'utf8' }));
        }

        const prevImage = images[varName];
        if (prevImage) {
            if (/^overrides\//.test(prevImage) && fs.existsSync('../public/' + prevImage)) {
                fs.unlinkSync('../public/' + prevImage);
            }
        }

        images[varName] = 'overrides/' + file.filename + '-' + fileName;
        fs.writeFileSync(_data_folder + 'images.json', JSON.stringify(images), { encoding: 'utf8' });
        fs.renameSync(tempFileName, '../public/' + images[varName]);

        return ({ rc: 'success', data: { url: images[varName] } });
    },

    '/sadmin/save_case_study_image': async (txn, db, input, file) => {
        const imageKey = input.data.image_key;

        const folder = '../public/case_studies/' + input.data.obj_key + '/images/';
        const fileName = 'overrides/' + file.filename + '-' + file.originalname.trim().toLowerCase().replace(/[^a-z0-9\.\_]+/g, '-');

        fs.renameSync(file.path, folder + fileName);

        $set = {};
        $set[input.data.image_key] = fileName;
        const filters = { arrayFilters: input.data.filters } || {};

        const coll = db.collection('case_studies');
        await coll.updateOne({ key: input.data.obj_key }, { $set: $set }, filters);

        if (input.data.prev_image.split('/').indexOf('overrides') != -1 && fs.existsSync('../public/' + input.data.prev_image)) {
            fs.unlinkSync('../public/' + input.data.prev_image);
        }

        return ({ rc: 'success', data: { url: fileName } });
    },

    '/admin/save_institute_image': async (txn, db, input, file) => {
        const imageKey = input.data.image_key;

        const folder = '../public/';
        const fileName = 'uploads/' + file.filename + '-' + file.originalname.trim().toLowerCase().replace(/[^a-z0-9\.\_]+/g, '-');

        fs.renameSync(file.path, folder + fileName);

        $set = {};
        $set[input.data.image_key] = fileName;
        const filters = { arrayFilters: input.data.filters } || {};

        const coll = db.collection('institutes');
        await coll.updateOne({ key: input.data.obj_key }, { $set: $set }, filters);

        if (/^uploads\//.test(input.data.prev_image) && fs.existsSync('../public/' + input.data.prev_image)) {
            fs.unlinkSync('../public/' + input.data.prev_image);
        }

        return ({ rc: 'success', data: { url: fileName } });
    },

    '/admin/upload_student_list': async (txn, db, input, file) => {
        const coll = db.collection('users');

        const workbook = xlsx.readFile(file.path);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const range = xlsx.utils.decode_range(worksheet['!ref']);
        const data = [];

        const fields = ['s_no', 'roll_no', 'name', 'college_email', 'personal_email', 'phone', 'program'];

        const gcoll = db.collection('games');

        var errors = [];
        var updated = 0;
        var inserted = 0;

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

        for (let row = range.s.r + 1; row <= range.e.r; row++) {
            const _row = {};
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddress = xlsx.utils.encode_cell({ r: row, c: col });
                const cellValue = worksheet[cellAddress]?.v || '';
                _row[fields[col]] = cellValue;
            }

            var hasData = false;
            for (var prop in _row) {
                if (_row[prop]) {
                    hasData = true;
                    break;
                }
            }
            if (!hasData) {
                continue;
            }

            _row.email = _row.college_email;
            delete _row.college_email;

            if (!_row.email) {
                errors.push({ row: row, message: 'missing email', record: _row });
                continue;
            }

            if (!_row.name) {
                errors.push({ row: row, message: 'missing name', record: _row });
                continue;
            }

            if (!_row.licenses) {
                _row.licenses = [];
            }

            const user = await coll.findOne({ email: _row.email });
            if (user) {
                if (user.institute_key != input.data.institute_key) {
                    errors.push({ row: row, message: 'user linked to another institute', record: _row });
                    continue;
                }
                else {
                    const email = _row.email;
                    delete _row.email;
                    delete _row._id;
                    delete _row.password;
                    delete _row.key;
                    delete _row.institute_key;

                    if (_row.licenses.indexOf(current.key) == -1) {
                        const lic = parseInt(current.no_of_licenses || 0);
                        const used = parseInt(current.used || 0);
                        if (lic < 0 || lic > used) {
                            current.used = used + 1;
                            await institutes.updateOne({ key: inst.key }, { $set: { licenses: licenses } });
                        }
                        else {
                            errors.push({ row: row, message: 'user not added. no licenses available', record: _row });
                            continue;
                        }
                        _row.licenses.push(current.key);
                    }
                    
                    await coll.updateOne({ email: email }, { $set: _row });
                    updated++;
                }
            }
            else {
                const lic = parseInt(current.no_of_licenses || 0);
                const used = parseInt(current.used || 0);
                if (lic < 0 || lic > used) {
                    current.used = used + 1;
                    await institutes.updateOne({ key: inst.key }, { $set: { licenses: licenses } });
                }
                else {
                    errors.push({ row: row, message: 'user not added. no licenses available', record: _row });
                    continue;
                }

                _row.key = uuid();
                delete _row._id;
                delete _row.password;
                _row.role = 'user';
                _row.institute_key = input.data.institute_key;

                if (_row.licenses.indexOf(current.key) == -1) {
                    const lic = parseInt(current.no_of_licenses || 0);
                    const used = parseInt(current.used || 0);
                    if (lic < 0 || lic > used) {
                        current.used = used + 1;
                        await institutes.updateOne({ key: inst.key }, { $set: { licenses: licenses } });
                    }
                    else {
                        errors.push({ row: row, message: 'user not added. no licenses available', record: _row });
                        continue;
                    }
                    _row.licenses.push(current.key);
                }

                await coll.insertOne(_row);
                inserted++;
            }
        }

        fs.unlinkSync(file.path);

        const selector = { institute_key: input.data.institute_key, role: 'user' };

        const count = await coll.countDocuments(selector);
        const npages = Math.ceil(count / input.data.page_size);
        const options = { skip: (input.data.page - 1) * input.data.page_size || 0, limit: input.data.page_size };
        const users = await coll.find(selector, options, { projection: { _id: 0, password: 0 } }).toArray();

        return ({
            rc: 'success', 
            data: {
                users: users, npages: npages, updated: updated, inserted: inserted, errors: errors.length ? errors : null
            }
        });
    },

    '/admin/upload_game_students': async (txn, db, input, file) => {
        const coll = db.collection('users');

        const gameKey = input.data.game_key;
        const games = db.collection('games');

        const game = await games.findOne({key: gameKey});
        const type = game.type;

        const institutes = db.collection('institutes');
        const inst = await institutes.findOne({ key: game.institute });
        const maxGames = parseInt(inst.max_self_play_games || 0);

        const workbook = xlsx.readFile(file.path);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const range = xlsx.utils.decode_range(worksheet['!ref']);
        const data = [];

        const headings = ['Roll Number', 'Name', 'Email', 'Team', 'Market'];
        const fields = ['roll_no', 'name', 'email', 'team', 'market'];

        var errors = [];

        const prevUsers = game.users;
        const gameUsers = [];
        const users = [];
        const teams = {};

        for (let row = range.s.r + 1; row <= range.e.r; row++) {
            const _row = {};
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddress = xlsx.utils.encode_cell({ r: row, c: col });
                const cellValue = worksheet[cellAddress]?.v || '';
                _row[fields[col]] = cellValue;
            }

            if (!_row.email) {
                errors.push({ row: row, message: 'missing email', record: _row });
                continue;
            }

            const email = _row.email;

            const user = await coll.findOne({ email: email });
            if (!user) {
                errors.push({ row: row, message: 'user not found', record: _row });
                continue;
            }

            if (user.institute_key != inst.key) {
                errors.push({ row: row, message: 'user linked to another institute', record: _row });
                continue;
            }

            if (prevUsers.indexOf(user.email) != -1) {
                gameUsers.push(user.key);
                continue;
            }

            if (gameUsers.indexOf(user.key) != -1) {
                errors.push({ row: row, message: 'duplicate record', record: _row });
                continue;
            }

            switch (type) {
                case 'assessment':
                case 'self_play':                    
                    const ngames = parseInt(user.self_play_games || 0);
                    if (ngames >= maxGames) {
                        errors.push({ row: row, message: 'user has already played ' + maxGames + ' games.', record: _row });
                        continue;
                    }
                    
                    break;
    
                case 'team_play':
                    const nteams = parseInt(game.no_of_teams || 0);
                    if (!_row.team) {
                        errors.push({ row: row, message: 'team not allocated', record: _row });
                        continue;
                    }

                    const team = parseInt(_row.team || 0);
                    if (team > nteams) {
                        errors.push({ row: row, message: 'team allocation exceeds ' + nteams + ' teams', record: _row });
                        continue;
                    }

                    const teamName = 'Team ' + team;
                    if (!teams[teamName]) {
                        teams[teamName] = {
                            users: {}
                        }
                    }
                    teams[teamName].users[user.key] = {
                        key: user.key,
                        name: user.name
                    }
                    
                    break;
            }

            gameUsers.push(user.key);
            users.push(user);
        }

        await games.updateOne({ key: gameKey }, { $set: { users: gameUsers, teams: teams } });
        fs.unlinkSync(file.path);

        return ({
            rc: 'success',
            data: {
                users: users, teams: teams, errors: errors.length ? errors : null
            }
        });
    },

    '/admin/upload_bot_decisions': async (txn, db, input, file) => {
    }
};

module.exports = apis;
