const {Users, Messages} = require('../mongodb.js')

const Send_Messages_Function = async (from, to,message) => {

    const new_Message = new Messages({
        users:  [ from,to],
        message: message,
        Sender: from,
        createdAt: new Date().toLocaleString(),
    })
    let x = await new_Message.save()
    return x;
}
const Get_Users_Function = async (owner) => {

    let users = await Users.find({}).select('UserName');
    let users_except_owner = users.filter(user => {
        return user.UserName != owner;
    });
    return users_except_owner ;

}
const Get_Messages_Function = async (from , to) => {

    // console.log(From,To);
    const messages = await Messages.find({ users: { $all: [from,to] }});
    return  messages ;

}

const clear_chat_Function = async (from , to) => {

        const messages = await Messages.deleteMany({ users: { $all: [from,to] }});
        return messages ; 
};
const clear_messages_Function = async (objects) => {

        const messages = await Messages.deleteMany({_id: { $in: objects}});;
        return messages ;

};
module.exports = {Send_Messages_Function,Get_Users_Function,Get_Messages_Function,clear_chat_Function,clear_messages_Function};