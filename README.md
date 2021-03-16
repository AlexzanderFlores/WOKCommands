<a href='http://wornoffkeys.com/discord?from=wokcommands-npm' target='_blank'>![alt Discord](https://img.shields.io/discord/464316540490088448?color=7289da&logo=discord&logoColor=white)</a> <a href='https://github.com/AlexzanderFlores/WOKCommands' target='_blank'>![alt GitHub Repo](https://img.shields.io/github/stars/AlexzanderFlores/WOKCommands?style=social)</a>

<a href='https://nodei.co/npm/wokcommands/' target='_blank'>![alt WOKCommands](https://nodei.co/npm/wokcommands.png)</a>

# WOKCommands

WOKCommands is a Discord.JS command handler made by [Worn Off Keys](https://youtube.com/wornoffkeys). The goal of this package is to make it simple and easy to get your bot off the ground without worrying about your own command handler.

# Table of Contents

- [Installation](#installation)
- [Setup](#setup)
- [Creating a Feature](#creating-a-feature)
- [Configuring a Feature](#configuring-a-feature)
- [Creating a Command](#creating-a-command)
- [Handling Command Errors](#handling-command-errors)
- [Command Categories](#command-categories)
- [Command Initialization Method](#command-initialization-method)
- [Argument Rules](#argument-rules)
- [Per-server Command Prefixes](#per-server-command-prefixes)
- [Bot Owner Only Commands](#bot-owner-only-commands)
- [Guild Only Commands](#guild-only-commands)
- [Custom Dynamic Help Menu](#custom-dynamic-help-menu)
- [Enable or Disable a Command](#enable-or-disable-a-command)
- [Required Permissions](#required-permissions)
- [Configurable Required Roles](#configurable-required-roles)
- [Command Cooldowns](#command-cooldowns)
  - [Global Cooldowns](#global-cooldowns)
- [Slash Commands](#slash-commands)
  - [Slash Command Arguments](#slash-command-arguments)
  - [Responding with Embeds](#responding-with-embeds)
- [Language Support](#language-support)
  - [Language Configuration](##language-configuration)
  - [Storing custom messages and translations](##storing-custom-messages-and-translations)
  - [Loading message text](##-loading-message-text)
  - [Global Syntax Errors](##global-syntax-errors)
- [Events](#events)
- [Test Servers](#test-servers)
- [Support & Feature Requests](#support--feature-requests)

# Installation

**NPM**

```bash
npm install wokcommands
```

Development Build

```bash
npm install github:AlexzanderFlores/WOKCommands#dev
```

# Setup

After you have installed WOKCommands there is a simple setup process. You have the ability to pass in an options object to customize WOKCommands:

```JS
const DiscordJS = require('discord.js')
const WOKCommands = require('wokcommands')
require('dotenv').config()

const client = new DiscordJS.Client({
  partials: ['MESSAGE', 'REACTION'],
})

client.on('ready', () => {
  // See the "Language Support" section of this documentation
  // An empty string = ignored
  const messagesPath = ''

  // Used to configure the database connection.
  // These are the default options but you can overwrite them
  const dbOptions = {
    keepAlive: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  }

  // If you want to disable built in commands you can add them to this array. Simply uncomment the strings to disable that command.

  const disabledDefaultCommands = [
    // 'help',
    // 'command',
    // 'language',
    // 'prefix',
    // 'requiredrole'
  ]

  // Initialize WOKCommands with specific folders and MongoDB
  new WOKCommands(client, {
    commandsDir: 'commands',
    featuresDir: 'features',
    messagesPath,
    showWarns: true, // Show start up warnings
    del: -1, // Timeout in seconds before and error message gets deleted (Missing permissions, missing roles, or command disabled) set to -1 to disable
    dbOptions,
    disabledDefaultCommands
  })
    // Set your MongoDB connection path
    .setMongoPath(process.env.MONGO_URI)
    // Set the default prefix for your bot, it is ! by default
    .setDefaultPrefix('!')
    // Set the embed color for your bot. The default help menu will use this. This hex value can be a string too
    .setColor(0xff0000)
})

client.login(process.env.TOKEN)
```

# Creating a Feature

Features are files that include code related to one specific feature of your bot. These often will include event handlers and other utility functions that collectively make up a single feature.

Here is a basic example that simply console logs each message sent:

```JS
// File name: "log-messages.js"
// Folder: "./features"

module.exports = (client, instance) => {
  client.on('message', (message) => {
    console.log(message.content)
  })
}
```

`client` is the Discord JS client for your bot.

`instance` is the WOKCommands instance that contains some helper functions.

Each file inside of the "features" folder (or whatever you specified in "Setup") will be ran whenever your bot starts up.

# Configuring a Feature

Often times you may want to only load a feature once your database is connected to. This is useful if you load data from your database when initializing your feature.

You can export a `config` object to delay loading of a feature until your database is connected, as well as specify `displayName` and `dbName` properties:

```JS
module.exports = (client, instance) => {
  console.log('something that requires a database connection')
}

module.exports.config = {
  displayName: 'Test', // Can be changed any time
  dbName: 'TEST', // Should be unique and NEVER be changed once set
  loadDBFirst: true, // Wait for the database connection to be present
}
```

`loadDBFirst` will make this feature only load once your bot has successfully connected to your database.

`displayName` is a name that will eventually be used in this package for enable/disable functionality. This is what users will see when interacting with your bot.

`dbName` is something that once set should NEVER be changed. This is what will be used to keep track of what features are enabled or disabled in each Discord server. Separating these two means you can rename what your user's see without breaking what servers have a feature enabled or disabled. This property should always be in upper case.

# Creating a Command

Creating a command is simple using WOKCommands:

Here's an example of a basic ping command:

```JS
// File name: "ping.js"
// Folder "./commands"

module.exports = {
  aliases: ['p'], // Optional
  callback: ({ message }) => {
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
  callback: ({ message }) => {
    message.reply('pong')
  }
}
```

This will make `!ping`, `!runping`, and `!p` execute the command. There are various popular command formats. This approach of multiple options is meant to help support them out of the box without many changes on your part.

The `callback` function can also be named `run` or `execute`. This function has one object parameter with the following properties:

1. `message`: The standard Message object. This is undefined if your command is a slash command.
2. `args`: An array of all arguments provided with the command
3. `text`: A string version of the args array
4. `client`: The Discord.JS client for your bot
5. `prefix`: The prefix for the server this command is being ran in, or "!" is one is not set. This is undefined if your command is a slash command.
6. `instance`: The WOKCommands instance which will contain some helper methods
7. `channel`: The channel where the message was sent
8. `interaction`: The interaction for the slash command.

Example:

```JS
// File name: "ping.js"
// Folder "./commands"

module.exports = {
  callback: ({ message, args, text, client, prefix, instance, channel }) => {
    message.reply('pong')
  }
}
```

These properties are inside of an object so you can access any of them individually. For example if you need the `instance` then you won't need to access all previous parameters before accessing instance.

# Handling Command Errors

WOKCommands sends an error message by default, however you might want to customize this more and perhaps send an embed instead of a normal message. You can listen to command errors to achieve this.

Here is a list of all command errors you can listen for:

```
EXCEPTION
COOLDOWN
INVALID ARGUMENTS
MISSING PERMISSIONS
MISSING ROLES
COMMAND DISABLED
```

Each one will provide various pieces of information depending on what the error is. For example "MISSING ROLES" will provide a list of missing roles. "INVALID ARGUMENTS" will provide the arguments the user used in the command.

To listen to command errors you can pass an "error" function in your comamnd object like so:

```JS
// File name: "ping.js"
// Folder "./commands"

const { MessageEmbed } = require('discord.js')

module.exports = {
  callback: ({ message }) => {
    message.reply('pong')
  },
  error: ({ error, command, message, info }) => {
    if (error === 'COMMAND DISABLED') {
      const embed = new MessageEmbed()
        .setTitle('Command disabled')
        .setColor(0xff0000)

      message.reply(embed)
    }
  },
}
```

# Command Categories

You can also specify an optional command category for each command:

```JS
// File name: "ping.js"
// Folder "./commands"

module.exports = {
  category: 'Fun',
  callback: ({ message }) => {
    message.reply('pong')
  }
}
```

This is most useful for a dynamic help menu. The default dynamic help menu uses category emojis to navigate between pages. You can set a category's emoji with the following method:

```JS
const DiscordJS = require('discord.js')
const WOKCommands = require('wokcommands')
require('dotenv').config()

const client = new DiscordJS.Client()

client.on('ready', () => {
  // Initialize WOKCommands with specific folders and MongoDB
  new WOKCommands(client, {
    commandsDir: 'commands',
    featuresDir: 'features'
  })
    .setMongoPath(process.env.MONGO_URI)
    .setDefaultPrefix('?')
    // Set the category emoji by using it's settings:
    .setCategorySettings([
      {
        name: 'Fun',
        emoji: '🎮'
      },
      {
        name: 'Economy',
        emoji: '💸'
      },
      {
        // You can change the default emojis as well
        name: 'Configuration',
        emoji: '🚧',
        // You can also hide a category from the help menu
        // Admins bypass this
        hidden: true
      },
      {
        // You can use custom emojis by specifying the ID
        // NOTE: Your bot MUST be in the same server as the emoji
        name: 'Example',
        // :typescript: emoji ID from the WOK server
        emoji: '814238393747243009',
        customEmoji: true
      },
      {
        // You can also specify the full name of the emoji without the boolean
        // WOKCommands will detect that this is custom and get the ID
        // NOTE: Your bot MUST be in the same server as the emoji
        name: 'Example',
        // :typescript: emoji String from the WOK server
        emoji: '<:typescript:791512440021975062>'
      }
    ])
})

client.login(process.env.TOKEN)
```

The category name "Fun" must match the exact name specified in your commands, this is case sensitive.

# Command Initialization Method

Some commands may require you to run code when they are loaded. This will often include create a basic listener, or fetching data from some source.

You can use the `init()` method within your command to handle this type of functionality:

```JS
// File name: "ping.js"
// Folder "./commands"

module.exports = {
  category: 'Fun',
  init: (client, instance) => {
    console.log('ran only one time when the bot starts up')
  },
  callback: ({ message }) => {
    message.reply('pong')
  }
}
```

`client` is the Discord JS client for your bot.

`instance` is the WOKCommands instance that contains some helper functions.

# Argument Rules

You can easily specify how many arguments are required as well as provide an error message per command. Let's say that you want the above "ping" command to never have any arguments. You can easily accomplish that with the following code:

```JS
// File name: "ping.js"
// Folder "./commands"

module.exports = {
  minArgs: 0,
  maxArgs: 0,
  syntaxError: 'Incorrect syntax! Use `{PREFIX}ping`',
  callback: ({ message }) => {
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
  callback: ({ message }) => {
    message.reply('pong')
  }
}
```

In either case the `{PREFIX}` will be replaced with the server's prefix. If the server prefix hasn't been set it will default to "!".

# Per-Server Command Prefixes

_This feature requires a database connection to be present._

Allowing server owners to configure your bot's prefix will help prevent prefix collisions with existing bots. There is a simple command for server owners to configure prefixes:

`!prefix [NEW PREFIX]`

The `NEW PREFIX` argument is optional, and omitting it will simply display the current prefix. By default WOKCommands uses "!" as it's command prefix.

# Bot Owner Only Commands

Sometimes you might want to make a command that only the bot owner will have access to. An example of this would be a status command that updates the "Playing" status of your bot. You can do so by first specifying your Discord ID:

```JS
const DiscordJS = require('discord.js')
const WOKCommands = require('wokcommands')
require('dotenv').config()

const client = new DiscordJS.Client({
  partials: ['MESSAGE', 'REACTION'],
})

client.on('ready', () => {
  new WOKCommands(client, , {
    commandsDir: 'commands',
    featuresDir: 'features'
  })
    // Use your own ID of course
    // If you have only 1 ID you can pass in a string instead of an array
    .setBotOwner(['251120969320497153', 'another id', 'another id'])
})

client.login(process.env.TOKEN)
```

After that you can specify a command to only work for owners like so:

```JS
// File name: "ping.js"
// Folder "./commands"

module.exports = {
  ownerOnly: true,
  callback: ({ message }) => {
    message.reply('pong')
  },
}
```

# Guild Only Commands

Often times you will want to make a command only work within guilds and not within direct messages. You can easily do this by specifying "guildOnly" like so:

```JS
// File name: "ping.js"
// Folder "./commands"

module.exports = {
  guildOnly: true,
  callback: ({ message }) => {
    message.reply('pong')
  },
}
```

# Custom Dynamic Help Menu

The WOKCommands package ships with a dynamic help menu out of the box, however each help menu is different and your bot might require specific needs. You can overwrite the default help command by creating your own:

```JS
// Folder: "commands"
// File: "./help.js"

module.exports = {
  callback: ({ message, args, text, client, prefix, instance }) => {
    instance.commandHandler.commands.forEach((command) => {
      console.log(command)
    })
  }
}
```

This will log important information regarding each command. You can use this within a help command to display a meaningful dynamic help menu.

# Enable or Disable a Command

_This feature requires a database connection to be present._

Server owners might not want all commands your bot comes with. It's important to allow them to enable or disable each command, and WOKCommands comes with this functionality out of the box.

Server owners can toggle a command with the following command:

`!command <"enable" | "disable"> <Command Name>`

# Required Permissions

Sometimes you will want to require a Discord permission node before a user can run a command. An example could be an administrative command. Requiring "ADMINISTRATOR" will prevent people without that permission node from running the command. You can easily do that with the following syntax:

```JS
// File name: 'hi.js'
// Folder: './commands'

module.exports = {
  maxArgs: 0,
  permissions: ['ADMINISTRATOR'],
  callback: ({ message }) => {
    message.reply('hello')
  },
}
```

Whenever anyone runs that command that doesn't have the "ADMINISTRATOR" permission node, it will tell them they need it. Also if you spell a permission node incorrectly or not upper case it will automatically let you know when your bot starts up.

# Configurable Required Roles

_This feature requires a database connection to be present._

Server owners will often want some commands to only be accessible from users with a specific role. Server owners will have the option to require this for any command your bot provides using the following command:

`!requiredRole <Command Name> <"none" | Tagged Role | Role ID string>`

This will allow server owners to dynamically configure commands for their own server without you needing to change anything as the developer. This is ideal because each will have its own rank for some commands and features. Forcing that rank to be named something specific is constrictive and this option makes your bot more user friendly.

Using "none" will remove all required roles for that command.

# Command Cooldowns

_This feature might require a database connection to be present._

WOKCommands makes it easy to provide per-user cooldowns. These will only affect users in the server where they ran the command, and not globally across multiple servers using your bot.

```JS
// File name: "ping.js"
// Folder "./commands"

module.exports = {
  cooldown: '60s',
  callback: ({ message }) => {
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

For durations over 5 minutes a database connection is STRONGLY RECOMMENDED. Cooldowns with a duration larger than 5 minutes will automatically be updated to your database every 20 seconds. These durations will be loaded when your bot starts up, this ensures that restarts do not affect cooldowns.

# Global Cooldowns

_This feature might requires a database connection to be present._

Some use cases might require a global cooldown over all users for a specific server. This can be easily done with the following:

```JS
// File name: "ping.js"
// Folder "./commands"

module.exports = {
  globalCooldown: '10m',
  callback: ({ message }) => {
    message.reply('pong')
  }
}
```

The minimum duration is 1 minute for global cooldowns. For durations over 5 minutes a database connection is STRONGLY RECOMMENDED. Cooldowns with a duration larger than 5 minutes will automatically be updated to your database every 20 seconds. These durations will be loaded when your bot starts up, this ensures that restarts do not affect cooldowns.

For more examples of the cooldown format please see the chart at [Command Cooldowns](#command-cooldowns).

# Test Servers

You might not want a command or feature to work while it is still in development. You can specify a test server to prevent in-development code from working.

First you must specify test servers like so:

```JS
const DiscordJS = require('discord.js')
const WOKCommands = require('wokcommands')
require('dotenv').config()

const client = new DiscordJS.Client({
  partials: ['MESSAGE', 'REACTION'],
})

client.on('ready', () => {
  // Initialize WOKCommands
  new WOKCommands(client, {
    // Can be a single string as well
    testServers: ['747587598712569913'],
  })
})

client.login(process.env.TOKEN)
```

After that you can specify some features and commands as "testOnly" like so:

```JS
// File name: "ping.js"
// Folder "./commands"

module.exports = {
  testOnly: true, // Will now only work on test servers
  callback: ({ message }) => {
    message.reply('pong')
  }
}
```

```JS
// File name: "message-logger.js"
// Folder "./features"

module.exports = (client, instance, isEnabled) => {
  // Listen for messages
  client.on('message', (message) => {
    // Access the guild, required to see if this is enabled
    const { guild } = message

    // If the guild exists and we are enabled within this guild
    // Remove the guild checek if you want this to be enabled in DMs
    if (guild && isEnabled(guild.id)) {
      // If this is enabled then log the content to the console
      console.log(message.content)
    }
  })
}

module.exports.config = {
  displayName: 'Test',
  dbName: 'TEST',
  loadDBFirst: true,
  testOnly: true, // Will now only work on test servers
}

```

# Slash Commands

Slash commands are a new system for commands within Discord bots. WOKCommands aims to help developers implement slash commands in the easiest way possible. You can view the official documentation for slash commands [here](https://discord.com/developers/docs/interactions/slash-commands).

Here is a basic ping pong slash command example:

```JS
// File name: "ping.js"
// Folder "./commands"

module.exports = {
  slash: true,
  testOnly: true, // Ensure you have test servers setup, see the above section
  description: 'A simple ping pong command', // Required for slash commands
  callback: ({}) => {
    // The content to reply with must be returned from the callback function
    // This is required for slash commands exclusively
    return 'pong'
  }
}
```

When running `/ping` it will send "pong" in the same channel.

The "testOnly" property is important when testing. Guild based slash commands will register instantly, where global slash commands may take up to an hour to be visible in servers who use your bot. To specify the test guild IDs please check the [Test Servers](#test-servers) documentation.

All of the normal WOKCommands callback arguments are available aside from `message` and `prefix`. A full list can be found [here](#creating-a-command).

## Slash Command Arguments

Slash commands handle arguments differently, hover WOKCommands will allow you specify your slash command arguments in the same way as normal commands. Here is an example of a "name and age" command:

```JS
// File name: "nameage.js"
// Folder "./commands"

module.exports = {
  slash: true,
  testOnly: true, // Ensure you have test servers setup, see the above section
  description: 'Displays your name and age', // Required for slash commands
  minArgs: 2,
  expectedArgs: '<Name> <Age>',
  callback: ({ args }) => {
    // Destructure the name and age from the args array
    const [name, age] = args

    // The content to reply with must be returned from the callback function
    // This is required for slash commands exclusively
    return `Hello my name is ${name} and I am ${age} years old.`
  }
}
```

If you were to run `/nameage Alex 27` you would then see the text "Hello my name is Alex and I am 27 years old." as a reply. The `minArgs` property will let WOKCommands know how many arguments are required. In this case it is all of them, however if it was `1` then the "Age" argument would be optional.

## Responding with Embeds

If you have worked with embeds and slash commands directly then you know there is extra work that goes into it. WOKCommands makes this very easy and does the heavy lifting for you. If we wanted the previous example to return with an embed then we can just simply return an embed like so:

```JS
// File name: "nameage.js"
// Folder "./commands"

const { MessageEmbed } = require('discord.js')

module.exports = {
  slash: true,
  testOnly: true, // Ensure you have test servers setup, see the above section
  description: 'Displays your name and age', // Required for slash commands
  minArgs: 2,
  expectedArgs: '<Name> <Age>',
  callback: ({ args }) => {
    // Destructure the name and age from the args array
    const [name, age] = args

    // Create the embed
    const embed = new MessageEmbed()
      .setTitle('Example Embed')
      .addField('Name', name)
      .addField('Age', age)

    // The content to reply with must be returned from the callback function
    // This is required for slash commands exclusively
    return embed
  },
}
```

# Language Support

## Language Configuration

Server owners can configure what language messages are sent in, you can do so with this simple command:

`!language [new language]`

If server owners want to see what language is currently set they can simply omit the new language argument and run:

`!language`

## Storing custom messages and translations

As the developer you can create a `messages.json` file that contains your own text and translations. There are two types of objects within this file: `direct messages` and `embeds`. Direct messages will be a single message in different languages, while embeds will contain different types of fields. An example of each:

Direct messages:

```JSON
{
  "NEW_LANGUAGE": {
    "english": "Language set to {LANGUAGE}.",
    "spanish": "Idioma configurado en {LANGUAGE}."
  }
}
```

Embed:

```JSON
{
  "HELP_MENU": {
    "TITLE": {
      "english": "Help Menu",
      "spanish": "Menú de ayuda"
    }
  }
}
```

You can find the default `messages.json` here: https://github.com/AlexzanderFlores/WOKCommands/blob/main/src/messages.json. You will also need to define where your `messages.json` file lives in the WOKCommands constructor like so:

```JS
// Assumes messages.json is in the same directory as this code's file
new WOKCommands(client, , {
    commandsDir: 'commands',
    featuresDir: 'features',
    messagesPath: 'messages.json'
  })
```

## Loading message text

You should not load text from your `messages.json` file directly, instead there is a built-in function to ensure the correct language is returned. A simple example:

```JSON
// messages.json
{
  "EXAMPLE": {
    "english": "An example message",
    "spanish": "Un mensaje de ejemplo"
  }
}
```

```JS
// File name: "example.js"
// Folder "./commands"

module.exports = {
  callback: ({ message, args, text, client, prefix, instance }) => {
    const { guild } = message
    message.reply(instance.messageHandler.get(guild, 'EXAMPLE'))
  },
}
```

If you ran the "!example" in a server it will reply with "An example message". If that server was configured to Spanish it will reply with "Un mensaje de ejemplo" instead.

You can set dynamic placeholders in your messages like so:

```JSON
// messages.json
{
  "EXAMPLE": {
    "english": "An example message. {TEST}",
    "spanish": "Un mensaje de ejemplo. {TEST}"
  }
}
```

You can then dynamically insert values like so:

```JS
// File name: "example.js"
// Folder "./commands"

module.exports = {
  callback: ({ message, args, text, client, prefix, instance }) => {
    const { guild } = message
    message.reply(instance.messageHandler.get(guild, 'EXAMPLE', {
      TEST: 'hello world'
    }))
  },
}
```

Now running `!ping` will display "An example message. hello world".

## Global Syntax Errors

In a lot of cases your syntax errors will be very similar. You can specify a global syntax error within your `messages.json` file like so:

```JSON
{
  "SYNTAX_ERROR": {
    "english": "Incorrect usage! Please use \"{PREFIX}{COMMAND} {ARGUMENTS}\"",
    "spanish": "¡Uso incorrecto! Utilice \"{PREFIX} {COMMAND} {ARGUMENTS}\""
  },
}
```

The `{PREFIX}`, `{COMMAND}` and `{ARGUMENTS}` must always be in upper case. These will be replaced with the correct content when an error occurs. The `{ARGUMENTS}` variable must be specified in the command like so:

```JS
// File name: "ping.js"
// Folder "./commands"

module.exports = {
  minArgs: 1,
  maxArgs: -1, // -1 means no limit
  expectedArgs: "<Target user's @>",
  callback: ({ message }) => {
    message.reply('pong')
  }
}
```

A per-command syntax error message will always overwrite a global one for that specific command.

# Events

This package includes some useful events. Here is an example of listening to all supported events:

```JS
const DiscordJS = require('discord.js')
const WOKCommands = require('wokcommands')
require('dotenv').config()

const client = new DiscordJS.Client()

client.on('ready', () => {
  const wok = new WOKCommands(client, , {
    commandsDir: 'commands',
    featuresDir: 'features'
  })
    .setMongoPath(process.env.MONGO_URI)
    .setDefaultPrefix('?')

  // Ran whenever a supported database connection is connected
  wok.on('databaseConnected', (connection, state) => {
    console.log('The state is', state)
  })

  // Ran when a server owner attempts to set a language that you have not supported yet
  wok.on('languageNotSupported', (message, lang) => {
    console.log('Attempted to set language to', lang)
  })

  // Ran when an exception occurs within a command
  wok.on('commandException', (command, message, error) => {
    console.log(`An exception occured when using command "${command.names[0]}"! The error is:`)
    console.error(error)
  })

  // Ran when a message is sent or updated
  // NOTE: This is ran on the client and not the WOKCommands instance
  client.on('messageUpsert', (message, oldMessage) => {
    // oldMessage is undefined if it was not updated
    const wasUpdated = !!oldMessage

    console.log(`The new content is ${message.content}.`)
  })
})

client.login(process.env.TOKEN)
```

# Support & Feature Requests

This package is looking for feedback and ideas to help cover more use cases. If you have any ideas feel free to share them within the "💡 ｜ suggestions" channel in the [Worn Off Keys Discord server](http://wornoffkeys.com/discord?from=wokcommands-npm-bottom).
