import React from "react";
import Card from 'react-bootstrap/Card';
import AutoSaveText from '../utils/AutoSaveText';
import TextBlock from '../utils/TextBlock';

const CompanyIntroduction = (props) => {
    const caseStudy = props.caseStudy;

    return (
        caseStudy && <Card style={{height: '100%'}}>
            <Card.Header>
                <AutoSaveText 
                    saveKey="text.introduction_heading"
                    text={caseStudy.text.introduction_heading || 'Welcome to Super Mobile Ltd!'}
                    {...props}
                />
            </Card.Header>
            <Card.Body style={{overflowY: 'scroll'}}>
                    <TextBlock
                        saveKey="text.description"
                        text={caseStudy.text.description}
                        toolbarStyle={{top: '-25px', right: '0px'}}
                        regex={/^[^\<\>\'\"]+$/}
                        {...props}
                    />
            </Card.Body>
        </Card>
    );
};

export default CompanyIntroduction;