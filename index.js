const express = require('express');

const app = express();

app.get('/',(req,res)=>{
    res.send(`
      <div>
        <form>
            <input placeholder="Email"/>
            <input placeholder="Password"/>
            <input placeholder="Password confirmation"/>
            <button>Sign Up</button>
        </form>
      </div>
        `);
});

app.listen(3000,()=>{
    console.log('listing');
}) 