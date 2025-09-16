const _domain = window.location.hostname;
const _port = window.location.port;
const _server = _domain == "localhost" ? `http://localhost:5000` : `https://${_domain}`;

const _public_url = _domain == "localhost" ? `http://localhost:5000/` : `https://${_domain}/`;

const version = (() => {
    if (_domain == 'localhost') {
        if (_port == 4000) {
            return 'game.aimabizlabedge.com';
        }
        if (_port == 3500) {
            return 'bizlab.parasim.in';
        }
        if (_port == 3000) {
            return 'game.parasim.in';
        }
    }
    else
    {
        return _domain;
    }
    return null;
})();

const gameConfig = {
    "VERSION": version,
    "DOMAIN": _domain,
    "PORT": _port,
    "USE_STUBS": false,
    "SERVER_URL": _server,
    "GET_URL": _server,
    "API_URL": _server + "/api",
    "UPLOAD_URL": _server + "/upload",
    "SOCKET_URL": _server,
    "PUBLIC_URL": _public_url,
    "ITEMS_PER_PAGE_BATCH_LIST": 5,
    "DEBUG_DISABLE_LOCALSTORAGE": false,

    getCaseStudyImagePath: (key, image) => {
        return key && image ? _public_url + 'case_studies/' + key + '/images/' + image : null;
    },
    getImagePath: (image) => {
        return _public_url + image;
    },

    academicYearCutOffDate: '01-05',

    defaultPage: {
        user: 'home',
        admin: 'games',
        superadmin: 'case_studies_list'
    },
    brandName: 
        version == 'game.aimabizlabedge.com' || 
        version == 'demo.aimabizlabedge.com' || 
        version == 'test.aimabizlabedge.com' || 
        version == 'bizlab.parasim.in' || 
        version == 'bizlab_demo.parasim.in' ?
        'Bizlab Edge' : 'Parasim',
    title: 
        version == 'game.aimabizlabedge.com' || 
        version == 'demo.aimabizlabedge.com' || 
        version == 'test.aimabizlabedge.com' || 
        version == 'bizlab.parasim.in' || 
        version == 'bizlab_demo.parasim.in' ?
        'Bizlab Edge - A business simulation game' : 'Parasim - A business simulation Game',
    favicon: 
        version == 'game.aimabizlabedge.com' || 
        version == 'demo.aimabizlabedge.com' || 
        version == 'test.aimabizlabedge.com' || 
        version == 'bizlab.parasim.in' || 
        version == 'bizlab_demo.parasim.in' ?
        'images/bizlab-favicon.ico' : 'images/parasim-favicon.ico',

    progressBarColors: {
        0: 'red',
        33: 'orange',
        75: 'green'
    },
    defaultColors: {
        '--loginpage_background_color': '#060919',
        '--loginform_background_color': '#060919',
        '--loginform_text_color': '#ffffff',

        '--container-background-color': '#cccccc',
        '--navigate-bar-background-color': '#ddddff',
        '--card-background-color': '#efefef',
        '--chart-background-color': '#fffffe',
        '--table-background-color': '#fffffe',
        '--news-background-color': '#fffffe',
        '--subcard-background-color': '#fffffe',

        '--loginform_button_background_color': '#2196F3',
        '--loginform_button_text_color': '#FFFFFF',

        /* global */
        '--icon_color': '#000000',
        '--toolbar_background_color': '#ADD8E6',
        '--toolbar_text_color': '#0000FF',
        '--negative_amount_color': '#ff0000',
        '--errormsg_color': '#ff0000',

        /* app_page */
        '--default_page_background_color': '#efefef', 
        '--default_page_text_color': '#0c0606',

        /* header */
        '--header_background_color': '#5fb4c5',
        '--brand_background_color': '#2f74c5',
        '--brand_text_color': '#e6f1f3',
        '--header_nav_text_color': '#0f4475',

        /* footer */
        '--footer_background_color': '#adadad',
        '--footer_text_color': '#090909',

        /* sidebar */
        '--sidebar_background_color': '#4fa4c5',
        '--sidebar_text_color': '#e6f1f3',
        '--sidebar_background_color_active': '#5fb4c5',
        '--sidebar_text_color_active': '#e6f1f3',
        '--sidebar_background_color_hover': '#93b1c6',
        '--sidebar_text_color_hover': '#f5f5f5',
        '--sidebar_collapse_button_background_color': '#77e5d5',
        '--parentnav_background_color': '#0f9fb4',
        '--parentnav_text_color': '#e0e4e9',

        /* dashboard */
        '--dashboard_item_border_color': '#120202',
        '--dashboard_item_background_color': '#ead8d8',
        '--dashboard_item_text_color': '#0d062b',
        '--dashboard_item_background_color_hover': '#d3b2b2',

        /* case study list */
        '--active_case_study_background_color' : '#eeeeee',

        /* card */
        '--card-header-background': '#dfefff',
        '--card-header-text-color': '#403a97',
        '--card-border-color': '#ececec',
        '--card-text-color': '#2f2f2f',

        /* html */
        '--button-background-color': '#4684df',
        '--button-text-color': '#e6f1f3',
        '--table-heading-background-color': '#dfefff',
        '--table-heading-border-color': '#b6b2f1',
        '--table-heading-text-color': '#403a97'
    },

    defaultStyles: {
        '--loginform_width': '500px',
        '--loginform_padding': '20px',
        '--card-shadow': '3px 3px 3px #dddddd'
    },

    defaultImages: {
        'game_logo': version == 'game.aimabizlabedge.com' || version == 'demo.aimabizlabedge.com' || version == 'bizlab.parasim.in' || version == 'bizlab_demo.parasim.in' ? 'images/bizlab-logo.png' : 'images/parasim-logo-small.png',

        'page_background': 'images/pexels-kindel-media-7688336.jpg',
        'login_page_background': 'images/grid-background.svg',

        'case_study_link_thumbnail': 'images/pexels-katerina-holmes-5905522.jpg',
        'dashboard_link_thumbnail': 'images/pexels-mike-b-945443.jpg',
        'leaderboard_link_thumbnail': 'images/pexels-anna-tarazevich-6370120.jpg',
        'games_list_link_thumbnail': 'images/pexels-pixabay-278918.jpg',

        'demand_forecast_link_thumbnail': 'images/pexels-photo-8734409.jpg',
        'market_share_link_thumbnail': 'images/business-4546620_960_720.jpg',
        'competition_link_thumbnail': 'images/pexels-photo-5940841.jpg',
        'projects_results_link_thumbnail': 'images/pexels-andrea-piacquadio-3760613.jpg',

        'income_statement_link_thumbnail': 'images/pexels-tima-miroshnichenko-6693655.jpg',
        'cashflow_statement_link_thumbnail': 'images/pexels-karolina-grabowska-4968639.jpg',
        'balance_sheet_link_thumbnail': 'images/pexels-pavel-danilyuk-7658352.jpg',
        'financial_ratios_link_thumbnail': 'images/pexels-lukas-590041.jpg',

        'products_link_thumbnail': 'images/pexels-brett-jordan-2643698.jpg',
        'rankings_link_thumbnail': 'images/pexels-ds-stories-7267585.jpg',
        'marketing_link_thumbnail': 'images/pexels-lukas-hartmann-1827234.jpg',
        'manufacturing_link_thumbnail': 'images/pexels-thisisengineering-3862129.jpg',
        'human_resources_link_thumbnail': 'images/pexels-edmond-dantes-4344860.jpg',
        'financing_link_thumbnail': 'images/pexels-ravi-roshan-8576782.jpg',
        'special_projects_link_thumbnail': 'images/pexels-startup-stock-photos-212286.jpg',
        'projections_link_thumbnail': 'images/pexels-anna-nekrashevich-6801647.jpg',
        'submit_link_thumbnail': 'images/pexels-unseop-kang-8855545.jpg'
    },

    getRandomTeamNames: (n) => {
        const names = [];
        for (var i = 1; i <= n; i++) {
            names.push('Team ' + i);
        }
        return names;
    }
};

export default gameConfig;