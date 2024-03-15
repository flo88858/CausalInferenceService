const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.use('/', indexRouter);

/*
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});
*/
// error handler
app.use(function (err, req, res) {
    // render the error page
    res.status(err.status || 500);
    res.json({'error': err.message});
});

module.exports = app;
