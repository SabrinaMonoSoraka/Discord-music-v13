const { Client } = require('discord.js');
const bot = new Client({ intents: [
 'GUILDS',
 'GUILD_MESSAGES',
 'GUILD_VOICE_STATES',
 'GUILD_MESSAGE_TYPING',
 'GUILD_INTEGRATIONS',
 'DIRECT_MESSAGE_TYPING',
 'DIRECT_MESSAGE_REACTIONS',
 'GUILD_MESSAGE_REACTIONS'
]});
const {
	NoSubscriberBehavior,
	StreamType,
	createAudioPlayer,
	createAudioResource,
	entersState,
	AudioPlayerStatus,
	VoiceConnectionStatus,
	joinVoiceChannel,
	AudioPlayer
} = require('@discordjs/voice');

const config = {
    token: "Seu Token",
    prefix: ";"
}

const player = createAudioPlayer();

function play() {

	const resource = createAudioResource("music.mp3", {
		inputType: StreamType.Arbitrary,
	});
	player.play(resource);

	return entersState(player, AudioPlayerStatus.Playing, 5e3);

}

async function connectToChannel(channel) {
const connection = joinVoiceChannel({
	channelId: channel.id,
	guildId: channel.guild.id,
	adapterCreator: channel.guild.voiceAdapterCreator,
});
try {
	await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
	return connection;
} catch (error) {
	connection.destroy();
	throw error;
}

}

async function disconnetToChannel(channel) {
const connection = joinVoiceChannel({
	channelId: channel.id,
	guildId: channel.guild.id,
	adapterCreator: channel.guild.voiceAdapterCreator,
});
	connection.destroy();

}

bot.on("ready", () => console.log("Estou pronta"));

bot.on("messageCreate", async msg => { 
if (msg.author.bot) return undefined;
if (!msg.content.startsWith(config.prefix)) return undefined;

let command = msg.content.toLowerCase().split(' ')[0];
command = command.slice(config.prefix.length)

if(command === "play"){
		const channel = msg.member?.voice.channel;
		if (channel) {
			try {
				const connection = await connectToChannel(channel);
				connection.subscribe(player);
				await play();
				await msg.channel.send('Tocando');
				player.on(AudioPlayerStatus.Idle,async () => {
					disconnetToChannel(channel)
					
				});
			} catch (error) {
				console.error(error);
			}
		} else {
			await msg.channel.send('Voce precisa ta em um canal de voz!');
		}
}else if(command === "leave"){
	const channel = msg.member?.voice.channel;
	if (channel) {
		try {
			disconnetToChannel(channel);
		} catch (error) {
			console.error(error);
		}
	} else {
		await msg.channel.send('Voce precisa ta em um canal de voz!');
	}
	}else if (command === "pause"){
		player.pause();
		await msg.channel.send("Pausou")
	}else if(command === "unpause"){
        player.unpause();
		await msg.channel.send("Resume")
    }

})
bot.login(config.token);