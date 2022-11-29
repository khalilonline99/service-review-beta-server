const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7njjpna.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  const serviceCollection = client.db("visaService").collection("services");
  const usersCollection = client.db("visaService").collection("users");

  try {
    app.get('/services', async (req, res) => {
      const query = {}
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      const shuffled = services.sort(() => 0.5 - Math.random());
      const servicesHome = shuffled.slice(0, 3);
      res.send({ services, servicesHome });
    });

    app.get('/services/:id', async (req, res) => {
      const searchID = req.params.id
      const query = { _id: ObjectId(searchID) }
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services)
    });

    app.get('/reviews/:id', async (req, res) => {
      const searchID = req.params.id
      const query = { serviceId: searchID }
      const cursor = usersCollection.find(query);
      const services = await cursor.toArray();
      res.send(services)
    })

    // getting my reviews
    app.get ('/myreviews', async (req, res) => {
      let query = {}
      if (req.query.email){
        query = {
          email: req.query.email
        }
      }
      const cursor = usersCollection.find(query);
      const myReview = await cursor.toArray();
      res.send(myReview)
    })

    app.post('/reviews', async (req, res) => {
      // const searchID = req.params.id;
      const reviewByUser = req.body;
      const result = await usersCollection.insertOne(reviewByUser);
      res.send(result);
    })

  }
  finally {

  }
}
run().catch(err => console.log(err))



app.get('/', (req, res) => {
  res.send('EduPro Running OOOOOOOK!')
})


app.listen(port, () => {
  console.log(`EduPro app listening on port ${port}`)
})