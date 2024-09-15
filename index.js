require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const Person = require('./modules/person');

const app = express();
app.use(express.static('dist'));
app.use(express.json());
app.use(cors());

function morganHandlerFnc(tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'),
    '-',
    tokens['response-time'](req, res),
    'ms',
    '- Body:',
    JSON.stringify(req.body),
  ].join(' ');
}

app.use(morgan(morganHandlerFnc));

app.get('/', function (request, response) {
  response.send('Hello World');
});

app.get('/info', function (request, response) {
  Person.find({}).then((mongoDbResponse) => {
    const info = `
      Phonebook has info for ${mongoDbResponse.length} people <br /><br />
      ${new Date()}
    `;
    response.send(info);
  });
});

app.get('/api/persons', function (request, response) {
  Person.find({}).then((mongoDbResponse) => {
    response.json(mongoDbResponse);
  });
});

app.get('/api/persons/:id', async function (request, response, next) {
  const id = request.params.id;

  try {
    const person = await Person.findById(id);

    if (person) {
      return response.json(person);
    }

    response.status(404).end();
  } catch (error) {
    next(error);
  }
});

app.post('/api/persons', async function (request, response, next) {
  const person = request.body;
  const phonebooksList = await Person.find({});
  const personAlreadyExists = phonebooksList.find(
    (personDB) => personDB.name === person.name
  );

  if (personAlreadyExists) {
    if (personAlreadyExists) {
      messageToSend = 'Name must be unique';
    }

    return response.status(400).json({
      error: messageToSend,
    });
  }

  const newPerson = new Person({
    name: person.name,
    number: person.number,
  });

  newPerson
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.put('/api/persons/:id', function (request, response, next) {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(
    request.params.id,
    { ...person },
    { new: true, runValidators: true, context: 'query' }
  )
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', async function (request, response, next) {
  const id = request.params.id;
  try {
    await Person.findByIdAndDelete(id);

    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

function unknownEndpoint(request, response) {
  response.status(404).send({ error: 'unknown endpoint' });
}

app.use(unknownEndpoint);

function errorHandler(error, request, response, next) {
  console.log(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
}

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
