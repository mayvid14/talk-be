const express = require('express');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fileType = require('file-type');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')));
const db = require('./db/functions');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dirPath = path.join(__dirname, ..._.get(config, "PROFILES", ["..", "profiles"]));
        console.log(`dirpath is ${dirPath}`);
        return cb(null, dirPath);
    },

    filename: (req, file, cb) => {
        return cb(null, Date.now() + file.originalname);
    }
});

const upload = multer({ storage });

const port = _.get(config, "PORT", 8080);

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(require('cors')());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

io.on('connection', function (socket) {
    console.log('a user connected');

    socket.on('new user', (user) => {
        io.emit('new user', user);
    });

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});

app.post('/signup', upload.single('profile'), (req, res) => {
    bcrypt.genSalt((err, salt) => {
        if (err) res.sendStatus(500);
        bcrypt.hash(_.get(req, ["body", "password"], ""), salt, (error, hash) => {
            if (error) res.sendStatus(500);
            const username = _.get(req, ["body", "username"], "");
            const profile = _.get(req, ["file", "path"], "");
            console.log(`Adding user ${username},${req.file}`);
            db.addNewUser(username, hash, profile, res);
        });
    });
});

app.post('/login', (req, res) => {
    const p = db.getUserByUsername(_.get(req, ["body", "username"], ""));
    let u;

    p.then(user => {
        u = user;
        const str = _.get(req, ["body", "password"], "");
        const hash = _.get(user, "password", "");
        return bcrypt.compare(str, hash);
    }).then(valid => {
        console.log(valid ? 'Returning valid user' : 'Incorrect credentials');
        valid ? res.send(u) : res.sendStatus(404);
    }).catch(err => {
        res.sendStatus(500);
    });
});

app.get('/image/:path', (req, res) => {
    const path = decodeURI(_.get(req, ["params", "path"], ""));
    fs.readFile(path, (err, data) => {
        if (err) res.sendStatus(500);
        res.contentType(fileType(data).mime);
        console.log(fileType(data).mime);
        res.send(data);
    });
});

server.listen(port, () => {
    console.log(`listening on ${port}`);
});