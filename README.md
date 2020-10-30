<a href='http://wornoffkeys.com/discord?from=wokcommands-npm' target='_blank'>![alt Discord](https://img.shields.io/discord/464316540490088448?color=7289da&logo=discord&logoColor=white)</a> <a href='http://wornoffkeys.com/patreon?from=wokcommands-npm' target='_blank'>![alt Patreon](https://img.shields.io/badge/donate-patreon-F96854.svg)</a> <a href='https://github.com/AlexzanderFlores/WOKCommands' target='_blank'>![alt GitHub Repo](https://img.shields.io/github/stars/AlexzanderFlores/WOKCommands?style=social)</a>

<a href='https://nodei.co/npm/wokcommands/' target='_blank'>![alt WOKCommands](https://nodei.co/npm/wokcommands.png)</a>

# This package is still under development. Not all features are done yet.

# Table of Contents

- [Installation](#installation)
- [Setup](#setup)
- [Creating a "Feature"](#creating-a-feature)
- [Creating a Command](#creating-a-command)
- [Argument Rules](#argument-rules)
  - [Global Syntax Errors](#global-syntax-errors)
- [Per-server Command Prefixes](#per-server-command-prefixes)
- [Enable or Disable each Command or Feature](#enable-or-disable-each-command-or-feature)
- [Configurable Required Roles](#configurable-required-roles)
- [Command Cooldowns](#command-cooldowns)
  - [Global Cooldowns](#global-cooldowns)
  - [Configurable Cooldown Error Messages](#configurable-cooldown-error-messages)
- [Channel Specific Commands](#channel-specific-commands)
- [Support & Feature Requests](#support--feature-requests)

# Installation

**NPM**

```bash
npm install wokcommands
```

# Setup

After you have installed WOKCommands there is a simple setup process:

```JS
const DiscordJS = require('discord.js')
const WOKCommands = require('wokcommands')
require('dotenv').config()

const client = new DiscordJS.Client()

client.on('ready', () => {
  // Initialize WOKCommands
  new WOKCommands(client)
})

client.login(process.env.TOKEN)
```

You might want to specify your commands and features folder, as well as your MongoDB connection path.

This next example assumes you are using a local `commands` folder for your command files, a local `features` folder for event listener files, and that your MongoDB connection path is located within your `.env` file as `MONGO_URI`.

```JS
const DiscordJS = require('discord.js')
const WOKCommands = require('wokcommands')
require('dotenv').config()

const client = new DiscordJS.Client()

client.on('ready', () => {
  // Initialize WOKCommands with specific folders and MongoDB
  new WOKCommands(client, 'commands', 'features')
    .setMongoPath(process.env.MONGO_URI)
})

client.login(process.env.TOKEN)
```

# Creating a "Feature"

"Features" are files that include code related to one specific feature of your bot. These often will include event handlers and other utility functions that collectively make up a single feature.

Here is a basic example that simply console logs each message sent:

```JS
// File name: "log-messages.js"
// Folder: "./features"

module.exports = (client) => {
  client.on('message', (message) => {
    console.log(message.content)
  })
}
```

Each file inside of the "features" folder (or whatever you specified in "Setup") will be ran whenever your bot starts up.

# Creating a Command

Creating a command is simple using WOKCommands. The end goal of this package is to support as many command formats as possible. If your commands aren't immediately supported by WOKCommands then please read "Support & Feature Requests"

Here's an example of a basic ping command:

```JS
// File name: "ping.js"
// Folder "./commands"

module.exports = {
  aliases: ['p'], // Optional
  callback: (message) => {
    message.reply('pong')
  }
}
```

Running `!ping` or `!p` will execute this command and reply with "pong". The name of the file is included as a command alias by default.

You can also specify a `name` property for the command, as well as use a `commands` array for aliases:

```JS
// File name: "ping.js"
// Folder "./commands"

module.exports = {
  name: 'ping', // Optional
  commands: ['runping'], // Optional
  aliases: ['p'], // Optional
  callback: (message) => {
    message.reply('pong')
  }
}
```

This will make `!ping`, `!runping`, and `!p` execute the command. There are various popular command formats. This approach of multiple options is meant to help support them out of the box without many changes on your part.

# Argument Rules

You can easily specify how many arguments are required as well as provide an error message per command. Let's say that you want the above "ping" command to never have any arguments. You can easily accomplish that with the following code:

```JS
// File name: "ping.js"
// Folder "./commands"

module.exports = {
  minArgs: 0,
  maxArgs: 0,
  syntaxError: 'Incorrect syntax! Use `{PREFIX}ping`',
  callback: (message) => {
    message.reply('pong')
  }
}
```

Or let's say you wanted one argument of tagging a member, and no maximum number of arguments:

```JS
// File name: "ping.js"
// Folder "./commands"

module.exports = {
  minArgs: 1,
  maxArgs: -1, // -1 means no limit
  syntaxError: "Incorrect syntax! Use `{PREFIX}ping <Target user's @>`",
  callback: (message) => {
    message.reply('pong')
  }
}
```

In either case the `{PREFIX}` will be replaced with the server's prefix. If the server prefix hasn't been set it will default to "!".

# Global Syntax Errors

In a lot of cases your syntax errors will be very similar. You can specify a global syntax format using the following:

```JS
new WOKCommands(client)
  .setSyntaxError('Incorrect syntax! Please use {PREFIX}{COMMAND} {ARGUMENTS}')
```

The `{PREFIX}`, `{COMMAND}` and `{ARGUMENTS}` must always be in upper case. These will be replaced with the correct content when an error occurs. The `{ARGUMENTS}` variable must be specified in the command like so:

```JS
// File name: "ping.js"
// Folder "./commands"

module.exports = {
  minArgs: 1,
  maxArgs: -1, // -1 means no limit
  expectedArgs: "<Target user's @>",
  callback: (message) => {
    message.reply('pong')
  }
}
```

A per-command syntax error message will always overwrite a global one.

# Per-Server Command Prefixes

_This feature requires a MongoDB connection to be present._

Allowing server owners to configure your bot's prefix will help prevent prefix collisions with existing bots. There is a simple command for server owners to configure prefixes:

`!prefix [NEW PREFIX]`

The `NEW PREFIX` argument is optional, and omitting it will simply display the current prefix. By default WOKCommands uses "!" as it's command prefix. Configuration commands such as this one use the "!wok" prefix, however the "!" symbol will be changed when using this command. For example if a server owner changes their prefix to "?" then the command would then become `?prefix [NEW PREFIX]`.

# Enable or Disable each Command or Feature

Server owners might not want all features your bot comes with. It's important to allow them to enable or disable each command or feature. WOKCommands also comes with this functionality out of the box.

Server owners can view all commands or features with the following command:

`!commands`

`!features`

This will then display a message with all commands and features, as well as their enabled or disable status. Server owners can toggle a feature or command with the following command:

`!command <COMMAND NAME> <enable | disable>`

`!feature <FEATURE NAME> <enable | disable>`

_Note that "command" and "feature" are separated in these commands to allow you to use the same name for both a command and feature_

# Configurable Required Roles

Server owners will often want some commands to only be accessible from users with a specific role. WOKCommands allows both the developer as well as the server owner to configure this.

**How to specify what roles each user needs in order to run this command:**

```JS
// File name: "ping.js"
// Folder "./commands"

module.exports = {
  requiredRoles: [
    'Patron',
    'Server Booster'
  ],
  requiredRolesType: 'ALL' // "ANY" or "ALL"
  callback: (message) => {
    message.reply('pong')
  }
}
```

The `requiredRolesType` defaults to "ANY" which allows users to run the command if they have any of the specified roles. Alternatively you can use "ALL" to require the user to have all the specified roles.

**How server owners can specify roles per command:**

A useful feature of WOKCommands is that server owners can configure this themselves.

`!requiredRole <COMMAND NAME> <"none" | Tagged Role | Role ID string>`

This will allow server owners to dynamically configure commands for their own server without you needing to change anything as the developer.

# Command Cooldowns

_This feature might requires a MongoDB connection to be present._

WOKCommands makes it easy to provide per-user cooldowns. These will only affect users in the server where they ran the command, and not globally across multiple servers with your bot.

```JS
// File name: "ping.js"
// Folder "./commands"

module.exports = {
  cooldown: '60s',
  callback: (message) => {
    message.reply('pong')
  }
}
```

The cooldown can be specified using the following format:

| Character | Duration | Minimum | Maximum | Example |
| --------- | -------- | ------- | ------- | ------- |
| s         | Seconds  | 1       | 60      | 30s     |
| m         | Minutes  | 1       | 60      | 10m     |
| h         | Hours    | 1       | 24      | 5h      |
| d         | Days     | 1       | 365     | 3d      |

Durations over 5 minutes require a MongoDB server to be connected and will throw an exception if one is not found.

# Global Cooldowns

_This feature might requires a MongoDB connection to be present._

Some use cases might require a global cooldown over all users for a specific server. This can be easily done with the following:

```JS
// File name: "ping.js"
// Folder "./commands"

module.exports = {
  globalCooldown: '10m',
  callback: (message) => {
    message.reply('pong')
  }
}
```

The minimum amount of time for this is 1 minute. Durations over 5 minutes require a MongoDB server to be connected and will throw an exception if one is not found.

# Configurable Cooldown Error Messages

_This feature requires a MongoDB connection to be present._

When using a cooldown you'll want to send a message to inform a user to use the command less often. That can be easily configured like so:

```JS
new WOKCommands(client, 'commands', 'listeners')
  .setCooldownMessage('You must wait to use this command again')
```

# Channel Specific Commands

_This feature requires a MongoDB connection to be present._

Sometimes you may want a command to only be ran in a specific channel. WOKCommands includes this functionality and allows server owners to configure this themselves with a command:

`!channelOnly <Command Name> <Channel Tag>`

This will allow the server owners to specify a command and tag a channel to only allow that command to be ran in that channel.

# Support & Feature Requests

This package is looking for feedback and ideas to help cover more use cases. If you have any ideas feel free to share them within the "💡 ｜ suggestions" channel in the [Worn Off Keys Discord server](http://wornoffkeys.com/discord?from=wokcommands-npm-bottom).
