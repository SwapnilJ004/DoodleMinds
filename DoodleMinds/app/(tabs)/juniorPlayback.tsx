import { Image } from "react-native";
import React, { useState, useRef, useEffect } from "react";
import ViewShot from "react-native-view-shot";
import * as FileSystem from "expo-file-system/legacy";
import { Asset } from "expo-asset";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import Svg, { Path } from "react-native-svg";
import { useLocalSearchParams } from "expo-router";
import { allStories } from "../../data/index";
import { InteractionPoint, Story } from "../../data/story1";

const COLORS = [
  { name: "red", color: "#FF6B6B" },
  { name: "blue", color: "#4ECDC4" },
  { name: "green", color: "#95E1D3" },
  { name: "yellow", color: "#FFE66D" },
  { name: "orange", color: "#FF8B4D" },
  { name: "purple", color: "#C792EA" },
];

const DrawingInterface = ({
  interaction,
  onContinueStory,
  storyId,
  interactionIndex,
}: {
  interaction: InteractionPoint;
  onContinueStory: () => void;
  storyId: string;
  interactionIndex: number;
}) => {
  const viewRef = useRef<ViewShot>(null);
  const [userPaths, setUserPaths] = useState<{
    [partId: string]: { path: string; color: string; strokeWidth: number }[];
  }>({});
  const [fillColors, setFillColors] = useState<{ [partId: string]: string }>({});
  const [currentColor, setCurrentColor] = useState<string>(COLORS[0].color);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(
    interaction.outlineParts.length > 0 ? interaction.outlineParts[0].id : null
  );
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showTryAgainPopup, setShowTryAgainPopup] = useState(false);
  const [brushSize, setBrushSize] = useState<number>(4);
  const [attemptCount, setAttemptCount] = useState(0);

  const currentPath = useRef<string>("");
  const successScale = useRef(new Animated.Value(0)).current;
  const tryAgainScale = useRef(new Animated.Value(0)).current;
  const [isChecking, setIsChecking] = useState(false);

  const handleDrawingStart = (event: any) => {
    if (!selectedPartId) return;
    const { locationX, locationY } = event.nativeEvent;
    currentPath.current = `M${locationX.toFixed(0)},${locationY.toFixed(0)}`;
    const newPath = {
      path: currentPath.current,
      color: currentColor,
      strokeWidth: brushSize,
    };
    setUserPaths((prev) => ({
      ...prev,
      [selectedPartId]: [...(prev[selectedPartId] || []), newPath],
    }));
  };

  const handleDrawingMove = (event: any) => {
    if (!selectedPartId) return;
    const { locationX, locationY } = event.nativeEvent;
    const newPoint = ` L${locationX.toFixed(0)},${locationY.toFixed(0)}`;
    currentPath.current += newPoint;
    const updatedPath = {
      path: currentPath.current,
      color: currentColor,
      strokeWidth: brushSize,
    };
    setUserPaths((prev) => ({
      ...prev,
      [selectedPartId]: [
        ...(prev[selectedPartId] || []).slice(0, -1),
        updatedPath,
      ],
    }));
  };

  const handlePartPress = (partId: string) => {
    setSelectedPartId(partId);
    setFillColors((prev) => ({ ...prev, [partId]: currentColor }));
  };

  const getAssetBase64 = async (requireSource: any) => {
    const asset = Asset.fromModule(requireSource);
    await asset.downloadAsync();
    const uri = asset.localUri || asset.uri;
    return await FileSystem.readAsStringAsync(uri, { encoding: "base64" });
  };

  const getReferenceImages = async () => {
    console.log('Selected Story:', storyId, 'Interaction:', interactionIndex);
    switch (storyId) {
      case "Clever-Fish":
        return [await getAssetBase64(require("../../assets/fish.png"))];
      case "the-bear-and-the-bee":
        if (interactionIndex === 0)
          return [await getAssetBase64(require("../../assets/beehive.png"))];
        if (interactionIndex === 1)
          return [await getAssetBase64(require("../../assets/honeypot.png"))];
        break;
      case "the-wind-and-the-sun":
        if (interactionIndex === 0)
          return [await getAssetBase64(require("../../assets/sun.png"))];
        if (interactionIndex === 1)
          return [await getAssetBase64(require("../../assets/omlet.png"))];
        break;
      case "tuta-ghada":
        if (interactionIndex === 0)
          return [await getAssetBase64(require("../../assets/pot.png"))];
        if (interactionIndex === 1)
          return [await getAssetBase64(require("../../assets/flower.png"))];
        break;
      default:
        return [await getAssetBase64(require("../../assets/fish.png"))];
    }
    return [];
  };

  const handleSubmit = async () => {
    if (viewRef.current && typeof viewRef.current.capture === "function") {
      try {
        setIsChecking(true);
        const drawingBase64 = await viewRef.current.capture();
        const referenceImages = (await getReferenceImages()) || [];

        const geminiApiUrl =
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAay25hKjum5zo60sNKOMR-jgEiTsytq8I";
        const prompt =
          "Are these two images visually similar? Reply YES if the child’s drawing matches the reference at least 20%, even if it’s not perfect or colored in roughly. If not, reply NO. Give a short, friendly explanation for kids.";

        const parts = [
          { text: prompt },
          { inline_data: { mime_type: "image/png", data: drawingBase64 } },
          ...referenceImages.map((ref) => ({
            inline_data: { mime_type: "image/png", data: ref },
          })),
        ];

        const body = {
          contents: [
            {
              role: "user",
              parts,
            },
          ],
        };

        const response = await fetch(geminiApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const result = await response.json();
        console.log("Gemini API response:", JSON.stringify(result, null, 2));
        const reply =
          result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

        if (/^YES/i.test(reply)) {
          setShowSuccessPopup(true);
          Animated.spring(successScale, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
          }).start();
          setTimeout(() => {
            setShowSuccessPopup(false);
            setAttemptCount(0);
            onContinueStory();
          }, 2000);
        } else if (attemptCount < 2) {
          setAttemptCount(attemptCount + 1);
          setShowTryAgainPopup(true);
          Animated.spring(tryAgainScale, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
          }).start();
          setTimeout(() => setShowTryAgainPopup(false), 1500);
        } else {
          setAttemptCount(0);
          setShowSuccessPopup(true);
          Animated.spring(successScale, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
          }).start();
          setTimeout(() => {
            setShowSuccessPopup(false);
            onContinueStory();
          }, 2000);
        }
        setIsChecking(false);
      } catch (error) {
        setIsChecking(false);
        console.error("API call failed:", error);
      }
    } else {
      console.warn("ViewShot ref or capture method is undefined");
    }
  };

  const handleClear = () => {
    setUserPaths({});
    setFillColors({});
  };

  return (
  <View style={styles.drawingContainer}>
    <Text style={styles.title}>{interaction.prompt}</Text>
    {interaction.image && (
      <Image
        source={interaction.image}
        style={styles.referenceImage}
        resizeMode="contain"
      />
    )}
    <ViewShot ref={viewRef} options={{ format: "png", result: "base64" }}>
      <View
        style={styles.outlineBox}
        onStartShouldSetResponder={() => true}
        onResponderGrant={handleDrawingStart}
        onResponderMove={handleDrawingMove}
      >
        <Svg height="100%" width="100%" viewBox="0 0 300 300">
          {interaction.outlineParts.map((part) => (
            <Path
              key={part.id}
              d={part.svgPath}
              stroke={selectedPartId === part.id ? "#333" : "#999"}
              strokeWidth={selectedPartId === part.id ? 2.5 : 1.5}
              strokeDasharray="6, 3"
              fill={fillColors[part.id] || "rgba(255, 255, 255, 0.7)"}
              onPress={() => handlePartPress(part.id)}
            />
          ))}
          {Object.values(userPaths)
            .flat()
            .map((item, index) => (
              <Path
                key={index}
                d={item.path}
                stroke={item.color}
                strokeWidth={item.strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
        </Svg>
      </View>
    </ViewShot>

    {isChecking && (
      <View style={styles.loaderOverlay}>
        <Text style={styles.loaderText}>Checking...</Text>
      </View>
    )}

    <View style={styles.toolsSection}>
      <View style={styles.colorPalette}>
        {COLORS.map(({ color }) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              {
                backgroundColor: color,
                transform: [{ scale: currentColor === color ? 1.2 : 1 }],
              },
            ]}
            onPress={() => setCurrentColor(color)}
          />
        ))}
      </View>
      <View style={styles.brushOptions}>
        {[4, 8, 12].map((size) => (
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
                { width: size * 2, height: size * 2 },
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>

    <View style={styles.buttonRow}>
      <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
        <Text style={styles.buttonText}>Clear</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Done!</Text>
      </TouchableOpacity>
    </View>

    <Modal visible={showSuccessPopup} transparent animationType="fade">
      <View style={styles.popupContainer}>
        <Animated.View
          style={[styles.popup, { transform: [{ scale: successScale }] }]}
        >
          <Text style={styles.popupText}>Amazing Work!</Text>
        </Animated.View>
      </View>
    </Modal>

    <Modal visible={showTryAgainPopup} transparent animationType="fade">
      <View style={styles.popupContainer}>
        <Animated.View
          style={[styles.popup, { transform: [{ scale: tryAgainScale }] }]}
        >
          <Text style={[styles.popupText, { color: "#FF6B6B" }]}>Try Again!</Text>
        </Animated.View>
      </View>
    </Modal>
  </View>
);

};

export default function JuniorPlaybackScreen() {
  const { storyId } = useLocalSearchParams<{ storyId: string }>();
  const storyData = allStories.find((story: Story) => story.id === storyId);

  const [appState, setAppState] = useState<"video" | "drawing">("video");
  const [isPlaying, setIsPlaying] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [currentInteraction, setCurrentInteraction] =
    useState<InteractionPoint | null>(null);
  const [completedTimestamps, setCompletedTimestamps] = useState<number[]>([]);

  const videoRef = useRef<Video>(null);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Find the index of current interaction in storyData.interactionPoints
  const currentInteractionIndex =
    storyData && currentInteraction
      ? storyData.interactionPoints.findIndex((p) => p === currentInteraction)
      : 0;

  useEffect(() => {
    if (!storyData) {
      console.error("Story not found!");
    }
  }, [storyData]);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded || !storyData) return;
    const nextInteraction = storyData.interactionPoints.find(
      (p: InteractionPoint) =>
        status.positionMillis >= p.timestamp &&
        !completedTimestamps.includes(p.timestamp)
    );
    if (nextInteraction) {
      videoRef.current?.pauseAsync();
      setIsPlaying(false);
      setCurrentInteraction(nextInteraction);
      setCompletedTimestamps((prev) => [...prev, nextInteraction.timestamp]);
      setAppState("drawing");
    }
  };

  const handleContinueStory = () => {
    setAppState("video");
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
    setIsPlaying((prev) => {
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

  if (!storyData) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "white" }}>Loading Story...</Text>
      </View>
    );
  }

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
      {controlsVisible && appState === "video" && (
        <Pressable style={styles.controlsOverlay} onPress={togglePlayPause}>
          <Text style={styles.controlButtonText}>
            {isPlaying ? "❚❚" : "▶"}
          </Text>
        </Pressable>
      )}
      {appState === "drawing" && currentInteraction && (
        <View style={styles.drawingOverlay}>
          <DrawingInterface
            interaction={currentInteraction}
            onContinueStory={handleContinueStory}
            storyId={storyId}
            interactionIndex={currentInteractionIndex}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  referenceImage: {
    width: 180,
    height: 180,
    marginVertical: 16,
    borderRadius: 12,
  },
  container: { flex: 1, backgroundColor: "#000" },
  videoContainer: { flex: 1 },
  video: { ...StyleSheet.absoluteFillObject },
  drawingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFF8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  controlButtonText: { color: "#fff", fontSize: 60 },
  drawingContainer: {
    flex: 1,
    padding: 16,
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginTop: 40,
  },
  outlineBox: {
    width: 320,
    height: 320,
    backgroundColor: "white",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  toolsSection: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 10,
  },
  colorPalette: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  brushOptions: { flexDirection: "row", justifyContent: "center" },
  brushOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
  },
  brushOptionSelected: { backgroundColor: "#FFE66D" },
  brushPreview: { borderRadius: 100, backgroundColor: "#333" },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  clearButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  submitButton: {
    backgroundColor: "#4ECDC4",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  popupContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  popup: {
    padding: 32,
    backgroundColor: "white",
    borderRadius: 24,
    alignItems: "center",
  },
  popupText: { fontSize: 24, fontWeight: "bold", color: "#333" },
  loaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loaderText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 24,
  },
});
