import { Story } from './story1';

export const storyData2: Story = {
  id: 'the-bear-and-the-bee',
  title: 'The Bear and the Bee',
  video: require('../assets/story2.mp4'),
  interactionPoints: [
    {
      timestamp: 14000,
      prompt: 'The bees need a home. Can you color their beehive?',
      image: require('../assets/beehive.png'),
      outlineParts: [
        { id: 'hive_body', name: 'Hive Body', svgPath: 'M50 150 C50 80, 250 80, 250 150 C250 220, 50 220, 50 150 Z' },
        { id: 'hive_layer1', name: 'Middle Stripe', svgPath: 'M55 140 C55 110, 245 110, 245 140' },
        { id: 'hive_layer2', name: 'Top Stripe', svgPath: 'M75 115 C75 95, 225 95, 225 115' },
        { id: 'hive_opening', name: 'Opening', svgPath: 'M150 170 A15 15 0 1 1 150 180 A15 15 0 1 1 150 170 Z' },
      ],
    },
    {
      timestamp: 32000, 
      prompt: 'The bear loves honey! Let\'s color his honey pot.',
      image: require("../assets/honeypot.png"),
      outlineParts: [
        {
          id: 'pot_body',
          name: 'Pot',
          svgPath: 'M70 100 C 70 250, 230 250, 230 100',
        },
        {
          id: 'pot_rim',
          name: 'Rim',
          svgPath: 'M60 100 C 60 80, 240 80, 240 100',
        },
        {
          id: 'pot_label',
          name: 'Label',
          svgPath: 'M150 150 m-40 0 a40 40 0 1 0 80 0 a40 40 0 1 0 -80 0',
        },
      ],
    },
  ],
};