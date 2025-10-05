import { Story } from './story1';

export const storyData3: Story = {
  id: 'the-wind-and-the-sun',
  title: 'The Wind and the Sun',
  video: require('../assets/story3.mp4'),
  interactionPoints: [
    {
      timestamp: 20000, 
      prompt: 'The sun is shining brightly! Let\'s color it!',
      outlineParts: [
        { id: 'sun_face', name: 'Sun Face', svgPath: 'M150 150 m-60 0 a60 60 0 1 0 120 0 a60 60 0 1 0 -120 0' },
        { id: 'sun_ray_top', name: 'Ray', svgPath: 'M150 70 L140 40 L160 40 Z' },
        { id: 'sun_ray_right', name: 'Ray', svgPath: 'M230 150 L260 140 L260 160 Z' },
        { id: 'sun_ray_bottom', name: 'Ray', svgPath: 'M150 230 L140 260 L160 260 Z' },
        { id: 'sun_ray_left', name: 'Ray', svgPath: 'M70 150 L40 140 L40 160 Z' },
      ],
    },
    {
      timestamp: 53000,
      prompt: 'Let\'s make a tasty omelette!',
      outlineParts: [
        {
          id: 'omelette_body',
          name: 'Omelette',
          svgPath: 'M50 150 C 100 50, 200 50, 250 150 L 50 150 Z',
        },
        {
          id: 'omelette_filling',
          name: 'Filling',
          svgPath: 'M100 140 Q 150 120, 200 140',
        },
      ],
    },
  ],
};