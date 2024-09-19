
const createGithubReference = (issueNumber, nodeId, projv2Id, htmlUrl) => {
    const msg = `IssueID: ${issueNumber}\nIssueNodeID: ${nodeId}\nProjectIssueID: ${projv2Id}\nIssueURL: ${htmlUrl}`;
    console.log(msg);
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
    console.log(msg);
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

module.exports = {
    createGithubReference,
    parseGithubReference,
    createDiscordReference,
    parseDiscordReference
}