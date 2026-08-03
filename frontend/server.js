const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();
const staticFileMiddleware = express.static(path.join(__dirname + '/build'));

app.use(staticFileMiddleware);
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, '/build', 'index.html'));
});

var server = app.listen(process.env.PORT || 8080, '0.0.0.0', function () {
  var port = server.address().port;
  console.log("App now running on port", port);
});