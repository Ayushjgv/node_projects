import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import{io} from 'socket.io-client';
import { useMemo } from 'react';

import './word.css'

const Word = () => {
  const navigate=useNavigate();
  const [SocketId, setSocketId] = useState("");
  const socket=useMemo(()=>io('http://localhost:3000',{}),[]);
  const [UserId, setUserId] = useState(null);
  const [Value, setValue] = useState("");
  const [Lobbies, setLobbies] = useState([]);



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


    socket.on("receivedword",({redirectTo,lobby,word})=>{
      navigate(redirectTo);
    });



  }, [socket])
  



  useEffect(() => {
    // console.log(UserId);
    getlobbylist();
  }, [UserId,socket]);
  



  const getlobbylist=async ()=>{
    const res =await fetch('http://localhost:3000/lobbylist',{
      method:'GET',
      headers:{
        'Content-Type':'application/json'
      }
    });

    let data=await res.json();
    setLobbies(data);
    // console.log(Lobbies);
  }




  const handlesubmit=()=>{
    // console.log(Lobbies);
    const lobbyindex=Lobbies.findIndex((a)=>a.player1===UserId || a.player2===UserId);
    console.log(Lobbies);
    
    socket.emit("sentword",{word:Value,lobby:Lobbies[lobbyindex]});
    // navigate('/GameOnline');

  }




  return (
    <div className="container-word">
        <div className="word-box">
            <form onSubmit={(e)=>{
              e.preventDefault();
              handlesubmit();
            }}>
                <input className="input-word" value={Value} onChange={(e)=>{
                  setValue(e.target.value);
                }} type="text" maxLength={10} placeholder="Enter the word" />
                <button className="button-word" type="submit">Submit</button>
            </form>
        </div>
    </div>
  )
}

export default Word