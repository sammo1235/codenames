<template>
  <div class="flex top-box">
    <h1>C O D E N A M E S</h1>
    <div style="display: flex; flex-direction: row; justify-content: center; text-align: center; margin-bottom: 0px; font-size: 20px; align-items: center;">
      <p><span style="color: blue;">{{ colourCount('blue')}}</span> - <span style="color: red;">{{ colourCount('red')}}</span></p>
      <p v-if="!winner" style="margin-left: 40px;" :style="[turn === 'blue' ? 'color: blue' : 'color: red']">{{ turn[0].toUpperCase() + turn.substring(1) }}'s turn</p>
      <p v-if="winner" style="margin-left: 40px;" :style="[winner === 'blue' ? 'color: blue' : 'color: red']">{{ winner[0].toUpperCase() + winner.substring(1) }} wins!</p>
      <button class="button" style="margin-left: 40px;" v-if="!winner" v-on:click="takeTurn(), playSound('turn')">End Turn</button>
    </div>
  </div>
  <div class="flex c-wrapper">
    <div  @click="playSound(tile.colour), clickTile(tile.id, tile.clicked, tile.colour)" v-for="tile in tiles" :key="tile.word" :class="[tile.clicked ? `clicked-${tile.colour}` : spymaster ? `spymaster-${tile.colour}` : '', 'box']">
      <p class="word" style="font-size: 14px; margin: 5px 0px 5px 0px; margin-left: auto; margin-right: auto; font-weight: normal; width: 100%;">{{ tile.word.toUpperCase() }}</p>
    </div>
  </div>
  <router-link to='/'><button>Home</button></router-link>
  <button v-on:click="spymasterSwitch()" style="margin-left: 10px; margin-top: 30px">Spymaster</button>
</template>

<script>
import { db } from '@/firebase'
import firebase from 'firebase'
import click from '../assets/click.wav'
import explosion from '../assets/explosion.wav'
import turnButton from '../assets/turnButton.wav'
import gameOver from '../assets/gameover.wav'

export default {
  name: 'App',
  data() {
    return {
      tiles: [],
      spymaster: false,
      winner: '',
      gameId: this.$route.params.id,
      turn: 'blue',
      gameEnded: false
    }
  },
  created() {
    const tileRef = db.collection('tiles')
    const gameRef = db.collection('games')

    gameRef.where(firebase.firestore.FieldPath.documentId(), '==', this.gameId)
      .onSnapshot((querySnapshot) => {
        var turn = 'blue';
        var gameEnded = '';
        var winner = '';
        querySnapshot.forEach((doc) => {
          turn = doc.data().turn,
          gameEnded = doc.data().game_ended,
          winner = doc.data().winner
        })
        this.turn = turn;
        this.gameEnded = gameEnded;
        if(gameEnded) {
          this.spymaster = true;
          this.winner = winner;
        }
      });

    tileRef.where("game_id", "==", this.gameId)
      .limit(25)
      .onSnapshot((querySnapshot) => {
        var tileData = []
        querySnapshot.forEach((doc) => {
          tileData.push({
            id: doc.id, 
            word: doc.data().word,
            colour: doc.data().colour,
            clicked: doc.data().clicked
          });
        })
        this.tiles = tileData;
        this.checkWinner()
      });
  },
  methods: {
    clickTile(tileId, clicked, tileColour) {
      if(clicked === true || this.gameEnded === true) {
        console.log('already clicked')
      } else {
        this.tiles = this.tiles.map((tile) => tile.id === tileId ? {...tile, clicked: !tile.clicked} : tile)
        const tileRef = db.collection('tiles').doc(tileId)
        tileRef.update({clicked: true});
        if (tileColour === "black") {
            this.endGame()
          }
        if(tileColour != this.turn) {
          this.takeTurn()
        }
        this.checkWinner()
      } 
    },
    playSound(sound) {
      let audio = new Audio(click)
      if (sound == "black") {
        audio = new Audio(explosion)
      }
      if (sound == "turn") {
        audio = new Audio(turnButton)
      }
      if (sound == "gameover") {
        audio = new Audio(gameOver)
      }
      
      audio.play()
    },
    colourCount(colour) {
      var filtered = this.tiles.filter(function (el) {
        return el.colour == colour
          && el.clicked == false
      })
      return filtered.length
    },
    spymasterSwitch() {
      this.spymaster = !this.spymaster;
    },
    checkWinner() {
      if(this.colourCount('blue') === 0) {
        this.winner = 'blue'
        this.spymaster = true;
      } else if (this.colourCount('red') === 0) {
        this.winner = 'red'
        this.spymaster = true;
      }
    },
    takeTurn() {
      var turn = '';
      if(this.turn === "blue") {
        turn = 'red'
      } else {
        turn = 'blue'
      }
      this.turn = turn
      db.collection('games').doc(this.gameId).update({turn: turn})
    },
    endGame() {
      this.spymaster = true;
      if(this.turn === "blue") {
        this.winner = "red" 
      } else {
        this.winner = "blue"
      }
      db.collection('games').doc(this.gameId).update({game_ended: true, winner: this.winner})
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.box {
  animation: fadeIn 1s ease-in;
  background-color: rgb(237, 237, 237);
  color: black;
  border-radius: 5px;
  padding: 7px;
  font-size: 150%;
  text-align: center;
  justify-content: center;
  transition: 0.8s;
  box-shadow: -1px 1px 3px 1px rgba(66,66,66,0.38);
  display: flex;
  flex-direction: column;
  align-items: center;
  /* width: 200px; */
}

.box:hover {
  box-shadow: -1px 3px 7px 1px rgba(40, 40, 40, 0.38);
  transform: scale(1.05);
  transition: 0.3s;
}

.box:active {
  box-shadow: -1px 2px 5px 1px rgba(40, 40, 40, 0.38);
  transform: scale(1);
  transition: 0.2s;
}

.top-box {
  margin-top: 60px;
}
.clicked-blue {
  background: rgba(39, 39, 212, 0.842);
}
.clicked-red {
  background: rgba(221, 60, 60, 0.945);
}
.clicked-gray {
  background: rgba(241, 203, 144, 0.555);
}
.clicked-black {
  background: black;
  color: white;
}
.spymaster-blue {
  background: lightblue;
}
.spymaster-red {
  background: pink;
}
.spymaster-gray {
  background: rgb(216, 216, 216);
}
.spymaster-black {
  background: rgba(41, 41, 41, 0.671);
}
.c-wrapper {
  margin-top: 20px;
  justify-content: center;
  display: grid;
  grid-gap: 15px;
  grid-template-columns: repeat(5, 110px);
  grid-template-rows: repeat(5, 110px);
  grid-auto-flow: column;
}
.word {
  -moz-user-select: none;
  -khtml-user-select: none;
  -webkit-user-select: none;
}
a {
  text-decoration: none;
  color: black;
}
button {
  background: white;
  border-style: solid;
  border-width: 1px;
  border-color: black;
  border-radius: 5px;
  padding: 8px;
  color: black;
}
</style>
