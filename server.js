const express = require('express');
const app = express();
const server = require('http').Server(app); //since server is built-in we don't need to require http package first and then call server on it
const io = require('socket.io')(server);
const { v4: uuidv4} = require('uuid');
const {ExpressPeerServer} = require('peer'); //peer and express works together
const peerServer = ExpressPeerServer(server,{
    debug:true
});


app.set('view engine','ejs');
app.use(express.static('public'))//notifies server that static files will be in public folder

app.use('/peerjs',peerServer);

app.get('/',(req,res)=>{
    //res.status(200).send('Hello world');//with send method we can get the Hello world printed on the localhost:3030 
    //res.render('room'); //res.render is used with ejs // this line means we will show the room.ejs file on the front end
    res.redirect(`/${uuidv4()}`)
});

app.get('/:room',(req,res)=>{
    res.render('room',{roomId: req.params.room})
})

io.on('connection',socket=>{
    socket.on('join-room',(roomId,userId)=>{ //receive from client 
        socket.join(roomId) //console.log('hey we joined room');
        socket.to(roomId).broadcast.emit('user-connected',userId); //send to client //server tells that hey this unique id user joined the chat 
        socket.on('message',message =>{  //receives from frontend
            io.to(roomId).emit('createMessage',message)  //sends back the msg to all users
        })
    
    
    })
})


server.listen(process.env.PORT || 3030,()=>{
    console.log('server started at 3030');
});



//io.on('conection') on server side always socket.on('connect') on client side always
//socket.emit is the one sending and socket.on is the one receiving. both sender and receiver has a unique event name

