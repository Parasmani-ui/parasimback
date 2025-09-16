import React from "react";
import { post } from './ServerCall';
import Icon from '../Icon.js';
import ShowToast from './ShowToast';
import db from '../utils/db';

const EditableListColToolbar = (props) => {
    const idx = props.idx;
    const list = props.list || [];
    const dontMove = props.dontMove;

    const toolbarStyle = {
        display: 'flex',
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 1
    };

    if (props.toolbarStyle) {
        for (var prop in props.toolbarStyle) {
            toolbarStyle[prop] = props.toolbarStyle[prop];
        }
    }

    const saveList = async (props, list) => {
        if (props.onListChange) {
            props.onListChange(list);
            return;
        }

        await db.saveCaseStudyData(props, props.saveKey, list, props.filters || null);
    };

    const removeClicked = async () => {
        if (list.length == 1) {
            ShowToast({icon: 'danger', heading: 'Cannot remove last item', message: 'The list must have at least 1 item. It is not possible to remove the last item in the list.'});
            return;
        }
        const _list = list;
        _list.splice(idx, 1);
        for (var i = 0; i < _list.length; i++) {
            _list[i].idx = i;
        }
        await saveList(props, _list);
    };

    const leftClicked = async () => {
        list[idx].idx = idx - 1;
        list[idx - 1].idx = idx;
        const _list = list.sort((a, b) => { return a.idx - b.idx; });
        await saveList(props, _list);
    };

    const rightClicked = async () => {
        list[idx].idx = idx + 1;
        list[idx + 1].idx = idx;
        const _list = list.sort((a, b) => { return a.idx - b.idx; });
        await saveList(props, _list);
    };

    return (props.mode == 'edit' &&
        <span className='editable_wrapper list_col_toolbar' style={{ position: 'relative', display: 'block' }} >
            <span className="toolbar" style={toolbarStyle}>
                {idx != 0 && !dontMove && <span className="toolbar_button list_left_button" onClick={() => leftClicked()} ><Icon name="left" /></span>}
                {idx != (list.length - 1) && !dontMove && <span className="toolbar_button list_right_button" onClick={() => rightClicked()} ><Icon name="right" /></span>}
                <span className="toolbar_button list_delete_button" onClick={removeClicked} ><Icon name="remove" /></span>
            </span>
        </span>
    );
};

export default EditableListColToolbar;
