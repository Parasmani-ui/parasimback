const express = require('express');
var compression = require('compression');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const { MongoClient } = require("mongodb");
const cors = require('cors');
const multer = require('multer');
const apis = require('./libs/apis');
const uploads = require('./libs/uploads');
const webmToMp4 = require("webm-to-mp4");
const { Transform } = require('stream');
const ExcelJS = require('exceljs');
var socket = null;
var io = null;
const args = require('minimist')(process.argv);

const API_URL = process.env.REACT_APP_API_URL;

const port = args.port;
const API_URL = process.env.REACT_APP_API_URL;


const logFileName = () => {
  const now = new Date();
  return './logs/log-' + now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + '.log'
};

const connections = {};

const myTransformStream = new Transform({
  transform(chunk, encoding, callback) {
    // Call your function on the data here
    const modifiedChunk = myFunction(chunk);

    // Send the modified data to the output stream
    this.push(modifiedChunk);

    // Call the callback function to signal that the transformation is complete
    callback();
  }
});

const app = express();
const server = http.createServer(app);

// Database connections for different domains
const databases = {
  "http://localhost:3000": 'parasim',
  "http://localhost:3500": 'bizlab',
  "http://localhost:4000": 'bizlab',
  "http://localhost:5000": 'parasim',
  "https://game.parasim.in": 'parasim',
  "https://demo.parasim.in": 'parasim_demo',
  "https://test.parasim.in": 'parasim_test',
  "https://game.aimabizlabedge.com": 'bizlab',
  "https://demo.aimabizlabedge.com": 'bizlab_demo',
  "https://test.aimabizlabedge.com": 'bizlab_test',
  "https://bizlab.parasim.in": 'bizlab',
  "https://bizlab_demo.parasim.in": 'bizlab_demo',
  "https://aimabizlabedge.com": 'bizlab',
  "https://parasim.in": 'parasim',
  "http://parasim.local": 'parasim'
};

const data_folder = {
  "http://localhost:3000": 'parasim',
  "http://localhost:3500": 'bizlab',
  "http://localhost:4000": 'bizlab',
  "http://localhost:5000": 'parasim',
  "https://game.parasim.in": 'parasim',
  "https://demo.parasim.in": 'parasim',
  "https://test.parasim.in": 'parasim_test',
  "https://game.aimabizlabedge.com": 'bizlab',
  "https://demo.aimabizlabedge.com": 'bizlab',
  "https://test.aimabizlabedge.com": 'bizlab_test',
  "https://bizlab.parasim.in": 'bizlab',
  "https://bizlab_demo.parasim.in": 'bizlab',
  "https://aimabizlabedge.com": 'bizlab',
  "https://parasim.in": 'parasim',
  "http://parasim.local": 'parasim'
};

// Create a connection pool for each database
//const clients = {};
const pools = {};

/*
for (const domain in databases) {
  if (databases.hasOwnProperty(domain)) {
    clients[domain] = new MongoClient('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true });
  }
}
// allow cross origin requests
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (allowList.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false } // disable CORS for this request
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
}
*/

app.use(compression());
app.use(cors());

