import React, { useState, useEffect } from "react";
import { createRoot } from 'react-dom/client';
import Card from 'react-bootstrap/Card';
import AutoSaveText from '../utils/AutoSaveText';
import Icon from '../Icon.js';
import db from '../utils/db';

const modalId = '__modal_id_market_news';

function removeElement() {
    const element = document.getElementById(modalId);
    element && element.remove();
}

const DemandMessage = (props) => {
    const gameData = props.gameData;
    const news = gameData.news || [];

    const results = [];
    news.forEach((_msg) => {
        if (_msg.type == 'special_project') {
            return;
        }

        results.push(_msg);
    });

    const buttonClicked = (type) => {
        const _props = { ...props };
        _props.messageType = type;
        _props.closeClicked = closeClicked;
        Fullscreen(_props);
    };

    const closeClicked = () => {
        removeElement();
    };

    return (
        <Card style={{height: '100%'}}>
            <Card.Header>
                {props.mode == 'edit' &&
                    <DemandMessagesToolbar buttonClicked={buttonClicked} />
                }
                <AutoSaveText
                    saveKey="text.market_news_heading"
                    text={props.caseStudy.text.market_news_heading || 'Market News'}
                    {...props}
                />
            </Card.Header>
            {props.mode != 'edit' && gameData && 
                <Card.Body style={{overflowY: 'scroll'}}>
                    {gameData && gameData.news && results.map((_news, idx) => (
                        <Card key={idx} className="news-item" style={{marginTop: idx ? '10px' : 0}}>
                            <Card.Body>
                                <Card.Subtitle style={{paddingBottom: '10px', fontWeight: 'bold'}}>{_news.title ? _news.title : 'Good Luck!!'}</Card.Subtitle>
                                <Card.Text>{_news.text ? _news.text : ''}</Card.Text>
                            </Card.Body>
                        </Card>
                    ))}
                </Card.Body>
            }
            {props.mode == 'edit' &&
                <Card.Body>
                    <Card.Subtitle>Admin Note</Card.Subtitle>
                    <p>
                        The sales and capacity data would be based on actual decisions
                        taken by players so it cannot be edited here.
                    </p>
                    <p>
                        Click on the above buttons to add texts for market news which would be picked up automatically during the game.
                    </p>
                </Card.Body>
            }
        </Card>
    );
};

export default DemandMessage;

const MessagesEdit = (props) => {
    const caseStudy = props.caseStudy;
    const messageType = props.messageType;
    const [messages, setMessages] = useState(caseStudy.demandMessages);

    const toolbarStyle = {
        display: 'flex',
        position: 'absolute',
        right: 0,
        top: 0,
        textAlign: 'right',
        zIndex: 1
    };

    const deleteMessage = async (idx) => {
        const _messages = JSON.parse(JSON.stringify(messages));
        _messages[messageType].splice(idx, 1);
        await db.saveCaseStudyData(props, "demandMessages", _messages);
        setMessages(_messages);
    };

    const addMessage = async () => {
        const _messages = JSON.parse(JSON.stringify(messages));
        _messages[messageType].push({
            title: 'Message Title',
            text: 'Message Text'
        });
        await db.saveCaseStudyData(props, "demandMessages", _messages);
        setMessages(_messages);
    };

    return (
        <div style={{ position: 'fixed', top: 0, right: 0, left: 0, bottom: 0, height: '100%', zIndex: 1, backgroundColor: 'white' }}>
            <Card style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '100%', overflowY: 'scroll', zIndex: 1 }}>
                <Card.Header>
                    <span className='editable_wrapper market_news_toolbar' style={{ position: 'relative', display: 'block' }} >
                        <span className="toolbar" style={toolbarStyle}>
                            <span className="toolbar_button close_news" onClick={addMessage} ><Icon name="add" /></span>
                            <span className="toolbar_button close_news" onClick={props.closeClicked} ><Icon name="close" /></span>
                        </span>
                    </span>
                    {(caseStudy.text.market_news_heading || 'Market News') + ' - ' + props.messageType}
                </Card.Header>
                <Card.Body>
                    {messages[props.messageType] && messages[props.messageType].map((msg, idx) => (
                        <Card key={idx}>
                            <span className='editable_wrapper market_news_delete_toolbar' style={{ position: 'relative', display: 'block' }} >
                                <span className="toolbar" style={toolbarStyle}>
                                    <span className="toolbar_button delete_news" onClick={async () => { await deleteMessage(idx) }} ><Icon name="remove" /></span>
                                </span>
                            </span>
                            <Card.Body>
                                <Card.Subtitle>
                                    <AutoSaveText
                                        saveKey={'demandMessages.' + messageType + '.' + idx + '.title'}
                                        text={msg.title || 'Title'}
                                        toolbarStyle={{ top: '-25px', right: 0 }}
                                        {...props}
                                    />
                                </Card.Subtitle>
                                <Card.Text>
                                    <AutoSaveText
                                        saveKey={'demandMessages.' + messageType + '.' + idx + '.text'}
                                        text={msg.text || 'Message Text'}
                                        toolbarStyle={{ top: '-25px', right: 0 }}
                                        {...props}
                                    />
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    ))}
                </Card.Body>
            </Card>
        </div>
    );
};

const DemandMessagesToolbar = (props) => {
    const caseStudy = props.caseStudy;

    const toolbarStyle = {
        display: 'flex',
        position: 'absolute',
        right: 0,
        top: 0,
        textAlign: 'right',
        zIndex: 1
    };

    return (
        <span className='editable_wrapper market_news_toolbar' style={{ position: 'relative', display: 'block' }} >
            <span className="toolbar" style={toolbarStyle}>
                <span className="toolbar_button news_general" onClick={() => { props.buttonClicked('general') }} ><Icon name="news" /></span>
                <span className="toolbar_button news_neutral" onClick={() => { props.buttonClicked('neutral') }} ><Icon name="dash" /></span>
                <span className="toolbar_button news_increase" onClick={() => { props.buttonClicked('increase') }} ><Icon name="increase" /></span>
                <span className="toolbar_button news_decrease" onClick={() => { props.buttonClicked('decrease') }} ><Icon name="decrease" /></span>
            </span>
        </span>
    );
};

function Fullscreen(props) {
    removeElement();

    const container = document.createElement('div');
    container.setAttribute('id', modalId);
    document.body.appendChild(container);

    const root = createRoot(container);
    root.render(<MessagesEdit {...props} />);
}
