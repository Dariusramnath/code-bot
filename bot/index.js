require("dotenv").config();

// Require the necessary discord.js classes
const fs = require("node:fs");
const path = require("node:path");
const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  MessageFlags,
} = require("discord.js");
const mongoose = require("mongoose");
const { DISCORD_TOKEN, MONGO_URI } = process.env;

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

console.log("🔗 Connecting to MongoDB...", MONGO_URI);

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

// Command Handling
for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

// Event Handling
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(DISCORD_TOKEN);

// ✅ Add fake HTTP server so Render keeps the service alive
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const apiRouter = require("./api/verifyPin");

app.use(bodyParser.json());

app.get("/", (req, res) => res.send("Bot is running!"));

app.use("/api", apiRouter);

app.listen(PORT, () => {
  console.log(`🌐 Web service listening on port ${PORT}`);
});
