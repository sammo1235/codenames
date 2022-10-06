<template>
  <div class="hello">
    <h1>C O D E N A M E S</h1>
    <button v-on:click="createGame()" style="margin-top: 30px;">New Game</button>
  </div>
  <form id="join-game" style="margin-top: 25px">
    <input style="padding: 10px; border-radius: 7px;" type="text" name="gameId" placeholder="Enter Game ID">
    <button style="margin-left: 10px;" v-on:click="joinGame()">Join Game</button>
  </form>

  <div class="hello">
    <h1>C O D E S W E E P E R S</h1>
    <div style="">
      <label>Difficulty</label>
      <select id="codesweepers-difficulty" style="margin-left: 10px;">
        <option value="easy">Easy (8 bombs, 3 lives)</option>
        <option value="medium" selected>Medium (12 bombs, 3 lives)</option>
        <option value="hard">Hard (20 bombs, 2 lives)</option>
        <option value="impossible">Impossible (32 bombs, 2 lives)</option>
        <option value="insanity">Insanity (32 bombs, 1 life)</option>
      </select>
      <button v-on:click="createCodesweepersGame()" style="margin: 30px 0 0 10px;">New Game</button>
    </div>
  </div>
  <form id="join-sweepers-game" style="margin-top: 25px">
    <input style="padding: 10px; border-radius: 7px;" type="text" name="sweepersGameId" placeholder="Enter Game ID">
    <button style="margin-left: 10px;" v-on:click="joinCodeSweepersGame()">Join Game</button>
  </form>

  <div class="hello">
    <h1>🇨🇦 C A N A D A S W E E P E R S 🇨🇦</h1>
    <button v-on:click="createCodesweepersGame(true)" style="margin-top: 30px;">New Game</button>
  </div>
  <form id="join-sweepers-game" style="margin-top: 25px">
    <input style="padding: 10px; border-radius: 7px;" type="text" name="sweepersGameId" placeholder="Enter Game ID">
    <button style="margin-left: 10px;" v-on:click="joinCodeSweepersGame()">Join Game</button>
  </form>
</template>

<script>
  import { createGame, createCodeSweepersGame } from '@/firebase'
  export default {
    name: 'Welcome',
    methods: {
      createGame() {
        console.log('game created')
        var gameId = createGame()
        this.$router.push(`/game/${gameId}`)
      },
      createCodesweepersGame(canadian = false) {
        let select = document.getElementById("codesweepers-difficulty")
        let selectedDifficulty = select.options[select.selectedIndex].value
        let bombCount;
        let lifeCount = 3
        if (selectedDifficulty == "easy") {
          bombCount = 8
        } else if (selectedDifficulty == "medium") {
          bombCount = 12
        } else if (selectedDifficulty == "hard") {
          bombCount = 20
          lifeCount = 2
        } else if (selectedDifficulty == "impossible") {
          bombCount = 32
          lifeCount = 2
        } else if (selectedDifficulty == "insanity") {
          bombCount = 32
          lifeCount = 1
        }
        var gameId = createCodeSweepersGame(canadian, bombCount, lifeCount);
        this.$router.push(`/csgame/${gameId}`)
      },
      joinGame() {
        console.log('joining...')
        const joinForm = document.getElementById('join-game')
        const gameId = joinForm.querySelector('input[name=gameId]').value
        this.$router.push(`/game/${gameId}`)
      },
      joinCodeSweepersGame() {
        console.log('joining...')
        const joinForm = document.getElementById('join-sweepers-game')
        const gameId = joinForm.querySelector('input[name=sweepersGameId]').value
        this.$router.push(`/csgame/${gameId}`)
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.hello {
  margin-top: 60px;
}
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
