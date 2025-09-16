import React from "react";
import { post } from './ServerCall';
import Icon from '../Icon.js';
import ShowToast from './ShowToast';
import db from '../utils/db';

const EditableListRowToolbar = (props) => {
    const idx = props.idx;
    const list = props.list;
    const template = props.template;

    const toolbarStyle = {
        display: 'flex',
        position: 'absolute',
        right: 0,
        top: 0,
        textAlign: 'right',
        zIndex: 1
    };

    if (props.toolbarStyle) {
        for (var prop in props.toolbarStyle) {
            toolbarStyle[prop] = props.toolbarStyle[prop];
        }
    }

    const addClicked = async () => {
        const _template = typeof template === 'function' ? template(list.length) : template;
        _template.idx = list.length;
        list.push(_template);

        if (props.onListChange) {
            props.onListChange(list);
            return;
        }

        await db.saveCaseStudyData(props, props.saveKey, list, props.filters || null);
    };

    return ((props.mode == 'edit' || props.user.role == 'superadmin') && 
        <span className='editable_wrapper list_row_toolbar' style={{ position: 'relative', display: 'block' }} >
            <span className="toolbar" style={toolbarStyle}>
                <span className="toolbar_button list_add_button" onClick={addClicked} ><Icon name="add" /></span>
            </span>
        </span>
    );
};

export default EditableListRowToolbar;
