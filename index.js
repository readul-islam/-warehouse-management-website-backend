const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2m6j3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });



const run = async () => {

    try {
        await client.connect();
        const inventoryCollection = client.db("carWarehouse").collection("inventorys");

        app.post('/add-inventory', async (req, res) => {

            const user = req.body;
            const result = await inventoryCollection.insertOne(user)
            res.send({ success: true, error: 'your inventory unSuccessfull', result })

        })
        app.get('/add-inventory', async (req, res) => {

            const query = {};
            const cursor = inventoryCollection.find(query)
            const inventorys = await cursor.toArray()
            res.send(inventorys)
        })
        app.get('/add-inventory/:id', async (req, res) => {

            const id = req.params.id;
            const query = { _id: ObjectId(id) }

            const result = await inventoryCollection.findOne(query);
            res.send(result)

        })


        app.delete('/manage-inventory/:id', async (req, res) => {

            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await inventoryCollection.deleteOne(query);
            res.send({ success: true, error: 'delete error', result })
        })

        app.get('/search', async (req, res) => {

            const query = req.query.title.toLowerCase();
            const cursor = inventoryCollection.find({})
            const result = await cursor.toArray();

            const matched = result.filter(inventory => inventory.title.toLowerCase().includes(query));
            res.send(matched)



        })
        app.put('/add-inventory/:id', async (req, res) => {
            let updateQuantity;
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            let result = await inventoryCollection.findOne(query);
            const options = { upsert: true };
            //---------------------------------------------------//
            const add = parseInt(req.query.add)
            const deleted = parseInt(req.query.deleted)
            const addQuantity = parseInt(result.quantity) + add;
            const deleteQuantity = parseInt(result.quantity) - deleted;

            try {

                if (add && !deleted) {

                    if (result.quantity) {
                        updateQuantity = await inventoryCollection.updateOne(query, { $set: { quantity: addQuantity } }, options)
                    } else {
                        updateQuantity = await inventoryCollection.updateOne(query, { $set: { quantity: add } }, options)
                    }

                    res.send(result)

                } else {

                    if (result.quantity) {
                        updateQuantity = await inventoryCollection.updateOne(query, { $set: { quantity: deleteQuantity } }, options)

                    }

                    else {
                        res.send({ error: 'Error updating quantity' })
                    }
                    res.send(result)
                }
 }
            catch (error) {
                console.log(error)

            }

})

    }
    finally {

    }



}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('hellow world')
})

app.listen(port, () => {
    console.log('my server running')
})