const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

const stripePublicKey =
  "pk_test_51HNep5EMNkysPWnqe8FXZz0KdwFZQQDCx5bA4pns7JLZbr7mQ3NmoSQjaKoqNELvP8A3RJkUt2Pr9t4JV0aAJB9o00jWRs9Ebx";

console.log(stripeSecretKey);
console.log(stripePublicKey);

var express = require("express");
var app = express();
const fs = require("fs");
const stripe = require("stripe")(stripeSecretKey);

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static("public"));

app.get("/store", function (req, res) {
  fs.readFile("items.json", function (err, data) {
    if (err) {
      res.status(500).end();
    } else {
      res.render("store.ejs", {
        items: JSON.parse(data),
        stripePublicKey: stripePublicKey,
      });
    }
  });
});

app.post("/purchase", function (req, res) {
  fs.readFile("items.json", function (err, data) {
    if (err) {
      res.status(500).end();
    } else {
      const itemsJson = JSON.parse(data);
      const itemsArray = itemsJson.music.concat(itemsJson.merch);
      total = 0;
      req.body.items.forEach(function (item) {
        const itemJson = itemsArray.find(function (i) {
          return i.id == item.id;
        });
        total = total + itemJson.price * item.quantity;
      });
      stripe.charges
        .create({
          amount: total,
          source: req.body.stripeTokenId,
          currency: "usd",
        })
        .then(function () {
          console.log("payment successful");
          res.json({ message: "Successfully purchased" });
        })
        .catch(function () {
          console.log("charge fail");
          res.status(500).end();
        });
    }
  });
});

app.listen(3000, function () {
  console.log("cart app running on 3000");
});