// Parse incoming request bodies in a middleware before your handlers
app.use(bodyParser.json({ limit: 150000 }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.use((req, res, next) => {
  var host = req.hostname;
  if (host == 'localhost') {
    host = req.get('Referer').slice(0, -1);
  }
  else {
    host = 'https://' + host;
  }

  req.body.data_folder = '../data/' + (data_folder[host] || 'parasim') + '/';

  if (!databases[host]) {
    console.error('Unauthorised domain access: ' + host);
    res.status(404).send('Domain not authorised');
    return;
  }

  if (pools.hasOwnProperty(host)) {
    req.database = pools[host];
    next();
    return;
  }

  const client = new MongoClient('mongodb://127.0.0.1:27017/' + databases[host]);

  client.connect()
    .then(() => {
      pools[host] = client.db();
      console.info(`Connected to database ${databases[host]} for ${host}`);
      req.database = pools[host];
      next();
    })
    .catch((err) => {
      console.error(`Error connecting to database ${databases[host]} for ${host}:`, err);
    });
});

app.get('/download_users', (req, res) => {
  const filePath = path.join(__dirname, '../data/student_template.xlsx');
  res.sendFile(filePath);
});

app.get('/download_user_list', async (req, res) => {
  try {
    const user = await apis.validate('/admin/download_user_list', req.database, { user: req.query });
    if (!user) {
      fs.appendFileSync(logFileName(), txn + ':' + 'Unauthorized access: ' + txn + '\n');
      fs.appendFileSync(logFileName(), JSON.stringify(req.body) + '\n');
      res.status(500).send('Not authorised');
      return;
    }

    const gameKey = req.query.game_key;

    const db = req.database;
    const games = db.collection('games');
    const users = db.collection('users');
    const institutes = db.collection('institutes');

    const game = await games.findOne({ key: gameKey });
    if (!game) {
      fs.appendFileSync(logFileName(), 'download_user_list: game not found: ' + gameKey + '\n');
      res.status(500).send('Invalid data');
      return;
    }

    const institute = await institutes.findOne({ key: game.institute });
    const list = await users.find({ institute_key: institute.key, role: 'user' }).toArray();

    const templatePath = path.join(__dirname, '../data/student_allocation.xlsx');
    const outputFilePath = path.join(__dirname, '_temp/user_list.xlsx');

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);

    const worksheet = workbook.worksheets[0];

    const headings = ['Roll Number', 'Name', 'Email', 'Team', 'Market'];
    let rowIdx = 2;

    list.forEach((user, idx) => {
        const row = worksheet.getRow(rowIdx++);
        row.getCell(1).value = user.roll_no;
        row.getCell(2).value = user.name;
        row.getCell(3).value = user.email;

        const templateRow = worksheet.getRow(2);
        for (let colIdx = 1; colIdx <= headings.length; colIdx++) {
            row.getCell(colIdx).style = templateRow.getCell(colIdx).style;
        }

        row.commit();
    });

    await workbook.xlsx.writeFile(outputFilePath);
    res.sendFile(outputFilePath, (err) => {
      err && res.status(500).send(err);
      fs.unlinkSync(outputFilePath);
    });
  } catch (err) {
    fs.appendFileSync(logFileName(), 'download_user_list: Error generating file: ' + err.toString() + '\n');
    res.status(500).send('Failed to generate file');
  }
});

app.get('/download_bot_decisions', (req, res) => {
  const filePath = path.join(__dirname, '../data/student_template.xlsx');
  res.sendFile(filePath);
});

const upload = multer({ dest: 'uploads/' })
app.post('/upload/*', upload.single('file'), async (req, res) => {
  const txn = req.url.replace(/^\/upload/g, '');
  const _data = req.body;
  _data.user = JSON.parse(_data.user);
  _data.data = JSON.parse(_data.data);

  try {
    var output = null;
    const user = await apis.validate(txn, req.database, req.body);
    if (!user) {
      res.json({ rc: 'Unauthorized access: ' + txn });
      console.error('Unauthorized access: ' + txn);
      fs.appendFileSync(logFileName(), txn + ':' + 'Unauthorized access: ' + txn + '\n');
      return;
    }

    req.body.user = user;

    output = await uploads[txn].call(null, txn, req.database, _data, req.file);
    res.json(output);
  } catch (e) {
    console.error(e.message);
    res.json({ rc: e.message });
    const now = new Date();
    fs.appendFileSync(logFileName(), JSON.stringify(e) + '\n');
  }
});

// Serve the API routes from the apiRouter module
app.use('/api', async (req, res) => {
  if (!apis[req.url]) {
    console.error('Invalid API:[' + req.url + '].');
    fs.appendFileSync(logFileName(), 'Invalid API:[' + req.url + '].' + '\n');
    res.json({ rc: 'Invalid API:[' + req.url + '].' });
    return;
  }

  let start = Date.now();
  const txn = req.url;

  fs.appendFileSync(logFileName(), 'api called: ' + txn + '\n');
  try {
    const user = await apis.validate(txn, req.database, req.body);
    if (!user) {
      res.json({ rc: 'Unauthorized access: ' + txn });
      console.error('Unauthorized access: ' + txn);
      fs.appendFileSync(logFileName(), txn + ':' + 'Unauthorized access: ' + txn + '\n');
      fs.appendFileSync(logFileName(), JSON.stringify(req.body) + '\n');
      let timeTaken = Date.now() - start;
      fs.appendFileSync(logFileName(), txn + ':' + "Total time taken : " + timeTaken + " milliseconds" + '\n');
      return;
    }

    req.body.user = user;

    const output = await apis[txn].call(null, txn, req.database, io, req.body);
    let timeTaken = Date.now() - start;
    fs.appendFileSync(logFileName(), txn + ':' + "Total time taken : " + timeTaken + " milliseconds. Data size: " + Buffer.byteLength(JSON.stringify(output), 'utf8') + '\n');

    res.json(output);
  } catch (e) {
    console.error('Exception: ' + e.message);
    res.json({ rc: e.message });
    let timeTaken = Date.now() - start;
    const now = new Date();
    fs.appendFileSync(logFileName(), 'Exception: ' + txn + ':' + JSON.stringify(e) + '\n');
    fs.appendFileSync(logFileName(), JSON.stringify(req.body) + '\n');
    fs.appendFileSync(logFileName(), txn + ':' + "Total time taken : " + timeTaken + " milliseconds" + '\n');
  }
});

// Serve files from public folder
app.use(express.static(path.join(__dirname, '../public')));

// Serve React app
app.use(express.static(path.join(__dirname, '../app/build')));

// Serve the React app for all other requests
app.use('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../app/build/index.html'));
});

const PORT = process.env.PORT || port;

server.listen(PORT, () => {
  console.info(`Server listening on port ${PORT}`);
});

io = socketIo(server, { cors: { origin: Object.keys(databases) } });
//io = socketIo(server);

io.use((socket, next) => {
  try {
    // Your custom error handling logic here
    next();
  } catch (e) {
    console.error('Socket.IO Error:', JSON.stringify(e) + '\n');
    const now = new Date();
    fs.appendFileSync(logFileName(), JSON.stringify(e) + '\n');
  }
});

io.on('connection', (_socket) => {
  socket = _socket;
  socket.on('disconnect', () => {
  });

  socket.on('error', error => {
    console.error('Socket.IO Error:', error);
    const now = new Date();
    fs.appendFileSync(logFileName(), JSON.stringify(error) + '\n');
  });
});
