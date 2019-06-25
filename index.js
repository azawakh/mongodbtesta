const { format } = require('util');
const { env, stdout, exit } = require('process');
const { MongoClient } = require('mongodb');
const assert = require('assert');

const { MONGO_USER, MONGO_PASSWORD } = env;

const mongoUrl = `mongodb+srv://${MONGO_USER}:${encodeURIComponent(
  MONGO_PASSWORD
)}@twitter-reminder-orsyp.mongodb.net/test?retryWrites=true&w=majority`;
// const mongoUrl = 'mongodb://127.0.0.1:27017';

// insert
const insertDocuments = async db => {
  const message = await (collection =>
    new Promise(resolve =>
      collection.insertMany(
        [{ a: 1 }, { a: 2 }, { a: 3 }],
        (err, { result, ops }) => {
          assert.equal(err, null);
          assert.equal(3, result.n);
          assert.equal(3, ops.length);
          resolve('inserted 3 documents into the collection\n');
        }
      )
    ))(db.collection('documents'));

  stdout.write(`${message}\n`);
};

// findAll
const findAllDocuments = async db => {
  const documents = await (collection =>
    new Promise(resolve => resolve(collection.find({}))))(
    db.collection('documents')
  );
  return documents;
};
// Connection url

// Database Name
const dbName = 'test';
// Connect using MongoClient
const client = new MongoClient(mongoUrl, { useNewUrlParser: true });

(async () => {
  try {
    const err = await new Promise(resolve => client.connect(resolve));
    assert.equal(null, err);
    stdout.write('connection successfully to server\n');

    const db = client.db(dbName);

    await insertDocuments(db);

    const documents = await findAllDocuments(db);

    documents.forEach(doc => stdout.write(`${format(doc)}\n`));

    client.close();
  } catch (e) {
    stdout.write(`${e}\n`);
    client.close();
  }
})();
