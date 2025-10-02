// app/(tabs)/index.tsx
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import * as Animatable from "react-native-animatable";
import { Audio } from "expo-av";

export default function Index() {
  const router = useRouter();
  const [showAgeSelection, setShowAgeSelection] = useState(false);

  useEffect(() => {
    let sound: Audio.Sound | null = null;

    async function playSound() {
      const { sound: playbackObj } = await Audio.Sound.createAsync(
        require("../../assets/logo_sound_effect.mp3")
      );
      sound = playbackObj;
      await sound.playAsync();
    }

    playSound();

    // Show age selection after logo animation
    const timeout = setTimeout(() => {
      setShowAgeSelection(true);
    }, 3500);

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      clearTimeout(timeout);
    };
  }, []);

  const handleAgeSelection = (ageGroup: 'young' | 'older') => {
    if (ageGroup === 'young') {
      router.push("/(tabs)/landing" as never);
    } else {
      router.push("/(tabs)/scribble" as never);
    }
  };

  if (!showAgeSelection) {
    // Logo splash screen
    return (
      <View style={styles.container}>
        <Animatable.Text
          style={styles.logoTextFirst}
          duration={2000}
          animation="fadeIn"
        >
          Doodle
        </Animatable.Text>

        <Animatable.Text
          style={styles.logoTextSecond}
          duration={2000}
          animation="fadeInUp"
        >
          Minds
        </Animatable.Text>

        <Animatable.Text
          style={styles.tagline}
          duration={500}
          delay={2500}
          animation="lightSpeedIn"
        >
          The mindful sketch!
        </Animatable.Text>
      </View>
    );
  }

  // Age selection screen
  return (
    <View style={styles.ageContainer}>
      {/* Floating decorative elements */}
      <Animatable.Text
        animation="pulse"
        iterationCount="infinite"
        duration={2000}
        style={[styles.floatingIcon, { top: 60, left: 40 }]}
      >
        🎨
      </Animatable.Text>
      <Animatable.Text
        animation="pulse"
        iterationCount="infinite"
        duration={2500}
        delay={500}
        style={[styles.floatingIcon, { top: 80, right: 50 }]}
      >
        ✏️
      </Animatable.Text>
      <Animatable.Text
        animation="pulse"
        iterationCount="infinite"
        duration={3000}
        delay={1000}
        style={[styles.floatingIcon, { bottom: 100, left: 30 }]}
      >
        🖍️
      </Animatable.Text>

      <Animatable.View
        animation="fadeIn"
        duration={800}
        style={styles.contentWrapper}
      >
        {/* Title */}
        <Animatable.Text
          animation="bounceIn"
          duration={1000}
          style={styles.ageTitle}
        >
          How old are you? 🎂
        </Animatable.Text>

        <Animatable.Text
          animation="fadeInUp"
          delay={300}
          duration={800}
          style={styles.ageSubtitle}
        >
          Pick your adventure!
        </Animatable.Text>

        {/* Age Selection Cards */}
        <View style={styles.cardsContainer}>
          {/* Young Kids Card */}
          <Animatable.View
            animation="bounceInLeft"
            delay={600}
            duration={1000}
          >
            <TouchableOpacity
              style={[styles.ageCard, styles.youngCard]}
              onPress={() => handleAgeSelection('young')}
              activeOpacity={0.8}
            >
              <View style={styles.cardIconContainer}>
                <Text style={styles.cardIcon}>🧸</Text>
              </View>
              <Text style={styles.cardTitle}>2-5 Years</Text>
              <Text style={styles.cardSubtitle}>Story Time! 📖</Text>
              <View style={styles.cardFeatures}>
                <Text style={styles.featureText}>✨ Listen & Imagine</Text>
                <Text style={styles.featureText}>🎵 Fun Sounds</Text>
                <Text style={styles.featureText}>🌈 Colorful Stories</Text>
              </View>
            </TouchableOpacity>
          </Animatable.View>

          {/* Older Kids Card */}
          <Animatable.View
            animation="bounceInRight"
            delay={600}
            duration={1000}
          >
            <TouchableOpacity
              style={[styles.ageCard, styles.olderCard]}
              onPress={() => handleAgeSelection('older')}
              activeOpacity={0.8}
            >
              <View style={styles.cardIconContainer}>
                <Text style={styles.cardIcon}>🎨</Text>
              </View>
              <Text style={styles.cardTitle}>6+ Years</Text>
              <Text style={styles.cardSubtitle}>Scribble Fun! ✏️</Text>
              <View style={styles.cardFeatures}>
                <Text style={styles.featureText}>🖌️ Draw & Create</Text>
                <Text style={styles.featureText}>🎯 Cool Games</Text>
                <Text style={styles.featureText}>💫 Show Your Art</Text>
              </View>
            </TouchableOpacity>
          </Animatable.View>
        </View>

        {/* Bottom decoration */}
        <Animatable.View
          animation="slideInUp"
          delay={1200}
          duration={1000}
          style={styles.bottomDecoration}
        >
          <Text style={styles.decorationEmoji}>🌟</Text>
          <Text style={styles.decorationEmoji}>🎈</Text>
          <Text style={styles.decorationEmoji}>🦄</Text>
          <Text style={styles.decorationEmoji}>🎪</Text>
        </Animatable.View>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Logo screen styles
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  logoTextFirst: {
    color: "white",
    fontSize: 36,
    fontWeight: "800",
  },
  logoTextSecond: {
    color: "#ff4d6d",
    fontSize: 36,
    fontWeight: "800",
  },
  tagline: {
    color: "white",
    fontSize: 10,
    fontWeight: "400",
  },

  // Age selection screen styles
  ageContainer: {
    flex: 1,
    backgroundColor: "#FFF5F7",
    padding: 20,
  },
  floatingIcon: {
    position: 'absolute',
    fontSize: 25,
    opacity: 0.4,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 60,
  },
  ageTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FF6B9D',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 107, 157, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  ageSubtitle: {
    fontSize: 16,
    color: '#8B5CF6',
    marginBottom: 25,
    fontWeight: '600',
  },
  cardsContainer: {
    width: '100%',
    gap: 20,
  },
  ageCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 3,
    marginBottom: 12,
  },
  youngCard: {
    borderColor: '#FFB6C1',
    backgroundColor: '#FFF0F5',
  },
  olderCard: {
    borderColor: '#B8E6FF',
    backgroundColor: '#F0F9FF',
  },
  cardIconContainer: {
    marginBottom: 10,
  },
  cardIcon: {
    fontSize: 50,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B9D',
    marginBottom: 12,
  },
  cardFeatures: {
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  bottomDecoration: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 25,
  },
  decorationEmoji: {
    fontSize: 30,
  },
});