import React from "react";
import { useState, useEffect } from "react";
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Header from './Header';
import gameConfig from '../gameConfig';
import { toCamelCase } from './utils/common';
import Footer from "./Footer";
import StandardToolbar from "./utils/StandardToolbar";
import ShowToast from "./utils/ShowToast";

import LeaderBoard from './pages/LeaderBoard';

const AssignedGames = (props) => {
    const games = props.user.games && Object.values(props.user.games).length ? Object.values(props.user.games) : null;
    const show = true;

    const toolbarStyle = {
        display: 'flex',
        position: 'absolute',
        right: 0,
        top: 0,
        textAlign: 'right',
        zIndex: 1
    };

    const toolbarButton = (userKey, instituteKey, caseStudyKey, gameKey) => {
        const message = <table style={{border: 'none'}}><tbody>
            <tr><td>User: </td><td>{userKey}</td></tr>
            <tr><td>Institute: </td><td>{instituteKey}</td></tr>
            <tr><td>Case Study: </td><td>{caseStudyKey}</td></tr>
            <tr><td>Game: </td><td>{gameKey}</td></tr>
            {/*<tr><td>Game State: </td><td>{gameStateKey}</td></tr>
            <tr><td>Game Data: </td><td>{gameDataKey}</td></tr>*/}
        </tbody></table>;
        return [
            {
                name: 'debug_info',
                icon: 'info',
                click: () => {
                    ShowToast({
                        icon: 'info',
                        heading: 'System Data',
                        message: message
                    });
                }
            }
        ];
    };

    const disabled = (game) => {
        if (game.game_status == 'started') {
            if (game.quarter_status == 'submitted' || game.quarter_status == 'timeout') {
                return true;
            }
            else {
                return false;
            }
        }
        else if (game.game_status == 'finished') {
            return false;
        }
        else {
            return true;
        }
    };
    const buttonLabel = (game) => {
        if (game.game_status == 'started') {
            if (game.quarter_status == 'submitted' || game.quarter_status == 'timeout') {
                return 'Processing Quarter';
            }
            else {
                return 'Go To Game';
            }
        }
        else if (game.game_status == 'finished') {
            return 'View Results';
        }
        else {
            return 'Game Not Started';
        }
    };

    return (
        <Card className="container-card">
            <div style={{ position: 'relative' }}>
                <div className="header" style={{ display: 'flex' }}>
                    <div style={{ display: 'flex' }}>
                        <div style={{ padding: '10px', height: '60px', width: '60px' }}>
                            <img style={{ height: '100%', width: 'auto' }} src={gameConfig.getImagePath(props.images['game_logo'])} alt={gameConfig.brandName} />
                        </div>
                        <div style={{ flex: '1 1 auto', position: 'relative' }}>
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="nav_text" style={{ paddingLeft: '10px', textTransform: 'uppercase', fontSize: '0.9em', color: 'var(--header_nav_text_color)' }}>{gameConfig.brandName}</span></div>
                        </div>
                    </div>
                    <div style={{ flex: '1 1 0px' }}>
                        <Header user={props.user} handleLogout={props.handleLogout} />
                    </div>
                </div>
                <div>
                    {games &&
                        <Card>
                            <Card.Header>Assigned Games</Card.Header>
                            <Card.Body>
                                <Row>
                                    {games.map((game, idx) => (
                                        <Col key={idx} md={3}>
                                            <Card style={{ backgroundColor: 'var(--subcard-background-color)', border: '1px solid lightgrey' }}>
                                                <StandardToolbar toolbarStyle={toolbarStyle} show={show} buttons={toolbarButton(props.user.key, props.user.institute_key, game.case_study_key, game.key)} />
                                                <Card.Header>
                                                    {game.name}
                                                </Card.Header>
                                                <Card.Body>
                                                    <Card.Text style={{ fontWeight: 'bold' }}>Game Type: {toCamelCase(game.type)}</Card.Text>
                                                    <Card.Text>Case Study: {game.case_study_name}</Card.Text>
                                                    <Card.Text>Current Quarter: {game.quarter_labels[game.current_quarter]}</Card.Text>
                                                    <Card.Text>Status: {toCamelCase(game.game_status)}</Card.Text>
                                                    <Button onClick={async () => { await props.gotoGame(game.key) }} disabled={disabled(game)}>{buttonLabel(game)}</Button>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </Card.Body>
                        </Card>
                    }
                    {!games &&
                        <Card style={{ padding: '30px', textAlign: 'center' }}><Card.Body>You do not have any assigned games</Card.Body></Card>
                    }
                </div>
            </div>
            <LeaderBoard user={props.user} />
            <div style={{ width: '100%' }}>
                <Footer />
            </div>
        </Card>
    );
};

export default AssignedGames;
