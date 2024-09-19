const fs = require('fs');
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


const createGithubReference = (issueNumber, nodeId, projv2Id, htmlUrl) => {
    const msg = `IssueID: ${issueNumber}\nIssueNodeID: ${nodeId}\nProjectIssueID: ${projv2Id}\nIssueURL: ${htmlUrl}`;
    return msg;
}

const parseGithubReference = (githubReference) => {
    const lines = githubReference.split('\n');
    const issueId = lines[0].split(': ')[1];
    const issueNodeId = lines[1].split(': ')[1];
    const projv2Id = lines[2].split(': ')[1];
    const issueUrl = lines[3].split(': ')[1];

    return {
        issueId,
        issueNodeId,
        projv2Id,
        issueUrl
    }
}

const createDiscordReference = (channelId, threadId, threadUrl, projV2Id) => {
    // const discordReferenceComment = `DiscordThread: ${thread.id}\nDiscordThreadURL: ${thread.url}`;
    const msg = `DiscordChannel: ${channelId}\nDiscordThread: ${threadId}\nDiscordThreadURL: ${threadUrl}\nProjectIssueID: ${projV2Id}`;
    return msg;
}

const parseDiscordReference = (discordReference) => {
    const lines = discordReference.split('\n');
    const channelId = lines[0].split(': ')[1];
    const threadId = lines[1].split(': ')[1];
    const threadUrl = lines[2].split(': ')[1];
    const projV2Id = lines[3].split(': ')[1];

    return {
        channelId,
        threadId,
        threadUrl,
        projV2Id
    }
}

const getTrackedChannels = () => {
    const tracker = getTrackerJson();
    return tracker.tracked;
}

const addTrackedChannel = (channel) => {
    const tracker = getTrackerJson();
    if (tracker.tracked.find(c => c.id === channel.id)) {
        return;
    }
    tracker.tracked.push(channel);
    saveTrackerJson(tracker);
}

const removeTrackedChannel = (channel) => {
    const tracker = getTrackerJson();
    tracker.tracked = tracker.tracked.filter(c => c.id !== channel.id);
    saveTrackerJson(tracker);
}

const isChannelTracked = (id) => {
    const tracker = getTrackerJson();
    return tracker.tracked.find(c => c.id === id);
}

const getTrackerJson = () => {
    // if tracker does not exist, create it
    if (!fs.existsSync('./tracker.json')) {
        const tracker = {
            tracked: []
        }
        fs.writeFileSync('./tracker.json', JSON.stringify(tracker));
    }
    
    // read and parse as json
    return JSON.parse(fs.readFileSync('./tracker.json'));
}

const saveTrackerJson = (tracker) => {
    fs.writeFileSync('./tracker.json', JSON.stringify(tracker));
}

const pairCreatedThreadWithIssue = async (thread) => {
    const messages = await thread.messages.fetch();
    const post = messages.first();
    if (!post) return;

    // Get the tags on the thread, if its tagged as "Assigned", set state to assigned instead of ready, otherwise if tagged as Closed, dont create an issue.
    const tags = thread.parent.availableTags;
    const assignedTag = tags.find(tag => tag.name === "Assigned");
    const closedTag = tags.find(tag => tag.name === "Closed");
    if (thread.appliedTags.filter(t => t.id === closedTag.id).length > 0) return;

    const projectState = thread.appliedTags.filter(t => t.id === assignedTag.id).length > 0 ? ProjectStates.InProgress : ProjectStates.Ready;

    // Filter for messages from the bot
    const botMessages = messages.filter(m => m.author.id === thread.client.user.id);
    const botMessage = botMessages.first();

    // already tracked
    if (botMessage) return;
    console.log("Creating pair with issue");

    // log applied tags
    console.log(thread.appliedTags);

    // Log tags
    console.log(tags);
    console.log(thread.appliedTags.filter(t => t.id === closedTag.id).length);

    const createIssueResponse = await createIssue(process.env.OWNER, process.env.REPO, `${post.author}: ${thread.name}`, post.content);
    const addIssueToProjectResponse = await addIssueToProject(process.env.OWNER, process.env.REPO, process.env.PROJECT, createIssueResponse.node_id);
    const setIssueStateResponse = await setIssueState(process.env.OWNER, process.env.REPO, process.env.PROJECT, addIssueToProjectResponse, projectState);

    // Create the github reference message for discord (used to reference the github case later)
    const githubReferenceComment = createGithubReference(createIssueResponse.number, createIssueResponse.node_id, addIssueToProjectResponse, createIssueResponse.html_url);
    thread.send(githubReferenceComment);

    // Create the discord thread reference message for github (used to reference the discord thread later)
    const discordReferenceComment = createDiscordReference(thread.parentId, thread.id, thread.url, addIssueToProjectResponse);
    const addIssueCommentResponse = await addIssueComment(process.env.OWNER, process.env.REPO, createIssueResponse.number, discordReferenceComment);

    const tag = thread.parent.availableTags.find(tag => tag.name === "Ready");

    if (tag && projectState === ProjectStates.Ready)
    {
        thread.setAppliedTags([tag.id]);
    }
}

module.exports = {
    createGithubReference,
    parseGithubReference,
    createDiscordReference,
    parseDiscordReference,
    getTrackedChannels,
    addTrackedChannel,
    removeTrackedChannel,
    pairCreatedThreadWithIssue,
    isChannelTracked
}