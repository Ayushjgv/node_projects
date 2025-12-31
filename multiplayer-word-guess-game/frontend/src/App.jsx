import React from 'react'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Index from './components/Index';
import Game from './components/Game';
import GameOnline from './components/GameOnline';
import Lobbies from './components/Lobbies';
import Waiting from './components/Waiting';
import Word from './components/Word';

const App = () => {
  return (
    <div className="index">
      <Router>
        <Routes>
          <Route path='/' element={<Index />} />
          <Route path='/Game' element={<Game />} />
          <Route path='/GameOnline' element={<GameOnline />} />
          <Route path='/Lobbies' element={<Lobbies />} />
          <Route path='/Waiting' element={<Waiting />} />
          <Route path='/Word' element={<Word />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App