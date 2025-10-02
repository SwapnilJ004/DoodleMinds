import { Text, View, StyleSheet } from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import * as Animatable from "react-native-animatable";
import { Audio } from "expo-av";

export default function Index() {
  const navigation = useRouter();

  useEffect(() => {
    let sound: Audio.Sound | null = null;

    async function playSound() {
      const { sound: playbackObj } = await Audio.Sound.createAsync(
        require("../../assets/logo_sound_effect.mp3") // ✅ use require
      );
      sound = playbackObj;
      await sound.playAsync();
    }

    playSound();

    const timeout = setTimeout(() => {
      navigation.push("/(tabs)/landing" as never);
    }, 4000);

    // cleanup: stop sound + clear timeout
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      clearTimeout(timeout);
    };
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
