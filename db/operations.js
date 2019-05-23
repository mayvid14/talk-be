const user = require('./userSchema');

module.exports = {
    addUser: obj => {
        const newUser = new user(obj);
        return newUser.save();
    },

    findUserByUsername: username => {
        console.log(username);
        return user.findOne({username}).exec();
    }
};