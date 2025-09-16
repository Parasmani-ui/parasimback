import React from "react";
import ProgressBar from 'react-bootstrap/ProgressBar';
import EditProgressBar from './EditProgressBar';

const ProgressBarColored = (props) => {
    const caseStudy = props.caseStudy;
    const colors = caseStudy.progressBarColors;
    const value = parseInt(props.now);
    var variant = 'info';

    for (var prop in colors) {
        if (value >= parseInt(colors[prop])) {
            variant = prop;
        }
    }

    return (<div>
        <EditProgressBar {...props} />
        <ProgressBar now={value} label={value} variant={variant} />
    </div>)
};

export default ProgressBarColored;