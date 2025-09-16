const { MongoClient } = require('mongodb');

const dblist = ['parasim', 'bizlab', 'bizlab_demo', 'parasim_demo'];
const colls = ['case_studies', 'game_data'];
const fields = {
    'continousImprovement' : 'continuousImprovement',
    'continous_improvement' : 'continuous_improvement'
};

function renameField(obj) {
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            if (key === 'continousImprovement') {
                obj['continuousImprovement'] = value;
                delete obj[key];
            }

            // If the value is an object, recursively rename fields within it
            if (typeof value === 'object' && value !== null) {
                renameField(value);
            }
            
        }
    }
    return obj;
}

async function renameFieldsInCollection(dbname) {
  const uri = 'mongodb://127.0.0.1:27017/' + dbname; // Replace with your MongoDB connection string
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    //await client.connect();
    //const database = client.db(dbname);
    client.connect()
    .then(async () => {
        const database = client.db();
        for (var i = 0; i < colls.length; i++) {
            const collname = colls[i];
            const collection = database.collection(collname);
            const documents = await collection.find().toArray();
            for (const doc of documents) {
                const updatedDoc = renameField(doc);
                await collection.updateOne({ _id: doc._id }, { $set: updatedDoc });
            }
        }
        console.log('Field renaming completed successfully.');
    })
    .catch((err) => {
      console.error('Error connecting to database ' + dbname, err);
    });
}

const renameInAllDbs = async () => {
    for (var i = 0; i < dblist.length; i++) {
        const dbname = dblist[i];
        renameFieldsInCollection(dbname);
    }
}

renameInAllDbs();
