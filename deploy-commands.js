// deploy-commands.js
require('dotenv').config(); // 💡 맨 첫 줄에 비밀 서랍(.env)을 여는 코드를 추가했어요!
const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');

const commands = [];
// commands 폴더 안의 파일들을 읽어서 대기표 목록에 자동으로 넣기
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    }
}

// ⭐ 진짜 토큰과 ID 문자열을 지우고, 비밀 서랍에서 꺼내오도록 수정했어요!
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log(`🔄 총 ${commands.length}개의 슬래시 명령어 등록을 시작합니다...`);

        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands },
        );

        console.log('✅ 슬래시 명령어가 성공적으로 업데이트되었습니다!');
    } catch (error) {
        console.error('⚠️ 등록 중 에러 발생:', error);
    }
})();