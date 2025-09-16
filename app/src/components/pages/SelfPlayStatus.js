import React from "react";
import Card from 'react-bootstrap/Card';
import AutoSaveText from '../utils/AutoSaveText';

const SelfPlayStatus = (props) => {
    const pageData = props.siteData ? props.siteData[props.pageName] : {};
    const [institute, setInstitute] = useState();

    return (
        <Card>
            <Card.Header>
            <AutoSaveText
                    saveKey="games_heading"
                    text={pageData.games_heading || 'Games'}
                    saveFn="saveSiteData"
                    {...props}
                />
            </Card.Header>
            <Card.Body>
                <Card.Text>
                    Self Play Status
                </Card.Text>
            </Card.Body>
        </Card>
    );
};

export default SelfPlayStatus;
