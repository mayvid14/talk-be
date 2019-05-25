const express = require('express');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')));
const db = require('./db/functions');

const port = _.get(config, "PORT", 8080);

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(require('cors')());
app.use(bodyParser.json({
    limit: '15mb'
}));
app.use(bodyParser.urlencoded({
    limit: '15mb',
    parameterLimit: 100000,
    extended: false
}));

io.on('connection', function (socket) {
    console.log('a user connected. Users =', io.engine.clientsCount);
    io.emit('refresh');

    socket.on('new user', (user) => {
        socket.user = user;
        io.emit('new user', getOnlineUsers(io));
    });

    socket.on('new message', message => {
        db.addNewMessage(message.sentBy._id, message.sentAt, message.content, message.attachment).then(data => {
            console.log(data.sentBy.username, ':', data.content);
            io.emit('new message', data);
        }).catch(console.error);
    });

    socket.on('disconnect', function () {
        console.log('a user disconnected. Users =', io.engine.clientsCount);
        io.emit('new user', getOnlineUsers(io));
    });
});

const getOnlineUsers = (io) => {
    const online = [];
    Object.keys(io.sockets.sockets).forEach(s => {
        const u = io.sockets.sockets[s].user;
        u ? online.push(u) : null;
    });
    return online;
}

app.post('/forgot', (req, res) => {
    bcrypt.genSalt((err, salt) => {
        if (err) res.sendStatus(500);
        bcrypt.hash(_.get(req, ["body", "password"], ""), salt, (error, hash) => {
            if (error) res.sendStatus(500);
            const username = _.get(req, ["body", "username"], "");
            db.changePassword(username, hash).then(_ => {
                res.json({ success: true });
            }).catch(_ => {
                res.sendStatus(500);
            });
        });
    });
});

app.post('/signup', (req, res) => {
    bcrypt.genSalt((err, salt) => {
        if (err) res.sendStatus(500);
        bcrypt.hash(_.get(req, ["body", "password"], ""), salt, (error, hash) => {
            if (error) res.sendStatus(500);
            const username = _.get(req, ["body", "username"], "");
            const profile = _.get(req, ["body", "profile"], "");
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

app.get('/populate', (req, res) => {
    console.log('populating');
    db.populateFeed().then(data => {
        res.send(data);
    }).catch(_ => {
        res.sendStatus(500);
    });
});

server.listen(port, () => {
    console.log(`listening on ${port}`);
});