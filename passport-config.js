const { authenticate } = require("passport")
const localStrategy = require("passport-local").Strategy
const bcrypt = require("bcrypt")
const { Users, Messages } = require("./mongodb.js")
async function initialize(passport) {
    const authenticateUser = async (email, password, done) => {
        let userData = await Users.find({});
        let user  =  userData.find(user=>user.email===email)
        console.log(user);
        if (user == null) {
            return done(null, false, { message: 'No user with that email found' })
        }
        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else {
                return done(null, false, { message: 'Password is incorrect' })
            }
            
        } catch (e) {
            return done(e)
        }
    }
    passport.use(new localStrategy({ usernameField: "email" }, authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser(async(id, done) => {
        let user = await Users.findById(id);
        return done(null, user)
    })
};
module.exports = initialize;