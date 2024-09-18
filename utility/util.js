
const createGithubReference = (issueNumber, nodeId, htmlUrl) => {
    // const githubReferenceComment = `IssueID: ${createIssueResponse.number}\nIssueNodeID: ${createIssueResponse.node_id}\nIssueURL: ${createIssueResponse.html_url}`;
    return `IssueID: ${issueNumber}\nIssueNodeID: ${nodeId}\nIssueURL: ${htmlUrl}`;
}

const parseGithubReference = (githubReference) => {
    const lines = githubReference.split('\n');
    const issueId = lines[0].split(': ')[1];
    const issueNodeId = lines[1].split(': ')[1];
    const issueUrl = lines[2].split(': ')[1];

    return {
        issueId,
        issueNodeId,
        issueUrl
    }
}

const createDiscordReference = (threadId, threadUrl) => {
    // const discordReferenceComment = `DiscordThread: ${thread.id}\nDiscordThreadURL: ${thread.url}`;
    return `DiscordThread: ${threadId}\nDiscordThreadURL: ${threadUrl}`;
}

const parseDiscordReference = (discordReference) => {
    const lines = discordReference.split('\n');
    const discordThreadId = lines[0].split(': ')[1];
    const discordThreadUrl = lines[1].split(': ')[1];

    return {
        discordThreadId,
        discordThreadUrl
    }
}

module.exports = {
    createGithubReference,
    parseGithubReference,
    createDiscordReference,
    parseDiscordReference
}