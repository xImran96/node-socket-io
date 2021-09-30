const http = require('http');
const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./util/messages.js');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./util/users.js');


const app = express();

const server = http.createServer(app);

const io = socketio(server);

const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));

const port = process.env.PORT || 3500;


let count = 0;

io.on('connection', (socket)=>{
	console.log('Connection Established');


		socket.on('join', (options, callback)=>{	

		// socket.on('join', ({username, room}, callback)=>{	
			const {error, user} = addUser({id: socket.id, ...options});

			// const {error, user} = addUser({ id: socket.id, username, room});
			if(error){
				return callback(error);
			}
	

			// socket.join(room);

			socket.join(user.room);

			socket.emit('greetings', generateMessage(user.username, 'Welcome!!!'));
			
			
			// socket.broadcast.to(room).emit('greetings', generateMessage(`${username} joined the group...`));
		
			socket.broadcast.to(user.room).emit('greetings', generateMessage(`${user.username} joined the group...`));
			io.to(user.room).emit('roomData', {
				room: user.room,
				users: getUsersInRoom(user.room)
			});
			callback();

	})




	socket.on('sendLocation', (coords, callback)=>{

		const user = getUser(socket.id);
		io.to(user.room).emit('LocationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));

		callback();
	})




	socket.on('disconnect', () => {
		const user = removeUser(socket.id);

		if(user){

			io.to(user.room).emit('greetings', generateMessage(`${user.username} left the chatroom..`));		
			io.to(user.room).emit('roomData', {
				room: user.room,
				users: getUsersInRoom(user.room)
			});
		}
	});

	socket.on('sendMessage', (message, callback)=>{
		
		const user = getUser(socket.id);

		const filter = new Filter();
		if(filter.isProfane(message)){
			return callback('Profanity is not allowed');
		}

		io.to(user.room).emit('greetings', generateMessage(user.username, message));
		callback();	
	});







});

server.listen(port, ()=>{
	console.log(`Server is running at ${port}`);
});