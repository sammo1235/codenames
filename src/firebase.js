import firebase from 'firebase'
import 'firebase/firestore'
import 'random-words'
import { ref, onUnmounted } from 'vue';
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

export const getGame = async id => {
  const game = await gamesCollection.doc(id).get();
  return game.exists ? game.data() : null
}

export const getTiles = async () => {
  const tiles = ref([])
  const close = tilesCollection.onSnapshot(snapshot => {
    tiles.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
  onUnmounted(close)
  return tiles
}

export const getTilesOnce = () => {
  let tiles = [];
  const ref = db.collection('tiles')
  
  ref.where("game_id", "==", "gpfoE3QFTLv5uTL9xm65z1")
    .limit(25)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        tiles.push({
          id: doc.id, 
          word: doc.data().word,
          colour: doc.data().colour,
          clicked: doc.data().clicked,
          game_id: doc.data().game_id
        });
      })
    })
  return tiles;
}
//  how to create dedicated dyno
// what usually holds up the queues
