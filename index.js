const express = require('express')
const cors = require('cors')
const app = express()
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7njjpna.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// JWT verification
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'Unauthorized Access :(' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access :@' });
    }
    req.decoded = decoded;
    next()
  })
}

async function run() {

  try {
    const serviceCollection = client.db("visaService").collection("services");
    const usersCollection = client.db("visaService").collection("users");

    app.post('/jwt', (req, res) => {

      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
      res.send({token})
    })

    // services in home
    app.get('/services', async (req, res) => {
      const query = {};
      const options = {
        sort: { date: -1 },
      };
      const cursor = serviceCollection.find(query, options);
      const services = await cursor.toArray();
      // const shuffled = services.sort(() => 0.5 - Math.random());
      const servicesHome = services.slice(0, 3);
      res.send({ services, servicesHome });
    });

    app.get('/services/:id', async (req, res) => {
      const searchID = req.params.id
      const query = { _id: ObjectId(searchID) }
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services)
    });

    // showing reviews under service details
    app.get('/reviews/:id', async (req, res) => {
      const searchID = req.params.id
      const query = { serviceId: searchID }
      const options = {
        sort: { date: -1 },
      }
      const cursor = usersCollection.find(query, options);
      const services = await cursor.toArray();
      res.send(services)
    })

    //adding reviews under service details
    app.post('/reviews', verifyJWT, async (req, res) => {
      const reviewByUser = req.body;
      // const date = Date()
      // const reviewWithDate = [reviewByUser, {date}]
      const result = await usersCollection.insertOne(reviewByUser);
      res.send(result);
    })

  
    // getting my reviews with user email
    app.get('/myreviews', verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      if (decoded.email !== req.query.email) {
        res.status(403).send({ message: "Unauthorized ACCESS" })
      }

      let query = {}
      if (req.query.email) {
        query = {
          email: req.query.email
        }
      }
      const options = {
        sort: { date: -1 },
      }
      const cursor = usersCollection.find(query, options);
      const myReview = await cursor.toArray();
      res.send(myReview)
    })

    // updating My Reviews ***
    app.patch('/editreview', verifyJWT, async (req, res) => {
      let query = {}
      const changedReview = req.body.review;
      if (req.query.id) {
        query = { _id: ObjectId(req.query.id) }
      }
      const updatedDoc = {
        $set: { review: changedReview }
      };
      const result = await usersCollection.updateOne(query, updatedDoc);
      res.send(result)
    })


    // delete my Review
    app.delete('/myreview/delete/:id', verifyJWT, async (req, res) => {
      const reviewId = req.params.id;
      const query = { _id: ObjectId(reviewId) }
      const result = await usersCollection.deleteOne(query);
      res.send(result)

    })

    // add service by user
    app.post('/addservicebyuser', async (req, res) => {
      const serviceByUser = req.body;
      const result = await serviceCollection.insertOne(serviceByUser)
      // console.log(serviceByUser);
      res.send(serviceByUser)
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
