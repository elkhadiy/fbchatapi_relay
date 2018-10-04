"use strict";

const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const login = require("facebook-chat-api");
const level = require("level");

const app = express();
const urlencodedParser = bodyParser.urlencoded({extended: false});
const urlencodedJsonParser = bodyParser.json();

// ===========================================================================

const db = level('./db', { valueEncoding: 'json' });
const key = fs.readFileSync('jwtRS256.key');
const cert = fs.readFileSync('jwtRS256.key.pub');

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
          let token = jwt.sign({ email: req.body.email }, key, { algorithm: 'RS256' });
          db.put(req.body.email, api.getAppState(), (err, value) => {
            if (err) res.status(401).send(err).end();
            else {
              res.status(200).send({ authorization: token });
            }
          })
        }
      })
  }
)

app.get(
  "/friends", urlencodedJsonParser,
  function (req, res) {
    db.get(jwt.verify(req.headers.authorization, cert).email, (err, value) => {
      if (err) res.status(401).send(err).end();
      else {
        login({
          appState: value
        }, (err, api) => {
          if (err) res.status(401).send(err).end();
          else {
            api.getFriendsList((err, data) => {
              if (err) res.status(401).send(err).end();
              else res.status(200).send(data).end();
            });
          }
        });
      }
    })
})

app.get(
  "/messages/:threadid/:nb?", urlencodedJsonParser,
  function (req, res) {
    db.get(jwt.verify(req.headers.authorization, cert).email, (err, value) => {
      if (err) res.status(401).send(err).end();
      else {
        login({
          appState: value
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
      }
    })
})

app.post(
  "/message/:threadid", urlencodedJsonParser,
  function (req, res) {
    db.get(jwt.verify(req.headers.authorization, cert).email, (err, value) => {
      if (err) res.status(401).send(err).end();
      else {
        login({
          appState: value
        }, (err, api) => {
          if (err) res.status(401).send(err).end();
          else {
            api.sendMessage(req.body, req.params.threadid, (err, messageInfo) => {
              if (err) res.status(401).send(err).end();
              else {
                res.status(200).send(messageInfo).end();
              }
            });
          }
        });
      }
    })
  }
)

app.post(
  "/attach/:threadid/:filename", urlencodedJsonParser,
  function (req, res) {
    db.get(jwt.verify(req.headers.authorization, cert).email, (err, value) => {
      if (err) res.status(401).send(err).end();
      else {
        login({
          appState: value
        }, (err, api) => {
          if (err) res.status(401).send(err).end();
          else {
            let body = {
              body: "",
              attachment: fs.createReadStream(req.params.filename)
            }
            api.sendMessage(body, req.params.threadid, (err, messageInfo) => {
              if (err) res.status(401).send(err).end();
              else {
                res.status(200).send(messageInfo).end();
              }
            });
          }
        });
      }
    })
  }
)

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
