import { Story } from './story1';

export const storyData4: Story = {
  id: 'tuta-ghada',
  title: 'The Broken Pot (Tuta Ghada)',
  video: require('../assets/story4.mp4'),
  interactionPoints: [
    {
      timestamp: 18000,
      prompt: 'This is the pot for carrying water. Let\'s color it!',
      image: require("../assets/pot.png"),
      outlineParts: [
        { id: 'pot_body', name: 'Pot Body', svgPath: 'M60 120 C 10 250, 290 250, 240 120' },
        { id: 'pot_neck', name: 'Pot Neck', svgPath: 'M120 70 C 110 130, 190 130, 180 70' },
        { id: 'pot_rim', name: 'Pot Rim', svgPath: 'M110 70 C 110 50, 190 50, 190 70' },
      ],
    },
    {
      timestamp: 100000,
      prompt: 'Let\'s draw a beautiful flower!',
      image: require("../assets/flower.png"),
      outlineParts: [
        {
          id: 'flower_center',
          name: 'Center',
          svgPath: 'M150 150 m-20 0 a20 20 0 1 0 40 0 a20 20 0 1 0 -40 0',
        },
        {
          id: 'flower_petal_top',
          name: 'Petal',
          svgPath: 'M150 120 C 120 120, 120 80, 150 80 C 180 80, 180 120, 150 120 Z',
        },
        {
          id: 'flower_petal_right',
          name: 'Petal',
          svgPath: 'M180 150 C 180 120, 220 120, 220 150 C 220 180, 180 180, 180 150 Z',
        },
        {
          id: 'flower_petal_bottom',
          name: 'Petal',
          svgPath: 'M150 180 C 120 180, 120 220, 150 220 C 180 220, 180 180, 150 180 Z',
        },
        {
          id: 'flower_petal_left',
          name: 'Petal',
          svgPath: 'M120 150 C 120 120, 80 120, 80 150 C 80 180, 120 180, 120 150 Z',
        },
      ],
    },
  ],
};