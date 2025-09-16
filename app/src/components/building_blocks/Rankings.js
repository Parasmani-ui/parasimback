import React from "react";
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import FormatData from '../FormatData';
import AutoSaveText from '../utils/AutoSaveText';

const Rankings = (props) => {
    const game = props.game;
    const caseStudy = props.caseStudy;
    const gameState = props.gameState;
    const gameData = props.gameData;
    const teams = props.mode == 'edit' ? [...Object.values(gameState.teams)] : [...props.teams];

    teams.sort((a, b) => { return a.rank - b.rank; });

    return <Card style={{height: '100%'}}>
        <Card.Header>
            <AutoSaveText
                saveKey="text.rankings_heading"
                text={caseStudy.text.rankings_heading || props.blockHeading || 'Rankings'}
                {...props}
            />
        </Card.Header>
        <Card.Body style={{ fontSize: '0.8rem', overflowY: 'auto' }}>
            <Table bordered hover>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th style={{ textAlign: 'left' }}>Team</th>
                        <th>Score</th>
                        <th>Revenues</th>
                        <th>Profits</th>
                        <th>Market Share (Volume)</th>
                    </tr>
                </thead>
                <tbody>
                    {teams && teams.map((rec) => (
                        <tr key={rec.name}>
                            <td>{rec.rank}</td>
                            <td style={{ textAlign: 'left' }}>{rec.name}</td>
                            <td>{rec.score}</td>
                            <td>
                                <FormatData
                                    caseStudy={caseStudy}
                                    format="thousands_indicator_int"
                                    name="compmany_revenue"
                                    value={rec.revenue || 0} />
                            </td>
                            <td>
                                <FormatData
                                    caseStudy={caseStudy}
                                    format="thousands_indicator_int"
                                    name="compmany_revenue"
                                    value={rec.profit || 0} />
                            </td>
                            <td>
                                <FormatData
                                    caseStudy={caseStudy}
                                    format="thousands_indicator_int"
                                    name="market_share"
                                    value={rec.marketShare || 0} />
                            </td>
                        </tr>
                    ))
                    }
                </tbody>
            </Table>
        </Card.Body>
    </Card>
};

export default Rankings;
