import React from "react";
import db from '../utils/db';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const TextBlock = (props) => {
    const caseStudy = props.caseStudy;

    const setValue = async (text) => {
        if (props.onSave) {
            await props.onSave(text);
            return true;
        }

        const saveFunction = props.saveFn || 'saveCaseStudyData';

        const result = await db[saveFunction](props, props.saveKey, text, props.filters || null, false);
        return (!result);
    };

    return props.mode == 'edit' ?
        <ReactQuill theme="snow" value={props.text || 'Text Block'} onChange={setValue} />
    :
        <div dangerouslySetInnerHTML={{ __html: props.text || 'Text Block' }} />;
};

export default TextBlock;
