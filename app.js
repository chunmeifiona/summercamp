const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session')
const flash = require('connect-flash')
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override'); // for edit->patch 
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const summercampRoutes = require('./routes/summercamps')
const reviewRoutes = require('./routes/reviews')

mongoose.connect('mongodb://localhost:27017/summercamp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();


app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({ extended: true })); // post request passed 
app.use(methodOverride('_method')); //for edit->patch
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: 'chunmei',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //diaplay time
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }

}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {//set up before use router
    //console.log(req.session)
    res.locals.success = req.flash('success'); // boilerplate.ejs:<%= success %>
    res.locals.error = req.flash('error');
    next();
})

app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'lichm215@gmai.com', username: 'fiona' })
    const newUser = await User.register(user, 'good')
    res.send(newUser)
})

app.use('/summercamps', summercampRoutes) //routes/summercamps
app.use('/summercamps/:id/reviews', reviewRoutes) //routes//reviews


app.get('/', (req, res) => {
    console.log('1')
    res.render('home')
})

//every path call this call back //任何没有在上边过滤掉的path
app.all('*', (req, res, next) => {//star means every single request
    //console.log('Page Not Found')
    const newError = new ExpressError('Page Not Found', 404)
    next(newError)
})

// error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})
app.listen(3000, () => {
    console.log("APP IS LISTENING ON PORT 3000!")
})
