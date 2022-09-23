import firebase from 'firebase'
import 'firebase/firestore'
import { words } from './new_words';
import { canadianWords } from './canadian_words';

const short = require("short-uuid")

// firebase init - add your own config here
const firebaseConfig = {
  apiKey: "AIzaSyCxIoBcpzu2jFoHuXkb-8BNpfjYcqWIJW4",
  authDomain: "codenames-bdea9.firebaseapp.com",
  projectId: "codenames-bdea9",
  storageBucket: "codenames-bdea9.appspot.com",
  messagingSenderId: "714892939600",
  appId: "1:714892939600:web:d209463a2cad77c80ddc55",
  measurementId: "G-JD5VNH0PTR"
};

firebase.initializeApp(firebaseConfig)

// utils
const db = firebase.firestore()
const auth = firebase.auth()

const gamesCollection = db.collection('games')
const tilesCollection = db.collection('tiles')

export {
  db,
  auth, 
  gamesCollection
}

export const createGame = () => {
  var gameId = short.generate();
  
  var game = {turn: 'blue', game_ended: false, winner: ''};
  gamesCollection.doc(gameId).set(game)

  let gameWords = getWords(25)
  var tiles = [];
  let blackWord = gameWords[0]
  tiles.push(createTile(gameId, blackWord, 'black'));
  for (var j=1; j<10; j++) { // 9 blue
    let word = gameWords[j]
    tiles.push(createTile(gameId, word, 'blue'))
  }
  for (var k=10; k<18; k++) { // 8 red 
    let word = gameWords[k]
    tiles.push(createTile(gameId, word, 'red'))
  }
  for (var i=18; i<25; i++) { // 7 gray
    let word = gameWords[i]
    tiles.push(createTile(gameId, word, 'gray'))
  }
  return gameId;
}

export const createCodeSweepersGame = (canadian = false, bombCount = 12) => {
  let gameId = short.generate();

  let game = {turn: 'blue', game_ended: false, winner: '', blueLives: 3, redLives: 3, canadian: canadian};
  gamesCollection.doc(gameId).set(game);

  let gameWords = getWords(49, canadian)
  for (let i = 0; i < 9; i++) {
    let word = gameWords[i]
    createTile(gameId, word, 'blue')
  }
  for (let k=9; k < 17; k++) {
    let word = gameWords[k]
    createTile(gameId, word, 'red')
  }
  for (let j=17; j<(17+bombCount); j++) {
    let word = gameWords[j]
    createTile(gameId, word, 'black')
  }
  for (let m=(17+bombCount); m<49; m++) {
    let word = gameWords[m]
    createTile(gameId, word, 'gray')
  }

  // uniq checker
  // Array.from(new Set(this.tiles.map(tile => tile.word))) 
  return gameId;
}

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

const getWords = (amount, canadian) => {
  let wordList = canadian ? canadianWords : words
  let start = Math.floor(Math.random()*(wordList.length - amount))
  return shuffle(wordList).slice(start, start + amount + 1);
}

export const createTile = (gameId, word, colour) => {
  var tile = {game_id: gameId, 'word': word, 'clicked': false, 'colour': colour, showBombCount: false, bombCount: 0, showBombsInArea: false, redColourCount: 0, blueColourCount: 0, showColourCount: false}; 
  return tilesCollection.add(tile);
}
