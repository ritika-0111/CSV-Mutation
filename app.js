const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const indexRoute = require('./routes/index');
const app = express();
require('dotenv').config();


// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// public folder
app.use('/public',express.static(path.join(__dirname, 'public')));


app.use(bodyParser.urlencoded({ extended: true }));


// Routing
app.use('/', indexRoute);



// Server 
app.listen(process.env.PORT , (err) => {
    if (err) console.log(err)
    console.log('Server Started');
})

module.exports = app;