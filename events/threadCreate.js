const { Events } = require('discord.js');
const fs = require('node:fs');
const { ChangeThreadState } = require('../utility/discUtil.js');
const {
    isChannelTracked
} = require('../utility/util.js');

module.exports = {
	name: Events.ThreadCreate,
	async execute(thread, boolean) {
		if (!isChannelTracked(thread.parentId)) return;
		console.log('Thread created');

		// if thread is now archived, unarchive it
		if (thread.archived) {
			await thread.setArchived(false);
		}

		// Check the permissions of the creator of the thread
		ChangeThreadState(thread, 'todo');
	},
};

