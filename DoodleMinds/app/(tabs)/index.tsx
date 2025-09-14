import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Button, Pressable, Modal } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import Svg, { Path } from 'react-native-svg';
import { storyData, InteractionPoint } from '../../data/story1';

const DrawingInterface = ({
  interaction,
  onContinueStory,
}: {
  interaction: InteractionPoint;
  onContinueStory: () => void;
}) => {
  const [userPaths, setUserPaths] = useState<string[]>([]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const currentPath = useRef<string>('');

  const checkTraceCompletion = (currentPaths: string[]) => {
    const allPaths = currentPaths.join('');
    const pointsDrawn = (allPaths.match(/ L/g) || []).length;

    const COMPLETION_THRESHOLD_POINTS = 80;
    if (pointsDrawn >= COMPLETION_THRESHOLD_POINTS) {
      setShowSuccessPopup(true);
      setTimeout(() => {
        onContinueStory();
      }, 2000);
    }
  };

  const handleDrawingStart = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    currentPath.current = `M${locationX.toFixed(0)},${locationY.toFixed(0)}`;
    setUserPaths(prev => [...prev, currentPath.current]);
  };

  const handleDrawingMove = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    const newPoint = ` L${locationX.toFixed(0)},${locationY.toFixed(0)}`;
    currentPath.current += newPoint;
    setUserPaths(prev => [...prev.slice(0, -1), currentPath.current]);
  };

  const handleDrawingEnd = () => {
    checkTraceCompletion(userPaths);
  };

  return (
    <View style={styles.drawingContainer}>
      <Text style={styles.title}>{interaction.prompt}</Text>
      <View
        style={styles.outlineBox}
        onStartShouldSetResponder={() => true}
        onResponderGrant={handleDrawingStart}
        onResponderMove={handleDrawingMove}
        onResponderRelease={handleDrawingEnd}
      >
        <Svg height="100%" width="100%" viewBox="0 0 300 300">
          <Path
            d={interaction.outlineSvgPath}
            stroke="#a9a9a9"
            strokeWidth={3}
            strokeDasharray="6, 6"
            fill="none"
          />
          {userPaths.map((path, index) => (
            <Path key={index} d={path} stroke="blue" strokeWidth={4} fill="none" />
          ))}
        </Svg>
      </View>
      <View style={styles.buttonRow}>
        <Button title="Clear" onPress={() => setUserPaths([])} />
        <Button title="Continue the Story" onPress={onContinueStory} />
      </View>

      <Modal visible={showSuccessPopup} transparent animationType="fade">
        <View style={styles.popupContainer}>
          <View style={styles.popup}>
            <Text style={styles.popupText}>Well done! 🎉</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default function HomeScreen() {
  const [appState, setAppState] = useState<'video' | 'drawing'>('video');
  const [isPlaying, setIsPlaying] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [currentInteraction, setCurrentInteraction] = useState<InteractionPoint | null>(null);
  const [completedTimestamps, setCompletedTimestamps] = useState<number[]>([]);
  const videoRef = useRef<Video>(null);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    const nextInteraction = storyData.interactionPoints.find(
      point => status.positionMillis >= point.timestamp && !completedTimestamps.includes(point.timestamp)
    );

    if (nextInteraction) {
      videoRef.current?.pauseAsync();
      setIsPlaying(false);
      setCurrentInteraction(nextInteraction);
      setCompletedTimestamps(prev => [...prev, nextInteraction.timestamp]);
      setAppState('drawing');
    }
  };

  const handleContinueStory = () => {
    setAppState('video');
    setCurrentInteraction(null);
    videoRef.current?.playAsync();
    setIsPlaying(true);
  };

  const showControls = () => {
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    setControlsVisible(true);
    hideControlsTimer.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  };

  const togglePlayPause = () => {
    showControls();
    setIsPlaying(prev => {
      const isNowPlaying = !prev;
      if (isNowPlaying) videoRef.current?.playAsync();
      else videoRef.current?.pauseAsync();
      return isNowPlaying;
    });
  };

  useEffect(() => {
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
      videoRef.current?.unloadAsync();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Pressable style={styles.videoContainer} onPress={showControls}>
        <Video
          ref={videoRef}
          style={styles.video}
          source={storyData.video} // ⚠️ ensure this is {uri: "..."} or require("...")
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={isPlaying}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        />
      </Pressable>

      {controlsVisible && appState === 'video' && (
        <Pressable style={styles.controlsOverlay} onPress={togglePlayPause}>
          <Text style={styles.controlButtonText}>{isPlaying ? '❚❚' : '▶'}</Text>
        </Pressable>
      )}

      {appState === 'drawing' && currentInteraction && (
        <View style={styles.drawingOverlay}>
          <DrawingInterface
            interaction={currentInteraction}
            onContinueStory={handleContinueStory}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  videoContainer: { flex: 1 },
  video: { ...StyleSheet.absoluteFillObject },
  drawingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0,0, 0.3)',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 60,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  drawingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width: '100%',
    height: '100%',
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  outlineBox: { width: 300, height: 300, marginBottom: 30 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  popupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  popup: {
    width: 200,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  popupText: { fontSize: 20, fontWeight: 'bold' },
});
