"use strict";

const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const login = require("facebook-chat-api");

const app = express();
const urlencodedParser = bodyParser.urlencoded({extended: false});
const urlencodedJsonParser = bodyParser.json();

// ===========================================================================

// setup a database or something in here

// ===========================================================================

app.post(
  "/login", urlencodedJsonParser,
  function (req, res) {
    login({
        email: req.body.email,
        password: req.body.password
      },
      (err, api) => {
        if (err) res.status(401).send(err).end();
        else {
          let token = jwt.sign({ email: req.body.email }, "sicret69");
          fs.writeFileSync(req.body.email, JSON.stringify(api.getAppState()));
          res.status(200).send({ authorization: token });
        }
      })
  }
)

app.get(
  "/friends", urlencodedJsonParser,
  function (req, res) {
    login({
      appState: JSON.parse(fs.readFileSync(jwt.decode(req.headers.authorization).email, "utf8"))
    }, (err, api) => {
      if (err) res.status(401).send(err).end();
      else {
        api.getFriendsList((err, data) => {
          if (err) res.status(401).send(err).end();
          else res.status(200).send(data).end();
        });
      }
    });
})

app.get(
  "/messages/:threadid/:nb?", urlencodedJsonParser,
  function (req, res) {
    login({
      appState: JSON.parse(fs.readFileSync(jwt.decode(req.headers.authorization).email, "utf8"))
    }, (err, api) => {
        if (err) res.status(401).send(err).end();
        else {
          api.getThreadHistory(req.params.threadid, req.params.nb || 50, undefined,
            (err, hist) => {
              if (err) res.status(401).send(err).end();
              else {
                res.status(200).send(hist).end();
              }
          });
        }
      });
})

// ===========================================================================

app.listen(process.argv[2],
  function () {
    console.log("App launched");
  }
)

app.use(function(err, req, res, next) {
  console.log(err);
  res.status(err.status || 500);
  res.send("Error\n");
})
