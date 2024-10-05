const express = require('express');
const app = express();
require('dotenv').config();

const Person = require('./models/person');

app.use(express.json());
app.use(express.static('dist'));

const cors = require('cors');
app.use(cors());

const morgan = require('morgan');

app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :postData'
  )
);

morgan.token('postData', (req) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body);
  }
  return '-';
});

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path:  ', request.path);
  console.log('Body:  ', request.body);
  console.log('---');
  next();
};

app.use(requestLogger);

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

app.get('/', (request, response) => {
  response.send('<h1>Phonebook API</h1>');
});

app.get('/info', async (request, response, next) => {
  try {
    let currentDate = new Date();
    const count = await Person.countDocuments({});

    const info = `
      Phonebook has info for ${count} people
      <br/><br/>
      ${currentDate}
    `;

    response.send(info.trim());
  } catch (error) {
    next(error);
  }
});

app.get('/api/persons', (request, reponse, next) => {
  Person.find({})
    .then((persons) => {
      reponse.json(persons);
    })
    .catch((error) => next(error));
});

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id;
  Person.findById(id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', async (request, response, next) => {
  try {
    const id = request.params.id;
    const result = await Person.findByIdAndDelete(id);

    if (result) {
      response.status(204).end();
    } else {
      response.status(404).json({ error: 'Person not found' });
    }
  } catch (error) {
    console.error('Error deleting person:', error);
    // response
    //   .status(500)
    //   .json({ error: 'An error occurred while deleting the person' });
    next(error);
  }
});

app.post('/api/persons', async (request, response, next) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response
      .status(400)
      .json({ error: 'The name or number is missing' });
  }

  try {
    const existPerson = await Person.findOne({ name: body.name });
    if (existPerson) {
      return response.status(400).json({ error: 'Name must be unique' });
    }

    const person = new Person({
      name: body.name,
      number: body.number,
    });

    const savedPerson = await person.save();
    response.json(savedPerson);
  } catch (error) {
    next(error);
  }
});

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
