const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server is running');
});



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.u7wqc8p.mongodb.net/?appName=Cluster0`;
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
        const ratingsCollection = db.collection('ratings');

        // Find
        app.get('/models', async (req, res) => {
            const result = await modelCollection.find().toArray();

            res.send(result);
        });

        // findOne
        app.get('/models/:id', async (req, res) => {
            const { id } = req.params;
            // console.log(id);
            const result = await modelCollection.findOne({ _id: new ObjectId(id) });
            res.send({
                success: true,
                result
            })
        })

        // Insert
        app.post('/models', async (req, res) => {
            const data = req.body;
            // console.log(data);
            const result = await modelCollection.insertOne(data);
            res.send(
                {
                    success: true,
                    result
                }
            )
        });

        // latest 6 data find
        app.get('/latest-properties', async (req, res) => {

            const result = await modelCollection.find().sort({ postedDate: 'desc' }).limit(6).toArray();
            // console.log(result);
            res.send(result);
        })

        // My properties
        app.get('/my-properties', async (req, res) => {
            const email = req.query.email;
            const result = await modelCollection.find({ userEmail: email }).toArray();
            res.send(result);
        })

        // Update Property
        app.put("/update-property/:id", async (req, res) => {
            const id = req.params.id;
            const updateData = req.body;

            const result = await modelCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData }
            );

            res.send(result);
        });

        // Delete Property
        app.delete("/delete-property/:id", async (req, res) => {
            const id = req.params.id;
            const result = await modelCollection.deleteOne({
                _id: new ObjectId(id),
            });
            res.send(result);
        });

        // ratings functionality
        app.post("/add-rating", async (req, res) => {
            const rating = req.body;
            const result = await ratingsCollection.insertOne(rating);
            res.send(result);
        });

        app.get("/ratings/:propertyId", async (req, res) => {
            const id = req.params.propertyId;
            const result = await ratingsCollection.find({ propertyId: id }).toArray();
            res.send(result);
        });

        app.get("/my-ratings", async (req, res) => {
            const email = req.query.email;
            const result = await ratingsCollection.find({ reviewerEmail: email }).toArray();
            res.send(result);
        });

        // Search and sort functionality
        app.get("/all-properties", async (req, res) => {
            const { search, sortBy, order } = req.query;
            const query = {};

            if (search) {
                query.propertyName = { $regex: search, $options: "i" }; // case-insensitive search
            }

            const sortOptions = {};
            if (sortBy == "postedDate") {
                sortOptions.postedDate = order === "desc" ? 1 : -1;
            }

            const result = await modelCollection.find(query).sort(sortOptions).toArray();
            res.send(result);
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

