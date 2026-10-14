const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let users = [];
let nextId = 1;

const findUserByEmail = (email) => users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
const findUserById = (id) => users.find(u => u.id === id);
const sanitize = (u) => { const {password, ...safe} = u; return safe; };

app.get('/api/users', (req,res)=> res.json(users.map(sanitize)));

app.post('/api/users', (req,res)=>{
  const {name,email,password,role} = req.body;
  if(!name||!email||!password) return res.status(400).json({error:'All fields required'});
  if(findUserByEmail(email)) return res.status(409).json({error:'Email exists'});
  let r='user'; if(role==='admin') r='admin'; else if(role==='staff') r='staff';
  const newUser={id:nextId++, name,email,password,role:r};
  users.push(newUser); res.status(201).json(sanitize(newUser));
});

app.post('/api/login', (req,res)=>{
  const {email,password}=req.body;
  const user=findUserByEmail(email);
  if(!user || user.password!==password) return res.status(401).json({error:'Invalid login'});
  let redirect='/user.html'; if(user.role==='admin') redirect='/admin.html'; else if(user.role==='staff') redirect='/staff.html';
  res.json({message:'Login ok', user:sanitize(user), redirectTo:redirect});
});

app.delete('/api/users/:id', (req,res)=>{
  const id=parseInt(req.params.id); users=users.filter(u=>u.id!==id); res.status(204).send();
});

app.listen(3000, ()=> console.log('Server running on http://localhost:3000'));