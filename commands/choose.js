const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('랜덤')
        .setDescription('입력한 항목들 중 하나를 랜덤으로 선택합니다.')
        .addStringOption(option =>
            option.setName('항목')
                .setDescription('항목들을 띄어쓰기나 쉼표(,)로 구분해 적어주세요.')
                .setRequired(true)
        ),

    async execute(interaction) {
        const input = interaction.options.getString('항목');

        // 띄어쓰기 또는 쉼표를 기준으로 나눔
        const choices = input.split(/[ ,]+/).filter(choice => choice.trim() !== '');

        if (choices.length < 2) {
            return interaction.reply({ 
                content: '⚠️ 최소 2개 이상의 항목을 입력해 주세요! (예: `짜장면, 짬뽕, 탕수육`)', 
                ephemeral: true 
            });
        }

        const picked = choices[Math.floor(Math.random() * choices.length)];

        // 임베드(Embed)를 사용하면 결과가 훨씬 보기 좋습니다.
        await interaction.reply({ 
            content: `🎲 랜덤 선택 결과입니다!`,
            embeds: [{
                color: 0x72767d, // Discord 색상
                description: `제 선택은... **${picked}** 입니다!`
            }]
        });
    },
};