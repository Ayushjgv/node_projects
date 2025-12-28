const mongoose=require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/tictactoe');

const lobbyschema=new mongoose.Schema({
    name:{type:String,required:true},
    player1:{type:String,default:null},
    player2:{type:String,default:null},
    turn:{type:String,default:'player1'},
    status:{type:String,default:'waiting'}
});

const lobby=mongoose.model('lobby',lobbyschema);

module.exports=lobby;