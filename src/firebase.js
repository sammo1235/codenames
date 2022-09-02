import firebase from 'firebase'
import 'firebase/firestore'
import { words } from './new_words';

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

  var tiles = [];
  tiles.push(createTile(gameId, 'black'));
  for (var j=0; j<9; j++) {
    tiles.push(createTile(gameId, 'blue'))
  }
  for (var k=0; k<8; k++) {
    tiles.push(createTile(gameId, 'red'))
  }
  for (var i=0; i<7; i++) {
    tiles.push(createTile(gameId, 'gray'))
  }
  return gameId;
}

export const createCodeSweepersGame = () => {
  let gameId = short.generate();

  let game = {turn: 'blue', game_ended: false, winner: '', blueLives: 3, redLives: 3};
  gamesCollection.doc(gameId).set(game);

  let gameWords = getWords(49)
  let tiles = [];
  for (let i = 0; i < 9; i++) {
    let word = gameWords[i]
    tiles.push(createTile(gameId, word, 'blue'))
  }
  for (var k=9; k<17; k++) {
    let word = gameWords[k]
    tiles.push(createTile(gameId, word, 'red'))
  }
  for (var j=17; j<29; j++) {
    let word = gameWords[j]
    tiles.push(createTile(gameId, word, 'black'))
  }
  for (var m=29; m<49; m++) {
    let word = gameWords[m]
    tiles.push(createTile(gameId, word, 'gray'))
  }

  // uniq checker
  // Array.from(new Set(this.tiles.map(tile => tile.word))) 
  return gameId;
}

const getWords = (amount) => {
  let start = Math.floor(Math.random()*words.length)
  return words.slice(start, start + amount + 1);
}

export const createTile = (gameId, word, colour) => {
  // while (word.length > 8 || word.length < 4) {
  //   word = words[Math.floor(Math.random()*words.length)];
  // }

  var tile = {game_id: gameId, 'word': word, 'clicked': false, 'colour': colour, showBombCount: false, bombCount: 0, showBombsInArea: false, redColourCount: 0, blueColourCount: 0, showColourCount: false}; 
  return tilesCollection.add(tile);
}
