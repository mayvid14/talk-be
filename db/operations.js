const user = require('./userSchema');
const msg = require('./messageSchema');

module.exports = {
    addUser: obj => {
        const newUser = new user(obj);
        return newUser.save();
    },

    findUserByUsername: username => {
        console.log(username);
        return user.findOne({username}).exec();
    },

    addMessage: obj => {
        const newMsg = new msg(obj);
        return newMsg.save().then(e => e.populate('sentBy').execPopulate());
    }
};