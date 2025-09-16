import React from "react";
import {useState} from "react";
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Button from 'react-bootstrap/Button';
import Icon from '../Icon';

const EditingToolbar = (props) => {
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [operationInProgress, setOperationInProgress] = useState(false);

    const _save = async () => {
        if (operationInProgress) {
            return;
        }

        setButtonDisabled(true);
        setOperationInProgress(true);

        await props.handleSaveClick();

        setButtonDisabled(false);
        setOperationInProgress(false);
    };

    return !props.readOnly && 
        <ButtonToolbar style={props.style} className="toolbar">
            {
                !props.editing && (
                    <Button name="edit" className="not_editing" style={{height: '40px', display: 'flex'}} onClick={() => props.handleEditClick()}><Icon name="edit" /><span>Edit</span></Button>
                )
            }
            {
                props.editing && (
                    <>
                        <Button name="save" className="editing" style={{height: '40px', display: 'flex'}} onClick={_save} disabled={buttonDisabled}><Icon name="save" /><span>Save</span></Button>
                        <Button name="close" className="editing" style={{height: '40px', display: 'flex'}} onClick={() => props.handleCloseClick()}><Icon name="close" /><span>Cancel</span></Button>
                    </>
                )
            }
        </ButtonToolbar>;
};

export default EditingToolbar;
