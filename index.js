const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("dist"));

function morganHandlerFnc(tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, "content-length"),
    "-",
    tokens["response-time"](req, res),
    "ms",
    "- Body:",
    JSON.stringify(req.body),
  ].join(" ");
}

app.use(morgan(morganHandlerFnc));

let phonebooksList = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

function generateNewId() {
  const currentLength = phonebooksList.length;
  const maxId =
    currentLength > 0
      ? Math.max(...phonebooksList.map((person) => Number(person.id)))
      : 0;
  return String(maxId + 1);
}

app.get("/", function (request, response) {
  response.send("Hello World");
});

app.get("/info", function (request, response) {
  const info = `
    Phonebook has info for ${phonebooksList.length} people <br /><br />
    ${new Date()}
  `;
  response.send(info);
});

app.get("/api/persons", function (request, response) {
  response.json(phonebooksList);
});

app.get("/api/persons/:id", function (request, response) {
  const id = request.params.id;
  const person = phonebooksList.find((person) => person.id === id);

  if (person) {
    return response.json(person);
  }

  response.status(404).end();
});

app.post("/api/persons", function (request, response) {
  const person = request.body;

  const personAlreadyExists = phonebooksList.find(
    (personDB) => personDB.name === person.name
  );

  if (!person.name || !person.number || personAlreadyExists) {
    let messageToSend = "The name is a mandatory field";

    if (!person.number) {
      messageToSend = "The number is a mandatory field";
    }

    if (personAlreadyExists) {
      messageToSend = "Name must be unique";
    }

    return response.status(400).json({
      error: messageToSend,
    });
  }

  const newPerson = {
    id: generateNewId(),
    name: person.name,
    number: person.number,
  };

  phonebooksList = phonebooksList.concat(newPerson);

  response.json(newPerson);
});

app.delete("/api/persons/:id", function (request, response) {
  const id = request.params.id;
  phonebooksList = phonebooksList.filter((person) => person.id !== id);

  response.status(204).end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
