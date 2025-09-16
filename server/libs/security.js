const crypt = require('./crypt');

const _guests = [
    '/auth/login',
    '/auth/logout',
    '/system/get_all_styles',
    '/system/get_images',
    '/website/institute_list',
    '/website/faculty_list',
    '/website/leaderboard',
    '/website/site_data',
    '/guest/validate',
    '/guest/national_leaderboard'
];

/*
const _examinee = [
    '/examinee/get_exam',
    '/examinee/record_answer',
    '/examinee/get_answers'
];
*/

const _userOnly = [
    '/user/game_details',
    '/user/state_leaderboard',
    '/user/institute_leaderboard',
    '/user/get_game_data',
    '/user/get_assigned_games',
    '/user/update_game_data',
    '/user/save_game_data',
    '/user/submit_data'
];

const _adminOnly = [
    '/admin/save_game_state_data',
    '/admin/user_list',
    '/admin/user_save',
    '/admin/user_save_password',
    '/admin/user_reset_password',
    '/admin/save_user_data',
    '/admin/games_list',
    '/admin/download_user_list',
    '/admin/game_users',
    '/admin/add_more_game_users',
    '/admin/new_game',
    '/admin/save_game',
    '/admin/reset_game',
    '/admin/start_game',
    '/admin/add_faculty',
    '/admin/delete_faculty',
    '/admin/institute_admins',
    '/admin/institute_admin_add',
    '/admin/save_institute_data',
    '/admin/delete_admin_user',
    '/admin/case_study_list',
    '/admin/academic_years_list',
    '/admin/select_institute',
    '/admin/get_case_study',
    '/admin/undo_quarter',
    '/admin/process_quarter',
    '/admin/reset_quarter',
    '/admin/start_next_quarter',
    '/admin/assessment_timeout',
    '/admin/quarter_timeout',

    '/admin/save_institute_image',
    '/admin/upload_student_list',
    '/admin/upload_game_students'
];

const _superAdminOnly = [
    '/admin/user_remove',
    '/sadmin/case_study_add',
    '/sadmin/case_study_remove',
    '/sadmin/change_case_study_name',
    '/sadmin/select_case_study',
    '/sadmin/institute_list',
    '/sadmin/institute_add',
    '/sadmin/institute_remove',
    '/sadmin/change_institute_name',
    '/sadmin/add_license',
    '/sadmin/delete_license',
    '/sadmin/get_colors',
    '/sadmin/save_colors',
    '/sadmin/get_styles',
    '/sadmin/save_styles',
    '/sadmin/remove_image_override',
    '/sadmin/save_case_study_data',
    '/sadmin/remove_case_study_value',
    '/sadmin/save_website_data',
    '/sadmin/delete_game',

    '/sadmin/upload_system_image',
    '/sadmin/save_case_study_image',
    '/admin/upload_bot_decisions'
];

const token = (user) => {
    const auth = {
        key: user.key,
        role: user.role,
        institute_key: user.institute_key
    };
    return  crypt.encrypt(JSON.stringify(auth));
};

const validate = async (txn, db, input) => {
    if (_guests.includes(txn)) {
        return {};
    }

    const roles = ['user', 'admin', 'superadmin'];

    const user = input.user;

    if (!user || !user.auth) {
        return null;
    }

    var auth = crypt.decrypt(user.auth);
    if (!auth) {
        return null;
    }

    try {
        auth = JSON.parse(auth);
    }
    catch (e) {
        return null;
    }

    if (!auth) {
        return null;
    }
    
    const role = auth.role;
    //const role = user.role;
    if (roles.indexOf(role) == -1 || role != user.role) {
        return null;
    }

    const key = auth.key;
    if (!auth.key || auth.key != user.key) {
        return null;
    }

    const users = db.collection('users');
    const _user = await users.findOne({ key: key }, { projection: { _id: 0, password: 0 } });
    if (!_user) {
        return null;
    }

    if (user.email != _user.email || user.role != _user.role) {
        return null;
    }

    if (role == 'superadmin' && (_guests.includes(txn) || _userOnly.includes(txn) || _adminOnly.includes(txn) || _superAdminOnly.includes(txn))) {
        return _user;
    }

    if (role == 'admin' && (_userOnly.includes(txn) || _adminOnly.includes(txn))) {
        if (!auth.institute_key) {
            return null;
        }

        if (auth.institute_key != user.institute_key || auth.institute_key != _user.institute_key) {
            return null;
        }

        return _user;
    }

    if (role == 'user' && _userOnly.includes(txn)) {
        return _user;
    }

    return null;
};

module.exports = {
    validate: validate,
    token: token
};
