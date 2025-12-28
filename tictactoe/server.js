const express=require('express');
const app=express();
const http=require('http');
const path =require('path');
const server=http.createServer(app);
const {Server}=require('socket.io');
const io=new Server(server);

const PORT=process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.resolve('./public')));






io.on('connection',(socket)=>{
    console.log('A user connected:', socket.id);
});


server.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});