import React from "react";
import Card from 'react-bootstrap/Card';

const FinanceSettings = (props) => {
    const gameData = props.gameData;
    const caseStudy = props.caseStudy;
    const heading = props.pageName;

    return (
        <Card>
            <Card.Header>{heading}</Card.Header>
            <Card.Body>
                <Card.Text>
                    test
                </Card.Text>
            </Card.Body>
        </Card>
    );
};

export default FinanceSettings;
