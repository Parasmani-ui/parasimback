import React from "react";
import { useState, useRef, useEffect } from "react";
import {uuid } from '../utils/common';
import Icon from '../Icon';
import { upload } from './ServerCall';
import gameConfig from '../../gameConfig';
import ShowToast from './ShowToast';
import db from '../utils/db';

const EditableImage = (props) => {
    const [owner, setOwner] = useState();
    const [imageURL, setImageURL] = useState();
    const [image, setImage] = useState(null);
    const [showSave, setShowSave] = useState(false);

    useEffect(() => {
        if (props.owner && props.owner != owner ) {
            setImageURL(props.src);
            setOwner(props.owner);
            setShowSave(false);
        }
        else
        {
            setImageURL(imageURL || props.src);
        }
    });

    const element = useRef();

    const toolbarStyle = {
        display: 'flex',
        position: 'absolute', 
        right: 0, 
        top: 0
    };

    if (props.toolbarStyle) {
        for (var prop in props.toolbarStyle) {
            toolbarStyle[prop] = props.toolbarStyle[prop];
        }
    }

    var _style = { ...props.style };

    if (props.imageMode == 'background') {
        _style.backgroundImage = 'url(' + imageURL + ')';
        _style.backgroundSize = 'cover';
    }

    const imageChanged = (e) => {
        if (e.target.files[0]) {
            setImage(e.target.files[0]);
            const url = URL.createObjectURL(e.target.files[0]);
            setImageURL(url);
            if (props.imageMode == 'background') {
                element.current.style.backgroundImage = 'url(' + url + ')';
                element.current.style.backgroundSize = 'cover';
            }
            setShowSave(true);
        }
    };

    const saveImage = async () => {
        if (props.mode != 'edit' && !props.editable) {
            setShowSave(false);
            return;
        }

        const saveFn = props.saveFn || 'saveCaseStudyImage';
        const result = await db[saveFn](props, props.saveKey, props.src, image, props.filters || null, false);
        setImageURL(result.url);
        setShowSave(false);
        //props.updateData();

        /*
        const result = await upload(
            'sadmin/save_case_study_image', 
            props.user,
            { 
                case_study: props.caseStudy.key, 
                image_key: props.saveKey,
                prev_image: props.src ? props.src.replace(gameConfig.PUBLIC_URL, '') : '',
                filters: props.filters || null
            },
            image
        );
        if (result.rc) {
            ShowToast({icon: 'danger', heading: 'Error saving value', small: 'sadmin/save_case_study_image', message: result.rc});
            return;
        }
        setShowSave(false);
        await props.updateData();
        */
    };

    const revertImage = () => {
        setImageURL(props.src);
        if (props.imageMode == 'background') {
            element.current.style.backgroundImage = 'url(' + props.src + ')';
            element.current.style.backgroundSize = 'cover';
        }
        setImage(null);
        setShowSave(false);
    };

    const id = uuid();

    return (
        <div className="editable_wrapper" style={{ position: 'relative', textAlign: 'center' }}>
            {(props.mode == 'edit' || props.editable) && 
                <span className="toolbar" style={toolbarStyle}>
                    <span className="toolbar_button">
                        <label htmlFor={id}>
                            <Icon name="upload" />
                        </label>
                        <input id={id} style={{ display: 'none' }} type="file" onChange={imageChanged} />
                    </span>
                    {showSave && <span className="toolbar_button" onClick={saveImage}><Icon name="save" /></span>}
                    {showSave && <span className="toolbar_button" onClick={revertImage}><Icon name="cross" /></span>}
                </span>
            }
            {(props.imageMode == 'background' ?
                <div className="editable_background_image" style={_style} ref={element}></div> :
                <img src={imageURL} style={_style} />)}
        </div>
    );
};

export default EditableImage;
