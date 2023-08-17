const {Users, Messages} = require('../mongodb.js')
const express = require("express");
const router = express.Router();
const {Send_Messages_Function,Get_Users_Function,Get_Messages_Function,clear_chat_Function,clear_messages_Function} = require('./api-functions.js')


const Send_Messages = async (req, res) => {
    let owner = req.user.UserName.trim();
    let owner_to = req.query.UserName.trim();
    let message = req.query.message.trim();
    let result = await Send_Messages_Function(owner,owner_to,message)
    res.status(200).json(result);
}
const Get_Users = async (req, res,next) => {
    try {
        let result = await Get_Users_Function(req.user.UserName);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}
const Get_Messages = async (req, res ,next) => {
    try {
        const From = req.user.UserName.trim();
        const To = req.query.UserName.trim();
        let result = await Get_Messages_Function(From,To)
        res.status(200).json(result);}
        catch (ex) {
            next(ex);
          }
}

const clear_chat = async (req, res,next) => {
    try {
        const From = req.user.UserName.trim();
        const To = req.query.UserName.trim();
        let result = await clear_chat_Function(From,To)
        res.status(200).json(result);
    }
        catch (ex) {
            next(ex);
          }
};
const clear_messages = async (req, res,next) => {
    try {
        
        const objects = req.query.chat_id;
        let result = await clear_messages_Function(objects)
        res.status(200).json(result);
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