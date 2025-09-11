// This interface defines the shape of our interaction point data
export interface InteractionPoint {
  timestamp: number; // Time in milliseconds to pause the video
  prompt: string; // The text to show the user
  outlineSvgPath: string; // The SVG path data for the drawing outline
}

// This interface defines the shape of our entire story object
export interface Story {
  id: string;
  title: string;
  video: any; // Using 'any' for the require() statement
  interactionPoints: InteractionPoint[];
}

// Here is the actual data for our first story
export const storyData: Story = {
  id: 'wiggles-the-caterpillar',
  title: 'Wiggles The Caterpillar',
  video: require('../assets/story1.mp4'), // Path to the video
  interactionPoints: [
    {
      timestamp: 15000, // Pause at 15 seconds
      prompt: 'Help Wiggles! Draw him a yummy red apple!',
      // SVG path for a simple circle (apple)
      outlineSvgPath: 'M40 150 C40 100 120 100 180 150 C120 200 40 200 40 150 Z M180 150 L260 110 L260 190 L180 150 Z M70 145 A5 5 0 1 1 70 155 A5 5 0 1 1 70 145 Z',
    },
    {
      timestamp: 35000, // Pause at 35 seconds
      prompt: 'Now draw a bright, warm sun to help Wiggles grow!',
      // SVG path for a sun with rays
      outlineSvgPath: 'M150 50 A100 100 0 1 1 150 250 A100 100 0 1 1 150 50 Z',
    },
    // You can add as many other interaction points as you want here
  ],
};