<template>
  <div class="flex top-box">
    <h1>C O D E S W E E P E R S</h1>
    <div style="display: flex; flex-direction: row; justify-content: center; text-align: center;">
      <p><span style="color: blue;">{{ colourCount('blue')}}</span> - <span style="color: red;">{{ colourCount('red')}}</span></p>
      <p v-if="!winner" style="margin-left: 40px;" :style="[turn === 'blue' ? 'color: blue' : 'color: red']">{{ turn[0].toUpperCase() + turn.substring(1) }}'s turn</p>
      <p v-if="winner" style="margin-left: 40px;" :style="[winner === 'blue' ? 'color: blue' : 'color: red']">{{ winner[0].toUpperCase() + winner.substring(1) }} wins!</p>
      <button class="button" style="margin-left: 40px;" v-if="!winner" v-on:click="takeTurn()">End Turn</button>
    </div>
  </div>
  <div class="flex wrapper">
    <div @click="clickTile(tile.id, tile.clicked, tile.colour, index)" v-for="(tile, index) in tiles" :key="tile.word" :class="[tile.clicked ? `clicked-${tile.colour}` : spymaster ? `spymaster-${tile.colour}` : '', 'box']">
        <p class="word" style="font-size: 12px; margin: 5px 10px; 5px 10px; font-weight: normal;">{{ tile.word.toUpperCase() }}</p>
      <div style="display: flex; height: 25px; justify-content: center;">
        <div v-if="tile.showBombCount" style="display: flex; flex-direction: column;">
          <p class="word" style="font-size: 12px; margin: auto; font-weight: normal;" v-if="tile.showBombCount">{{ tile.bombCount }}</p>
          <img style="height: 25px; margin-top: -3px" src="https://www.freeiconspng.com/uploads/black-bomb-png-image-0.png" />
        </div>
        <div v-if="tile.showColourCount" style="display: flex; flex-direction: column;">
          <p style="margin: 0 0; font-size: 12px;">{{ tile.blueColourCount }}</p>
          <p style="margin: 0 0; border: 1px solid black; background-color: blue; height: 5px; width: 15px;">&nbsp;&nbsp;</p>
        </div>
        <div v-if="tile.showColourCount" style="display: flex; flex-direction: column;">
          <p style="margin: 0 0; font-size: 12px;">{{ tile.redColourCount }}</p>
          <p style="margin: 0 0; border: 1px solid black; background-color: red; height: 5px; width: 15px;">&nbsp;&nbsp;</p>
        </div>
      </div>
    </div>
  </div>
  <button><router-link to='/'>Home</router-link></button>
  <button v-on:click="spymasterSwitch()" style="margin-left: 10px; margin-top: 30px">Spymaster</button>
</template>

<script>
import { db } from '@/firebase'
import firebase from 'firebase'
export default {
  name: 'App',
  data() {
    return {
      tiles: [],
      tileMap: [],
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
      if(clicked === true || this.gameEnded === true) {
        console.log('already clicked')
      } else {
        this.tiles = this.tiles.map((tile) => tile.id === tileId ? {...tile, clicked: !tile.clicked} : tile)
        const tileRef = db.collection('tiles').doc(tileId)
        tileRef.update({clicked: true});
        this.showBombsInArea(index, tileRef, tileColour == this.turn)
        if (tileColour === "black") {
            this.endGame()
          }
        if(tileColour != this.turn) {
          this.takeTurn()
        }
        this.checkWinner()
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
      console.log(areaIds)
      let bombCount = this.tiles.filter((tile, index) => areaIds.includes(index) && tile.colour == "black").length
      let redCount = this.tiles.filter((tile, index) => areaIds.includes(index) && tile.colour == "red").length
      let blueCount = this.tiles.filter((tile, index) => areaIds.includes(index) && tile.colour == "blue").length
      console.log(bombCount)
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
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: white;
  color: black;
  border-style: solid;
  border-radius: 5px;
  padding: 7px;
  font-size: 150%;
  border-width: 2px;
  border-color: black;
  text-align: center;
  /* width: 200px; */
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
.wrapper {
  margin-top: 30px;
  justify-content: center;
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(7, 90px);
  grid-template-rows: repeat(7, 90px);
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
