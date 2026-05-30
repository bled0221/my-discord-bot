const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('뒷담')
        .setDescription('당신의 이름을 숨기고 익명으로 메시지를 보냅니다.')
        .addStringOption(option =>
            option.setName('내용')
                .setDescription('익명으로 전송할 내용을 적어주세요.')
                .setRequired(true)),

    async execute(interaction) {
        const content = interaction.options.getString('내용');
        const guild = interaction.guild; // 명령어가 사용된 디스코드 서버

        // 유저에게는 비밀 메시지로 먼저 전송 완료 알림 보내기
        await interaction.reply({ content: '🤫 익명 메시지가 안전하게 전송되었습니다!', ephemeral: true });

        // 1. 서버에 '익명-뒷담방'이라는 이름의 텍스트 채널이 이미 있는지 확인
        let targetChannel = guild.channels.cache.find(ch => ch.name === '익명-뒷담방' && ch.type === ChannelType.GuildText);

        // 2. 만약 채널이 없으면 봇이 알아서 자동으로 만들기
        if (!targetChannel) {
            try {
                targetChannel = await guild.channels.create({
                    name: 'Open Claw-뒷담방',
                    type: ChannelType.GuildText,
                    topic: '🤫 신원 보장! 익명 뒷담이 올라오는 곳입니다. 자유롭게 즐겨보세요!',
                    // 유저들이 채널을 보고, 과거 기록도 읽고, 채팅도 마음껏 치게 기본 허용 설정
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone.id,
                            allow: [
                                PermissionFlagsBits.ViewChannel, 
                                PermissionFlagsBits.ReadMessageHistory,
                                PermissionFlagsBits.SendMessages // 👈 일반 유저 채팅 치기 전면 허용!
                            ]
                        }
                    ]
                });
            } catch (error) {
                console.error('채널 생성 중 에러 발생:', error);
                return interaction.followUp({ content: '❌ 봇에게 텍스트 채널을 만들 수 있는 권한(채널 관리하기)이 없어 기능을 실행하지 못했습니다.', ephemeral: true });
            }
        }

        // 3. 익명 박스(임베드) 꾸미기
        const anonymousEmbed = new EmbedBuilder()
            .setColor('#ff4757')
            .setTitle('🤫 익명 뒷담 메시지')
            .setDescription(`"${content}"`)
            .setTimestamp()
            .setFooter({ text: '※ 누군지 알아내려고 하지 마세요.' });

        // 4. 자동으로 찾았거나 새로 만든 '익명-뒷담방' 채널에 전송하기
        await targetChannel.send({ embeds: [anonymousEmbed] });
    },
};