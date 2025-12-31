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






let lobbies=[];






io.on('connection',(socket)=>{
    console.log('A user connected');
    const SocketId=socket.id;   

    socket.on('createLobby',(data)=>{
        const lobbyname=data.lobbyname;
        const userid=data.userid;

        // console.log(lobbyname+userid);
        

        // console.log('A user created a lobby '+lobbyname+ "by socket id "+socket.id);

        if (!lobbyname || typeof lobbyname !== 'string' || lobbyname.trim() === '') {
            socket.emit('createLobbyError', 'Lobby name cannot be empty.');
            return;
        }

        const lobbyExists = lobbies.some(lobby => lobby.name === lobbyname.trim());
        if (lobbyExists) {
            socket.emit('createLobbyError', 'Lobby name already exists.');
            return;
        }

        const newLobby = {
            name: lobbyname.trim(),
            turn:'player1',
            player1:userid,
            player2:null,
            status:'waiting'
        };


        lobbies.push(newLobby);

        // console.log(lobbies);
        

        socket.join(lobbyname.trim());

        socket.emit('createLobbySuccess', {lobbyname:newLobby,redirectTo:'/Waiting'});


    });



    socket.on("UpdateGameState",({values,word,lobby,history,chances})=>{
        // console.log(values);
        socket.to(lobby.name).emit("GameStateUpdated",{Value:values,word:word,lobby:lobby,history:history,chances:chances});
    });


    socket.on("connect-game",({id})=>{
        const joined=lobbies.find((lobby)=>lobby.player1===id||lobby.player2===id);
        if(joined) {
            socket.join(joined.name);
            // console.log("joined by "+id);
            io.to(joined.name).emit("game-connected",{lobby:joined});
        }
        
    });



    socket.on('joinLobby',(data)=>{
        const lobbyname=data.lobbyname;
        const userid=data.userid;

        console.log('A user joined a lobby '+lobbyname+"by socket id "+socket.id);

        const lobbyIndex = lobbies.findIndex(lobby => lobby.name === lobbyname.trim());

        if (lobbyIndex === -1) {
            socket.emit('joinLobbyError', 'Lobby does not exist.');
            return;
        }
        if (lobbies[lobbyIndex].player2 !== null) {
            socket.emit('joinLobbyError', 'Lobby is already full.');
            return;
        }

        lobbies[lobbyIndex].player2 = userid;
        lobbies[lobbyIndex].status = 'playing';

        console.log(lobbies[lobbyIndex]);

        socket.join(lobbyname.trim());



        socket.emit('joinLobbySuccess', { lobbyname: lobbies[lobbyIndex], redirectTo: '/GameOnline' });

        socket.to(lobbyname.trim()).emit('lobbyStatusUpdate', { status: 'playing', lobby: lobbies[lobbyIndex] });  
        
        

    });




    socket.on("sentword",(data)=>{
        console.log(data);
        io.emit("receivedword",{redirectTo:'/GameOnline',lobby:data.lobby,word:data.word});
    });




    socket.on('change-sides',({lobby})=>{
        console.log("sides cahnged");
        const currlobbyindex=lobbies.findIndex((a)=>a.name===lobby.name);
        lobbies[currlobbyindex]=lobby;
    });






    socket.on('disconnect',()=>{
        console.log('A user disconnected');
    });
});











app.get('/lobbylist',(req,res)=>{
    res.json(lobbies);
});

















server.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});