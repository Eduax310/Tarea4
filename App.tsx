import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, Image } from 'react-native';

const cardImages: { [key: string]: any } = {
  Circulo: require('./Imagenes/Circulo.png'),
  cuadrado: require('./Imagenes/cuadrado.png'),
  Estrella: require('./Imagenes/Estrella.png'),
  Triangulo: require('./Imagenes/Triangulo.png'),
  hexagono: require('./Imagenes/hexagono.png'),
  pentagono: require('./Imagenes/pentagono.png'),
};
const CardImages: { [key: string]: any } = {
  Carta: require('./Imagenes/Carta.jpg'),
};

interface CardProps {
  imageKey: string;
  onPress: (index: number) => void;
  index: number;
  animation: boolean;
  matched: boolean;
}

const Card: React.FC<CardProps> = ({ imageKey, onPress, index, animation, matched }) => {
  const [rotateValue] = useState(new Animated.Value(0));
  const [isFlipped, setIsFlipped] = useState(false);
  const [showFront, setShowFront] = useState(true);

  useEffect(() => {
    if (animation) {
      Animated.timing(rotateValue, {
        toValue: 180,
        duration: 500,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        setIsFlipped(true);
      });
    } else {
      Animated.timing(rotateValue, {
        toValue: 0,
        duration: 500,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        setIsFlipped(false);
      });
    }
  }, [animation]);

  const interpolatedRotateAnimation = rotateValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  useEffect(() => {
    if (!animation && isFlipped && !matched) {
      setTimeout(() => {
        setShowFront(true);
        Animated.timing(rotateValue, {
          toValue: 0,
          duration: 500,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(() => {
          setIsFlipped(false);
        });
      }, 1000);
    }
  }, [animation, matched]);

  const handlePress = () => {
    setShowFront(false);
    onPress(index);
  };

  return (
    <TouchableOpacity onPress={handlePress} disabled={matched}>
      <View style={styles.cardContainer}>
        {showFront ? (
          <Image source={CardImages['Carta']} style={styles.cardImage} />
        ) : (
          <Image source={cardImages[imageKey]} style={styles.cardImage} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const MemoryGameApp: React.FC = () => {
  const [cards, setCards] = useState<string[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([]);
  const [attempts, setAttempts] = useState<number>(0);
  const [matchedCount, setMatchedCount] = useState<number>(0);
  const [showWinScreen, setShowWinScreen] = useState<boolean>(false);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const initialCards: string[] = Object.keys(cardImages).sort(() => Math.random() - 0.5).slice(0, 6);
    const duplicatedCards: string[] = [...initialCards, ...initialCards];
    const shuffledCards: string[] = duplicatedCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
  };

  const handleCardPress = (index: number) => {
    if (flippedIndexes.includes(index) || selectedCards.length === 2 || matchedCount === cards.length) return;
    setSelectedCards([...selectedCards, index]);
    setFlippedIndexes([...flippedIndexes, index]);
    setAttempts(attempts + 1);
  };

  useEffect(() => {
    if (selectedCards.length === 2) {
      setTimeout(() => {
        checkSelectedCards();
      }, 1000);
    }
  }, [selectedCards]);

  const checkSelectedCards = () => {
    if (cards[selectedCards[0]] === cards[selectedCards[1]]) {
      handleMatch();
    } else {
      hideSelectedCards();
    }
  };

  const handleMatch = () => {
    setMatchedCount(matchedCount + 2);
    clearSelectedCards();
    if (matchedCount + 2 === cards.length) {
      setShowWinScreen(true);
    }
  };

  const clearSelectedCards = () => {
    setSelectedCards([]);
  };

  const hideSelectedCards = () => {
    setFlippedIndexes(flippedIndexes.slice(0, -2));
    clearSelectedCards();
  };

  const restartGame = () => {
    setAttempts(0);
    setMatchedCount(0);
    initializeGame();
    setSelectedCards([]);
    setFlippedIndexes([]);
    setShowWinScreen(false);
  };

  const renderCards = () => {
    const rows = [];
    for (let i = 0; i < 4; i++) {
      const cols = [];
      for (let j = 0; j < 3; j++) {
        const index = i * 3 + j;
        cols.push(
          <Card
            key={index}
            imageKey={cards[index]}
            index={index}
            onPress={(index) => handleCardPress(index)}
            animation={flippedIndexes.includes(index)}
            matched={matchedCount === cards.length}
          />
        );
      }
      rows.push(<View key={i} style={styles.row}>{cols}</View>);
    }
    return rows;
  };

  const renderWinnerScreen = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.winnerText}>¡Felicidades, has ganado!</Text>
        <Text style={styles.attemptsText}>Número de intentos: {attempts}</Text>
        <TouchableOpacity style={styles.button} onPress={restartGame}>
          <Text style={styles.buttonText}>Reiniciar Juego</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {showWinScreen ? renderWinnerScreen() : renderCards()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  cardContainer: {
    width: 80,
    height: 120,
    backgroundColor: 'lightblue',
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  winnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  winnerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  attemptsText: {
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});


export default MemoryGameApp;
