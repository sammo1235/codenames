<template>
  <div class="hello">
    <h1>C O D E N A M E D</h1>
    <button v-on:click="createGame()" style="margin-top: 30px;">New Game</button>
  </div>
  <form id="join-game" style="margin-top: 25px">
    <input style="padding: 10px; border-radius: 7px;" type="text" name="gameId" placeholder="Enter Game ID">
    <button style="margin-left: 10px;" v-on:click="joinGame()">Join Game</button>
  </form>
</template>

<script>
  import { createGame } from '@/firebase'
  export default {
    name: 'Welcome',
    methods: {
      createGame() {
        console.log('game created')
        var gameId = createGame()
        this.$router.push(`/game/${gameId}`)
      },
      joinGame() {
        console.log('joining...')
        const joinForm = document.getElementById('join-game')
        const gameId = joinForm.querySelector('input[name=gameId]').value
        this.$router.push(`/game/${gameId}`)
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
