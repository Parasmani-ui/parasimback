import React from "react";
import { useState, useRef } from "react";
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import { post } from './ServerCall';
import Icon from '../Icon.js';
import ShowModal from './ShowModal';
import ShowToast from './ShowToast';
import db from '../utils/db';

const EditLabelsToolbar = (props) => {
    const caseStudy = props.caseStudy;
    const labelName = props.labelName;
    var danger = caseStudy.kpmMessages[labelName].danger;
    var warning = caseStudy.kpmMessages[labelName].warning;
    var success = caseStudy.kpmMessages[labelName].success;

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

    const editClicked = () => {
        ShowModal({
            title: 'Edit Feedback Messages',
            body: <div>
                <Form.Group className="mb-3" controlId="danger">
                    <Form.Label>danger</Form.Label>
                    <Form.Control
                        as="textarea" rows={3}
                        defaultValue={danger || ''}
                        onChange={(e) => {danger = e.target.value.trim()}}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="warning">
                    <Form.Label>warning</Form.Label>
                    <Form.Control
                        as="textarea" rows={3}
                        defaultValue={warning || ''}
                        onChange={(e) => {warning = e.target.value.trim()}}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="success">
                    <Form.Label>success</Form.Label>
                    <Form.Control
                        as="textarea" rows={3}
                        defaultValue={success || ''}
                        onChange={(e) => {success = e.target.value.trim()}}
                    />
                </Form.Group>
            </div>,
            buttons: [
                {
                    text: 'Save',
                    onClick: async () => {
                        if (!danger.length || !warning.length || !success.length) {
                            ShowToast({icon: 'danger', heading: 'Empty values not allowed', message: 'Please make sure all fields have valid values'});
                            return false;
                        }
                        
                        await db.saveCaseStudyData(props, "kpmMessages." + labelName, {
                            danger: danger,
                            warning: warning,
                            success: success
                        });

                        return true;
                    }
                }
            ]
        });
    };

    return (props.mode == 'edit' &&
        <div>
            <span className='editable_wrapper edit_labels_toolbar' style={{ position: 'relative', display: 'block' }} >
                <span className="toolbar" style={toolbarStyle}>
                    <span className="toolbar_button edit_labels_button" onClick={editClicked} ><Icon name="label" /></span>
                </span>
            </span>
        </div>
    );
};

export default EditLabelsToolbar;
