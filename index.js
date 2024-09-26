const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const usersRepo = require('./repositories/users');

const app = express();
app.use(bodyParser.urlencoded({extended : true}));
app.use(cookieSession({
  keys : ['lgbhsuxwdw46y3uhbsj']
}))

app.get('/',(req,res)=>{
    res.send(`
      <div>
      your id is :${req.session.userid}
        <form method=POST >
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
app.post('/',async (req,res)=>{
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
})
app.listen(3000,()=>{
    console.log('listing');
}) 