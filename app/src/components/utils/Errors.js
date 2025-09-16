//import ShowToast from './ShowToast';
const logFileName = () => {
    const now = new Date();
    return './logs/log-' + now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + '.log'
};

export const showError = (error, txn, user, inputData) => {
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
