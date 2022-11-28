const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7njjpna.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    app.get('/services', async (req, res) => {
      const serviceCollection = client.db("visaService").collection("services");
      const query = {}
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    })
  }
  finally {

  }
}
run().catch(err => console.log(err))



// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });


app.get('/', (req, res) => {
  res.send('EduPro Running OOOOOOOK!')
})


app.listen(port, () => {
  console.log(`EduPro app listening on port ${port}`)
})