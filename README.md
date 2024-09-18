Notes:
Thread create, create discord-github pair, add to project, set state to ready
Thead delete, close github issue
Thead update, if archived, close github issue, if unarchived, open github issue

Issue create, create discord-github pair - Add to project, set state to backlog
Issue update -> Webhook -> update thread tag (open/closed)
ProjectV2Issue update -> Webhook -> update thread tag (...states)

- If we cannot get webhooks to work,
Only sync tasks inside staff channels,
create command to add an issue to be tracked
Every 5 minutes, pull all open issues on github and compare status.
