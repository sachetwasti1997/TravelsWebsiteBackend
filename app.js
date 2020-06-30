const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const placesRoutes = require("./routes/places-routes");
const userRoutes = require("./routes/user-routes");

const app = express();

app.use(bodyParser.json());
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//   );
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
//   next();
// });

app.use(cors())

app.use("/uploads/images", express.static(path.join("uploads", "images")));
app.use("/uploads/places", express.static(path.join("uploads", "places")));

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  res.json({ message: "An error thrown" });
});

app.use("/api/places", placesRoutes);
app.use("/api/users", userRoutes);

mongoose
  .connect(
    "mongodb+srv://sachet:sachet123@cluster0.xfbgj.mongodb.net/places?retryWrites=true&w=majority")
  .then(() => {
    console.log("DONE");
    app.listen(5000);
  })
  .catch();
