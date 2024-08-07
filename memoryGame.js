const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');

let memoryResults = {};

if (fs.existsSync('MemoryResults.json')) {
    memoryResults = JSON.parse(fs.readFileSync('MemoryResults.json'));
}

const saveResults = () => {
    fs.writeFileSync('MemoryResults.json', JSON.stringify(memoryResults, null, 2));
};

const fixedOrder = [
    { name: '紅色', emoji: '🔴' },
    { name: '橘色', emoji: '🟠' },
    { name: '黃色', emoji: '🟡' },
    { name: '綠色', emoji: '🟢' },
    { name: '藍色', emoji: '🔵' },
    { name: '紫色', emoji: '🟣' },
    { name: '咖啡色', emoji: '🟤' },
    { name: '白色', emoji: '⚪' }
];

const startMemoryGame = async (interaction) => {
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    const shuffledColors = [...fixedOrder];
    shuffledColors.sort(() => 0.5 - Math.random());
    const gameSequence = shuffledColors.slice(0, 8);

    const memoryEmbed = new EmbedBuilder()
        .setTitle('記憶遊戲')
        .setColor('#00FF00');

    await interaction.deferReply();

    const showSequence = async (index) => {
        if (index < gameSequence.length) {
            memoryEmbed.setDescription(`記住這個順序: ${gameSequence[index].emoji}`);
            await interaction.editReply({ embeds: [memoryEmbed] });

            setTimeout(() => showSequence(index + 1), 500);
        } else {
            memoryEmbed.setDescription('請依照順序點擊按鈕');
            await interaction.editReply({ embeds: [memoryEmbed] });

            await showButtons();
        }
    };

    const showButtons = async () => {
        const buttons = fixedOrder.map(color => new ButtonBuilder()
            .setCustomId(color.name)
            .setLabel(color.name)
            .setStyle(ButtonStyle.Primary));

        const row1 = new ActionRowBuilder().addComponents(buttons.slice(0, 4));
        const row2 = new ActionRowBuilder().addComponents(buttons.slice(4, 8));

        await interaction.followUp({ content: '請點擊按鈕', components: [row1, row2] });

        const filter = i => i.user.id === userId;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 });

        let userSequence = [];

        collector.on('collect', async i => {
            userSequence.push(i.customId);
            await i.deferUpdate();

            if (userSequence.length === gameSequence.length) {
                collector.stop();
            }
        });

        collector.on('end', async () => {
            let score = 400;
            let errors = 0;
            for (let i = 0; i < gameSequence.length; i++) {
                if (gameSequence[i].name !== userSequence[i]) {
                    score -= 50;
                    errors++;
                }
            }

            if (!memoryResults[guildId]) {
                memoryResults[guildId] = {};
            }
            memoryResults[guildId][userId] = Math.max(memoryResults[guildId][userId] || 0, score);
            saveResults();

            await interaction.followUp(`遊戲結束！你的分數是: ${score}，錯誤次數: ${errors}`);
        });
    };

    showSequence(0);
};

module.exports = { start: startMemoryGame };