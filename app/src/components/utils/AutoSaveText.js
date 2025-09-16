import React from "react";
import EditableText from './EditableText';
import { post } from './ServerCall';
import ShowToast from './ShowToast';
import db from '../utils/db';

const AutoSaveText = (props) => {
    const caseStudy = props.caseStudy;
    const regex = props.regex || /^[a-zA-Z0-9\s\!\.\,\-\_\?\(\)\&\%\+\/\=\*]+$/;

    const isValid = (value) => {
        return regex.test(value);
    };

    const onSave = async (text) => {
        if (!isValid(text)) {
            ShowToast({icon: 'danger', heading: 'Unable to save invalid value', small: 'Invalid Value', message: 'Only alphanumeric characters and ! , . - _ ? allowed'});
            return false;
        }

        if (props.onSave) {
            await props.onSave(text);
            return true;
        }

        const saveFunction = props.saveFn || 'saveCaseStudyData';

        const result = await db[saveFunction](props, props.saveKey, text, props.filters || null, false);
        return (!result);
    };

    return (
        <EditableText 
            editable={props.editable || props.mode == 'edit' || props.user.role == 'superadmin'}
            toolbarStyle={props.toolbarStyle}
            text={props.text}
            onSave={onSave}
            isValid={isValid}
        />
    );
};

export default AutoSaveText;
