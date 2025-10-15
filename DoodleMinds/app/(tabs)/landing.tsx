import { Audio } from 'expo-av';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useAudioPlayer } from 'expo-audio';
import audioSource from '../../assets/BackgroundMusic.mp3';

export default function LandingPage() {
  const router = useRouter();
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isSoundLoaded, setIsSoundLoaded] = useState(false);
  useEffect(() => {
    async function createSound() {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("../../assets/BackgroundMusic.mp3"),
          { isLooping: true } 
        );
        soundRef.current = sound;
        setIsSoundLoaded(true);
      } catch (error) {
        console.error("Error creating background music:", error);
      }
    }

    createSound();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (isSoundLoaded && soundRef.current) {
        soundRef.current.playAsync();
      }
      return () => {
        if (isSoundLoaded && soundRef.current) {
          soundRef.current.pauseAsync();
        }
      };
    }, [isSoundLoaded])
  );
  // useFocusEffect(
  //   useCallback(() => {
  //     let soundObject: Audio.Sound | null = null;

  //     async function playMusic() {
  //       try {
  //         const { sound } = await Audio.Sound.createAsync(
  //           require("../../assets/BackgroundMusic.mp3"),
  //           { shouldPlay: true, isLooping: true }
  //         );
  //         soundObject = sound;
  //       } catch (error) {
  //         console.error("Error playing background music:", error);
  //       }
  //     }

  //     playMusic();

  //     return () => {
  //       if (soundObject) {
  //         soundObject.unloadAsync();
  //       }
  //     };
  //   }, [])
  // );
  
  return (
    <View style={styles.container}>
      {/* Floating Stars Background Elements */}
      <Animatable.Text animation="pulse" iterationCount="infinite" duration={2000} style={[styles.floatingIcon, { top: 50, left: 30 }]}>⭐</Animatable.Text>
      <Animatable.Text animation="pulse" iterationCount="infinite" duration={2500} delay={500} style={[styles.floatingIcon, { top: 100, right: 40 }]}>🌟</Animatable.Text>
      <Animatable.Text animation="pulse" iterationCount="infinite" duration={3000} delay={1000} style={[styles.floatingIcon, { bottom: 150, left: 50 }]}>✨</Animatable.Text>
      <Animatable.Text animation="pulse" iterationCount="infinite" duration={2200} delay={800} style={[styles.floatingIcon, { bottom: 200, right: 60 }]}>💫</Animatable.Text>

      {/* Main Content Container */}
      <View style={styles.contentContainer}>
        <Animatable.Text animation="fadeInDown" duration={1500} style={styles.title}>
          Welcome to
        </Animatable.Text>

        <Animatable.View animation="bounceIn" duration={1500} style={styles.appNameContainer}>
          <Text style={styles.appName}>Doodle Minds</Text>
          <Animatable.Text animation="rotate" iterationCount="infinite" duration={3000} style={styles.emoji}>🎨</Animatable.Text>
        </Animatable.View>

        <Animatable.View animation="tada" delay={1000} duration={1500} style={styles.badge}>
          <Text style={styles.badgeText}>Adventure Awaits! 🚀</Text>
        </Animatable.View>

        <Animatable.Text animation="fadeInUp" delay={800} duration={1500} style={styles.subtitle}>
          Let your imagination guide the story!
        </Animatable.Text>

        <Animatable.View animation="bounceIn" delay={1500} duration={1200} style={styles.buttonContainer}>
            <TouchableOpacity
                style={[styles.languageButton, styles.englishButton]}
                onPress={() => router.push({ pathname: '/(tabs)/storyList', params: { lang: 'en' } })}
                activeOpacity={0.8}
            >
                <Text style={styles.languageButtonText}>English Stories</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.languageButton, styles.hindiButton]}
                onPress={() => router.push({ pathname: '/(tabs)/storyList', params: { lang: 'hi' } })}
                activeOpacity={0.8}
            >
                <Text style={styles.languageButtonText}>हिन्दी कहानियाँ</Text>
            </TouchableOpacity>
        </Animatable.View>
        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE5EC",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  floatingIcon: { position: "absolute", fontSize: 30, opacity: 0.6 },
  contentContainer: { alignItems: "center", width: "100%" },
  title: {
    fontSize: 24,
    color: "#8B5CF6",
    marginBottom: 10,
    fontWeight: "600",
    textShadowColor: "rgba(139, 92, 246, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  appName: {
    fontSize: 44,
    fontWeight: "900",
    color: "#FF6B9D",
    textShadowColor: "rgba(255, 107, 157, 0.4)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
    letterSpacing: 1,
  },
  emoji: { fontSize: 40, marginLeft: 10 },
  badge: {
    backgroundColor: "#FFA500",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#FFA500",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  badgeText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  subtitle: {
    fontSize: 18,
    color: "#6B7280",
    marginBottom: 40,
    textAlign: "center",
    fontWeight: "500",
    maxWidth: "80%",
  },
  playButton: {
    backgroundColor: "#10B981",
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 35,
    shadowColor: "#10B981",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 4,
    borderColor: "#FFF",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: { color: "#FFF", fontSize: 24, marginRight: 10, fontWeight: "700" },
  playButtonText: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  charactersContainer: { flexDirection: "row", marginTop: 50, gap: 20 },
  character: { fontSize: 40 },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  languageButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  englishButton: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  hindiButton: {
    backgroundColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
  },
  languageButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
