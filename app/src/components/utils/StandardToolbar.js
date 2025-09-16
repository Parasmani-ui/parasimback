import React from "react";
import Icon from '../Icon.js';

const StandardToolbar = (props) => {
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

    return (
        props.show &&
        <span className={'editable_wrapper ' + props.name} style={{ position: 'relative', display: 'block' }} >
            <span className="toolbar" style={toolbarStyle}>
                {props.buttons.map((button) => (
                    !button.hide &&
                    <span key={button.name} className={'toolbar_button ' + button.name} onClick={button.click}>
                        <Icon name={button.icon} />
                    </span>
                ))}

            </span>
        </span>
    );
};

export default StandardToolbar;
