import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { allStories } from '../../data';
import { Audio } from 'expo-av';
import { useMusic } from '../useMusic';
import { useMusicStore } from '../useMusicStore';

export default function StoryList() {
  const router = useRouter();
  const { lang } = useLocalSearchParams<{ lang: string }>();
  const filteredStories = useMemo(() => {
    if (!lang) return [];
    return allStories.filter(story => story.language === lang);
  }, [lang]);
  const { resumeMusic, pauseMusic, player } = useMusic();
  const { isPlaying } = useMusicStore();

  useEffect(() => {
    console.log("Focussed", isPlaying);
    if (isPlaying) resumeMusic();
  }, [isPlaying])

  const handleSelectStory = async (storyId: string) => {
    // Pause background music
    await pauseMusic();
    router.push({
      pathname: '/(tabs)/juniorPlayback',
      params: { storyId: storyId },
    });
  };

  // Colorful gradient backgrounds for cards
  const cardColors = [
    ['#FF6B9D', '#FEC163'],
    ['#A8E6CF', '#56CCF2'],
    ['#FFD93D', '#FF9A3C'],
    ['#B4A7D6', '#FDA7DF'],
    ['#82C4F8', '#6FEDD6'],
    ['#FFB6B9', '#FEC8D8'],
  ];
  const getCardColor = (index: number) => cardColors[index % cardColors.length];

  const headerTitle = lang === 'hi'
    ? 'एक कहानी चुनें'
    : 'Story Time!';

  return (
    <View style={styles.container}>
      <View style={styles.starContainer}>
        <Text style={styles.star}>⭐</Text>
        <Text style={[styles.star, styles.star2]}>✨</Text>
        <Text style={[styles.star, styles.star3]}>🌟</Text>
      </View>

      <View style={styles.headerContainer}>
        <Text style={styles.emoji}>📚</Text>
        <Text style={styles.header}>{headerTitle}</Text>
        <Text style={styles.subHeader}>Pick your favorite adventure</Text>
      </View>

      <FlatList
        data={filteredStories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const [color1] = getCardColor(index);
          return (
            <TouchableOpacity
              style={[styles.storyCard, { backgroundColor: color1 }]}
              onPress={() => handleSelectStory(item.id)}
              activeOpacity={0.8}
            >
              <View style={styles.cardContent}>
                <View style={styles.iconCircle}><Text style={styles.bookIcon}>📖</Text></View>
                <View style={styles.textContainer}>
                  <Text style={styles.storyTitle}>{item.title}</Text>
                  <View style={styles.playButton}>
                    <Text style={styles.playIcon}>▶️</Text>
                    <Text style={styles.playText}>Play Story</Text>
                  </View>
                </View>
              </View>
              <View style={styles.dotsContainer}>
                <View style={[styles.dot, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                <View style={[styles.dot, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                <View style={[styles.dot, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No stories found for this language.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
    paddingTop: 60,
  },
  starContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    zIndex: 0,
  },
  star: {
    fontSize: 24,
    opacity: 0.6,
  },
  star2: {
    marginTop: 10,
  },
  star3: {
    marginTop: 5,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  emoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  header: {
    fontSize: 36,
    fontWeight: '800',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subHeader: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  storyCard: {
    borderRadius: 24,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  bookIcon: {
    fontSize: 30,
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
  },
  storyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  playIcon: {
    fontSize: 12,
    marginRight: 5,
  },
  playText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 10,
    right: 15,
    flexDirection: 'row',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#6B7280',
    fontSize: 16
  },
});
