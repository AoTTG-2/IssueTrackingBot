const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log('AoTTG2IssueTracker Bot Now Online!');
        console.log(`Logged in as ${client.user.tag}`);
	},
};