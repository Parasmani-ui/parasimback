import React from "react";
import {useState} from "react";
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import AutoSaveText from '../utils/AutoSaveText';
import ShowToast from '../utils/ShowToast';
import { post } from '../utils/ServerCall';
import DecisionsSummary from './DecisionsSummary';

const SubmitDecisions = (props) => {
    const game = props.selectedGame;
    const caseStudy = props.caseStudy;
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [operationInProgress, setOperationInProgress] = useState(false);

    const submitClick = async () => {
        if (operationInProgress) {
            return;
        }

        setButtonDisabled(true);
        setOperationInProgress(true);

        const result = await post('user/submit_data', props.user, { team: game.game_data.team, obj_key: game.key });
        if (result && result.rc) {
            ShowToast({ icon: 'danger', heading: 'Error submitting data', message: result.rc });
            setButtonDisabled(false);
            setOperationInProgress(false);
            return;
        }

        if (game.type == 'team_play') {
            props.quarterSubmitted({ game_key: game.key, team: game.game_data.team });
            await props.updateData();
            //ShowToast({ icon: 'success', heading: 'Success', message: 'Your data has been submitted', done: props.gotoHome });
            props.gotoHome();
        }
        else if (game.type == 'assessment' || game.type == 'self_play') {
            props.assessmentSubmitted(result);
        }

        setButtonDisabled(false);
        setOperationInProgress(false);
    };

    return (
        <Card className="container-card">
            <Card.Body>
                <Card.Text>
                    <AutoSaveText
                        saveKey="text.submit_decisions_text"
                        text={caseStudy.text.submit_decisions_text || 'Check the following decisions before submitting'}
                        {...props}
                    />
                </Card.Text>
                <DecisionsSummary {...props} />
                <div style={{height: '15px'}}></div>
                {!props.readOnly && props.mode != 'edit' &&
                    <Card>
                        <Card.Body style={{ display: 'flex', justifyContent: 'center' }}>
                            <Button onClick={submitClick} disabled={buttonDisabled}>Submit Decisions</Button>
                        </Card.Body>
                    </Card>
                }
            </Card.Body>
        </Card>
    );
};

export default SubmitDecisions;
