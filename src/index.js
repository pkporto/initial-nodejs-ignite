const express = require('express');
const cors = require('cors');

 const { v4: uuidv4, v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function checksExistsUserAccount(request, response, next) {
      const { username } = request.headers;

      const user = users.find(user => user.username === username);

      if(!user){
        return response.status(400).json({
          error: 'User does not exist.'
        })
      }

      request.user = user;
      next();
}

app.post('/users', (request, response) => {
    const { username } = request.body;

    let user = users.find(user => user.username === username);

    if(user){
      return response.status(400).send({
        error: 'User already exists.'
      })
    }

    user = {
    ...request.body,
    id: uuidv4(),
    todos: []
  };
    users.push(user)

    return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const { user } = request;

    return response.status(200).json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
    const { title, deadline } = request.body;
    const { user } = request;

    const todo = {
      id: uuidv4(),
      done: false,
      created_at: new Date(),
      title,
      deadline: new Date(deadline)
    }

    user.todos.push(todo);

    return response.status(201).json(todo)


});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { title, deadline } = request.body;
    const { user }= request;
    const { id } = request.params;

    const todo = user.todos.find(td => td.id === id);

    if(!todo){
      return response.status(404).json({
        error: 'Todo not found'
      })
    }

    todo.title = title;
    todo.deadline = new Date(deadline);

    return response.status(201).json(
      todo
    )


});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user }= request;
  const { id } = request.params;

  const todo = user.todos.find(td => td.id === id);

    if(!todo){
      return response.status(404).json({
        error: 'Todo not found'
      })
    }

    todo.done = true;

    return response.status(200).json(
      todo
    )

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user }= request;
  const { id } = request.params;

  const todo = user.todos.find(td => td.id === id);

    if(!todo){
      return response.status(404).json({
        error: 'Todo not found'
      })
    }

    user.todos.splice(todo, 1);

    return response.status(204).json(user.todos);
});

module.exports = app;