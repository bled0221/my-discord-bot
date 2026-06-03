require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers
    ] 
});

client.commands = new Collection();
client.prefixCommands = new Collection();

// 1. 명령어 로딩
const loadCommands = () => {
    const folders = ['commands', 'dev-commands']; 
    for (const folder of folders) {
        const commandsPath = path.join(__dirname, folder);
        if (!fs.existsSync(commandsPath)) continue; 
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(__dirname, folder, file);
            // 캐시 제거를 통해 코드 수정 시 즉시 반영
            delete require.cache[require.resolve(filePath)]; 
            const command = require(filePath);
            
            if (command.data && command.execute) {
                client.commands.set(command.data.name, command);
            } else if (command.name && command.execute) {
                client.prefixCommands.set(command.name, command);
            }
        }
    }
};
loadCommands();

// 2. 로그 저장 함수 (슬래시 명령어 전용)
function saveLog(guildId, userId, fullCommand) {
    const logFilePath = path.join(__dirname, 'command-logs.txt');
    const timestamp = new Date().toLocaleString();
    const logEntry = `[${timestamp}] 서버ID: ${guildId} | 유저ID: ${userId} | 명령어: ${fullCommand}\n`;
    
    try {
        fs.appendFileSync(logFilePath, logEntry);
        console.log(`[로그 저장] ${fullCommand}`);
    } catch (err) {
        console.error("❌ 로그 저장 실패:", err);
    }
}

client.once(Events.ClientReady, (c) => {
    console.log(`✅ ${c.user.tag} 봇이 성공적으로 실행되었습니다!`);
});

// 3. 슬래시 명령어 처리 (로그 기록함)
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    // 입력된 전체 명령어 구성 (예: /익명 내용)
    const options = interaction.options.data.map(o => o.value).join(' ');
    const fullCommand = `/${interaction.commandName}${options ? ' ' + options : ''}`;

    // 로그 기록
    saveLog(interaction.guild.id, interaction.user.id, fullCommand);

    try { 
        await command.execute(interaction); 
    } catch (error) { 
        console.error(error); 
    }
});

// 4. 일반 명령어 처리 (!명령어 - 로그 기록 안 함)
client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith('!')) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args[0]; 
    const command = client.prefixCommands.get(`!${commandName}`);

    if (command && command.developerOnly && message.author.id === process.env.DEVELOPER_ID) {
        try {
            await command.execute(message);
        } catch (error) {
            console.error(error);
        }
    }
});

client.login(process.env.TOKEN);