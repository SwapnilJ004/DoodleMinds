// app/(tabs)/landing.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';

import audioSource from "../../assets/BackgroundMusic.mp3";
import { useAudioPlayer } from 'expo-audio';

export default function LandingPage() {
  const router = useRouter();
  const player = useAudioPlayer(audioSource);

  const pathName = usePathname();

  useEffect(() => {
    if(pathName == '/landing')
    {
      player.seekTo(10);
      player.play();
      player.loop = true;
    }
  })

  return (
    <View style={styles.container}>
      {/* Title */}
      <Animatable.Text
        animation="fadeInDown"
        duration={1500}
        style={styles.title}
      >
        Welcome to
      </Animatable.Text>

      <Animatable.Text
        animation="pulse"
        iterationCount="infinite"
        style={styles.appName}
      >
        Doodle Minds 🎨
      </Animatable.Text>

      {/* Subtitle */}
      <Animatable.Text
        animation="fadeInUp"
        delay={800}
        duration={1500}
        style={styles.subtitle}
      >
        Let your imagination guide the story!
      </Animatable.Text>

      {/* Button */}
      <Animatable.View animation="zoomIn" delay={1500} duration={1200}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => router.push('/(tabs)/juniorPlayback')}
        >
          <Text style={styles.playButtonText}>▶ Play Story 1</Text>
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    color: '#ccc',
    marginBottom: 10,
  },
  appName: {
    fontSize: 40,
    fontWeight: '800',
    color: '#ff4d6d',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 40,
    textAlign: 'center',
  },
  playButton: {
    backgroundColor: '#ff4d6d',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#ff4d6d',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
});
