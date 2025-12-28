const express=require('express');
const app=express();
const http=require('http');
const path =require('path');
const server=http.createServer(app);
const {Server}=require('socket.io');
const PORT=process.env.PORT || 3000;
const { json } = require('body-parser');
const { log } = require('console');
const io=new Server(server,{
    cors:{
        origin:"*",
        methods:["GET","POST"],
        credentials:true
    }
});
const cors=require('cors',{
    origin:"*",
    methods:["GET","POST"],
    credentials:true
});
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.resolve('./public')));
let lobbies = [];
io.on('connection', (socket) => {
  socket.on('create-lobby',(prop)=>{
    const lobbyname=prop.lobby_name;
    const existingLobby = lobbies.find(lobby => lobby.name === lobbyname);
    
    if (existingLobby) {
      socket.emit('error', 'Lobby name already exists');
      socket.emit('lobby_list',lobbies);
      return;
    }
    lobbies.push({name:lobbyname,player1:null,player2:null,status:'waiting'});
    socket.join(lobbyname);
    socket.emit('lobby_list',lobbies);
    socket.emit('lobbyCreated', {redirectTo:`/game`,lobbyname:lobbyname});
  });



  socket.on('refresh-lobby',()=>{
    socket.emit('lobby_list',lobbies);
    
  })





  socket.on('join-lobby',(prop)=>{
    const lobbyname=prop.lobby_name;
    const lobby = lobbies.find(lobby => lobby.name === lobbyname);
    if(lobby){
      socket.join(lobbyname);
      socket.emit('lobbyJoined', {redirectTo:`/game`,lobbyname:lobbyname});
    }else{
      console.log("no lobbies found");
    }
  });




  

  socket.on('create-game',(data)=>{
    lobbies.forEach((lobby)=>{
      if(lobby.player1 === null){
        lobby.player1 = data.usr;
      }
      else if(lobby.player2 === null && lobby.player1 !== data.usr){
        lobby.player2 = data.usr;
      }
    });
    socket.join(data.lobby_name);
  });






  socket.on('made-move',(data)=>{
    io.to(data.lobby_name).emit('update-game',data);
  });




  socket.on('new-player-joined',()=>{
    io.emit('getlist');
  });



socket.on('leave-game',(data)=>{
  const lobby=lobbies.find(a=>a.name===data.lobbyname);
  if(lobby.player1===data.usrid){
    lobby.player1=null;
  }
  if(lobby.player2===data.usrid){
    lobby.player2=null;
  }
  if (!lobby.player1 && !lobby.player2) {
    lobbies = lobbies.filter(l => l.name !== lobby.name);
  }else{
    console.log("none");
  }
  socket.emit('lobby_list',lobbies);
});




  socket.on('disconnect', () => {
    console.log('Client disconnected:');
  });
});
app.get('/lobbies',(req,res)=>{
    res.json(lobbies);
});
server.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});