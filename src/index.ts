import http from "http";
import express from "express";
import knex from "knex";
import carsRouter from "./routes/cars.routes";
import bodyParser from "body-parser";
import { Model } from "objection";

const port = 3000;
const app = express();

const knexInstance = knex({
  client: "pg",
  connection: {
    database: "postgres",
    user: "postgres",
    password: "123456", 
    port: 5432
  }
})

Model.knex(knexInstance)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use("/cars", carsRouter);

// route testing
app.get("/hello-world", (req, res)=> {
  res.status(200).json({
   message: "Hello World"
  });
});

const server = http.createServer(app);
server.listen(port, ()=> {
 console.log(`API is started at port ${port}`);
});