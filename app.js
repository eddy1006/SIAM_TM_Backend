const express = require('express')
const app = express()
const mongoClient = require('mongodb').MongoClient

const port = process.env.PORT || 3000
const url = "mongodb+srv://eddy1006:adityaa%40106@cluster0.roqqm.mongodb.net/MyDb?retryWrites=true&w=majority"
app.use(express.json())

mongoClient.connect(url, (err, db) => {

    if (err) {
        console.log("Error while connecting mongo client")
    } else {

        const myDb = db.db('MyDb')
        const collection = myDb.collection('UserCollection')
        const taskCollection = myDb.collection('TaskCollection')

        app.post('/signup', (req, res) => {

            const newUser = {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                role: req.body.role,
                department: req.body.department
            }

            const query = { email: newUser.email }

            collection.findOne(query, (err, result) => {

                if (result == null) {
                    collection.insertOne(newUser, (err, result) => {
                        res.status(200).send()
                    })
                } else {
                    res.status(400).send()
                }

            })

        })
        app.post('/tasks', (req, res) => {
            const newTask = {
                title: req.body.title,
                description: req.body.description,
                department: req.body.department,
                comments: [],
                acknowledges: [],
                deadline : req.body.deadline 
            }
            taskCollection.insertOne(newTask, (err, result) => {
                res.status(200).send()
            })
        })
        app.post('/getTasks', (req, res) => {

            const query = { department: req.body.department }
            taskCollection.find(query).project({ _id: 1, description: 1, department: 1, acknowledges: 1,title: 1, deadline: 1 }).toArray((err, result) => {
                if (result != null) {
                    res.send(result)
                } else {
                    res.status(404).send()
                }
            })
        })
        app.post('/getOneTask', (req, res) => {
            const ObjectId = require('mongodb').ObjectId;
            var id = req.body._id
            var good_id = new ObjectId(id);
            const query = { _id: good_id }
            taskCollection.findOne(query, (err, result) => {
                if (result != null) {
                    const objToSend = {
                        title: result.title,
                        description: result.description
                    }
                    res.status(200).send(JSON.stringify(objToSend))
                } else {
                    res.status(404).send()
                }
            })
        })
        app.post('/addComment', (req, res) => {
            const ObjectId = require('mongodb').ObjectId;
            var id = req.body._id
            var good_id = new ObjectId(id);
            const query = { _id: good_id }
            taskCollection.findOneAndUpdate(query,{$push: { "comments": { name: req.body.name, text: req.body.text }}},(err,result)=>{
                if(result != null){
                    res.status(200).send()
                }else{
                    res.status(404).send()
                }
            })
        })
        app.post('/acknowledge', (req, res) => {
            const ObjectId = require('mongodb').ObjectId;
            var id = req.body._id
            var good_id = new ObjectId(id);
            const query = { _id: good_id }
            taskCollection.findOneAndUpdate(query, {$push: { "acknowledges" : { name: req.body.name, email: req.body.email}}},(err,result)=>{
                if(result != null){
                    res.status(200).send()
                }else{
                    res.status(404).send()
                }
            })
        } )
        app.post('/changePass', (req,res)=>{
            const query = { email: req.body.email}
            collection.findOneAndUpdate(query, {$set: {"password" : req.body.password }},(err,result)=>{
                if(result != null){
                    res.status(200).send()
                }else{
                    res.status(404).send()
                }
            })
        })
        app.post('/getComments', (req,res)=> {
            const ObjectId = require('mongodb').ObjectId;
            var id = req.body._id
            var good_id = new ObjectId(id);
            const query = { _id: good_id }
            taskCollection.findOne(query,(err,result)=>{
                if(result != null){
                    console.log(result)
                    res.status(200).send(JSON.stringify(result.comments))
                }else{
                    res.status(404).send()
                }
            })
        })
        app.post('/endTask',  (req,res) =>{
            const ObjectId = require('mongodb').ObjectId;
            var id = req.body._id
            var good_id = new ObjectId(id);
            const query = { _id: good_id }
            taskCollection.deleteOne( query,(err,obj)=>{
                if(err){
                    res.status(404).send()
                }else{
                    res.status(200).send()
                    console.log(JSON.stringify(obj))
                }
            })
        })
        app.post('/login', (req, res) => {

            const query = {
                email: req.body.email,
                password: req.body.password
            }

            collection.findOne(query, (err, result) => {

                if (result != null) {

                    const objToSend = {
                        name: result.name,
                        email: result.email,
                        department: result.department,
                        role: result.role
                    }

                    res.status(200).send(JSON.stringify(objToSend))

                } else {
                    res.status(404).send("Login not found")
                }

            })

        })

    }

})

app.listen(port, () => {
    console.log(`Listening on port ${port}...`)
})
