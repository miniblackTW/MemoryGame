const { SlashCommandBuilder } = require('@discordjs/builders');
const { start: startMemoryGame } = require('../games/memoryGame');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('小遊戲')
        .setDescription('選擇一個小遊戲來玩')
        .addStringOption(option =>
            option.setName('遊戲')
                .setDescription('選擇一個小遊戲')
                .setRequired(true)
                .addChoices(
                    { name: '記憶遊戲', value: 'memorygame' }
                )),
    async execute(interaction) {
        const game = interaction.options.getString('遊戲');

        if (game === 'tetris') {
            await startTetrisGame(interaction);
        } else if (game === 'memorygame') {
            await startMemoryGame(interaction);
        } else {
            await interaction.reply('sad... 這個遊戲尚未開放');
        }
    },
};
