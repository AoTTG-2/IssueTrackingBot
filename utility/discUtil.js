

const threadStates = ['backlog', 'todo', 'assigned', 'closed'];

/*

// Get the tags on the thread, if its tagged as "Assigned", set state to assigned instead of ready, otherwise if tagged as Closed, dont create an issue.
    const tags = thread.parent.availableTags;
    const assignedTag = tags.find(tag => tag.name === "Assigned");
    const closedTag = tags.find(tag => tag.name === "Closed");
    if (thread.appliedTags.filter(t => t === closedTag.id).length > 0) return;

    const projectState = thread.appliedTags.filter(t => t === assignedTag.id).length > 0 ? ProjectStates.InProgress : ProjectStates.Ready;
    */

/**
 * Return a mapping from threadStats to the id of the tag
 * @param {*} thread discordjs thread channel
 */
const GetThreadStates = (thread) => {
    return threadStates.map(state => {
        return {
            state,
            id: thread.parent.availableTags.find(tag => tag.name === state).id
        }
    });
}

const GetReadableStates = () => {
    return [...threadStates]
}

/**
 * Some channels will have tags we don't care to track but that we want to leave on each thread.
 * This function should remove all tags that are in threadStates and then apply the desiredState.
 * @param {*} appliedTags Tags currently on the thread
 * @param {*} desiredState Tag to apply to the thread
 * @returns list of tags to apply to the thread
 */
const GetThreadStateChange = (thread, desiredState) => {
    const states = GetThreadStates(thread);
    // Remove all states
    const newTags = thread.appliedTags.filter(tag => !states.find(state => state.id === tag));
    // Add the desired state
    newTags.push(states.find(state => state.state === desiredState).id);
    return newTags;
}

const ChangeThreadState = (thread, desiredState) => {
    if (!ThreadSupportsStates(thread))
        return;
    const newTags = GetThreadStateChange(thread, desiredState);
    thread.setAppliedTags(newTags);
}

const ThreadSupportsStates = (thread) => {
    return ChannelSupportsStates(thread.parent);
}

const ChannelSupportsStates = (channel) => {
    // check that all state tags are present in the available tags
    return threadStates.every(state => channel.availableTags.find(tag => tag.name === state));
}

module.exports = {
    GetThreadStates,
    GetThreadStateChange,
    ChangeThreadState,
    ThreadSupportsStates,
    ChannelSupportsStates,
    GetReadableStates
}