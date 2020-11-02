<a href='http://wornoffkeys.com/discord?from=wokcommands-npm' target='_blank'>![alt Discord](https://img.shields.io/discord/464316540490088448?color=7289da&logo=discord&logoColor=white)</a> <a href='http://wornoffkeys.com/patreon?from=wokcommands-npm' target='_blank'>![alt Patreon](https://img.shields.io/badge/donate-patreon-F96854.svg)</a> <a href='https://github.com/AlexzanderFlores/WOKCommands' target='_blank'>![alt GitHub Repo](https://img.shields.io/github/stars/AlexzanderFlores/WOKCommands?style=social)</a>

<a href='https://nodei.co/npm/wokcommands/' target='_blank'>![alt WOKCommands](https://nodei.co/npm/wokcommands.png)</a>

# This package is still under development. Not all features are done yet.

# Table of Contents

- [Installation](#installation)
- [Setup](#setup)
- [Creating a Feature](#creating-a-feature)
- [Creating a Command](#creating-a-command)
- [Argument Rules](#argument-rules)
  - [Global Syntax Errors](#global-syntax-errors)
- [Per-server Command Prefixes](#per-server-command-prefixes)
- [Enable or Disable a Command](#enable-or-disable-a-command)
- [Required Permissions](#required-permissions)
- [Configurable Required Roles](#configurable-required-roles)
<!-- - [Command Cooldowns](#command-cooldowns)
  - [Global Cooldowns](#global-cooldowns)
  - [Configurable Cooldown Error Messages](#configurable-cooldown-error-messages)
- [Channel Specific Commands](#channel-specific-commands) -->
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

# Creating a Feature

Features are files that include code related to one specific feature of your bot. These often will include event handlers and other utility functions that collectively make up a single feature.

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

The `callback` function can also be named `run` or `execute`. This function can accept the following parameters:

```JS
// File name: "ping.js"
// Folder "./commands"

module.exports = {
  callback: (message, args, text, client, prefix, instance) => {
    message.reply('pong')
  }
}
```

1. `message`: The standard Message object
2. `args`: An array of all arguments provided with the command
3. `text`: A string version of the args array
4. `client`: The Discod.JS client for your bot
5. `prefix`: The prefix for the server this command is being ran in, or "!" is one is not set
6. `instance`: The WOKCommands instance which will contain some helper methods

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

A per-command syntax error message will always overwrite a global one for that specific command.

# Per-Server Command Prefixes

_This feature requires a MongoDB connection to be present._

Allowing server owners to configure your bot's prefix will help prevent prefix collisions with existing bots. There is a simple command for server owners to configure prefixes:

`!prefix [NEW PREFIX]`

The `NEW PREFIX` argument is optional, and omitting it will simply display the current prefix. By default WOKCommands uses "!" as it's command prefix.

# Enable or Disable a Command

Server owners might not want all commands your bot comes with. It's important to allow them to enable or disable each command, and WOKCommands comes with this functionality out of the box.

Server owners can view all commands or features with the following command:

`!commands`

This will then display a message with all commands, as well as their enabled or disable status. Server owners can toggle a command with the following command:

`!command <"enable" | "disable"> <Command Name>`

# Required Permissions

Sometimes you will want to require a Discord permission node before a user can run a command. An example could be an administrative command. Requiring "ADMINISTRATOR" will prevent people without that permission node from running the command. You can easily do that with the following syntax:

```JS
// File name: 'hi.js'
// Folder: './commands'

module.exports = {
  maxArgs: 0,
  requiredPermissions: ['ADMINISTRATOR'],
  callback: (message) => {
    message.reply('hello')
  },
}
```

Whenever anyone runs that command that doesn't have the "ADMINISTRATOR" permission node, it will tell them they need it. Also if you spell a permission node incorrectly or not upper case it will automatically let you know when your bot starts up.

# Configurable Required Roles

_This feature requires a MongoDB connection to be present._

Server owners will often want some commands to only be accessible from users with a specific role. Server owners will have the option to require this for any command your bot provides using the following command:

`!requiredRole <Command Name> <"none" | Tagged Role | Role ID string>`

This will allow server owners to dynamically configure commands for their own server without you needing to change anything as the developer. This is ideal because each will have its own rank for some commands and features. Forcing that rank to be named something specific is constrictive and this option makes your bot more user friendly.

Using "none" will remove all required roles for that command.

<!-- # Command Cooldowns

_This feature might require a MongoDB connection to be present._

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

This will allow the server owners to specify a command and tag a channel to only allow that command to be ran in that channel. Running the exact command again will toggle the channel requirement. -->

# Support & Feature Requests

This package is looking for feedback and ideas to help cover more use cases. If you have any ideas feel free to share them within the "💡 ｜ suggestions" channel in the [Worn Off Keys Discord server](http://wornoffkeys.com/discord?from=wokcommands-npm-bottom).
