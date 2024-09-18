const express = require('express');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('node:path');
const createServer = client => {
  const app = express()
  app.get("/", (_, res) => {
    res.send(`${client.user.username} says hello`)
  })

  // Define a post route called events that will get json data from github webhooks
    app.post("/events", express.json({type: 'application/json'}), (req, res) => {
        // Log request body to a unique file name prefixed with "github-webhook-"
        res.status(202).send('Accepted');
        
        const githubEvent = req.headers['x-github-event'];
        const fileName = `services/github-webhook-${githubEvent}-${Date.now()}.json`;
        fs.writeFileSync(fileName, JSON.stringify(req.body, null, 4));
    })

    app.get("/events", (_, res) => {
        const eventFiles = fs.readdirSync(__dirname).filter(file => file.startsWith('github-webhook-'));

        // read all files and send them as json
        const events = eventFiles.map(file => {
            return { [file]: JSON.parse(fs.readFileSync("services/" + file))};
        });

        
        res.send(JSON.stringify({events: events}));
    })

  return app
}

module.exports = { createServer }