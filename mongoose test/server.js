const express=require('express');
const app=express();
const fs=require('fs');
const path=require('path');
const User=require('./public/user');


app.set('view engine','ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,'public')));




app.get('/',(req,res)=>{
    const createUser = async () => {
        const user = await User.create({
            name: "Ayush",
            age: 20,
            email: "ayush@example.com"
        });
        console.log(user);
    };
    createUser();
    const getUsers = async () => {
        const users = await User.find(); // all users
        console.log(users);
    };
    getUsers();
    User.find({ age: { $gte: 18 } });
    res.render('index');
});


app.get('/users-data',async (req,res)=>{
    const users=await User.find();
    res.json(users);
});










app.listen(3000);