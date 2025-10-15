import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { off, onDisconnect, onValue, push, ref, set, update } from 'firebase/database';
import { useEffect, useRef, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import Svg, { Path } from 'react-native-svg';
import { database } from '../../firebaseConfig';

// --- Constants ---
const WORD_LIST = ['🐱 Cat', '🐶 Dog', '🌳 Tree', '🏠 House', '⭐ Star', '🌞 Sun', '🌙 Moon', '🚗 Car', '✈️ Plane', '🚂 Train', '🍎 Apple', '🍌 Banana', '🌸 Flower', '☁️ Cloud', '🌈 Rainbow', '🎈 Balloon', '⚽ Ball', '🎂 Cake', '🎁 Gift', '👑 Crown'];
const COLORS = [{ name: 'black', color: '#000000' }, { name: 'red', color: '#FF6B6B' }, { name: 'blue', color: '#4ECDC4' }, { name: 'green', color: '#95E1D3' }, { name: 'yellow', color: '#FFE66D' }, { name: 'purple', color: '#C792EA' }, { name: 'orange', color: '#FF8B4D' }, { name: 'pink', color: '#FF9CEE' }];

// --- Types ---
type Player = { id: string; name: string; score: number; hasGuessed: boolean; };
type GameState = 'lobby' | 'drawing' | 'guessing' | 'reveal' | 'gameover';
type DrawingPath = { path: string; color: string; strokeWidth: number };

// --- Main Game Component ---
export default function ScribbleGame() {
  const router = useRouter();
  
  // Local state (unique to this device)
  const [currentPlayerId] = useState(`player_${Math.random().toString(36).substr(2, 9)}`);
  const [currentPlayerName, setCurrentPlayerName] = useState('');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [joinRoomId, setJoinRoomId] = useState('');
  
  // Synced game state (from Firebase)
  const [gameState, setGameState] = useState<GameState>('lobby');
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [currentDrawer, setCurrentDrawer] = useState<string | null>(null);
  const [currentWord, setCurrentWord] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [round, setRound] = useState(1);
  const [chatMessages, setChatMessages] = useState<Array<{player: string, message: string, isCorrect?: boolean}>>([]);
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  
  // Local UI state
  const [guessInput, setGuessInput] = useState('');
  const [showWordModal, setShowWordModal] = useState(false);
  const [wordChoices, setWordChoices] = useState<string[]>([]);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(4);
  const currentPath = useRef<string>('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Hooks and Functions ---

  useEffect(() => {
    const loadPlayerName = async () => {
      const storedName = await AsyncStorage.getItem('playerName');
      if (storedName) setCurrentPlayerName(storedName);
    };
    loadPlayerName();
  }, []);

  useEffect(() => {
    if (!roomId) return;
    const roomRef = ref(database, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGameState(data.gameState || 'lobby');
        setPlayers(data.players || {});
        setCurrentDrawer(data.currentDrawer || null);
        setCurrentWord(data.currentWord || '');
        setTimeLeft(data.timeLeft !== undefined ? data.timeLeft : 60);
        setRound(data.round || 1);
        setChatMessages(data.chatMessages ? Object.values(data.chatMessages) : []);
        setPaths(data.paths ? Object.values(data.paths) : []);
      } else {
        alert("Room not found or has been closed.");
        setRoomId(null);
      }
    });
    return () => off(roomRef, 'value', unsubscribe);
  }, [roomId]);

  useEffect(() => {
    if ((gameState === 'drawing' || gameState === 'guessing') && timeLeft > 0) {
      const playersArray = Object.values(players);
      if (playersArray.length > 0 && playersArray[0].id === currentPlayerId) {
        timerRef.current = setTimeout(() => {
          if (roomId) {
            const newTime = timeLeft - 1;
            const roomRef = ref(database, `rooms/${roomId}`);
            if (newTime <= 0) {
              update(roomRef, { gameState: 'reveal' });
            } else {
              update(roomRef, { timeLeft: newTime });
            }
          }
        }, 1000);
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gameState, timeLeft, players, currentPlayerId, roomId]);

  const handleCreateGame = async () => {
    if (!currentPlayerName.trim()) return alert('Please enter your name!');
    await AsyncStorage.setItem('playerName', currentPlayerName.trim());
    const newRoomId = Math.random().toString(36).substring(2, 6).toUpperCase();
    await set(ref(database, `rooms/${newRoomId}`), { gameState: 'lobby', players: {}, round: 1 });
    joinGame(newRoomId);
  };

  const handleJoinExistingGame = async () => {
    if (!currentPlayerName.trim()) return alert('Please enter your name!');
    if (!joinRoomId.trim()) return alert('Please enter a room code!');
    await AsyncStorage.setItem('playerName', currentPlayerName.trim());
    joinGame(joinRoomId.toUpperCase());
  };

  const joinGame = (targetRoomId: string) => {
    setRoomId(targetRoomId);
    const playerRef = ref(database, `rooms/${targetRoomId}/players/${currentPlayerId}`);
    set(playerRef, { id: currentPlayerId, name: currentPlayerName.trim(), score: 0, hasGuessed: false });
    onDisconnect(playerRef).remove();
  };

  const handleStartGame = () => {
    if (!roomId) return;
    if (Object.values(players).length < 2) return alert('Need at least 2 players to start!');
    startNewRound();
  };

  const startNewRound = () => {
    if (!roomId) return;
    const playersArray = Object.values(players);
    const drawerIndex = (round - 1) % playersArray.length;
    const newDrawer = playersArray[drawerIndex].id;
    
    const updatedPlayers: Record<string, Player> = {};
    playersArray.forEach(p => { updatedPlayers[p.id] = {...p, hasGuessed: false }; });
    
    if (newDrawer === currentPlayerId) {
      setWordChoices(getRandomWords(3));
      setShowWordModal(true);
    }
    
    update(ref(database, `rooms/${roomId}`), {
      currentDrawer: newDrawer, gameState: 'guessing', timeLeft: 60,
      paths: null, chatMessages: null, players: updatedPlayers, currentWord: '',
    });
  };
  
  const getRandomWords = (count: number): string[] => {
    const shuffled = [...WORD_LIST].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const handleWordChoice = (word: string) => {
    if (roomId) update(ref(database, `rooms/${roomId}`), { currentWord: word, gameState: 'drawing' });
    setShowWordModal(false);
  };

  const handleGuess = () => {
    if (!guessInput.trim() || !roomId || players[currentPlayerId]?.hasGuessed) return;
    const isCorrect = guessInput.toLowerCase().trim() === currentWord.split(' ')[1]?.toLowerCase();
    
    push(ref(database, `rooms/${roomId}/chatMessages`), { player: currentPlayerName, message: guessInput, isCorrect });

    if (isCorrect) {
      const pointsEarned = Math.max(100 - (60 - timeLeft) * 2, 20);
      const playerRef = ref(database, `rooms/${roomId}/players/${currentPlayerId}`);
      update(playerRef, { score: (players[currentPlayerId].score || 0) + pointsEarned, hasGuessed: true });
    }
    setGuessInput('');
  };

  const handleDrawingStart = (event: any) => {
    if (currentDrawer !== currentPlayerId) return;
    const { locationX, locationY } = event.nativeEvent;
    currentPath.current = `M${locationX.toFixed(0)},${locationY.toFixed(0)}`;
  };

  const handleDrawingMove = (event: any) => {
    if (currentDrawer !== currentPlayerId) return;
    const { locationX, locationY } = event.nativeEvent;
    currentPath.current += ` L${locationX.toFixed(0)},${locationY.toFixed(0)}`;
  };

  const handleDrawingEnd = () => {
    if (currentDrawer !== currentPlayerId || !roomId || !currentPath.current) return;
    const newPath = { path: currentPath.current, color: currentColor, strokeWidth: brushSize };
    push(ref(database, `rooms/${roomId}/paths`), newPath);
    currentPath.current = '';
  };

  const clearCanvas = () => {
    if (roomId) update(ref(database, `rooms/${roomId}`), { paths: null });
  };

  // --- Render Functions ---

  const renderInitialScreen = () => (
    <View style={styles.lobbyContainer}>
      <Animatable.Text animation="bounceIn" style={styles.gameTitle}>🎨 Scribble Guess! 🎨</Animatable.Text>
      <View style={styles.joinSection}>
        <TextInput style={styles.nameInput} placeholder="Enter your name" value={currentPlayerName} onChangeText={setCurrentPlayerName} maxLength={15} />
        <TouchableOpacity style={styles.joinButton} onPress={handleCreateGame}><Text style={styles.joinButtonText}>Create Game</Text></TouchableOpacity>
        <Text style={styles.orText}>OR</Text>
        <TextInput style={styles.nameInput} placeholder="Enter room code" value={joinRoomId} onChangeText={setJoinRoomId} maxLength={4} autoCapitalize="characters" />
        <TouchableOpacity style={[styles.joinButton, styles.joinExistingButton]} onPress={handleJoinExistingGame}><Text style={styles.joinButtonText}>Join Game</Text></TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}><Text style={styles.backButtonText}>← Back</Text></TouchableOpacity>
    </View>
  );

  const renderLobby = () => {
    const playersArray = Object.values(players);
    return (
      <View style={styles.lobbyContainer}>
        <Text style={styles.roomCode}>Room Code: {roomId}</Text>
        <View style={styles.playersListContainer}>
          <Text style={styles.playersTitle}>Players ({playersArray.length})</Text>
          <ScrollView>
            {playersArray.map((player) => (<Animatable.View key={player.id} animation="fadeInRight" style={styles.playerCard}><Text style={styles.playerName}>{player.name}</Text></Animatable.View>))}
          </ScrollView>
        </View>
        {playersArray.length >= 2 && (<Animatable.View animation="pulse" iterationCount="infinite"><TouchableOpacity style={styles.startButton} onPress={handleStartGame}><Text style={styles.startButtonText}>🎮 Start Game!</Text></TouchableOpacity></Animatable.View>)}
        <TouchableOpacity style={styles.backButton} onPress={() => setRoomId(null)}><Text style={styles.backButtonText}>← Leave Room</Text></TouchableOpacity>
      </View>
    );
  };

  const renderDrawing = () => {
    const isDrawer = currentDrawer === currentPlayerId;
    const drawerName = players[currentDrawer || '']?.name || 'Someone';
    return (
      <View style={styles.gameContainer}>
        <View style={styles.gameHeader}>
          <View style={styles.timerContainer}><Text style={styles.timerText}>⏱️ {timeLeft}s</Text></View>
          <View style={styles.roundContainer}><Text style={styles.roundText}>Round {round}/{Object.keys(players).length}</Text></View>
        </View>
        <View style={styles.wordContainer}>
          {isDrawer ? <Text style={styles.wordText}>Draw: {currentWord}</Text> : <Text style={styles.wordHint}>{drawerName} is drawing...</Text>}
        </View>
        <View style={styles.canvas} onStartShouldSetResponder={() => true} onResponderGrant={handleDrawingStart} onResponderMove={handleDrawingMove} onResponderRelease={handleDrawingEnd}>
          <Svg height="100%" width="100%">{paths.map((item, index) => (<Path key={index} d={item.path} stroke={item.color} strokeWidth={item.strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />))}</Svg>
        </View>
        <View style={styles.bottomSection}>
          {isDrawer ? (
            <View style={styles.drawingTools}>
              <View style={styles.colorPalette}>{COLORS.map(({ color }) => (<TouchableOpacity key={color} style={[styles.colorButton, { backgroundColor: color }, currentColor === color && styles.selectedColor]} onPress={() => setCurrentColor(color)} />))}</View>
              <TouchableOpacity style={styles.clearButton} onPress={clearCanvas}><Text style={styles.clearButtonText}>🗑️</Text></TouchableOpacity>
            </View>
          ) : (
            <View>
              <View style={styles.chatContainer}>
                <ScrollView>
                  {chatMessages.map((msg, idx) => (
                    <View key={idx} style={[styles.chatMessage, msg.isCorrect && styles.correctGuess]}>
                      <Text style={styles.chatPlayer}>{msg.player}: </Text>
                      <Text>{msg.isCorrect ? '✅ Got it!' : msg.message}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.guessContainer}>
                <TextInput style={styles.guessInput} placeholder="Type your guess..." value={guessInput} onChangeText={setGuessInput} onSubmitEditing={handleGuess} editable={!players[currentPlayerId]?.hasGuessed} />
                <TouchableOpacity style={styles.guessButton} onPress={handleGuess} disabled={players[currentPlayerId]?.hasGuessed}><Text style={styles.guessButtonText}>Send</Text></TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderReveal = () => (
    <View style={styles.revealContainer}>
      <Animatable.Text animation="bounceIn" style={styles.revealTitle}>The word was:</Animatable.Text>
      <Animatable.Text animation="zoomIn" delay={300} style={styles.revealWord}>{currentWord}</Animatable.Text>
    </View>
  );

  const renderGameOver = () => {
    const sortedPlayers = Object.values(players).sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];
    return (
      <View style={styles.gameOverContainer}>
        <Animatable.Text animation="bounceIn" style={styles.gameOverTitle}>🎉 Game Over! 🎉</Animatable.Text>
        {winner && <Animatable.View animation="tada" delay={500} style={styles.winnerCard}><Text style={styles.winnerEmoji}>👑</Text><Text style={styles.winnerText}>Winner!</Text><Text style={styles.winnerName}>{winner.name}</Text><Text style={styles.winnerScore}>{winner.score} points</Text></Animatable.View>}
        <View style={styles.finalScoreboard}>
          <Text style={styles.finalScoreTitle}>Final Scores</Text>
          {sortedPlayers.map((player, index) => (
            <Animatable.View key={player.id} animation="fadeInUp" delay={index * 150} style={styles.finalScoreItem}><Text style={styles.finalScoreRank}>#{index + 1}</Text><Text style={styles.finalScoreName}>{player.name}</Text><Text style={styles.finalScorePoints}>{player.score} pts</Text></Animatable.View>
          ))}
        </View>
        <TouchableOpacity style={styles.playAgainButton} onPress={() => setRoomId(null)}><Text style={styles.playAgainText}>🔄 Play Again</Text></TouchableOpacity>
      </View>
    );
  };
  
  const renderContent = () => {
    if (!roomId) return renderInitialScreen();
    switch (gameState) {
      case 'lobby': return renderLobby();
      case 'drawing': case 'guessing': return renderDrawing();
      case 'reveal': return renderReveal();
      case 'gameover': return renderGameOver();
      default: return <Text>Loading...</Text>;
    }
  };

  return (
    <View style={styles.container}>
      {renderContent()}
      <Modal visible={showWordModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <Animatable.View animation="zoomIn" style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose a word to draw!</Text>
            {wordChoices.map((word) => (<TouchableOpacity key={word} style={styles.wordChoice} onPress={() => handleWordChoice(word)}><Text style={styles.wordChoiceText}>{word}</Text></TouchableOpacity>))}
          </Animatable.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F2FE',
  },
  lobbyContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  gameTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#0EA5E9',
    textAlign: 'center',
    marginBottom: 30,
  },
  roomCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
    textAlign: 'center',
    marginBottom: 20,
  },
  joinSection: {
    marginBottom: 30,
  },
  nameInput: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#BAE6FF',
  },
  bottomSection: { 
    marginTop: 10 
  },
  joinButton: {
    backgroundColor: '#4ECDC4',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinExistingButton: {
    backgroundColor: '#8B5CF6',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366F1',
    marginVertical: 15,
  },
  playersListContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    maxHeight: 200,
  },
  playersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 10,
  },
  playersList: {
    maxHeight: 150,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    marginBottom: 8,
  },
  playerEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  startButton: {
    backgroundColor: '#8B5CF6',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 15,
  },
  startButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    alignItems: 'center',
    padding: 10,
  },
  backButtonText: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600',
  },
  gameContainer: {
    flex: 1,
    padding: 10,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timerContainer: {
    backgroundColor: '#FF6B6B',
    padding: 10,
    borderRadius: 12,
  },
  timerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  roundContainer: {
    backgroundColor: '#4ECDC4',
    padding: 10,
    borderRadius: 12,
  },
  roundText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  wordContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  wordText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#334155',
  },
  wordHint: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
  canvasContainer: {
    marginBottom: 10,
  },
  canvas: {
    backgroundColor: 'white',
    height: 280,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#BAE6FF',
  },
  drawingTools: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  colorPalette: {
    flexDirection: 'row',
    flex: 1,
  },
  colorButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  selectedColor: {
    borderColor: '#333',
    borderWidth: 3,
  },
  clearButton: {
    backgroundColor: '#FF6B6B',
    padding: 10,
    borderRadius: 8,
  },
  clearButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  guessContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  guessInput: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#BAE6FF',
  },
  guessButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  guessButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  chatContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    height: 100,
    marginBottom: 10,
  },
  chatScroll: {
    flex: 1,
  },
  chatMessage: {
    padding: 6,
    marginBottom: 4,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  correctGuess: {
    backgroundColor: '#D1FAE5',
  },
  chatPlayer: {
    fontWeight: 'bold',
    color: '#334155',
  },
  chatText: {
    color: '#64748B',
  },
  miniScoreboard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
  },
  miniScoreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  miniScoreName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  miniScorePoints: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  revealContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  revealTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 20,
  },
  revealWord: {
    fontSize: 48,
    fontWeight: '900',
    color: '#8B5CF6',
    marginBottom: 30,
  },
  nextRoundText: {
    fontSize: 18,
    color: '#6366F1',
    fontWeight: '600',
  },
  gameOverContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0EA5E9',
    textAlign: 'center',
    marginBottom: 30,
  },
  winnerCard: {
    backgroundColor: '#FCD34D',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 4,
    borderColor: 'white',
  },
  winnerEmoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  winnerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#78350F',
  },
  winnerName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#78350F',
  },
  winnerScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#78350F',
    marginTop: 5,
  },
  finalScoreboard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
  },
  finalScoreTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 15,
    textAlign: 'center',
  },
  finalScoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    marginBottom: 8,
  },
  finalScoreRank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5CF6',
    width: 40,
  },
  finalScoreName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  finalScorePoints: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  playAgainButton: {
    backgroundColor: '#8B5CF6',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  playAgainText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 20,
  },
  wordChoice: {
    backgroundColor: '#E0F2FE',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#BAE6FF',
  },
  wordChoiceText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0EA5E9',
    textAlign: 'center',
  },
});