require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { createServer } = require('./services/server');


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildWebhooks,
  ],
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
    console.log(`registering event: ${event.name}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

const githubEventsPath = path.join(__dirname, 'githubevents');
const githubEventFiles = fs.readdirSync(githubEventsPath).filter(file => file.endsWith('.js'));

for (const file of githubEventFiles) {
  const filePath = path.join(githubEventsPath, file);
  const event = require(filePath);
  console.log(event.name);

  // Express server will host a single post route and accept json data, based on the json data, we will call the corresponding event


  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(process.env.TOKEN);

// Start express server
const app = createServer(client);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


const OnIssueCreate = (webhookData) => {
  // OnIssueCreate in github, create a corresponding discord thread and link the two

  // Create the discord thread

  // Issue: We don't know what thread channel the issue is related to (have a dedicated channel for github issues?)
}

// Example webhook
const webhookData = {
  "action": "edited",
  "projects_v2_status_update": {
      "id": 32633,
      "node_id": "PVTSU_lADOBH2n9s4Ajp6VzX95",
      "project_node_id": "PVT_kwDOBH2n9s4Ajp6V",
      "creator": {
      },
      "body": "We've kicked off this project and are feeling confident in our rollout plan. More updates and demos to come next week!",
      "start_date": "2024-06-24",
      "target_date": "2024-08-16",
      "status": "ON_TRACK",
      "created_at": "2024-06-24T20:27:48Z",
      "updated_at": "2024-06-24T20:30:47Z"
  },
  "changes": {
      "body": {
          "from": "We're still planning this out and are kicking off soon.",
          "to": "We've kicked off this project and are feeling confident in our rollout plan. More updates and demos to come next week!"
      },
      "status": {
          "from": "INACTIVE",
          "to": "ON_TRACK"
      },
      "start_date": {
          "from": null,
          "to": "2024-06-24"
      },
      "target_date": {
          "from": null,
          "to": "2024-08-16"
      }
  },
  "organization": {
  },
  "sender": {
  }
}