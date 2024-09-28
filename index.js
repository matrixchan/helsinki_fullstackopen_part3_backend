const express = require('express');
const app = express();

let persons = [
  {
    id: '1',
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: '2',
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: '3',
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: '4',
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
];

const generateId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map((n) => n.id)) : 0;
  return maxId + 1;
};

app.use(express.json());

app.get('/info', (request, response) => {
  let currentDate = new Date();

  const info = `
    Phonebook has info for ${persons.length} people
    <br/><br/>
    ${currentDate}
  `;

  response.send(info.trim());
});

app.get('/api/persons', (request, reponse) => {
  reponse.json(persons);
});

app.get('/api/persons/:id', (request, response) => {
  // const id = Number(request.params.id);
  const id = request.params.id;
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response
      .status(400)
      .json({ error: 'The name or number is  missing' });
  }

  const existPerson = persons.find((person) => person.name === body.name);
  if (existPerson) {
    return response.status(400).json({ error: 'Name must be unique' });
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  };

  persons = persons.concat(person);
  response.json(person);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
