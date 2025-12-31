import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import{io} from 'socket.io-client';
import Lobbies from './Lobbies.jsx';
import { useMemo } from 'react';
import './waiting.css'

const Waiting = () => {
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




  socket.on('disconnect', () => {
    console.log('Disconnected from server'+socket.id);
  });





  return () => {
    socket.off('connect');
    socket.off('disconnect');
  };

}, [socket,UserId]);





useEffect(() => {
  console.log(UserId);
}, [UserId])






  
  return (
    <div className="container-waiting">
        <div className="waiting-box">
            <h1>Waiting for other players to join............</h1>
        </div>
    </div>
  )
}

export default Waiting