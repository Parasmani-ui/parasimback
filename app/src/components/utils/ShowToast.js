import React from 'react';
import { useState } from "react";
import { createRoot } from 'react-dom/client';
import Toast from 'react-bootstrap/Toast';
import Icon from '../Icon.js';

const modalId = '__modal_id_toast';
function removeElement()
{
  const element = document.getElementById(modalId);
  element && element.remove();
}

function ToastMessage(props) {
  const [show, setShow] = useState(true);

  function close() {
    setShow(false);
    removeElement();
    props.done && props.done();
  }

  return (<div className="toast_wrapper" style={{
    top: 0,
    left: 0,
    position: 'fixed',
    width: '100%',
    height: '100%',
    display: show ? 'block' : 'none',
    zIndex: '9999'
    }}>
        <Toast style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 'auto' }} show={show} onClose={close}>
          <Toast.Header style={{borderBottom: '1px solid darkgrey'}}>
            <div style={{display: 'inline-block', marginRight: '10px'}}><Icon name={props.icon} /></div>
            <strong className="me-auto">{props.heading}</strong>
            {/*<small>{props.small}</small>*/}
          </Toast.Header>
          <Toast.Body>{props.message}</Toast.Body>
        </Toast>
    </div>
  );
}

function ShowToast(props) {
  removeElement();

  const container = document.createElement('div');
  container.setAttribute('id', modalId);
  document.body.appendChild(container);
  
  const root = createRoot(container);
  root.render(<ToastMessage {...props} />);  
}

export default ShowToast;
