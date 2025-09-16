import React from 'react';
import {useRef, useState} from 'react';
import Icon from '../Icon.js';

const EditableText = (props) => {
    const element = useRef();
    const [originalText, setOriginalText] = useState(props.text);
    const [updatedText, setUpdatedText] = useState(props.text);
    const [showSave, setShowSave] = useState(false);

    const toolbarStyle = {
        display: 'flex',
        position: 'absolute', 
        right: '-55px', 
        top: 0,
        zIndex: 1
    };

    if (props.toolbarStyle) {
        for (var prop in props.toolbarStyle) {
            toolbarStyle[prop] = props.toolbarStyle[prop];
        }
    }

    const emitChange = () => {
        const text = element.current.innerText.trim();
        setUpdatedText(text);

        setShowSave(text != originalText);
        

        if (!text.length) {
            element.current.setAttribute('class', 'blank_input');
            element.current.style.outline = '1px solid red';
            props.onChange && props.onChange(text);
            return;
        }

        if (props.isValid) {
            if (props.isValid(text)) {
                element.current.setAttribute('class', 'valid_input')
                element.current.style.outline = 'none';
            }
            else 
            {
                element.current.setAttribute('class', 'invalid_input');
                element.current.style.outline = '1px solid red';
            }
        }
        props.onChange && props.onChange(text);
    };

    const saveClicked = async () => {
        if (!props.onSave) {
            console.error('Error: onSave not specified');
            return;
        }

        const result = await props.onSave(updatedText);
        if (result) {
            setOriginalText(updatedText);
            setShowSave(false);
            element.current.setAttribute('class', 'valid_input')
            element.current.style.outline = 'none';
            return;
        }
        
        element.current.setAttribute('class', 'invalid_input');
        element.current.style.outline = '1px solid red';
    };

    const cancelClicked = () => {
        element.current.innerText = originalText;
        setUpdatedText(originalText);
        setShowSave(false);
        element.current.setAttribute('class', 'valid_input')
        element.current.style.outline = 'none';
    };

    return (
        <span className='editable_text editable_wrapper' style={{position: 'relative', display: 'inline-block', minHeight: '20px'}} >
        <span
            onInput={emitChange}
            onBlur={emitChange}
            onFocus={emitChange}
            contentEditable={props.editable}
            suppressContentEditableWarning={true}
            ref={element}
            style={{display:'inline-block'}}
        >
            {props.text}
        </span>
        {originalText != updatedText && 
            <span className="toolbar" style={toolbarStyle}>
                {showSave && <span className="toolbar_button" onClick={saveClicked} ><Icon name="save" /></span>}
                {showSave && <span className="toolbar_button" onClick={cancelClicked} ><Icon name="cross" /></span>}
            </span>
        }
        </span>
    );
};

export default EditableText;
