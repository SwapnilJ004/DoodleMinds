// app/(tabs)/scribble.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import * as Animatable from 'react-native-animatable';

// Word list for the game
const WORD_LIST = [
  '🐱 Cat', '🐶 Dog', '🌳 Tree', '🏠 House', '⭐ Star', 
  '🌞 Sun', '🌙 Moon', '🚗 Car', '✈️ Plane', '🚂 Train',
  '🍎 Apple', '🍌 Banana', '🌸 Flower', '☁️ Cloud', '🌈 Rainbow',
  '🎈 Balloon', '⚽ Ball', '🎂 Cake', '🎁 Gift', '👑 Crown'
];

const COLORS = [
  { name: 'black', color: '#000000' },
  { name: 'red', color: '#FF6B6B' },
  { name: 'blue', color: '#4ECDC4' },
  { name: 'green', color: '#95E1D3' },
  { name: 'yellow', color: '#FFE66D' },
  { name: 'purple', color: '#C792EA' },
  { name: 'orange', color: '#FF8B4D' },
  { name: 'pink', color: '#FF9CEE' },
];

type Player = {
  id: string;
  name: string;
  score: number;
  hasGuessed: boolean;
};

type GameState = 'lobby' | 'drawing' | 'guessing' | 'reveal' | 'gameover';

