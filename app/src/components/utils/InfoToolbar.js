import React from "react";
import ShowToast from './ShowToast';
import StandardToolbar from './StandardToolbar';

const InfoToolbar = (props) => {
    const buttons = [
        {
            name: 'information',
            icon: 'info',
            click: () => {
                ShowToast({
                    icon: 'info',
                    heading: props.heading,
                    small: 'info',
                    message: props.message
                });
            }
        }
    ];

    return (
        <StandardToolbar toolbarStyle={props.toolbarStyle} show={props.show} buttons={buttons} />
    );
};

export default InfoToolbar;
