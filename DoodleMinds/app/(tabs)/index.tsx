import React, { useState, useRef, useEffect } from 'react';
// Changed SafeAreaView to View here
import { StyleSheet, View, Text, Button } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

// --- The Drawing Interface Component (No changes here) ---
const DrawingInterface = ({ onContinueStory }: { onContinueStory: () => void }) => (
  <View style={styles.drawingContainer}>
    <Text style={styles.title}>Your turn to draw!</Text>
    
    <View style={styles.outlineBox}>
      <Text style={styles.outlineText}>An outline of the character appears here</Text>
    </View>
    
    <Button title="Continue the Story" onPress={onContinueStory} />
  </View>
);


// --- The Main App Screen ---
export default function HomeScreen() {
  const [appState, setAppState] = useState<'video' | 'drawing'>('video');
  const videoRef = useRef<Video>(null);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      return;
    }
    if (status.positionMillis >= 15000) {
      videoRef.current?.pauseAsync();
      setAppState('drawing');
    }
  };

  const handleContinueStory = () => {
    setAppState('video');
    videoRef.current?.playAsync();
  };

  useEffect(() => {
    return () => {
      videoRef.current?.unloadAsync();
    };
  }, []);

  return (
    // Changed SafeAreaView to View here
    <View style={styles.container}>
      {appState === 'video' ? (
        <Video
          ref={videoRef}
          style={styles.video}
          source={require('../../assets/story1.mp4')}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        />
      ) : (
        <DrawingInterface onContinueStory={handleContinueStory} />
      )}
    </View>
  );
}

// --- Styles for all our components (No changes here) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  drawingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  outlineBox: {
    width: 300,
    height: 300,
    borderWidth: 3,
    borderColor: '#a9a9a9',
    borderStyle: 'dashed',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    padding: 10,
  },
  outlineText: {
    color: '#a9a9a9',
    fontSize: 16,
    textAlign: 'center',
  },
});