// define some exports that are commonly used (project id, status id's etc)

const memoize = fn => new Proxy(fn, {
    cache: new Map(),
    apply (target, thisArg, argsList) {
      let cacheKey = argsList.toString();
      if(!this.cache.has(cacheKey))
        this.cache.set(cacheKey, target.apply(thisArg, argsList));
      return this.cache.get(cacheKey);
    }
});

const getOctokit = memoize(async () => {
    const { Octokit } = await import("@octokit/rest");
    return new Octokit({ auth: process.env.GHTOKEN });
})

const ProjectStates = {
    Backlog: "Backlog",
    Ready: "Ready",
    InProgress: "In Progress",
    Done: "Done"
}


// REST API
const createIssue = async (owner, repo, title, body) => {
    const octokit = await getOctokit();
    // Create rest api call to github using octokit
    const response = await octokit.rest.issues.create({
        owner,
        repo,
        title,
        body
    });

    return response.data;
}

const addIssueComment = async (owner, repo, issueNumber, body) => {
    const octokit = await getOctokit();
    // Create rest api call to github using octokit
    const response = await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: issueNumber,
        body
    });

    return response.data;
}

const getIssueCommentByReference = async (owner, repo, commentId) => {
    const octokit = await getOctokit();
    // Using the return result of addIssueComment, we can get the comment id
    const comments = await octokit.rest.issues.getComment({
        owner,
        repo,
        comment_id: commentId
    });

    return comments.data;
}

// GRAPHQL
const getProjectInformation = memoize(async (owner, repo, projectName) => {
    const octokit = await getOctokit();
    // Fetch the project and its fields
    const projectResponse = await octokit.graphql(`
        query($owner: String!, $repo: String!) {
            repository(owner: $owner, name: $repo) {
                projectsV2(first: 100) {
                    nodes {
                        id
                        title
                    }
                }
            }
        }
    `, {
        owner,
        repo
    });

    const project = projectResponse.repository.projectsV2.nodes.find(p => p.title === projectName);
    if (!project) {
        return undefined;
    }

    const fields = await getStatusFields(owner, repo, project.id);

    return { project, fields};
});

const getStatusFields = async (owner, repo, projectId) => {
    const octokit = await getOctokit();
    // Fetch the project and its fields
    const projectResponse = await octokit.graphql(`
        query($projectId: ID!) {
  node(id: $projectId) {
    ... on ProjectV2 {
      fields(first: 10) {
        nodes {
          __typename
          ... on ProjectV2SingleSelectField {
            name
            options {
              id
              name
            }
          }
        }
      }
    }
  }
}
    `, {
        projectId
    });

    // filter for "Status" field
    const statusField = projectResponse.node.fields.nodes.find(f => f.name === "Status");

    return statusField.options;
}

const addIssueToProject = async (owner, repo, projectName, issueNodeId) => {
    const octokit = await getOctokit();

    const {project, fields} = await getProjectInformation(owner, repo, projectName);

    // Add the issue to the project
    const addIssueToProjectResponse = await octokit.graphql(`
        mutation($projectId: ID!, $contentId: ID!) {
                addProjectV2ItemById(input: {projectId: $projectId, contentId: $contentId}) {
                    item {
                        id
                    }
                }
            }
    `, {
        projectId: project.id,
        contentId: issueNodeId
    });

    const itemId = addIssueToProjectResponse.addProjectV2ItemById.item.id;
    return itemId;
}

const setIssueState = async (owner, repo, projectName, itemId, state) => {
    const octokit = await getOctokit();

    const {project, fields} = await getProjectInformation(owner, repo, projectName);

    console.log(fields);
    
    const statusField = fields.find(f => f.name === state);

    // Set the status to "Ready"
    await octokit.graphql(`
        mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $value: String!) {
            updateProjectV2ItemFieldValue(input: {
                projectId: $projectId,
                itemId: $itemId,
                fieldId: $fieldId,
                value: { text: $value }
            }) {
                projectV2Item {
                    id
                }
            }
        }
    `, {
        projectId: project.id,
        itemId: itemId,
        fieldId: statusField.id,
        value: state
    });
}

// Export states and functions
module.exports = { ProjectStates, createIssue, addIssueComment, getIssueCommentByReference, addIssueToProject, setIssueState };