export default function ScribbleGame() {
  const router = useRouter();
  
  // Game state
  const [gameState, setGameState] = useState<GameState>('lobby');
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerName, setCurrentPlayerName] = useState('');
  const [currentDrawer, setCurrentDrawer] = useState<string | null>(null);
  const [currentWord, setCurrentWord] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [round, setRound] = useState(1);
  const [guessInput, setGuessInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{player: string, message: string, isCorrect?: boolean}>>([]);
  const [showWordModal, setShowWordModal] = useState(false);
  const [wordChoices, setWordChoices] = useState<string[]>([]);
  
  // Drawing state
  const [paths, setPaths] = useState<string[]>([]);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(4);
  const currentPath = useRef<string>('');
  
  // Timer
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState('');

  // Generate random player ID on mount
  useEffect(() => {
    setCurrentPlayerId(`player_${Math.random().toString(36).substr(2, 9)}`);
  }, []);

  // Timer logic
  useEffect(() => {
    if (gameState === 'drawing' || gameState === 'guessing') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const handleJoinGame = () => {
    if (currentPlayerName.trim()) {
      const newPlayer: Player = {
        id: currentPlayerId,
        name: currentPlayerName.trim(),
        score: 0,
        hasGuessed: false,
      };
      setPlayers([...players, newPlayer]);
      setCurrentPlayerName('');
    }
  };

  const handleStartGame = () => {
    if (players.length < 2) {
      alert('Need at least 2 players to start!');
      return;
    }
    startNewRound();
  };

  const startNewRound = () => {
    // Select random drawer
    const drawerIndex = (round - 1) % players.length;
    setCurrentDrawer(players[drawerIndex].id);
    
    // Reset player guessed status
    setPlayers(prev => prev.map(p => ({ ...p, hasGuessed: false })));
    
    // If current player is drawer, show word choices
    if (players[drawerIndex].id === currentPlayerId) {
      const choices = getRandomWords(3);
      setWordChoices(choices);
      setShowWordModal(true);
    } else {
      setGameState('guessing');
      setTimeLeft(60);
    }
    
    setPaths([]);
    setChatMessages([]);
    setGuessInput('');
  };

  const getRandomWords = (count: number): string[] => {
    const shuffled = [...WORD_LIST].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const handleWordChoice = (word: string) => {
    setCurrentWord(word);
    setShowWordModal(false);
    setGameState('drawing');
    setTimeLeft(60);
  };

  const handleTimeUp = () => {
    setGameState('reveal');
    setTimeout(() => {
      if (round >= players.length) {
        setGameState('gameover');
      } else {
        setRound(prev => prev + 1);
        startNewRound();
      }
    }, 5000);
  };

  const handleGuess = () => {
    if (!guessInput.trim()) return;
    
    const isCorrect = guessInput.toLowerCase().trim() === currentWord.split(' ')[1].toLowerCase();
    
    const player = players.find(p => p.id === currentPlayerId);
    if (!player || player.hasGuessed) return;

    setChatMessages(prev => [
      ...prev,
      { player: player.name, message: guessInput, isCorrect }
    ]);

    if (isCorrect) {
      // Award points
      const pointsEarned = Math.max(100 - (60 - timeLeft) * 2, 20);
      setPlayers(prev => prev.map(p => 
        p.id === currentPlayerId 
          ? { ...p, score: p.score + pointsEarned, hasGuessed: true }
          : p
      ));
      
      // Check if all players have guessed
      const allGuessed = players.filter(p => p.id !== currentDrawer).every(p => 
        p.hasGuessed || p.id === currentPlayerId
      );
      
      if (allGuessed) {
        handleTimeUp();
      }
    } else {
      setPlayers(prev => prev.map(p => 
        p.id === currentPlayerId ? { ...p, hasGuessed: true } : p
      ));
    }

    setGuessInput('');
  };

  // Drawing functions
  const handleDrawingStart = (event: any) => {
    if (currentDrawer !== currentPlayerId) return;
    const { locationX, locationY } = event.nativeEvent;
    currentPath.current = `M${locationX.toFixed(0)},${locationY.toFixed(0)}`;
    setPaths(prev => [...prev, currentPath.current]);
  };

  const handleDrawingMove = (event: any) => {
    if (currentDrawer !== currentPlayerId) return;
    const { locationX, locationY } = event.nativeEvent;
    const newPoint = ` L${locationX.toFixed(0)},${locationY.toFixed(0)}`;
    currentPath.current += newPoint;
    setPaths(prev => [...prev.slice(0, -1), currentPath.current]);
  };

  const clearCanvas = () => {
    setPaths([]);
  };

  // Render functions
  const renderLobby = () => (
    <View style={styles.lobbyContainer}>
      <Animatable.Text animation="bounceIn" style={styles.gameTitle}>
        🎨 Scribble Guess! 🎨
      </Animatable.Text>
      
      <View style={styles.joinSection}>
        <TextInput
          style={styles.nameInput}
          placeholder="Enter your name"
          value={currentPlayerName}
          onChangeText={setCurrentPlayerName}
          maxLength={15}
        />
        <TouchableOpacity style={styles.joinButton} onPress={handleJoinGame}>
          <Text style={styles.joinButtonText}>Join Game</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.playersListContainer}>
        <Text style={styles.playersTitle}>Players ({players.length})</Text>
        <ScrollView style={styles.playersList}>
          {players.map((player, index) => (
            <Animatable.View
              key={player.id}
              animation="fadeInRight"
              delay={index * 100}
              style={styles.playerCard}
            >
              <Text style={styles.playerEmoji}>👤</Text>
              <Text style={styles.playerName}>{player.name}</Text>
            </Animatable.View>
          ))}
        </ScrollView>
      </View>

      {players.length >= 2 && (
        <Animatable.View animation="pulse" iterationCount="infinite">
          <TouchableOpacity style={styles.startButton} onPress={handleStartGame}>
            <Text style={styles.startButtonText}>🎮 Start Game!</Text>
          </TouchableOpacity>
        </Animatable.View>
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDrawing = () => {
    const isDrawer = currentDrawer === currentPlayerId;
    const drawerName = players.find(p => p.id === currentDrawer)?.name || 'Someone';

    return (
      <View style={styles.gameContainer}>
        {/* Header */}
        <View style={styles.gameHeader}>
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>⏱️ {timeLeft}s</Text>
          </View>
          <View style={styles.roundContainer}>
            <Text style={styles.roundText}>Round {round}/{players.length}</Text>
          </View>
        </View>

        {/* Word display */}
        <View style={styles.wordContainer}>
          {isDrawer ? (
            <Text style={styles.wordText}>Draw: {currentWord}</Text>
          ) : (
            <Text style={styles.wordHint}>
              {drawerName} is drawing... Guess the word!
            </Text>
          )}
        </View>

        {/* Canvas */}
        <View style={styles.canvasContainer}>
          <View
            style={styles.canvas}
            onStartShouldSetResponder={() => isDrawer}
            onResponderGrant={handleDrawingStart}
            onResponderMove={handleDrawingMove}
          >
            <Svg height="100%" width="100%" viewBox="0 0 350 350">
              {paths.map((path, idx) => (
                <Path
                  key={idx}
                  d={path}
                  stroke={currentColor}
                  strokeWidth={brushSize}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
            </Svg>
          </View>

          {isDrawer && (
            <View style={styles.drawingTools}>
              <View style={styles.colorPalette}>
                {COLORS.map(({ color }) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorButton,
                      { backgroundColor: color },
                      currentColor === color && styles.selectedColor,
                    ]}
                    onPress={() => setCurrentColor(color)}
                  />
                ))}
              </View>
              <TouchableOpacity style={styles.clearButton} onPress={clearCanvas}>
                <Text style={styles.clearButtonText}>🗑️ Clear</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Guess input */}
        {!isDrawer && (
          <View style={styles.guessContainer}>
            <TextInput
              style={styles.guessInput}
              placeholder="Type your guess..."
              value={guessInput}
              onChangeText={setGuessInput}
              onSubmitEditing={handleGuess}
              editable={!players.find(p => p.id === currentPlayerId)?.hasGuessed}
            />
            <TouchableOpacity 
              style={styles.guessButton} 
              onPress={handleGuess}
              disabled={players.find(p => p.id === currentPlayerId)?.hasGuessed}
            >
              <Text style={styles.guessButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Chat/Guesses */}
        <View style={styles.chatContainer}>
          <ScrollView style={styles.chatScroll}>
            {chatMessages.map((msg, idx) => (
              <View
                key={idx}
                style={[
                  styles.chatMessage,
                  msg.isCorrect && styles.correctGuess,
                ]}
              >
                <Text style={styles.chatPlayer}>{msg.player}: </Text>
                <Text style={styles.chatText}>
                  {msg.isCorrect ? '✅ Got it!' : msg.message}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Scoreboard */}
        <View style={styles.miniScoreboard}>
          {players.map(player => (
            <View key={player.id} style={styles.miniScoreItem}>
              <Text style={styles.miniScoreName}>
                {player.id === currentDrawer ? '✏️ ' : ''}
                {player.name}
              </Text>
              <Text style={styles.miniScorePoints}>{player.score}pts</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderReveal = () => (
    <View style={styles.revealContainer}>
      <Animatable.Text animation="bounceIn" style={styles.revealTitle}>
        The word was:
      </Animatable.Text>
      <Animatable.Text animation="zoomIn" delay={300} style={styles.revealWord}>
        {currentWord}
      </Animatable.Text>
      <Text style={styles.nextRoundText}>
        {round >= players.length ? 'Final Scores!' : 'Next round starting...'}
      </Text>
    </View>
  );

  const renderGameOver = () => {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];

    return (
      <View style={styles.gameOverContainer}>
        <Animatable.Text animation="bounceIn" style={styles.gameOverTitle}>
          🎉 Game Over! 🎉
        </Animatable.Text>
        
        <Animatable.View animation="tada" delay={500} style={styles.winnerCard}>
          <Text style={styles.winnerEmoji}>👑</Text>
          <Text style={styles.winnerText}>Winner!</Text>
          <Text style={styles.winnerName}>{winner.name}</Text>
          <Text style={styles.winnerScore}>{winner.score} points</Text>
        </Animatable.View>

        <View style={styles.finalScoreboard}>
          <Text style={styles.finalScoreTitle}>Final Scores</Text>
          {sortedPlayers.map((player, index) => (
            <Animatable.View
              key={player.id}
              animation="fadeInUp"
              delay={index * 150}
              style={styles.finalScoreItem}
            >
              <Text style={styles.finalScoreRank}>#{index + 1}</Text>
              <Text style={styles.finalScoreName}>{player.name}</Text>
              <Text style={styles.finalScorePoints}>{player.score}</Text>
            </Animatable.View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.playAgainButton}
          onPress={() => {
            setGameState('lobby');
            setPlayers([]);
            setRound(1);
          }}
        >
          <Text style={styles.playAgainText}>🔄 Play Again</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {gameState === 'lobby' && renderLobby()}
      {(gameState === 'drawing' || gameState === 'guessing') && renderDrawing()}
      {gameState === 'reveal' && renderReveal()}
      {gameState === 'gameover' && renderGameOver()}

      {/* Word choice modal */}
      <Modal visible={showWordModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <Animatable.View animation="zoomIn" style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose a word to draw!</Text>
            {wordChoices.map((word, index) => (
              <TouchableOpacity
                key={index}
                style={styles.wordChoice}
                onPress={() => handleWordChoice(word)}
              >
                <Text style={styles.wordChoiceText}>{word}</Text>
              </TouchableOpacity>
            ))}
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
  joinButton: {
    backgroundColor: '#4ECDC4',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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