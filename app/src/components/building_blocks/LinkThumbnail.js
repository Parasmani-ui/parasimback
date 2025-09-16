import React from "react";
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import gameConfig from '../../gameConfig';
import EditableImage from '../utils/EditableImage';
import AutoSaveText from '../utils/AutoSaveText';

const LinkThumbnail = (props) => {
    const gameData = props.gameData;
    const caseStudy = props.caseStudy;
    const mode = props.mode;

    const style = {
        width: '100%',
        height: '150px'
    };

    const handleComponentClick = (pageName) => {
        if (mode == 'edit') {
            return;
        }
        if (pageName == 'games_list') {
            props.gotoHome();
            return;
        }
        props.changePage(pageName);
    };

    return (
        <Card style={{ position: 'relative' }}>
            {/*<Card.Header style={{
                textAlign: 'center',
                border: 'none',
                fontWeight: 'bold'
            }}
            >
                <AutoSaveText
                    saveKey={'text.' + props.data.blockKey + '_heading'}
                    text={caseStudy.text[props.data.blockKey + '_heading'] || props.data.heading}
                    {...props}
                />
        </Card.Header>*/}

            <EditableImage
                style={style}
                toolbarStyle={{position: 'absolute', top: 0, right: 0, zIndex: 1}}
                src={
                    gameConfig.getCaseStudyImagePath(caseStudy.key, caseStudy.images[props.data.image]) ||
                    gameConfig.getImagePath(props.images[props.data.image])
                }
                imageMode="background"
                saveKey={'images.' + props.data.image}
                {...props}
            />
            <Button style={{ width: '100%', borderRadius: '0', opacity: 0.8 }} onClick={() => handleComponentClick(props.pageName)}>{props.data.heading}</Button>
        </Card>
    );
};

export default LinkThumbnail;
