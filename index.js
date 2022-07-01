const express = require('express');
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
require('dotenv').config()

// Middlewares
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kcxwz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

(async () => {
    try {
        await client.connect();
        const billCollection = client.db("power-hack-pHero-task").collection("bill");

        // Add new billing api
        app.post('/api/add-billing', async (req, res) => {
            const data = req.body
            const result = await billCollection.insertOne(data);
            res.send(result)
        })

        // All billing list api
        app.get('/api/billing-list', async (req, res) => {
            const query = req.query
            const cursor = await billCollection.find(query);
            const result = await cursor.toArray()
            res.send(result)
        })

        // Get specific item 
        app.get('/api/update-billing/:id', async (req, res) => {
            const id = req.params.id
            const filter = ({ _id: ObjectId(id) })
            const result = await billCollection.findOne(filter);
            
            res.send(result)
        })

        // Deleting a specific item by id
        app.delete('/api/delete-billing/:id', async (req, res) => {
            const id = req.params.id
            const filter = ({ _id: ObjectId(id) })
            const result = await billCollection.deleteOne(filter);
            res.send(result)
        })






    } finally {

    }
})().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
