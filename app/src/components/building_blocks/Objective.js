import React from "react";
import Card from 'react-bootstrap/Card';
import AutoSaveText from '../utils/AutoSaveText';
import TextBlock from '../utils/TextBlock';

const Objective = (props) => {
    const caseStudy = props.caseStudy;

    return (
        caseStudy && <Card>
            <Card.Header>
                <AutoSaveText 
                    saveKey="text.objective_heading"
                    text={caseStudy.text.objective_heading || 'Your Objective'}
                    {...props}
                />
            </Card.Header>
            <Card.Body style={{overflowY: 'scroll'}}>
                <TextBlock
                    saveKey="text.objective"
                    text={caseStudy.text.objective}
                    toolbarStyle={{top: '-25px', right: '0px'}}
                    regex={/^[^\<\>\'\"]+$/}
                    {...props}
                />
            </Card.Body>
        </Card>
    );
};

export default Objective;

