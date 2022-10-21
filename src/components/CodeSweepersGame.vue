<template>
  <Canvas/>
  <div class="flex top-box">
    <h1 v-if="canadian" style="margin: 5px 0px 0px 0px; font-size: 28px;">🇨🇦 C A N A D A S W E E P E R S 🇨🇦</h1>
    <h1 v-if="!canadian" style="margin: 5px 0px 0px 0px; font-size: 28px;">C O D E S W E E P E R S</h1>
    <div style="display: flex; flex-direction: row; justify-content: center; text-align: center; margin-bottom: 0px; font-size: 20px; align-items: center;">
      <p><span style="color: blue; font-size: 18px;">{{ colourCount('blue')}}</span> - <span style="color: red; font-size: 18px;">{{ colourCount('red')}}</span></p>
      <p v-if="!winner" style="margin-left: 40px; font-size: 16px;" :style="[turn === 'blue' ? 'color: blue' : 'color: red']">{{ turn[0].toUpperCase() + turn.substring(1) }}'s turn</p>
      <p style="margin-left: 40px; font-size: 18px;">Lives: <span style="color: blue; font-size: 18px;">{{ blueLives }}</span> - <span style="color: red; font-size: 18px;">{{ redLives }}</span></p>

      <p v-if="winner" style="margin-left: 40px;" :style="[winner === 'blue' ? 'color: blue' : 'color: red']">{{ winner[0].toUpperCase() + winner.substring(1) }} wins!</p>
      <button class="button" style="margin-left: 40px;" v-if="!winner" v-on:click="takeTurn(), playSound('turn')">End Turn</button>
    </div>
  </div>
  <div class="flex wrapper">
    <div @click="playSound(tile.colour), clickTile(tile.id, tile.clicked, tile.colour, index)" v-for="(tile, index) in tiles" :key="tile.word" :class="[tile.clicked ? `clicked-${tile.colour} box-flip` : spymaster ? `spymaster-${tile.colour}` : '', 'box']">
      <p class="word" style="font-size: 12px; margin: 5px 0px; 5px 0px; margin-left: auto; margin-right: auto; font-weight: normal; width: 100%;">{{ tile.word.toUpperCase() }}</p>
      <div style="display: flex; height: auto; justify-content: space-around; width: 100%;">
        <div v-if="tile.showBombCount" style="display: flex; flex-direction: column;">
          <p class="word" style="font-size: 12px; margin: auto; font-weight: normal;" v-if="tile.showBombCount">{{ tile.bombCount }}</p>
          <img style="height: 20px; margin-top: -3px box-shadow: -1px 1px 3px 1px rgba(66,66,66,0.38);" src="https://www.freeiconspng.com/uploads/black-bomb-png-image-0.png" />
        </div>
        <div v-if="tile.showColourCount" style="display: flex; flex-direction: column;">
          <p style="margin: 0 0; font-size: 12px;">{{ tile.blueColourCount }}</p>
          <p style="margin: 0 0; border: 1px solid black; background-color: rgba(88, 152, 248, 0.842); height: 15px; width: 15px; box-shadow: -1px 1px 3px 1px rgba(66,66,66,0.38);">&nbsp;&nbsp;</p>
        </div>
        <div v-if="tile.showColourCount" style="display: flex; flex-direction: column;">
          <p style="margin: 0 0; font-size: 12px;">{{ tile.redColourCount }}</p>
          <p style="margin: 0 0; border: 1px solid black; background-color: red; height: 15px; width: 15px; box-shadow: -1px 1px 3px 1px rgba(66,66,66,0.38);">&nbsp;&nbsp;</p>
        </div>
      </div>
    </div>
  </div>
  <router-link to='/'><button>Home</button></router-link>
  <button v-on:click="spymasterSwitch()" style="margin-left: 10px; margin-top: 30px">Spymaster</button>
  <button id="drawToggle" @click="disableCanvas" class="drawButton">Let Me Play</button>
  <audio id="audio" src="../assets/click.wav"></audio>
</template>

