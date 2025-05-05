require('dotenv').config();

const mongoose = require('mongoose')
const connectionDbString = process.env.MONGO_URI

mongoose.connect(connectionDbString).then(()=>{
    console.log("MongoDB Connected Succesfully");
}).catch((err)=>{
    console.log(`MongoDB Connection Failed Due to : ${err}`);
})