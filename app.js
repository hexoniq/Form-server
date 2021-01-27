const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const nodemailer = require("nodemailer");
const cors = require('cors');
require('dotenv').config()
const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
app.use(bodyParser.json());

app.options('*', cors())
app.use(cors())

const url = process.env.MONGODBURL;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAILUSER,
        pass: process.env.GMAILPASS
    }
});

mongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, function (err, db) {
    if (err) throw err;
    console.log("Database Connected!");
    db.close();
});

app.get("/", (req, res) => {
    res.send('Namaste From Server..')
});

app.post("/response",async (req, res) => {
    const {
        name,
        email,
        apps,
        profession,
        memeScale,
        ageGroup,
        prosAndCons,
        socialScale
    } = req.body;
    
    const prosAndCons_ = prosAndCons.split('-');
    let client = await mongoClient.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }); //connect to db
    let db = client.db("form"); //db name
    let response = db.collection("responses"); //collection name
    response.insertOne({
        name:name,
        email:email,
        apps:apps,
        memeScale:memeScale,
        profession:profession,
        ageGroup:ageGroup,
        socialScale:socialScale,
        prosAndCons:prosAndCons_.slice(1,prosAndCons_.length)
    });
    const mailOptions = {
        from: '"noreply@hexoniqindia.com" <noreply@hexoniqindia.com>',
        to: `${email}`,
        subject: 'Thanks for your response',
        html: `Hello ${name} ,<br /> Thanks for filling out the form..`
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return res.sendStatus(501);
        } else {
            return res.sendStatus(201);
        }
    });  
            
    
})

app.listen(process.env.PORT || 5000, () => {
    console.log("Server is Live...");
})