<script>
import { db } from '@/firebase'
import firebase from 'firebase'
import click from '../assets/click.wav'
import explosion from '../assets/explosion.wav'
import turnButton from '../assets/turnButton.wav'
import gameOver from '../assets/gameover.wav'
import Canvas from './canvas.vue'

export default {
  name: 'App',
  components: {
    Canvas
  },
  data() {
    return {
      tiles: [],
      tileMap: [],
      spymaster: false,
      winner: '',
      gameId: this.$route.params.id,
      turn: 'blue',
      gameEnded: false,
      blueLives: 3,
      redLives: 3,
      canadian: false
    }
  },
  props: {
    canvasWidth: String
  },
  created() {
    const tileRef = db.collection('tiles')
    const gameRef = db.collection('games')

    gameRef.where(firebase.firestore.FieldPath.documentId(), '==', this.gameId)
      .onSnapshot((querySnapshot) => {
        var turn = 'blue';
        var gameEnded = '';
        var winner = '';
        let blueLives = 3;
        let redLives = 3;
        let canadian = false;
        querySnapshot.forEach((doc) => {
          turn = doc.data().turn,
          gameEnded = doc.data().game_ended,
          winner = doc.data().winner,
          blueLives = doc.data().blueLives,
          redLives = doc.data().redLives,
          canadian = doc.data().canadian
        })
        this.turn = turn;
        this.gameEnded = gameEnded;
        this.blueLives = blueLives;
        this.redLives = redLives;
        this.canadian = canadian;

        if(gameEnded) {
          this.spymaster = true;
          this.winner = winner;
        }
      });

    tileRef.where("game_id", "==", this.gameId)
      .limit(49)
      .onSnapshot((querySnapshot) => {
        var tileData = []
        querySnapshot.forEach((doc) => {
          tileData.push({
            id: doc.id, 
            word: doc.data().word,
            colour: doc.data().colour,
            clicked: doc.data().clicked,
            showBombCount: doc.data().showBombCount,
            showBombsInArea: doc.data().showBombsInArea,
            bombCount: doc.data().bombCount,
            showColourCount: doc.data().showColourCount,
            redColourCount: doc.data().redColourCount,
            blueColourCount: doc.data().blueColourCount,
          });
        })
        this.tiles = tileData;
        window.tiles = tileData;
        this.checkWinner()
      });

      let tileMap = Array()
      for (let i = 0; i < 7; i++) {
        let subarr = []
        for (let k = i; k <= (i + 42); k += 7) {
          subarr.push(k)
        }
        tileMap.push(subarr)
      }
      this.tileMap = tileMap
      window.tileMap = tileMap
  },
  methods: {
    clickTile(tileId, clicked, tileColour, index) {
      if (!this.spymaster) {
        if(clicked === true || this.gameEnded === true) {
          console.log('already clicked')
        } else {
          this.tiles = this.tiles.map((tile) => tile.id === tileId ? {...tile, clicked: !tile.clicked} : tile)
          const tileRef = db.collection('tiles').doc(tileId)
          tileRef.update({clicked: true});
          this.showBombsInArea(index, tileRef, tileColour == this.turn)
          if (tileColour === "black") {
              this.takeLife()
          }
          if (this.blueLives == 0 || this.redLives == 0) {
            this.endGame()
          }
          if(tileColour != this.turn) {
            this.takeTurn()
          }
          this.checkWinner()
        } 
      }
    },
    playSound(sound) {
      if (!this.spymaster) {
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
      }
    },
    takeLife() {
      const gameRef = db.collection('games').doc(this.gameId)
      if (this.turn == "red") {
        this.redLives = this.redLives - 1
        gameRef.update({redLives: this.redLives})
      } else {
        this.blueLives = this.blueLives - 1
        gameRef.update({blueLives: this.blueLives})
      }
    },
    showBombsInArea(clicked_tile_index, tileRef, correctAnswer) {
      let cti = clicked_tile_index
      // get coords of tile
      let coords = []
      for (let a = 0; a<7; a++) {
        if (this.tileMap[a].indexOf(cti) >= 0) { 
          coords.push(a, this.tileMap[a].indexOf(cti))
        }
      }
      // get the area around the clicked tile being careful of edges
      let row = coords[0]
      let col = coords[1]
      let validArea = []
      for (let b = (row > 0 ? row - 1 : row); b <= (row >= 6 ? 6 : row + 1); b++) {
        for (let c = (col > 0 ? col - 1 : col); c <= (col >= 6 ? 6 : col + 1); c++) {
          validArea.push([b, c])
        }
      }
      // get count of bombs in area
      let areaIds = []
      validArea.forEach((coord) => {
        areaIds.push(this.tileMap[coord[0]][coord[1]])
      });
      let currentTile = areaIds.indexOf(clicked_tile_index)
      areaIds.splice(currentTile, 1)
      let bombCount = this.tiles.filter((tile, index) => areaIds.includes(index) && tile.colour == "black").length
      let redCount = this.tiles.filter((tile, index) => areaIds.includes(index) && tile.colour == "red").length
      let blueCount = this.tiles.filter((tile, index) => areaIds.includes(index) && tile.colour == "blue").length

      if (correctAnswer) {
        this.tiles = this.tiles.map((tile, index) => index === clicked_tile_index ? {...tile, showBombCount: true, bombCount: bombCount, showColourCount: true, redColourCount: redCount, blueColourCount: blueCount} : tile)
        tileRef.update({showBombCount: true, bombCount: bombCount, showColourCount: true, redColourCount: redCount, blueColourCount: blueCount})
      } else {
        this.tiles = this.tiles.map((tile, index) => index === clicked_tile_index ? {...tile, showBombCount: true, bombCount: bombCount} : tile)
        tileRef.update({showBombCount: true, bombCount: bombCount})
      }
    },
    colourCount(colour) {
      var filtered = this.tiles.filter(function (el) {
        return el.colour == colour
          && el.clicked == false
      })
      return filtered.length
    },
    disableCanvas() {
      let canvas = document.getElementById("canvas");
      canvas.style.pointerEvents = canvas.style.pointerEvents === 'none' ? '' : 'none';

      let button = document.getElementById("drawToggle");
      button.textContent = button.textContent === 'Let Me Draw' ? 'Let Me Play' : 'Let Me Draw';

      let buttons = document.getElementById("buttons");
      buttons.style.display = buttons.style.display === 'none' ? '' : 'none';

    },
    spymasterSwitch() {
      if (!this.spymaster) {
        this.spymaster = !this.spymaster;
      }
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
      this.playSound("gameover")
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

.drawButton {
  position: relative;
  z-index: 5;
  margin-left: 10px;
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

.top-box {
  margin-top: 20px;
}
.clicked-blue {
  background: rgba(9, 67, 154, 0.842);
  color: white;
}
.clicked-red {
  background: rgba(206, 0, 0, 0.945);
  color: white;
}
.clicked-gray {
  background: rgba(241, 203, 144, 0.555);
}
.clicked-black {
  animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both;
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
.wrapper {
  margin-top: 8px;
  justify-content: center;
  display: grid;
  grid-gap: 15px;
  grid-template-columns: repeat(7, 100px);
  grid-template-rows: repeat(7, 100px);
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

a:hover {
  color: white;
}

button {
  background: white;
  border-style: solid;
  border-width: 1px;
  border-color: black;
  border-radius: 5px;
  padding-left: 20px;
  padding-right: 20px;
  height: 40px;
  color: black;
  transition: 0.5s;
}

button:hover {
  background: black;
  color: white;
  transition: 0.2s;
}

@keyframes shake {
  10%, 90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%, 80% {
    transform: translate3d(2px, 0, 0);
  }
  30%, 50%, 70% {
    transform: translate3d(-4px, 0, 0);
  }
  40%, 60% {
    transform: translate3d(4px, 0, 0);
  }
}

@keyframes fadeIn {
  0% {
    opacity:0;
  }
  100% {
    opacity: 1;
  }
}
</style>
