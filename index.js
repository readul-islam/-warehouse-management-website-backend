const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()

app.use(cors());
app.use(express.json());

function jwtVerify  (req, res, next){
const acessToken = req.headers.authorization;
if(!acessToken){
 return res.status(401).send({ message:'unauthorized access'})
}
const [bearer, token] = acessToken.split(' ');
jwt.verify(token, process.env.ACCESS_TOKEN,(err,decoded) => {
    if(err){
        res.status(403).send({ message:'Forbidden access'})
    }else{
        
        req.decoded = decoded;
        
        next()
    }
})

}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2m6j3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });




const run = async () => {

    try {
        await client.connect();
        const inventoryCollection = client.db("carWarehouse").collection("inventorys");
        // for jwt token access securly 
       app.post('/login',async (req, res) => {
        const email = req.body;
        // console.log(email)
        var token = jwt.sign(email, process.env.ACCESS_TOKEN);
        res.send({success: true, token})
       })

      // get all my items
        app.get('/my-items',jwtVerify, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded
        
         
            const query = {email:email};
           
            
           if(email === decodedEmail.email){
            const cursor = inventoryCollection.find(query)
            const myItems = await cursor.toArray()
            res.send(myItems)
           }else{
               res.status(403).send({message: 'Forbidden access'})
           }
           
            
        
           
            
        })
        //add inventory by current user
        app.post('/add-inventory', async (req, res) => {

            const user = req.body;
            const result = await inventoryCollection.insertOne(user)
            res.send({ success: true, error: 'your inventory unSuccessfull', result })

        })
        //get all invetory current user
        app.get('/add-inventory', async (req, res) => {
          
            const query = {};
            const cursor = inventoryCollection.find(query)
            const inventorys = await cursor.toArray()
            res.send(inventorys)
        })
        
        //specific user inventory details by id
        app.get('/add-inventory/:id', async (req, res) => {

            const id = req.params.id;
            const query = { _id: ObjectId(id) }

            const result = await inventoryCollection.findOne(query);
            res.send(result)

        })

        //delete item clinet side
        app.delete('/manage-inventory/:id', async (req, res) => {

            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await inventoryCollection.deleteOne(query);
            res.send({ success: true, error: 'delete error', result })
        })
        //search   inventory item api
        app.get('/search', async (req, res) => {

            const query = req.query.title.toLowerCase();
            const cursor = inventoryCollection.find({})
            const result = await cursor.toArray();

            const matched = result.filter(inventory => inventory.title.toLowerCase().includes(query));
            res.send(matched)



        })
        //update item quantity add and delete
        app.put('/add-inventory/:id', async (req, res) => {
           
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