const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if(!user){
    return response.status(404).json({ error: "Username not found!" });
  }

  request.user = user;

  return next();
};

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if(userAlreadyExists){
    return response.status(400).json({ error: "User already registred!" });
  };

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;

  const usersTasks = user.todos.find((todo) => todo.id === id);

  if(!usersTasks){
    response.status(404).json({ error: "This task doesn't exists" });
  }

  usersTasks.title = title;
  usersTasks.deadline = new Date(deadline);

  return response.json(usersTasks);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const usersTasks = user.todos.find((todo) => todo.id === id);

  if(!usersTasks){
    response.status(404).json({ error: "This task doesn't exists" });
  };

  usersTasks.done = true;

  response.status(200).json(usersTasks);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const usersTask = user.todos.find((todo) => todo.id === id);

  if(!usersTask){
    response.status(404).json({ error: "This task doesn't exists" });
  };

  user.todos.splice(usersTask, 1);

  response.status(204).json();
});

module.exports = app;