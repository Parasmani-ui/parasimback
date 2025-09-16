import React from "react";
import { useState, useRef } from "react";
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import { post } from './ServerCall';
import Icon from '../Icon.js';
import ShowModal from './ShowModal';
import ShowToast from './ShowToast';
import db from '../utils/db';

const EditProgressBar = (props) => {
    const caseStudy = props.caseStudy;
    const levels = caseStudy.progressBarColors;
    const error = useRef();

    var warning = levels.warning;
    var success = levels.success;

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

    const validate = () => {
        if (warning >= success) {
            error.current.innerText = 'Warning value must be less than success value';
            return false;
        }

        if (warning <= 0) {
            error.current.innerText = 'Warning value must be greater than 0';
            return false;
        }

        if (warning >= 100) {
            error.current.innerText = 'Warning value must be less than 100';
            return false;
        }

        if (success <= 0) {
            error.current.innerText = 'Success value must be greater than 0';
            return false;
        }

        if (success >= 100) {
            error.current.innerText = 'Success value must be less than 100';
            return false;
        }

        error.current.innerText = '';
        return true;
    };

    const warningChanged = (e) => {
        warning = e.target.value.length ? parseInt(e.target.value) : 0;
        validate();
    }

    const successChanged = (e) => {
        success = e.target.value.length ? parseInt(e.target.value) : 0;
        validate();
    }

    const editClicked = () => {
        ShowModal({
            title: 'Edit Progress Bar',
            body: <div>
                <InputGroup className="mb-3">
                    <InputGroup.Text>danger</InputGroup.Text>
                    <Form.Control
                        type="number"
                        value={levels.danger || '0'}
                        disabled
                    />
                </InputGroup>
                <InputGroup className="mb-3">
                    <InputGroup.Text>warning</InputGroup.Text>
                    <Form.Control
                        type="number"
                        defaultValue={levels.warning || '0'}
                        onChange={warningChanged}
                    />
                </InputGroup>
                <InputGroup className="mb-3">
                    <InputGroup.Text>success</InputGroup.Text>
                    <Form.Control
                        type="number"
                        defaultValue={levels.success || '0'}
                        onChange={successChanged}
                    />                    
                </InputGroup>
                <div style={{color: 'red', height: '40px', width: '250px'}} ref={error}></div>
            </div>,
            buttons: [
                {
                    text: 'Save',
                    onClick: async () => {
                        if (!validate())
                        {
                            return false;
                        }

                        await db.saveCaseStudyData(props, "progressBarColors", {
                            danger: levels.danger,
                            warning: warning,
                            success: success
                        }, props.filters || null);
                        
                        return true;
                    }
                }
            ]
        });
    };

    return (props.mode == 'edit' &&
        <span className='editable_wrapper edit_progress_bar' style={{ position: 'relative', display: 'block' }} >
            <span className="toolbar" style={toolbarStyle}>
                <span className="toolbar_button edit_progress_bar_button" onClick={editClicked} ><Icon name="stoplight" /></span>
            </span>
        </span>
    );
};

export default EditProgressBar;
