import { Text, View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';


export default function Index() {
const navigation = useRouter();

  useEffect(() => {
    setTimeout(()=> {
      navigation.navigate('/(tabs)/juniorPlayback');
    }, 3000);
  }, []);

  return (
    // <View>
      <View style={{ backgroundColor: "black", flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Animatable.Text style={{color: 'white', fontSize:36, fontWeight: '800'}} duration={2000} animation={'fadeIn'}>
          Doodle
        </Animatable.Text>
        <Animatable.Text style={{color: 'pink', fontSize:36, fontWeight: '800'}} duration={2000} animation={'fadeInUp'}>
          Minds
        </Animatable.Text>
      </View>
      /* <View style={styles.container}>
        <Text style={styles.text}>Home screen</Text>
        <Link href='./juniorPlayback' style={styles.button}>
          Go to Home screen
        </Link>
      </View> */
    
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
