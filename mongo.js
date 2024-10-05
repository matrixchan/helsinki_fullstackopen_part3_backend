const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log(
    'Please provide the password as an argument: node mongo.js <password>'
  );
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://openfullstack:${password}@cluster0.eiylj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set('strictQuery', false);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

async function addPerson(name, number) {
  const person = new Person({ name, number });
  try {
    await person.save();
    console.log(`added ${name} number ${number} to phonebook`);
  } catch (error) {
    console.error('Error saving person:', error);
  }
}

async function findAllPersons() {
  try {
    const persons = await Person.find({});
    console.log('phonebook:');
    persons.forEach((person) => {
      console.log(`${person.name} ${person.number}`);
    });
  } catch (error) {
    console.error('Error finding persons:', error);
  }
}

async function main() {
  try {
    await mongoose.connect(url);
    // console.log('Connected to MongoDB');

    if (process.argv.length === 5) {
      // Add new person
      const name = process.argv[3];
      const number = process.argv[4];
      await addPerson(name, number);
    } else if (process.argv.length === 3) {
      // Display all entries
      await findAllPersons();
    } else {
      console.log('Invalid number of arguments. Usage:');
      console.log('To add a person: node mongo.js <password> <name> <number>');
      console.log('To display all entries: node mongo.js <password>');
    }
  } catch (error) {
    console.error('Error in main function:', error);
  } finally {
    await mongoose.connection.close();
    // console.log('Database connection closed');
  }
}

main();
