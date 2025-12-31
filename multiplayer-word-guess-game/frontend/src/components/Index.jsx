import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import{io} from 'socket.io-client';
import Lobbies from './Lobbies.jsx';
import { useMemo } from 'react';
import './Index.css'


const Index = () => {
  const [Value, setValue] = useState("");
  const [Value2, setValue2] = useState("");
  const navigate=useNavigate();
  const [SocketId, setSocketId] = useState("");
  const socket=useMemo(()=>io('http://localhost:3000',{}),[]);
  const [UserId, setUserId] = useState(null);



  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server with ID:", socket.id);
      setSocketId(socket.id);

      const storedUserId = localStorage.getItem('userid');
      if (!storedUserId) {
        localStorage.setItem('userid', socket.id);
        setUserId(socket.id);
      } else {
        setUserId(storedUserId);
      }

      console.log(UserId);

    });

    socket.on("createLobbySuccess",({redirectTo})=>{
      navigate(redirectTo);
    });

  
    socket.on("joinLobbySuccess",({redirectTo})=>{
      navigate(redirectTo);
    });



    socket.on("lobbyStatusUpdate",({lobby})=>{
      const ID =localStorage.getItem("userid");
      
      
      
      if (lobby && lobby.turn === 'player1') {
        if (lobby.player1 === ID) {
          navigate('/Word');
        } else {
          navigate('/GameOnline');
        }
      } else if (lobby && lobby.turn === 'player2') {
        if (lobby.player2 === ID) {
          navigate('/Word');
        } else {
          navigate('/GameOnline');
        }
      } else {
        navigate('/GameOnline');
      }
    });

    

    socket.on('disconnect', () => {
      console.log('Disconnected from server'+socket.id);
    });



    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [socket,navigate]);







  useEffect(() => {
    console.log(UserId);
  }, [UserId]);
  



















  const playoffline=()=>{
    navigate('/Game');
  }


  const createLobby=(lobbyname)=>{
    socket.emit('createLobby',{lobbyname:lobbyname,userid:UserId});
  }

  const joinLobby=(lobbyname)=>{
    socket.emit('joinLobby',{lobbyname:lobbyname,userid:UserId});
  }







  return (
    <div className="index-container">
      <button className='button-index' onClick={playoffline}>Play Offline</button>

      <form method="POST" onSubmit={(e)=>{
        e.preventDefault();
        createLobby(Value);
      }}>
        <input
          className='input-index'
          type="text"
          placeholder="write name of lobby"
          value={Value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button className='button-index' type='submit'>Create Lobby</button>
      </form>

      <form method="POST" onSubmit={(e)=>{
        e.preventDefault();
        joinLobby(Value2);
      }}>
        <input
          className='input-index'
          type="text"
          placeholder="write name of lobby"
          value={Value2}
          onChange={(e) => setValue2(e.target.value)}
        />
        <button className='button-index' type='submit'>Join Lobby</button>
      </form>
    </div>
  );
}

export default Index