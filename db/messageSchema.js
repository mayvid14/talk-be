const object = require('./object');
const User = require('./userSchema');

const messageSchema = new object.mongoose.Schema({
    sentBy: {
        type: object.mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }, sentAt: {
        type: String,
        required: true
    }, content: {
        type: String,
        required: true
    }, attachment: {
        type: String
    }
});

module.exports = object.connection.model("message", messageSchema);