import { Text, View, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { useAudioPlayer } from 'expo-audio';

import audioSource from '../../assets/logo_sound_effect.mp3';

export default function Index() {
  const navigation = useRouter();
  const player = useAudioPlayer(audioSource);

  useEffect(() => {
    player.seekTo(0);
    player.play();
    setTimeout(() => {
      navigation.navigate('/(tabs)/juniorPlayback');
    }, 4000);
  }, []);

  return (
    <View style={{ backgroundColor: "black", flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Animatable.Text style={{ color: 'white', fontSize: 36, fontWeight: '800' }} duration={2000} animation={'fadeIn'}>
        Doodle
      </Animatable.Text>
      <Animatable.Text style={{ color: '#ff4d6d', fontSize: 36, fontWeight: '800' }} duration={2000} animation={'fadeInUp'}>
        Minds
      </Animatable.Text>
      <Animatable.Text style={{ color: 'white', fontSize: 10, fontWeight: '400'}} duration={500} delay={2500} animation={'lightSpeedIn'}>
        The mindful sketch!
      </Animatable.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  },
});
