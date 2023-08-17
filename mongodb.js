// MONGODB RELATED
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    UserName: String,
    email: String,
    password: String,
    // profile: String
});
const Users = mongoose.model("Users", UserSchema);
const MessageSchema = new mongoose.Schema({
    message: String,
    users: Array,
    Sender: String,
    createdAt: String,
});
const Messages = mongoose.model("Messages", MessageSchema);

module.exports = { Users, Messages}


// let newUser = new Users({
//     UserName: "admin",
//     email: "admin@email",
//     password: "admin",
// });
// newUser.save().catch((err) => {
//     if (err) return console.error(err);
// });
// let newMessage = new Messages({
//     users: ["admin", "admin"],
//     message: "Hello",
//     Sender: "admin",
//     createdAt: new Date().toLocaleString(),
// })
// newMessage.save().catch((err) => {
//     if (err) return console.error(err);
// });