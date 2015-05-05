/**
 * Created by brian on 15-03-12.
 */
'use strict';
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(express.static('./dist'));
app.use(bodyParser.json());

app.get('/api/tasks', function (req, res) {
  res.send([
    {
      id: "1",
      title: "First task",
      description: "A wonderful task"
    },
    {
      id: "2",
      title: "Second task",
      description: "Add assignees to tasks"
    }
  ]);
});
app.get('/api/tasks/:taskId', function (req, res) {
  res.send({
    id: req.params.taskId,
    title: "A title",
    description: "Some writing"
  });

});
app.post('/api/tasks/', function (req, res) {
  res.location('/tasks/5');
  res.send({message: 'success'});
});

app.post('/api/tasks/:taskId', function (req, res) {
  var message = 'successfully updated ' + req.body.id;
  console.log('Updated: ', req.body);
  res.send({message: message});
});

var server = app.listen(8080, function () {

  var port = server.address().port;

  console.log('Hack-stack sample app listening on http://localhost:%s', port);

});