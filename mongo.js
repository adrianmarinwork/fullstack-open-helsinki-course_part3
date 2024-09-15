const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("Give password as argument");
  process.exit(1);
}

const password = process.argv[2];
const url = `mongodb+srv://adrianmarinwork:${password}@phonebookcluster.5y6sw.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=PhonebookCluster`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

const paramName = process.argv[3];
const paramNumber = process.argv[4];

if (paramName && paramNumber) {
  const newPerson = new Person({
    name: paramName,
    number: paramNumber,
  });

  newPerson.save().then((result) => {
    console.log(`Added ${paramName} number ${paramNumber} to phonebook!`);
    mongoose.connection.close();
  });

  return;
}

Person.find({}).then((result) => {
  console.log("Phonebook:");
  result.forEach((person) => {
    console.log(`${person.name} ${person.number}`);
  });
  mongoose.connection.close();
});
