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

const logFileName = () => {
  const now = new Date();
  return './logs/log-' + now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + '.log'
};

const connections = {};

const myTransformStream = new Transform({
  transform(chunk, encoding, callback) {
    const modifiedChunk = myFunction(chunk);
    this.push(modifiedChunk);
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
  "http://parasim.local": 'parasim',
  "https://parasim.vercel.app": 'parasim',        // ✅ Vercel frontend
  "https://parasimback.onrender.com": 'parasim'   // ✅ Render backend
};

const data_folder = { ...databases };

// ---- CORS FIX ----
const allowedOrigins = Object.keys(databases);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed for this origin"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(compression());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // preflight support

// Parse incoming request bodies
app.use(bodyParser.json({ limit: 150000 }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// ---- DOMAIN CHECK + DB CONNECT ----
const pools = {};
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
  }

  var host = req.hostname;
  if (host == 'localhost') {
    host = req.get('Referer')?.slice(0, -1);
  } else {
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

  const mongoUri = process.env.MONGODB_URI || `mongodb://127.0.0.1:27017`;
  const dbName = databases[host];
  const client = new MongoClient(mongoUri);

  client.connect()
    .then(() => {
      pools[host] = client.db(dbName);
      console.info(`Connected to database ${dbName} for ${host}`);
      req.database = pools[host];
      next();
    })
    .catch((err) => {
      console.error(`Error connecting to database ${dbName} for ${host}:`, err);
      res.status(500).send('Database connection error');
    });
});

// ---- ROUTES ----
app.get('/download_users', (req, res) => {
  const filePath = path.join(__dirname, '../data/student_template.xlsx');
  res.sendFile(filePath);
});

app.get('/download_user_list', async (req, res) => {
  try {
    const user = await apis.validate('/admin/download_user_list', req.database, { user: req.query });
    if (!user) {
      fs.appendFileSync(logFileName(), 'Unauthorized access: download_user_list\n');
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
    let rowIdx = 2;

    list.forEach((user) => {
      const row = worksheet.getRow(rowIdx++);
      row.getCell(1).value = user.roll_no;
      row.getCell(2).value = user.name;
      row.getCell(3).value = user.email;
      row.commit();
    });

    await workbook.xlsx.writeFile(outputFilePath);
    res.sendFile(outputFilePath, (err) => {
      err && res.status(500).send(err);
      fs.unlinkSync(outputFilePath);
    });
  } catch (err) {
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
    const user = await apis.validate(txn, req.database, req.body);
    if (!user) {
      res.json({ rc: 'Unauthorized access: ' + txn });
      return;
    }

    req.body.user = user;
    const output = await uploads[txn].call(null, txn, req.database, _data, req.file);
    res.json(output);
  } catch (e) {
    res.json({ rc: e.message });
  }
});

app.use('/api', async (req, res) => {
  if (!apis[req.url]) {
    res.json({ rc: 'Invalid API:[' + req.url + '].' });
    return;
  }

  let start = Date.now();
  const txn = req.url;

  try {
    const user = await apis.validate(txn, req.database, req.body);
    if (!user) {
      res.json({ rc: 'Unauthorized access: ' + txn });
      return;
    }

    req.body.user = user;
    const output = await apis[txn].call(null, txn, req.database, io, req.body);
    res.json(output);
  } catch (e) {
    res.json({ rc: e.message });
  }
});

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Parasim Backend API is running',
    version: '1.0.0',
    endpoints: {
      api: '/api/*',
      upload: '/upload/*',
      downloads: '/download_*'
    }
  });
});

// Catch-all
app.use('*', (req, res) => {
  res.status(404).json({
    rc: 'endpoint_not_found',
    message: `Endpoint ${req.originalUrl} not found`,
    available_endpoints: ['/api/*', '/upload/*', '/download_*']
  });
});

const PORT = process.env.PORT || port;
server.listen(PORT, () => {
  console.info(`Server listening on port ${PORT}`);
});

// ---- SOCKET.IO with CORS FIX ----
io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.use((socket, next) => {
  try {
    next();
  } catch (e) {
    console.error('Socket.IO Error:', JSON.stringify(e));
    fs.appendFileSync(logFileName(), JSON.stringify(e) + '\n');
  }
});

io.on('connection', (_socket) => {
  socket = _socket;
  socket.on('disconnect', () => { });
  socket.on('error', error => {
    console.error('Socket.IO Error:', error);
    fs.appendFileSync(logFileName(), JSON.stringify(error) + '\n');
  });
});
