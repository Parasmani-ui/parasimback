import axios from 'axios';
import gameConfig from '../../gameConfig';
import { dummyCall } from './debug/DummyStubs';
import { serverHooks } from '../../context/hooks.js';
import { useState } from "react";
import { createRoot } from 'react-dom/client';
import Spinner from 'react-bootstrap/Spinner';
import ShowToast from '../utils/ShowToast';

const logFileName = () => {
  const now = new Date();
  return './logs/log-' + now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + '.log'
};

const showError = (error, txn, user, inputData) => {
  console.error(error);
  txn && console.error(txn);
  //user && console.error(user);
  //inputData && console.error(inputData);
  /*
  const fileName = logFileName();
  fs.appendFileSync(fileName, txn + ':' + error + '\n');
  user && fs.appendFileSync(fileName, 'user: => ' + JSON.stringify(user));
  inputData && fs.appendFileSync(fileName, 'inputData: => ' + JSON.stringify(inputData));
  //ShowToast({icon: 'danger', heading: 'There was an error!', small: 'Server Call', message: error});
  */
};

export const post = async (serviceName, user, inputData, context) => {
  ShowWait();
  let start = Date.now();
  console.info('api call: ' + serviceName);

  inputData = serverHooks[serviceName + '_in'] ? serverHooks[serviceName + '_in'](serviceName, user, inputData, context) : inputData;

  var output = null;

  if (!gameConfig.USE_STUBS) {
    try {
      const response = await axios.post(`${gameConfig.API_URL}/${serviceName}`, { user: user, data: inputData });
      const data = response.data;
      if (data.rc != 'success') {
        showError(data.rc, serviceName, user, inputData);
        output = data;
      }
      else {
        output = data.data || null;
      }

    } catch (err) {
      showError(err.message, serviceName, user, inputData);
      ShowToast({icon: 'danger', heading: 'Network error', message: err.message});
      output = { rc: err.message };
    }
  }
  else {
    // stub calls for debugging and demo system
    const response = await dummyCall(serviceName, user, inputData);
    const data = response;
    if (data.rc != 'success') {
      showError(data.rc, serviceName, user, inputData);
      output = data;
    }
    else {
      output = data.data || null;
    }
  }

  output = serverHooks[serviceName + '_out'] ? serverHooks[serviceName + '_out'](serviceName, user, inputData, context, output) : output;
  let timeTaken = Date.now() - start;
  console.info(serviceName + ": Total time taken : " + timeTaken + " ms");
  removeElement();
  return output;
};

export const upload = async (serviceName, user, inputData, file, context) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user', JSON.stringify(user));
  formData.append('data', JSON.stringify(inputData));

  try {
    const response = await axios.post(`${gameConfig.UPLOAD_URL}/${serviceName}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    const data = response.data;
    if (data.rc != 'success') {
      showError(data.rc, serviceName, user, inputData);
      return data;
    }
    return data.data || null;
  } catch (err) {
    showError(err.message, serviceName, user, inputData);
    ShowToast({icon: 'danger', heading: 'Network error', message: err.message});
    return { rc: err.message };
  }
};

export const uploadVideo = async (serviceName, user, inputData, video, context) => {
  const blob = new Blob(video, { type: 'video/webm' });
  const formData = new FormData();
  formData.append('video', blob, 'recorded-video.webm');
  formData.append('user', JSON.stringify(user));
  formData.append('data', JSON.stringify(inputData));

  try {
    const response = await axios.post(`${gameConfig.UPLOAD_URL}/${serviceName}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    const data = response.data;
    if (data.rc != 'success') {
      showError(data.rc, serviceName, user, inputData);
      return data;
    }
    return data.data || null;
  } catch (err) {
    showError(err.message, serviceName, user, inputData);
    ShowToast({icon: 'danger', heading: 'Network error', message: err.message});
    return { rc: err.message };
  }
};

const modalId = '__modal_id_wait4server';

function removeElement() {
  return;
  const element = document.getElementById(modalId);
  element && element.remove();
}

function ShowWait() {
  return;
  removeElement();

  const container = document.createElement('div');
  container.setAttribute('id', modalId);
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<WaitIndicator />);
}

function WaitIndicator() {
  return <div style={{
            position: 'fixed', 
            top: 0, left: 0, right: 0, bottom: 0,
            width: '100vh', height: '100vw', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            backgroundColor: 'grey',
            opacity: 0.2,
            zIndex: 1
      }}>
        <div style={{width: '100px', height: '100px'}}>
        <Spinner animation="border" />
        </div>
    </div>;
}
