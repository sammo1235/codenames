import firebase from 'firebase'
import 'firebase/firestore'
import 'random-words'
var randomWords = require('random-words');
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

export const createTile = (gameId, colour) => {
  var tile = {game_id: gameId, 'word': randomWords(), 'clicked': false, 'colour': colour}; 
  return tilesCollection.add(tile);
}
