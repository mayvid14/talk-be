const operations = require("./operations");
const _ = require("lodash");

module.exports = {
    addNewUser: (username, password, profile, res) => {
        const obj = { username, password, profile };
        const p = operations.addUser(obj);

        p.then(data => {
            res.send(data);
        }).catch(err => {
            console.log(err);
            res.sendStatus(500);
        });
    },

    getUserByUsername: (username) => {
        return operations.findUserByUsername(username);
    },

    addNewMessage: (sentBy, sentAt, content, attachment) => {
        const obj = attachment ? { sentBy, sentAt, content, attachment } : { sentBy, sentAt, content };
        return operations.addMessage(obj);
    }
};