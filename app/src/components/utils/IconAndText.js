import React from "react";
import Icon from '../Icon.js';

const IconAndText = (props) => {

    return <span>
        <Icon style={{ height: '24px' }} name={props.icon} ></Icon>
        <span >{props.text}</span>
    </span>;
};

export default IconAndText;
