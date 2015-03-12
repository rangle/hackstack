/**
 * Created by brian on 15-03-12.
 */
'use strict';
var express = require('express');
var app = express();

app.use(express.static('sample-app'));

var server = app.listen(3337, function () {

  var port = server.address().port;

  console.log('Hack-stack sample app listening on http://localhost:%s', port)

});