// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import mongoose from "mongoose";
import connectDB from "./db/index.js";

import express from "express"
const app = express()


dotenv.config({
    path: "./env"
})



connectDB()
.then(()=>{
    app.listen(process.env.PORT || 80001, () => {
        console.log(`sever is running at port : ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.log("MONGO DB connection failed !!!", err)
})










/*


(async () => {
    try{
         await mongoose.connect(`${process.env.MONGOBD_URLI}`)
         app.on(()=>{
            console.log("ERROR :", error)
            throw error
         })

         app.listen(process.env.PORT, () =>{
            console.log(`App is listening on port ${process.env.PORT}`)
         })

    }
    catch(error){
        console.error("Error:", error)
        throw error
    }
})()

*/