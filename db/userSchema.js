const object = require('./object');

const userSchema = new object.mongoose.Schema({
    username: {
        type: String,
        required: true
    }, password: {
        type: String,
        required: true
    }, profile: {
        type: String,
        required: true
    }
});

module.exports = object.connection.model("user", userSchema);