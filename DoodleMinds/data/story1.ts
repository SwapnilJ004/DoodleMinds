// This interface defines each part of a drawing outline
export interface OutlinePart {
  id: string; // unique identifier for the part
  name: string; // human-readable name (e.g., "body", "fin", "eye")
  svgPath: string; // the SVG path for this part
  fillColor?: string; // optional fill color (initially undefined)
}

// This interface defines the shape of our interaction point data
export interface InteractionPoint {
  timestamp: number; // Time in milliseconds to pause the video
  prompt: string; // The text to show the user
  outlineParts: OutlinePart[]; // Array of parts the user can interact with
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
    timestamp: 15000,
    prompt: 'Help Wiggles! Color his Fish!',
    outlineParts: [
      {
        id: 'apple_body',
        name: 'Apple Body',
        svgPath: 'M150 40 C100 40 100 120 150 180 C200 120 200 40 150 40 Z',
      },
      {
        id: 'apple_leaf',
        name: 'Apple Leaf',
        svgPath: 'M150 180 L110 260 L190 260 L150 180 Z',
      },
      {
        id: 'apple_spot',
        name: 'Apple Spot',
        svgPath: 'M145 70 A5 5 0 1 1 155 70 A5 5 0 1 1 145 70 Z',
      },
    ],
  },
  // ... rest unchanged
]

};
