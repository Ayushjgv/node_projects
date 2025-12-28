const express=require('express');
const app=express();
const path=require('path');
const fs=require('fs');


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));
app.set('view engine','ejs');


app.get('/',(req,res)=>{
    fs.readdir('./files','utf8',(err,data)=>{
        if(err){
            console.error('Error reading file:', err);
            return res.status(500).send('Server Error');
        }
        console.log('File data:',data);
        const notes=data.map(filename=>{
            const content=fs.readFileSync(`./files/${filename}`,'utf8');
            return {content,filename};
        });
        res.render('index',{notes});
    });
});



app.post('/note-add',(req,res)=>{
    const note=req.body.note;
    if(!note || note.trim()===''){
        return res.redirect('/');
    }
    console.log('Note received:',note);
    const filename = `note-${Date.now()}.txt`;
    fs.writeFile(`./files/${filename}`, note, (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return res.status(500).send('Server Error');
        }
        res.redirect('/');
    });
})




app.post('/note-delete/:id',(req,res)=>{
    const files = fs.readdirSync("./files");
    const filename = files[req.params.id];
    if (filename) fs.unlinkSync(`./files/${filename}`);
    res.redirect("/");
});





app.listen(3000);







