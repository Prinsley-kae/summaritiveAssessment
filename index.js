// DEPENDENCIES
const express = require('express');
const expressSession = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo').default;
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const path = require('path');
const flash = require('connect-flash');

require('dotenv').config();
const connectDb = require('./config/start');

// Importing the user model
const Signup = require('./models/Signup');

// Setting up the app
const app = express();
const port = 3000;

// Connecting to the database
connectDb();

// Setting up the view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// MIDDLEWARE
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use(expressSession({
    secret: 'Technical-assessment-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.DATABASE,
        collectionName: 'sessions'
    }),
    cookie: { // Changed 'cookies' to 'cookie'
        maxAge: 1000 * 60 * 60 * 3
    }
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// PASSPORT CONFIGURATION 
passport.use(new LocalStrategy(
    { usernameField: 'email' },
    Signup.authenticate() // Ensure Signup model has passport-local-mongoose plugin
));

passport.serializeUser(Signup.serializeUser());
passport.deserializeUser(Signup.deserializeUser());

// GLOBAL CONTEXT VARIABLES
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

// ROUTES
app.use('/', require('./routes/dashboardRoutes'));
app.use('/', require('./routes/signupRoutes'));

// 404 HANDLER
app.use((req, res) => {
    res.status(404).send('Oops! Route not found.');
});

// START SERVER
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});