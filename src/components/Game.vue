<template>
  <div class="flex">
    <span style="color: blue">{{ colourCount('blue')}}</span> - <span style="color: red">{{ colourCount('red')}}</span>
    <p v-if="!winner" :style="[turn === 'blue' ? 'color: blue' : 'color: red']">{{ turn }}'s turn</p>
    <p v-if="winner" :style="[winner === 'blue' ? 'color: blue' : 'color: red']">{{ winner }} wins!</p>
    <button v-if="!winner" v-on:click="takeTurn()">End Turn</button>
  </div>
  <div class="flex wrapper">
    <div @dblclick="clickTile(tile.id, tile.clicked, tile.colour)" v-for="tile in tiles" :key="tile.word" :class="[tile.clicked ? `clicked-${tile.colour}` : spymaster ? `spymaster-${tile.colour}` : '', 'box box1']">
      <p style="font-size: 15px; margin: auto; padding: 35px 0; font-weight: bold;">{{ tile.word }}</p>
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
      spymaster: false,
      winner: '',
      gameId: this.$route.params.id,
      turn: '',
      gameEnded: false
    }
  },
  created() {
    const tileRef = db.collection('tiles')
    const gameRef = db.collection('games')

    gameRef.where(firebase.firestore.FieldPath.documentId(), '==', this.gameId)
      .onSnapshot((querySnapshot) => {
        var turn = '';
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
  margin-top: 60px;
}
.box {
  background-color: rgb(216, 216, 216);
  color: white;
  border-radius: 5px;
  padding: 5px;
  font-size: 150%;
  border-width: 2px;
  border-color: black;
  text-align: center;
  /* width: 200px; */
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
  background: rgba(39, 39, 39, 0.795);
}
.wrapper {
  justify-content: center;
  margin: inherit;
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(5, 100px);
  grid-template-rows: repeat(5, 100px);
  grid-auto-flow: column;
}
a {
  text-decoration: none;
  color: black;
}
</style>
