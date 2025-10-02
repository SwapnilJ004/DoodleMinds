import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Button, Pressable, Modal, TouchableOpacity, Animated } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import Svg, { Path } from 'react-native-svg';
import { storyData, InteractionPoint } from '../../data/story1';

const COLORS = [
  { name: 'red', color: '#FF6B6B' },
  { name: 'blue', color: '#4ECDC4' },
  { name: 'green', color: '#95E1D3' },
  { name: 'yellow', color: '#FFE66D' },
  { name: 'orange', color: '#FF8B4D' },
  { name: 'purple', color: '#C792EA' },
  { name: 'pink', color: '#FF9CEE' },
  { name: 'brown', color: '#A67C52' },
];

const DrawingInterface = ({
  interaction,
  onContinueStory,
}: {
  interaction: InteractionPoint;
  onContinueStory: () => void;
}) => {
  const [userPaths, setUserPaths] = useState<{ [partId: string]: string[] }>({});
  const [fillColors, setFillColors] = useState<{ [partId: string]: string }>({});
  const [currentColor, setCurrentColor] = useState<string>(COLORS[0].color);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(
    interaction.outlineParts.length > 0 ? interaction.outlineParts[0].id : null
  );
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [brushSize, setBrushSize] = useState<number>(4);
  const [showInstructions, setShowInstructions] = useState(true);
  
  const currentPath = useRef<string>('');
  const lastTouchLocation = useRef<{ x: number; y: number } | null>(null);
  const touchStartTime = useRef<number>(0);
  
  // Animation values
  const successScale = useRef(new Animated.Value(0)).current;
  const instructionOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Hide instructions after 3 seconds
    const timer = setTimeout(() => {
      Animated.timing(instructionOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setShowInstructions(false));
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

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
      setFillColors(prev => ({
        ...prev,
        [selectedPartId]: currentColor,
      }));
    }
  };

  const handleSelectAndFillPart = (partId: string) => {
    setSelectedPartId(partId);
    setFillColors(prev => ({
      ...prev,
      [partId]: currentColor,
    }));
  };

  const handleSubmit = () => {
    setShowSuccessPopup(true);
    successScale.setValue(0);
    Animated.spring(successScale, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
    
    setTimeout(() => {
      setShowSuccessPopup(false);
      onContinueStory();
    }, 2000);
  };

  const handleClear = () => {
    setUserPaths({});
    setFillColors({});
  };

  return (
    <View style={styles.drawingContainer}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>{interaction.prompt}</Text>
        {showInstructions && (
          <Animated.View style={[styles.instructionBubble, { opacity: instructionOpacity }]}>
            <Text style={styles.instructionText}>👆 Tap to fill • ✏️ Draw to color</Text>
          </Animated.View>
        )}
      </View>

      <View style={styles.canvasSection}>
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
                stroke={selectedPartId === part.id ? '#333' : '#999'}
                strokeWidth={selectedPartId === part.id ? 3 : 2}
                strokeDasharray="8, 4"
                fill={fillColors[part.id] || 'white'}
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
                  strokeWidth={brushSize}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.9}
                />
              ))
            )}
          </Svg>
        </View>

        {/* Selected part indicator */}
        {selectedPartId && (
          <View style={styles.selectedPartIndicator}>
            <View style={[styles.selectedColorDot, { backgroundColor: currentColor }]} />
            <Text style={styles.selectedPartText}>Drawing on part {selectedPartId}</Text>
          </View>
        )}
      </View>

      {/* Tools Section */}
      <View style={styles.toolsSection}>
        {/* Color palette */}
        <View style={styles.colorSection}>
          <Text style={styles.sectionLabel}>Colors</Text>
          <View style={styles.colorPalette}>
            {COLORS.map(({ name, color }) => (
              <TouchableOpacity
                key={name}
                style={[
                  styles.colorOption,
                  {
                    backgroundColor: color,
                    borderWidth: currentColor === color ? 4 : 2,
                    borderColor: currentColor === color ? '#333' : '#ddd',
                    transform: [{ scale: currentColor === color ? 1.1 : 1 }],
                  },
                ]}
                onPress={() => setCurrentColor(color)}
                activeOpacity={0.7}
              />
            ))}
          </View>
        </View>

        {/* Brush size selector */}
        <View style={styles.brushSection}>
          <Text style={styles.sectionLabel}>Brush Size</Text>
          <View style={styles.brushOptions}>
            {[2, 4, 6, 8].map(size => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.brushOption,
                  brushSize === size && styles.brushOptionSelected,
                ]}
                onPress={() => setBrushSize(size)}
              >
                <View
                  style={[
                    styles.brushPreview,
                    {
                      width: size * 3,
                      height: size * 3,
                      backgroundColor: currentColor,
                    },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <Text style={styles.clearButtonText}>🗑️ Clear All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>✨ Done!</Text>
        </TouchableOpacity>
      </View>

      {/* Success Popup */}
      <Modal visible={showSuccessPopup} transparent animationType="fade">
        <View style={styles.popupContainer}>
          <Animated.View 
            style={[
              styles.popup,
              {
                transform: [{ scale: successScale }]
              }
            ]}
          >
            <Text style={styles.popupEmoji}>🎨</Text>
            <Text style={styles.popupText}>Amazing Work!</Text>
            <Text style={styles.popupSubtext}>Your drawing is beautiful! ✨</Text>
          </Animated.View>
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
    backgroundColor: '#FFF8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 60,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  drawingContainer: {
    flex: 1,
    padding: 16,
    width: '100%',
    height: '100%',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  instructionBubble: {
    backgroundColor: '#FFE66D',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  canvasSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  outlineBox: {
    width: 300,
    height: 300,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  selectedPartIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedColorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#333',
  },
  selectedPartText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  toolsSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  colorSection: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  colorPalette: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  brushSection: {},
  brushOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  brushOption: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  brushOptionSelected: {
    backgroundColor: '#FFE66D',
    borderColor: '#333',
  },
  brushPreview: {
    borderRadius: 100,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  clearButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  popupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  popup: {
    width: 260,
    padding: 32,
    backgroundColor: 'white',
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  popupEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  popupText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  popupSubtext: {
    fontSize: 16,
    color: '#666',
  },
});