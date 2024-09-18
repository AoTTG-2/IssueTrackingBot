// define some exports that are commonly used (project id, status id's etc)
const fs = require('node:fs');

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

const updateIssue = async (owner, repo, issueNumber, updateBody) => {
    const octokit = await getOctokit();
    return await octokit.issues.update({
        owner,
        repo,
        issue_number: issueNumber,
        ...updateBody
    });
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

// List issue events
const listIssueEvents = async (owner, repo, perPage) => {
    const octokit = await getOctokit();
    const events = await octokit.rest.issues.listEventsForRepo({
        owner,
        repo,
        per_page: perPage
    });

    return events.data;
}

const listIssues = async (owner, repo, state) => {
    const octokit = await getOctokit();
    const events = await octokit.rest.issues.listForRepo({
        owner,
        repo,
    });

    return events.data;
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
            id
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

    return statusField;
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

    const { project, fields } = await getProjectInformation(owner, repo, projectName);

    // Find the field that matches the desired state
    const stateField = fields.options.find(f => f.name.toLowerCase() === state.toLowerCase());
    if (!stateField) {
        throw new Error(`State "${state}" not found in project ${projectName}`);
    }

    await octokit.graphql(`
        mutation changeStatus(
          $field: ID!
          $item: ID!
          $project: ID!
          $value: ProjectV2FieldValue!
        ) {
          updateProjectV2ItemFieldValue(
            input: {
              fieldId: $field
              itemId: $item
              projectId: $project
              value: $value
            }
          ) {
            clientMutationId
            projectV2Item {
              id
            }
          }
        }
    `, {
        project: project.id,
        item: itemId,
        field: fields.id,
        value: {singleSelectOptionId: stateField.id}
    });
};


// Export states and functions
module.exports = { ProjectStates, createIssue, addIssueComment, getIssueCommentByReference, addIssueToProject, setIssueState, updateIssue, listIssueEvents, listIssues };