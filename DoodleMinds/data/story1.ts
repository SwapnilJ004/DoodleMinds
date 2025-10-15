// This interface defines each part of a drawing outline
export interface OutlinePart {
  id: string; // unique identifier for the part, e.g., 'fish_body'
  name: string; // human-readable name, e.g., "Body"
  svgPath: string; // the SVG path for this part
}

// This interface defines the shape of our interaction point data
export interface InteractionPoint {
  timestamp: number; // Time in milliseconds to pause the video
  prompt: string; // The text to show the user
  outlineParts: OutlinePart[];
  image?: any; // Array of parts the user can interact with
}

export interface Story {
  id: string;
  title: string;
  video: any; 
  language: 'en' | 'hi';
  interactionPoints: InteractionPoint[];
}

export const storyData: Story = {
  id: 'Clever-Fish',
  title: 'Clever Fish',
  video: require('../assets/story1.mp4'),
  language: 'en',
  interactionPoints: [
    {
      timestamp: 15000,
      prompt: 'Look! A little fish. Can you color it in?',
      image: require("../assets/fish.png"),
      outlineParts: [
        {
          id: 'fish_body',
          name: 'Body',
          svgPath: 'M40 150 C40 100 120 100 180 150 C120 200 40 200 40 150 Z',
        },
        {
          id: 'fish_tail',
          name: 'Tail',
          svgPath: 'M180 150 L260 110 L260 190 L180 150 Z',
        },
        {
          id: 'fish_eye',
          name: 'Eye',
          svgPath: 'M70 145 A5 5 0 1 1 70 155 A5 5 0 1 1 70 145 Z',
        },
      ],
    },
  ],
};