import React from 'react'
import { useState, useRef, useEffect } from 'react';
import './Game.css';
import { useNavigate } from 'react-router-dom';
import{io} from 'socket.io-client';
import { useMemo } from 'react';

const Game = () => {
    const [values, setValues] = useState(["", "", "", "", ""]);
    const inputsRef = useRef([]);
    const [Chances, setChances] = useState(7);
    const [Word, setWord] = useState("");
    const [GameState, setGameState] = useState("");
    const [History, setHistory] = useState([]);
    const [SocketId, setSocketId] = useState("");
    const socket=useMemo(()=>io('http://localhost:3000',{}),[]);
    const [UserId, setUserId] = useState(null);
    const [Lobbies, setLobbies] = useState([]);
    const [CurrLobby, setCurrLobby] = useState([]);


    const navigate=useNavigate();


    useEffect(() => {
      setGameState("running");
    }, [GameState]);
    


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

        socket.emit("connect-game",{id:storedUserId});

      });





      socket.on("game-connected",({lobby})=>{
        console.log("game-connected");
        // console.log(lobby);
        setCurrLobby(lobby);
      });





      socket.on("GameStateUpdated",({Value,word,lobby,history,chances})=>{
        // console.log(Value);
        // console.log(word);
        // console.log(lobby);

        setValues(Value);
        setWord(word);
        setHistory(history);
        setChances(chances);
        // setCurrLobby(lobby);

      })






      socket.on("receivedword",({redirectTo,lobby,word})=>{
        const a=word.toUpperCase();
        setWord(a);
        setChances(7);
        const len =a.length;
        const arr=Array(len).fill("");
        setValues(arr);
      });



    }, [socket])
    



    useEffect(() => {
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



  
    const handleChange = (e, index) => {

      if(CurrLobby.turn==='player1'){
        if(CurrLobby.player1===UserId){
          console.log("player1 turn");
        }else{

          const value = e.target.value.toUpperCase();
      
          if (!/^[A-Z]?$/.test(value)) return;
      
          const newValues = [...values];
          newValues[index] = value;
          setValues(newValues);
      
          if (value && index < values.length-1) {
            inputsRef.current[index + 1].focus();
          }

          socket.emit("UpdateGameState",{values:newValues,word:Word,lobby:CurrLobby,history:History,chances:Chances});
          console.log("not player 1");
        }
      }
      else if(CurrLobby.turn ==='player2'){
        if(CurrLobby.player2===UserId){
          console.log("player2 turn");
        }else{

          const value = e.target.value.toUpperCase();
      
          if (!/^[A-Z]?$/.test(value)) return;
      
          const newValues = [...values];
          newValues[index] = value;
          setValues(newValues);
      
          if (value && index < values.length-1) {
            inputsRef.current[index + 1].focus();
          }

          socket.emit("UpdateGameState",{values:newValues,word:Word,lobby:CurrLobby,history:History});
          console.log("not player 2");
        }
      }


      // const value = e.target.value.toUpperCase();
  
      // if (!/^[A-Z]?$/.test(value)) return;
  
      // const newValues = [...values];
      // newValues[index] = value;
      // setValues(newValues);
  
      // if (value && index < values.length-1) {
      //   inputsRef.current[index + 1].focus();
      // }

      // socket.emit("UpdateGameState",{values:newValues,word:Word,lobby:CurrLobby,history:History});
    };



  
    const handleKeyDown = (e, index) => {
      if (e.key === "Backspace" && !values[index] && index > 0) {
        inputsRef.current[index - 1].focus();
      }
      else if(e.key==="ArrowLeft"){
        inputsRef.current[index - 1].focus();
      }
    };
  
  
    const removeclasslist=()=>{
      for(let i=0;i<5;i++){
        let box=inputsRef.current[i];
  
        box.classList.remove("spin");
        void box.offsetWidth;
        box.classList.add("spin");
  
        box.classList.remove("correct");
        box.classList.remove("partial-correct");
      }
    };





    const handlewin=()=>{
      CurrLobby.turn=CurrLobby.turn==='player1'?'player2':'player1';
      console.log(CurrLobby);
      navigate('/word');
      socket.emit("change-sides",{lobby:CurrLobby});
    };





  
    const handlebutton=()=>{


      if(CurrLobby.turn ==='player1'){
        if(CurrLobby.player1===UserId){
          console.log("hi");
        }else{
          setHistory([...History,values]);
          // console.log(History);
          
      
          if(Chances>0){
            setChances((prev)=>prev-1);
            let a=[...values];
            let b=[...Word];
      
            //win
      
            if(a.join("")===b.join("")){
              alert("Congratulations You Guessed It Right !!!");
              setChances(7);
              const value=["","","","",""];
              setValues(value);
              setGameState("ended");
              handlewin();
              removeclasslist();
              setHistory([]);
              return;
            }
      
            //correct
            
            for(let i=0;i<values.length;i++){
              let box=inputsRef.current[i];
      
              box.classList.remove("spin");
              void box.offsetWidth;
              box.classList.add("spin");
      
              if(a[i]===b[i]){
                box.classList.add("correct");
                box.classList.remove("partial-correct");
                b[i]='';
              }else{
                box.classList.remove("partial-correct");
                box.classList.remove("correct");
              }
            }
      
            //partial-correct
      
            for(let i=0;i<values.length;i++){
              let box=inputsRef.current[i];
      
              box.classList.remove("spin");
              void box.offsetWidth;
              box.classList.add("spin");
      
              for(let j=0;j<values.length;j++){
                if(a[i]===b[j] && j!=i){
                  box.classList.add("partial-correct");
                  box.classList.remove("correct");
                  b[j]='';
                }
              }
            }
          }
      
          //loose
      
      
          else{
            setChances(7);
            alert("You Are Out Of Moves "+` \nCorrect Word is ${Word}`);
            const value=["","","","",""];
            setValues(value);
            setGameState("ended");
            handlewin();
            removeclasslist();
            setHistory([]);
            return;
          }
        }
      }else if(CurrLobby.turn==='player2'){
        if(CurrLobby.player2===UserId){
          console.log("hi");
          
        }else{
          setHistory([...History,values]);
          // console.log(History);
          
      
          if(Chances>0){
            setChances((prev)=>prev-1);
            let a=[...values];
            let b=[...Word];
      
            //win
      
            if(a.join("")===b.join("")){
              alert("Congratulations You Guessed It Right !!!");
              setChances(7);
              const value=["","","","",""];
              setValues(value);
              setGameState("ended");
              handlewin();
              removeclasslist();
              setHistory([]);
              return;
            }
      
            //correct
            
            for(let i=0;i<values.length;i++){
              let box=inputsRef.current[i];
      
              box.classList.remove("spin");
              void box.offsetWidth;
              box.classList.add("spin");
      
              if(a[i]===b[i]){
                box.classList.add("correct");
                box.classList.remove("partial-correct");
                b[i]='';
              }else{
                box.classList.remove("partial-correct");
                box.classList.remove("correct");
              }
            }
      
            //partial-correct
      
            for(let i=0;i<values.length;i++){
              let box=inputsRef.current[i];
      
              box.classList.remove("spin");
              void box.offsetWidth;
              box.classList.add("spin");
      
              for(let j=0;j<values.length;j++){
                if(a[i]===b[j] && j!=i){
                  box.classList.add("partial-correct");
                  box.classList.remove("correct");
                  b[j]='';
                }
              }
            }
          }
      
          //loose
      
      
          else{
            setChances(7);
            alert("You Are Out Of Moves "+` \nCorrect Word is ${Word}`);
            const value=["","","","",""];
            setValues(value);
            setGameState("ended");
            handlewin();
            removeclasslist();
            setHistory([]);
            return;
          }
        }
      }





      
    };






    const exithandler=()=>{
      navigate('/');
    }
  
  
  
    return (
      <div className="game-container">
        <div className="word-box">
  
          {History.map((word, rowIndex) => (
            <div key={rowIndex} className="history-row">
              {word.map((char, colIndex) => (
                <input
                  className="history"
                  key={colIndex}
                  type="text"
                  value={char}
                  readOnly
                />
              ))}
            </div>
          ))}
  
  
          <form onSubmit={(e)=>{
            e.preventDefault();
          }}>
            {values.map((val, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              type="text"
              maxLength={1}
              value={val}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
          ))}
            <button type="submit" onClick={handlebutton}>Check</button>
            <button onClick={exithandler}>Exit</button>
          </form>
        </div>
        <div className="chances">
          Chances Left : {Chances}
        </div>
      </div>
    );
}

export default Game