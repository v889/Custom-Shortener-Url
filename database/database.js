import mongoose from "mongoose";
//console.log(process.env.MONGO_URL)

export const connectdb=()=>{
    mongoose.connect(process.env.MONGO_URL,{
        "dbname":"URLAPP",
     })
     .then(()=>console.log("Database Conneted"))
     .catch((e)=>console.log(e));
    
};