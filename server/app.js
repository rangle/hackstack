/**
 * Created by brian on 15-03-12.
 */
'use strict';
var express = require('express');
var app = express();

app.use(express.static('client'));
app.get('/api/tasks', function (req, res) {
  res.send([
    {
      id: "1",
      title: "First task",
      description: "A wonderful task"
    }
  ]);
});

var server = app.listen(8080, function () {

  var port = server.address().port;

  console.log('Hack-stack sample app listening on http://localhost:%s', port)

});