const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server is running');
});

// username: mdoel-db
// password: ONX37JFwQpMgjAC6

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://model-db:ONX37JFwQpMgjAC6@cluster0.u7wqc8p.mongodb.net/?appName=Cluster0";
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

        const db = client.db('model-db');
        const modelCollection = db.collection('models');

        // Find
        app.get('/models', async(req, res) => {
            const result = await modelCollection.find().toArray();
            
            res.send(result);
        });

        // findOne
        app.get('/models/:id', async(req, res) => {
            const {id} = req.params;
            console.log(id);
            const result = await modelCollection.findOne({_id: new ObjectId(id)});
            res.send({
                success: true,
                result
            })
        })

        // Insert
        app.post('/models', async(req, res) => {
            const data = req.body;
            console.log(data);
            const result = await modelCollection.insertOne(data);
            res.send(
                {
                    success: true,
                    result
                }
            )
        });



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`This server is running on port ${port}`);
});

