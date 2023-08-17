const {Users, Messages} = require('../mongodb.js')
const express = require("express");
const router = express.Router();
const Send_Messages = async (req, res) => {
    let owner = req.user.UserName.trim();
    let owner_to = req.query.UserName.trim();
    let message = req.query.message.trim();
    const new_Message = new Messages({
        users:  [ owner,owner_to],
        message: message,
        Sender: owner,
        createdAt: new Date().toLocaleString(),
    })
    new_Message.save().then(()=>{
        res.status(200).json({message:"Message Sent"});
    }).catch((err) => {
        if (err) return console.error(err);
    });
}
const Get_Users = async (req, res,next) => {
    try {
        let users = await Users.find({}).select('UserName');
        let users_except_owner = users.filter(user => {
            return user.UserName != req.user.UserName;
        });
        res.status(200).json(users_except_owner);
    } catch (error) {
        next(error);
    }
}
const Get_Messages = async (req, res ,next) => {
    try {
        const From = req.user.UserName.trim();
        const To = req.query.UserName.trim();
        // console.log(From,To);
        const messages = await Messages.find({ users: { $all: [From,To] }});
        res.json(messages);}
        catch (ex) {
            next(ex);
          }
}

const clear_chat = async (req, res,next) => {
    try {
        const From = req.user.UserName.trim();
        const To = req.query.UserName.trim();
        const messages = await Messages.deleteMany({ users: { $all: [From,To] }});
        res.json(messages);
    }
        catch (ex) {
            next(ex);
          }
};
const clear_messages = async (req, res,next) => {
    try {
        
        const objects = req.query.chat_id;
        const messages = await Messages.deleteMany({_id: { $in: objects}});;
        res.json(messages);
    }
        catch (ex) {
            next(ex);
          }
};

router.route('/get-messages').get(Get_Messages)
router.route('/get-users').get(Get_Users)
router.route('/send-messages').get(Send_Messages)
router.route('/clear-chat').get(clear_chat)
router.route('/clear-message').get(clear_messages)

// router.route('/chat-bot').get(Get_Chatof_AI);


module.exports = router;