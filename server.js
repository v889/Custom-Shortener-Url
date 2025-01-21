import { app } from "./app.js";
import { connectdb } from "./database/database.js";

connectdb()

app.listen(process.env.port,()=>{
  console.log(`server is runing ${process.env.port}`)
})