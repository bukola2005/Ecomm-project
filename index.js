const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const usersRepo = require('./repositories/users');
// const e = require('express');

const app = express();
app.use(bodyParser.urlencoded({extended : true}));
app.use(cookieSession({
  keys : ['lgbhsuxwdw46y3uhbsj']
}))

app.get('/signup',(req,res)=>{
    res.send(`
      <div>
      your id is :${req.session.userid}
        <form method="POST" >
            <input name="email" placeholder="Email"/>
            <input name="password" placeholder="Password"/>
            <input name="passwordConfiramation"
             placeholder="Password confirmation"/>
            <button>Sign Up</button>
        </form>
      </div>
        `);
});
// const bodyParser = (req,res,next)=>{
//   if(req.method === 'POST'){
//     req.on('data',data =>{
//       const parsed = data.toString('utf8').split('&');
//       const formData = {};
//       for(let pair of parsed){
//         const [key,value]= pair.split('=');
//         formData[key] = value;
//       }
//       req.body = formData;
//       next();
//       });
//   }else{
//     next();
//   }
// }
app.post('/signup',async (req,res)=>{
  const {email,password,passwordConfiramation} = req.body;
  const existingUser = await usersRepo.getOneBy({email});
  if (existingUser){
    return res.send('Email in use');
  }

  if(password !== passwordConfiramation){
    return res.send('passwords must match');
  }
  // create a user in our userRepo to repersent this person
    const user = await usersRepo.create({email,password});

  // store the id of the user inside the users cookie
  req.session.userid = user.id  //Added by cookie session

  res.send('account created');
});

app.get('/signout',(req,res)=>{
  req.session = null;
  res.send('you are logged out');
});

app.get('/signin',(req,res)=>{
  res.send(`
    <div>
      <form method="POST" >
          <input name="email" placeholder="Email"/>
          <input name="password" placeholder="Password"/>
          <button>Sign In</button>
      </form>
    </div>
      `);
});

app.post('/signin'  ,async(req,res)=>{
  const {email,password} = req.body;

  const user = await usersRepo.getOneBy({email});

  if (!user) {
    return res.send('Email not found');
  }
  const vaildPassword = await usersRepo.comparePasswords(user.password,password)
  if (!vaildPassword) {
    return res.send('Invalid password');
  }

  req.session.userid = user.id;

  res.send('You are signed in');  
});

app.listen(3000,()=>{
    console.log('listing');
}) 