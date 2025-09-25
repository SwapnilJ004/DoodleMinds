import { Text, View, StyleSheet } from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import * as Animatable from "react-native-animatable";
import { useAudioPlayer } from "expo-audio";

import audioSource from "../../assets/logo_sound_effect.mp3";

export default function Index() {
  const navigation = useRouter();
  const player = useAudioPlayer(audioSource);

  useEffect(() => {
    player.seekTo(0);
    player.play();

    const timeout = setTimeout(() => {
      navigation.push('/(tabs)/landing' as never);
    }, 4000);


    // ✅ cleanup timeout when component unmounts
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <Animatable.Text
        style={{ color: "white", fontSize: 36, fontWeight: "800" }}
        duration={2000}
        animation="fadeIn"
      >
        Doodle
      </Animatable.Text>

      <Animatable.Text
        style={{ color: "#ff4d6d", fontSize: 36, fontWeight: "800" }}
        duration={2000}
        animation="fadeInUp"
      >
        Minds
      </Animatable.Text>

      <Animatable.Text
        style={{ color: "white", fontSize: 10, fontWeight: "400" }}
        duration={500}
        delay={2500}
        animation="lightSpeedIn"
      >
        The mindful sketch!
      </Animatable.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
});
