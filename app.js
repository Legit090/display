// BASIC NODEJS RELATED 
const express = require("express");
const path = require('path');
const app = express();
//const hostname = '192.168.29.94'
const port = 100;
const server = require('http').Server(app);

// MONGODB RELATED
const MongoDB_Url = "mongodb+srv://MrVegit:MRqLpmjilWGFlT3G@userinfo.pqsn00r.mongodb.net/GigaChat?retryWrites=true&w=majority";
// const MongoDB_Url = "mongodb://127.0.0.1:27017/chatapp";
const mongoose = require('mongoose');
mongoose
.connect(MongoDB_Url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });
const { Users,Messages } = require("./mongodb.js")


// SECURITY RELATED
const security = require("./routes/security.js")
const initializePassport = require("./passport-config");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require('method-override')
const MemoryStore = require('memorystore')(session)
initializePassport(passport)
app.use(flash())
app.use(session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}))
app.use(function (req, res, next) {
    res.locals.message = req.flash();
    next();
});
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


// EXPRESS SPECIFIC STUFF
app.use('/static', express.static('static')); //For serving static files
app.use(express.urlencoded({ extended: false }))


// PUG SPECIFIC STUFF
app.set('view engine', 'pug'); // set the template engine as pug
app.set('views', path.join(__dirname, 'templates')); //set the views directory

// API RELATED
const api = require("./routes/api.js")
const {Send_Messages_Function,Get_Users_Function,Get_Messages_Function,clear_chat_Function,clear_messages_Function} = require('./routes/api-functions.js')

//ENDPOINTS
app.get('/', checkAuthenticatedUser, (req, res) => {
    let user = req.user.UserName;
    // let profilePic  = req.user.profile;
    res.status(200).render('index.pug', { user: user});
    // res.status(200).render('index.pug', { user: user, profilePic:profilePic });
})
app.use("/api",checkAuthenticatedUser, api)
app.use("/security",checkNotAuthenticatedUser, security)
app.delete('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/security/login');
    });
});
app.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/security/login');
    });
    
});



function checkAuthenticatedUser(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect("/security/login")
}
function checkNotAuthenticatedUser(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/")
    }
    next()
}

// Start the Server
server.listen(port, () => {
    console.log(`The application has started successfully on port ${port}`);
});


// SOCKET.IO RELATED
const { instrument } = require("@socket.io/admin-ui"); // https://socket.io/docs/v4/admin-ui/
const io = require('socket.io')(server) // 3000 is the port number
// const userIo = io.of('/user') // namespace ;

// userIo.on('connection', socket => {
//     console.log('connected to user namespace');
// })
io.on('connection', socket => {
    let date_con = new Date();
    console.log(socket.id+' connected at '+date_con.getHours()+":"+date_con.getMinutes()+":"+date_con.getSeconds());
    socket.on('get-active-users', async(From) => { // done
        socket.broadcast.emit('Active-Users',From,socket.id)
        // let date = new Date();
        // console.log('get-active-users   '+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds());
    })
    socket.on('send-message', async(From,To,message,callBack) => { // done
        let x = await Send_Messages_Function(From,To,message)
        callBack(x);
        socket.to(To).emit('receive-message',From,x)
        // let date = new Date();
        // console.log('send messages   '+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds());
    })
    socket.on('get-users', async(From,callBack) => { // done
        let x = await Get_Users_Function(From)
        callBack(x);
        socket.join(From)
        socket.broadcast.emit('Active-Users',From,socket.id)
        // let date = new Date();
        // console.log('get-users   '+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds());
    })
    socket.on('get-messages', async(From,To,callBack) => { //done
        let x = await Get_Messages_Function(From,To)
        callBack(x);
    })
    socket.on('clear-chat', async(From,To,callBack) => {//done
        await clear_chat_Function(From,To)
        callBack();
    })
    socket.on('clear-messages', async(chat_ids, callBack) => { //done
        await clear_messages_Function(chat_ids)
        callBack();    
    })
    socket.on("disconnect", () => {
        socket.broadcast.emit('offline-Users',socket.id)
    });
})

instrument(io, {
    auth: false,
  });
