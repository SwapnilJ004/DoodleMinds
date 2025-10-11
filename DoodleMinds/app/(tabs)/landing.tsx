import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { useAudioPlayer } from 'expo-audio';
import audioSource from '../../assets/BackgroundMusic.mp3';

export default function LandingPage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Floating Stars Background Elements */}
      <Animatable.Text animation="pulse" iterationCount="infinite" duration={2000} style={[styles.floatingIcon, { top: 50, left: 30 }]}>⭐</Animatable.Text>
      <Animatable.Text animation="pulse" iterationCount="infinite" duration={2500} delay={500} style={[styles.floatingIcon, { top: 100, right: 40 }]}>🌟</Animatable.Text>
      <Animatable.Text animation="pulse" iterationCount="infinite" duration={3000} delay={1000} style={[styles.floatingIcon, { bottom: 150, left: 50 }]}>✨</Animatable.Text>
      <Animatable.Text animation="pulse" iterationCount="infinite" duration={2200} delay={800} style={[styles.floatingIcon, { bottom: 200, right: 60 }]}>💫</Animatable.Text>

      {/* Main Content Container */}
      <View style={styles.contentContainer}>
        <Animatable.Text animation="fadeInDown" duration={1500} style={styles.title}>Welcome to</Animatable.Text>

        <Animatable.View animation="bounceIn" duration={1500} style={styles.appNameContainer}>
          <Text style={styles.appName}>Doodle Minds</Text>
          <Animatable.Text animation="rotate" iterationCount="infinite" duration={3000} style={styles.emoji}>🎨</Animatable.Text>
        </Animatable.View>

        <Animatable.View animation="tada" delay={1000} duration={1500} style={styles.badge}>
          <Text style={styles.badgeText}>Adventure Awaits! 🚀</Text>
        </Animatable.View>

        <Animatable.Text animation="fadeInUp" delay={800} duration={1500} style={styles.subtitle}>Let your imagination guide the story!</Animatable.Text>

        <Animatable.View animation="bounceIn" delay={1500} duration={1200}>
          <TouchableOpacity
            style={styles.playButton}
            // Corrected navigation to the story list screen
            onPress={() => router.push('/(tabs)/storyList')}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.playIcon}>▶</Text>
              <Text style={styles.playButtonText}>Start Adventure!</Text>
            </View>
          </TouchableOpacity>
        </Animatable.View>

        <Animatable.View animation="slideInUp" delay={2000} duration={1500} style={styles.charactersContainer}>
          <Animatable.Text animation="bounce" iterationCount="infinite" duration={2000} style={styles.character}>🦄</Animatable.Text>
          <Animatable.Text animation="bounce" iterationCount="infinite" duration={2000} delay={300} style={styles.character}>🎈</Animatable.Text>
          <Animatable.Text animation="bounce" iterationCount="infinite" duration={2000} delay={600} style={styles.character}>🌈</Animatable.Text>
        </Animatable.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFE5EC', justifyContent: 'center', alignItems: 'center', padding: 20 },
  floatingIcon: { position: 'absolute', fontSize: 30, opacity: 0.6, },
  contentContainer: { alignItems: 'center', width: '100%', },
  title: { fontSize: 24, color: '#8B5CF6', marginBottom: 10, fontWeight: '600', textShadowColor: 'rgba(139, 92, 246, 0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4, },
  appNameContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, },
  appName: { fontSize: 44, fontWeight: '900', color: '#FF6B9D', textShadowColor: 'rgba(255, 107, 157, 0.4)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 8, letterSpacing: 1, },
  emoji: { fontSize: 40, marginLeft: 10, },
  badge: { backgroundColor: '#FFA500', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginBottom: 20, shadowColor: '#FFA500', shadowOpacity: 0.4, shadowOffset: { width: 0, height: 3 }, shadowRadius: 6, elevation: 4, },
  badgeText: { color: '#FFF', fontSize: 16, fontWeight: '700', },
  subtitle: { fontSize: 18, color: '#6B7280', marginBottom: 40, textAlign: 'center', fontWeight: '500', maxWidth: '80%', },
  playButton: { backgroundColor: '#10B981', paddingVertical: 18, paddingHorizontal: 50, borderRadius: 35, shadowColor: '#10B981', shadowOpacity: 0.5, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, elevation: 8, borderWidth: 4, borderColor: '#FFF', },
  buttonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', },
  playIcon: { color: '#FFF', fontSize: 24, marginRight: 10, fontWeight: '700', },
  playButtonText: { color: '#FFF', fontSize: 22, fontWeight: '800', letterSpacing: 0.5, },
  charactersContainer: { flexDirection: 'row', marginTop: 50, gap: 20, },
  character: { fontSize: 40, },
});