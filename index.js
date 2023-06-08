const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const stripe = require("stripe")('sk_test_51NGr84ADFosxOhRqgtxPy2acHpaRWnvVrX89tiHMyLYtyDc6rIcPUy318J1lxGF3Uj5Bc9Q8MgnPZZktp3Ejv4qc00iB0w0yvk');

app.use(express.static("public"));
app.use(express.json());

const calculateOrderAmount = (items) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 1400;
};

app.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});



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
    const dataBaseOfUsers = client.db('camp-champions-school').collection('users');


    /*SPORTS POPULAR*/
    app.get('/sports', async (req, res) => {

      const cursor = dataBaseOfSports.find()
      const result = await cursor.toArray()
      res.send(result);
    })



    /*COLLECT USER INFO*/

    app.post('/users', async (req, res) => {

      const users = req.body;
      const query = { email: users.email }
      const alreadyUserExisted = await dataBaseOfUsers.findOne(query)
      if (alreadyUserExisted) {

        return res.send({ message: "Already existed!!" })
      }

      const result = await dataBaseOfUsers.insertOne(query);
      console.log(result);
      res.send(result);
    })

    /*USER DATA GET*/

    app.get('/users', async (req, res) => {

      const cursor = dataBaseOfUsers.find()
      const result = await cursor.toArray()
      res.send(result);
    })


    /*USER ADMIN CHECK*/

    app.get('/users/admin/:email', async (req, res) => {

      const email = req.params.email;
      const query = { email: email }
      const user = await dataBaseOfUsers.findOne(query);
      res.send(user)
      console.log(user);
    })

    /*UPDATE USER ADMIN ROLE*/

    app.patch('/users/admin/:id', async (req, res) => {

      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {

        $set: {
          role: 'admin'
        },
      };

      const result = await dataBaseOfUsers.updateOne(filter, updateDoc)
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

      const email = req.body;
      if (!email) {
        res.send([])
      }
      else {


        const cursor = dataBaseOfSelectedClasses.find();
        const result = await cursor.toArray(cursor);
        res.send(result);

      }

    })


    /*DELETE FROM DASHBOARD*/

    app.delete('/classes/:id', async (req, res) => {

      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await dataBaseOfSelectedClasses.deleteOne(query)
      res.send(result);

    })

    /*PAYMENT*/

    app.post("/create-payment-intent", async (req, res) => {

      const { payment } = req.body;
      const totalAmount = payment * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount,
        currency: "usd",
        payment_method_types: ['card']
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
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