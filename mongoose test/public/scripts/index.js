const btn=document.getElementById('btn');

btn.addEventListener('click',async ()=>{
    let res=await fetch('/users-data');
    // console.log(res);
    let json=await res.json();
    console.log(json);
    let txt=JSON.stringify(json);
    console.log(txt);
});