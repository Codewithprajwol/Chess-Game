const express=require('express')
const path = require('path')
const socket=require('socket.io')
const http=require('http')
const {Chess} =require('chess.js')
const { title } = require('process')

const app=express()
const server= http.createServer(app)
const io=socket(server)
const chess = new Chess()

let player={}
let currentPlayer='w'

app.set('view engine',"ejs");
app.use(express.static(path.join(__dirname,'public')));

app.get('/',(req,res)=>{
    res.render('index',{title:"Chess Game"})
})

io.on('connection',function(uniqueSocket){
  if(! player.white){
    player.white=uniqueSocket.id;
    uniqueSocket.emit("playerRole","w")
  }
  else if(!player.black){
    console.log("might be")
    player.black=uniqueSocket.id;
    uniqueSocket.emit("playerRole","b")
  }
  else{
    uniqueSocket.emit("spectatorRole")
  }

  uniqueSocket.on("move",(move)=>{
    try {
        if(chess.turn()==='w' && uniqueSocket.id!==player.white) return ;
        if(chess.turn()==='b' && uniqueSocket.id!==player.black) return ;
        
        const result=chess.move(move)
        if(result){
            currentPlayer=chess.turn()
            io.emit('move',move)
            io.emit('boardState',chess.fen())
        }

    } catch (error) {
        console.log("Invalid move", move);
        uniqueSocket.emit('invalidMove',move)
        
    }
  })


  uniqueSocket.on("disconnect",()=>{
    console.log('disconnected');  
    if(uniqueSocket.id===player.white){
        delete player.white
    }else if(uniqueSocket.id===player.black){
        delete player.black
    }
  })
})

server.listen(5000,()=>{
    console.log('connected')
})