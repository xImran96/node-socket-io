// io();
const socket = io();

const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocation = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

//auto scroll

const autoscroll = ()=>{

		// New Element Message
		const $newMessage = $messages.lastElementChild;

		// New Message Style
		const newMessageStyle = getComputedStyle($newMessage);

		// New Message margin
		const newMessageMargin = parseInt(newMessageStyle.marginBottom); 

		// New Message height
		const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;


		// visible Height
		const visibleHeight = $messages.scrollHeight;

		// Container Height
		const containerHeight = $messages.scrollHeight;

		const scrollOffset = $messages.scrollTop + visibleHeight;

		if(containerHeight - newMessageHeight <= scrollOffset){
			$messages.scrollTop = $messages.scrollHeight;
		}


		console.log(newMessageHeight);


}




// Template
const messagesTemplate = document.querySelector('#messages-template').innerHTML;
const locationMessagesTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true});


socket.on('greetings', (message)=> {
	console.log(message);

	const html = Mustache.render(messagesTemplate, {
		username: message.username,
		message: message.text,
		createdAt: moment(message.createdAt).format('h:mm a')
	});

	$messages.insertAdjacentHTML('beforeend', html);
	autoscroll();
});

socket.on('countUpdate', (count)=> {
	console.log("the count has been updated " + count);
});

socket.on('LocationMessage', (url)=> {
	console.log(url);

	const html = Mustache.render(locationMessagesTemplate, {
		username: url.username,
		url: url.url,
		createdAt: moment(url.createdAt).format('h:mm a')
	});
	$messages.insertAdjacentHTML('beforeend', html)

});





$messageForm.addEventListener('submit', (e)=>{
	e.preventDefault();

	$messageFormButton.setAttribute('disabled', 'disabled');
	const message = e.target.elements.message.value;
	// const message = document.querySelector('textarea').value;
	$messageFormInput.value = ''; 
	$messageFormInput.focus()

	socket.emit('sendMessage', message, (error)=>{

	   $messageFormButton.removeAttribute('disabled');
		if(error){
			return console.log(error);
		}

		console.log('Message Delivered');

	});

});


$sendLocation.addEventListener('click', ()=>{
	if(!navigator.geolocation){
		return alert('Geo Location is not supported by your browser..');
	}	

	navigator.geolocation.getCurrentPosition((position)=>{
		

		socket.emit('sendLocation', {
				'latitude': position.coords.latitude,
				'longitude': position.coords.longitude
			}
			, ()=>{
				console.log('Location Shared...');
			});
	});

});


// console.log(username + ' '+ room);
socket.emit('join', { username, room }, (error)=>{
	if(error){
		alert(error);

		location.href = '/';

	}
});


socket.on('roomData', (data)=>{
	// console.log(data.room);
	// console.log(data.users);
		const html = Mustache.render(sidebarTemplate, {
		room: data.room,
		users: data.users
	});

	document.querySelector('#sidebar').innerHTML = html
});