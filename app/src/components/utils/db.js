import ShowToast from './ShowToast';
import { post, upload } from './ServerCall';
import gameConfig from '../../gameConfig';

const saveData = async (txn, key, props, saveKey, value, filters, dontUpdate) => {
    if (!key || !key.trim()) {
        ShowToast({rc: 'danger', heading: 'Error in transaction', message: 'Missing key in ' + txn});
        return;
    }
    if (!saveKey || !saveKey.trim()) {
        ShowToast({rc: 'danger', heading: 'Error in transaction', message: 'Missing save key in ' + txn});
        return;
    }
    const result = await post(
        txn,
        props.user,
        {
            obj_key: key,
            save_key: saveKey,
            value: value,
            filters: filters,
            quarter: props.currentQuarter
        }
    );

    if (result && result.rc) {
        ShowToast({ icon: 'danger', heading: 'Error saving value', small: txn, message: result.rc });
        return null;
    }

    !dontUpdate && (
        props.updateParent ? await props.updateParent({key: key, saveKey: saveKey, value: value, filters: filters}) : 
        (props.updateData ? await props.updateData({key: key, saveKey: saveKey, value: value, filters: filters}) : null));
    return result;
};

const saveImage = async (txn, key, props, saveKey, prevImage, image, filters, dontUpdate) => {
    const result = await upload(
        txn, 
        props.user,
        { 
            obj_key: key,
            image_key: saveKey,
            prev_image: prevImage ? prevImage.replace(gameConfig.PUBLIC_URL, '') : '',
            filters: filters || null
        },
        image
    );

    if (result && result.rc) {
        ShowToast({ icon: 'danger', heading: 'Error saving value', small: txn, message: result.rc });
        return null;
    }

    !dontUpdate && 
        (props.updateParent ? await props.updateParent({key: key, saveKey: saveKey, value: result.url}) : 
        await props.updateData({key: key, saveKey: saveKey, value: result.url}));
    return result.url;
};

const db = {
    saveCaseStudyData: async (props, saveKey, value, filters, dontUpdate) => {
        return await saveData('sadmin/save_case_study_data', props.caseStudy.key, props, saveKey, value, filters, dontUpdate);
    },

    saveGameData: async (props, saveKey, value, filters, dontUpdate) => {
        return await saveData('user/save_game_data', props.game.game_key, props, saveKey, value, filters, dontUpdate);
    },

    saveGameState: async (props, saveKey, value, filters, dontUpdate) => {
        if (!props.selectedGame && !props.selectedAdminGame) {
            ShowToast({icon: 'danger', heading: 'Error saving game data', message: 'no selected game'});
            return;
        }
        return await saveData('admin/save_game_state_data', props.selectedGame ? props.selectedGame.key : props.selectedAdminGame.key, props, saveKey, value, filters, dontUpdate);
    },

    saveSiteData: async (props, saveKey, value, filters, dontUpdate) => {
        return await saveData('sadmin/save_website_data', props.pageName, props, saveKey, value, filters, dontUpdate);
    },

    saveUserData: async (props, saveKey, value, filters, dontUpdate) => {
        return await saveData('admin/save_user_data', props.user.key, props, saveKey, value, filters, dontUpdate);
    },

    saveInstituteData: async (props, saveKey, value, filters, dontUpdate) => {
        return await saveData('admin/save_institute_data', props.institute.key, props, saveKey, value, filters, dontUpdate);
    },

    saveCaseStudyImage: async (props, saveKey, prevImage, image, filters, dontUpdate) => {
        return await saveImage('sadmin/save_case_study_image', props.caseStudy.key, props, saveKey, prevImage, image, filters, dontUpdate);
    },

    saveInstituteImage: async (props, saveKey, prevImage, image, filters, dontUpdate) => {
        return await saveImage('admin/save_institute_image', props.institute.key, props, saveKey, prevImage, image, filters, dontUpdate);
    },
};

export default db;
