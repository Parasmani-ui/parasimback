import React from "react";
import Card from 'react-bootstrap/Card';

const DemandForecastAdminNotes = (props) => {
    const gameData = props.gameData;
    const caseStudy = props.caseStudy;
    const heading = props.pageName;

    return (
        <Card>
            <Card.Header>Notes for Admin</Card.Header>
            <Card.Body>
                <Card.Text>
                    <p>Demand Forecast has to be managed from each game so it cannot be edited in case study.</p>
                    <p>Please go to Game Management -&gt; Demand Forecast to manage this data for each ongoing game.</p>
                    <p>
                        The data shown in Demand Forecast chart and the message is just an indication
                        on how the case study would look like to players
                    </p>
                </Card.Text>
            </Card.Body>
            <Card.Body>
                <Card.Title>
                    Game Data
                </Card.Title>
                <Card.Text>
                    The game data like Capacity, Sales and production would be calculated automatically based on decisions
                    taken by players so it cannot be edited by admin.
                </Card.Text>
            </Card.Body>
            <Card.Body>
                <Card.Title>
                    What can be edited here?
                </Card.Title>
                <Card.Text>
                    <p>1. You can edit the headings of the various cards.</p>
                    <p>2. You can edit the chart colors by clicking on colors icon.</p>
                    <p>You can define the default number of teams </p>
                </Card.Text>
            </Card.Body>
        </Card>
    );
};

export default DemandForecastAdminNotes;
