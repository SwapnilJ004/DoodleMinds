import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Button, Pressable, Modal, TouchableOpacity } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import Svg, { Path } from 'react-native-svg';
import { storyData, InteractionPoint } from '../../data/story1';

const COLORS = ['red', 'blue', 'green', 'yellow', 'orange', 'purple'];

const DrawingInterface = ({
  interaction,
  onContinueStory,
}: {
  interaction: InteractionPoint;
  onContinueStory: () => void;
}) => {
  const [userPaths, setUserPaths] = useState<{ [partId: string]: string[] }>({});
  const [fillColors, setFillColors] = useState<{ [partId: string]: string }>({});
  const [currentColor, setCurrentColor] = useState<string>('blue');
  const [selectedPartId, setSelectedPartId] = useState<string | null>(
    interaction.outlineParts.length > 0 ? interaction.outlineParts[0].id : null
  );
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const currentPath = useRef<string>('');
  const lastTouchLocation = useRef<{ x: number; y: number } | null>(null);
  const touchStartTime = useRef<number>(0);

  const handleDrawingStart = (event: any) => {
    if (!selectedPartId) return;
    const { locationX, locationY } = event.nativeEvent;
    lastTouchLocation.current = { x: locationX, y: locationY };
    touchStartTime.current = Date.now();
    currentPath.current = `M${locationX.toFixed(0)},${locationY.toFixed(0)}`;
    setUserPaths(prev => ({
      ...prev,
      [selectedPartId]: [...(prev[selectedPartId] || []), currentPath.current],
    }));
  };

  const handleDrawingMove = (event: any) => {
    if (!selectedPartId) return;
    const { locationX, locationY } = event.nativeEvent;
    lastTouchLocation.current = { x: locationX, y: locationY };
    const newPoint = ` L${locationX.toFixed(0)},${locationY.toFixed(0)}`;
    currentPath.current += newPoint;
    setUserPaths(prev => ({
      ...prev,
      [selectedPartId]: [...(prev[selectedPartId] || []).slice(0, -1), currentPath.current],
    }));
  };

  const handleDrawingEnd = (event: any) => {
    if (!selectedPartId) return;
    const { locationX, locationY } = event.nativeEvent;
    const touchEndTime = Date.now();
    const duration = touchEndTime - touchStartTime.current;
    const distX = locationX - (lastTouchLocation.current?.x || 0);
    const distY = locationY - (lastTouchLocation.current?.y || 0);
    const distance = Math.sqrt(distX * distX + distY * distY);

    if (duration < 200 && distance < 10) {
      // Tap detected on selected part - fill it
      setFillColors(prev => ({
        ...prev,
        [selectedPartId]: currentColor,
      }));
    }
  };

  // Handle tap with large invisible hit area so any part can be selected and filled reliably
  const handleSelectAndFillPart = (partId: string) => {
    setSelectedPartId(partId);
    setFillColors(prev => ({
      ...prev,
      [partId]: currentColor,
    }));
  };

  const handleSubmit = () => {
    setShowSuccessPopup(true);
    setTimeout(() => {
      setShowSuccessPopup(false);
      onContinueStory();
    }, 1500);
  };

  return (
    <View style={styles.drawingContainer}>
      <Text style={styles.title}>{interaction.prompt} (Tap to fill, drag to draw)</Text>
      <View
        style={styles.outlineBox}
        onStartShouldSetResponder={() => true}
        onResponderGrant={handleDrawingStart}
        onResponderMove={handleDrawingMove}
        onResponderRelease={handleDrawingEnd}
      >
        <Svg height="100%" width="100%" viewBox="0 0 300 300">
          {interaction.outlineParts.map(part => (
            <Path
              key={part.id}
              d={part.svgPath}
              stroke={selectedPartId === part.id ? 'black' : '#555'}
              strokeWidth={12}      // increased for easier tap
              strokeDasharray="6, 6"
              fill={fillColors[part.id] || 'none'}
              opacity={1}
              onPressIn={() => handleSelectAndFillPart(part.id)}
            />
          ))}
          {Object.entries(userPaths).map(([partId, paths]) =>
            paths.map((path, idx) => (
              <Path
                key={`${partId}-${idx}`}
                d={path}
                stroke={currentColor}
                strokeWidth={6}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))
          )}
        </Svg>

      </View>

      {/* Color palette */}
      <View style={styles.colorPalette}>
        {COLORS.map(color => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              {
                backgroundColor: color,
                borderWidth: currentColor === color ? 3 : 1,
              },
            ]}
            onPress={() => setCurrentColor(color)}
          />
        ))}
      </View>

      <View style={styles.buttonRow}>
        <Button
          title="Clear"
          onPress={() => {
            setUserPaths({});
            setFillColors({});
          }}
        />
        <Button title="Submit" onPress={handleSubmit} />
      </View>

      {/* Success Popup */}
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
  const hideControlsTimer = useRef<number | null>(null);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    const nextInteraction = storyData.interactionPoints.find(
      point =>
        status.positionMillis >= point.timestamp &&
        !completedTimestamps.includes(point.timestamp)
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
          source={storyData.video}
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
    textShadowRadius: 10
  },
  drawingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width: '100%',
    height: '100%',
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  outlineBox: { width: 300, height: 300, marginBottom: 20 },
  colorPalette: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 5,
    borderColor: '#333',
  },
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
