const express = require('express');
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
require('dotenv').config()
const jwt = require('jsonwebtoken');

// Middlewares
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kcxwz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// Verify JWT Token
const verifyJWT = (req, res, next) => {
    const auth = req.headers.authorization
    if (auth) {
        const TOKEN = auth.split(' ')[1]
        jwt.verify(TOKEN, process.env.ACCESS_TOKEN, TOKEN, function (err, decoded) {
            if (err) {
                return res.status(401).send({ status: 401, msg: 'Unathorized Access' })
            } else {
                req.decoded = decoded
                next()
            }
        });
    } else {
        return res.status(401).send({ status: 401, msg: 'Unathorized Access' })
    }
}

(async () => {
    try {
        await client.connect();
        const billCollection = client.db("power-hack-pHero-task").collection("bill");
        const userCollection = client.db("power-hack-pHero-task").collection("user");


        // Registration api
        app.post('/api/registration', async (req, res) => {
            const data = req.body
            const result = await userCollection.insertOne(data);
            res.send({ result, token })
        })

        // Login api
        app.get('/api/login/:email/:pass', async (req, res) => {
            const email = req.params.email
            const pass = req.params.pass
            const filter = ({ email: email, password: pass })
            const data = await userCollection.findOne(filter)
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN);
            res.send({ data, token })
        })

        // Add new billing api
        app.post('/api/add-billing', verifyJWT, async (req, res) => {
            const data = req.body
            const { email } = req.decoded
            if (email) {
                const result = await billCollection.insertOne(data);
                return res.send(result)
            } else {
                return res.send({ status: 403 })
            }

        })

        // All billing list api
        app.get('/api/billing-list', async (req, res) => {
            let result
            const query = {}
            const search = req.query
            console.log(search)
            const page = parseInt(req.query.page)
            const cursor = await billCollection.find(query).sort({ _id: -1 });
            let count = await billCollection.countDocuments();
            if (page >= 0) {
                result = await cursor.skip(page * 10).limit(10).toArray()
            } else {
                result = await cursor.toArray()
            }

            if (search.search) {
                const value = await billCollection.find({}).toArray()
                result = value.filter(v => v.name.toLowerCase().includes(search.search.toLowerCase()) || v.email.toLowerCase().includes(search.search.toLowerCase()))
            }


            res.send({ result, count })
        })

        // Update a specific item 
        app.put('/api/update-billing/:id', async (req, res) => {
            const id = req.params.id
            const data = req.body
            const filter = ({ _id: ObjectId(id) })
            const options = { upsert: true };
            const updateDoc = {
                $set: data
            }
            const result = await billCollection.updateOne(filter, updateDoc, options);

            res.send(result)
        })

        // Deleting a specific item by id
        app.delete('/api/delete-billing/:id', verifyJWT, async (req, res) => {
            const id = req.params.id
            const filter = ({ _id: ObjectId(id) })
            const { email } = req.decoded
            if (email) {
                const result = await billCollection.deleteOne(filter);
                return res.send(result)
            } else {
                return res.send(status)
            }
        })






    } finally {

    }
})().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})
