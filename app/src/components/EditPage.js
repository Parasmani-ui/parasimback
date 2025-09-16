import React from "react";
import {useState} from "react";
import Card from 'react-bootstrap/Card';
import pageConfig from '../context/pageConfig';
import pageList from '../context/pageList';
import fakeGameState from '../context/data/edit_mode_dummy_game_state';
import fakeGameData from '../context/data/edit_mode_dummy_game_data';
import Icon from "./Icon";
import updateAccounts from "./utils/UpdateAccounts";

const EditPage = (props) => {
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [operationInProgress, setOperationInProgress] = useState(false);

    const _pageName = pageList[props.pageName].page_name;
    const _page = pageList[_pageName];
    const Page = pageConfig[_page.component];
    const _props = { ...props };
    _props.pageName = _pageName;
    _props.mode = 'edit';
    const caseStudy = props.caseStudy;

    // to allow pages to open with some data being displayed set the game state to a dummy value    
    _props.gameState = fakeGameState;
    _props.user.team = Object.keys(fakeGameState.teams)[0];
    _props.gameData = fakeGameData;

    const allQuartersData = {
        '0': JSON.parse(JSON.stringify(fakeGameData)),
        '1': JSON.parse(JSON.stringify(fakeGameData)),
        '2': JSON.parse(JSON.stringify(fakeGameData))
    };
    _props.allQuartersData = allQuartersData;

    const toolbarStyle = {
        display: 'flex',
        position: 'absolute',
        right: 0,
        top: 0,
        textAlign: 'right',
        zIndex: 1
    };

    const _update = async () => {
        if (operationInProgress) {
            return;
        }

        setButtonDisabled(true);
        setOperationInProgress(true);

        await updateAccounts(props);

        setButtonDisabled(false);
        setOperationInProgress(false);
    };

    return (
        caseStudy ?
            <>
                <div style={{ backgroundColor: 'white', border: '1px solid darkgrey', padding: '10px', textAlign: 'center' }}>
                    {!caseStudy.accounts_updated && <span className='editable_wrapper update_accounts_toolbar' style={{ position: 'relative', display: 'block' }} >
                        <span className="toolbar" style={toolbarStyle}>
                            <span className="toolbar_button update_button" onClick={_update} disabled={buttonDisabled}><Icon name="update" /></span>
                        </span>
                    </span>
                    }
                    <span style={{ fontWeight: 'bold' }}>Editing Case Study</span>
                    <h3>{props.caseStudy.name}</h3>
                    <h4 style={{ fontSize: '1.2rem' }}>{pageList[props.pageName].heading}</h4>
                    {caseStudy.accounts_updated ?
                        <span style={{ color: 'green', fontWeight: 'bold' }}>Accounts updated</span>
                        :
                        <span style={{ color: 'red', fontWeight: 'bold' }}>Accounts need to be updated</span>
                    }
                </div>
                <Card className="container-card">
                    <Page {..._props} />
                </Card>
            </>
            :
            <div style={{ backgroundColor: 'white', borderRadius: '5px', border: '1px solid darkgrey', padding: '10px', textAlign: 'center' }}>
                <h2>Please select a case study from Case Studies page.</h2>
            </div>
    );
};

export default EditPage;
