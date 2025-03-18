## AI Chat Workflows Automation app for Rocket.Chat

> *POC for [💡 AI Chat Workflows Automation App with multi-step reasoning](https://github.com/RocketChat/google-summer-of-code/blob/main/google-summer-of-code-2025.md#ai-chat-workflows-automation-app-with-multi-step-reasoning)*


## Installation
```sh
git clone https://github.com/r3yc0n1c/ai-chat-workflows-automation.git
cd ai-chat-workflows-automation/
npm i
```

Setup deployment script
```sh
mv deploy.sh.example deploy.sh
chmod +x deploy.sh
```


## Run
Note: Make sure your Rcoket.Chat server is running.
```sh
# Deploy the app
./deploy.sh
```

## Test

- Create a channel called `#test-chan`
- Use the following command to enable the workflow
```
whenever @<your-username> posts any welcome messages in #test-chan, immediately DM him with a thank-you note
```

Note: Change the username in [AiChatWorkflowsAutomationAppApp.ts](AiChatWorkflowsAutomationAppApp.ts)

- Message the bot for hello in `#general`
- Message the bot for hello in `#test-chan` and get a reply