const express = require('express');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('node:path');

const {
	ProjectStates,
    createIssue,
    addIssueComment,
    getIssueCommentByReference,
    addIssueToProject,
    setIssueState,
    updateIssue,
    listIssueEvents,
    listIssues,
    findBotCommentOnIssue,
} = require('../utility/github');

const createServer = client => {
  const app = express()
  app.get("/", (_, res) => {
    res.send(`${client.user.username} says hello`)
  })

  // Define a post route called events that will get json data from github webhooks
    app.post("/events", express.json({type: 'application/json'}), async (req, res) => {
        // Log request body to a unique file name prefixed with "github-webhook-"
        res.status(202).send('Accepted');
        
        const githubEvent = req.headers['x-github-event'];

        // We only care about issues (other event is issue_comment created)
        if (githubEvent !== 'issues') {
            return;
        }

        const event = req.body;
        if (event.issue.user == process.env.BOTUSER || event.issue.performed_via_github_app)
        {
          return;
        }
        if (event.action == "opened")
        {
          const number = event.issue.number;
          const node_id = event.issue.node_id;
          const html_url = event.issue.html_url;
        }
        else if (event.action == "assigned")
        {
          // Change the state of the issue to "In Progress", update the tag on discord to "In Progress"
          const number = event.issue.number;
          const comment = await findBotCommentOnIssue(process.env.OWNER, process.env.REPO, number);
          console.log(comment);

        }
        else if (event.action == "closed")
        {
          // Update the tag on discord to "closed" and archive the thread.
          const number = event.issue.number;
          const comment = await findBotCommentOnIssue(process.env.OWNER, process.env.REPO, number);
          console.log(comment);
        }

    })

  return app
}

module.exports = { createServer }