const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;



//middleware

app.use(cors());
app.use(express.json());



//MONGODB CONNECT


const uri = "mongodb+srv://tasinpronoy56:uw3RxRhGiqGg7QsI@cluster0.es0s7yl.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const dataBaseOfSports = client.db('camp-champions-school').collection('sports');
    const dataBaseOfSelectedClasses = client.db('camp-champions-school').collection('classes');


    /*SPORTS POPULAR*/
    app.get('/sports', async (req, res) => {

      const cursor = dataBaseOfSports.find()
      const result = await cursor.toArray()
      res.send(result);
    })


    /*SELECTED CLASSES INSERT IN DATABASE COLLECTION*/

    app.post('/classes', async (req, res) => {

      const classes = req.body;
      const result = await dataBaseOfSelectedClasses.insertOne(classes);
      res.send(result);
    })


    /*SELECTED CLASSES SHOWING FROM DATABASE*/

    app.get('/classes', async (req, res) => {

      const cursor = dataBaseOfSelectedClasses.find()
      const result = await cursor.toArray()
      res.send(result);
    })






    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {

  res.send('Helloo');
})

app.listen(port, () => {

  console.log(`port is running ${port}`)
})