/**
 * Author: Murtadha Marzouq
 */
const socket = io('ws://localhost:1633');

let users = [];
let currentUser = {
    nickname: '',
    state: " ",
    isTyping: " "

}


const userIsTyping = (nickname) => {
    /**
     * Update the typing indicator for 2 seconds
     */
    users.forEach((user) => {
        if (user.nickname === nickname) {
            console.log(user.nickname + ' is typing typing');
            setTimeout(() => {
                user.isTyping = "false";
                socket.emit('updateUsers', users);
                console.log(user.nickname + ' is not typing');
            }, 2000);
        }
    }
    )

}



document.addEventListener('DOMContentLoaded', () => {




    function setNickname() {
        let nickname = document.getElementById('nickname').value;
        currentUser.nickname = nickname;
        socket.emit('nickname', nickname);
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('ChatApp').style = 'display: blocks ';

        /**
         * Get the initial data from the server
         */
        socket.emit('getInitialData', `${currentUser.nickname} has joined the chat`);
    }



    document.getElementById('message-form').addEventListener('submit', function (e) {
        e.preventDefault();
    });
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        setNickname();
    });

    const sendMessageform = document.getElementById('message-form');
    sendMessageform.addEventListener('submit', (e) => {
        e.preventDefault();
        let message = document.getElementById('SendMessage').value;
        message = `${currentUser.nickname}: ${message}`;
        socket.emit('message', message);
        document.getElementById('SendMessage').value = ''        
    });




    /**
     * ActionListener for the form
     * */
    var input = document.getElementById('SendMessage');

    input.addEventListener('submit', function (e) {
        e.preventDefault();
        if (input.value) {
            console.log(input.value);
            let message = `${currentUser.nickname}: ${input.value}`;
            socket.emit('message', message);
            input.value = '';
        }
    });

    // socket.emit('getInitialData', `${currentUser.nickname} has joined the chat`);
});

/**
 * Get the elements from the DOM
 * */

let messages = document.getElementById('messages')
var form = document.getElementById('login-form');
var usersList = document.getElementById('users-list');

var typing = document.getElementById('typing');
let updates = document.getElementById('status-updates');

const updateStatusMessage = (message) => {
    const update = document.createElement('p');
    update.innerHTML = message;
    updates.appendChild(update);
}

var input = document.getElementById('SendMessage');

input.addEventListener('keypress', function (e) {
    /**
     * Send the typing event to the server
     */
    console.log('typing');
    currentUser.isTyping = "true";
    socket.emit('typing', `${currentUser.nickname}`);


});






/**
 * Load the messages from the server
 */
socket.on('messages', function (newMessages) {
    messages.innerHTML = '';
    console.log(newMessages);
    newMessages.forEach(function (message) {
        let newMessage = document.createElement('li');
        let messageUser = message.split(":")[0];
        let messageContent = message.split(":")[1];
        /**
         * Remove spaces from the message
         */
        messageContent = messageContent.trim();
        messageUser = messageUser.trim();
        let messageHTML = '';
        if (messageUser === currentUser.nickname) {
            messageHTML = ` 
                <div class="message sent">
                <p>${messageContent}</p>
                
                </div>           
                <p class="timerecieved" >${new Date().toLocaleTimeString()}</p>
                <span></span>
            `;
        } else {
            messageHTML = `  <span class="nickname">${messageUser}:</span>

                <div class="message received">
               
      
                <p>${messageContent}</p>
</div>
                <p class="timesent" >${new Date().toLocaleTimeString()}</p>
            <span></span>`;
        }
        newMessage.innerHTML = messageHTML;
        messages.appendChild(newMessage);


        window.scrollTo(0, document.body.scrollHeight);
    });
});




/**
 * Update State Socket Event
 */
socket.on('updateUsers', function (Updatedusers) {
    users = Updatedusers;

    usersList.innerHTML = '';

    users.forEach(function (user) {


        var newUser = document.createElement('div');
        newUser.className = 'user box ';
        if (user.isTyping === "true") {
            userIsTyping(user.nickname);
            newUser.innerHTML = `
        <div class="user-status">

<li class="nickname">
${user.nickname}
<div class="isTyping typing-indicator">
  <span></span>
  <span></span>
  <span></span>
</div>
</li>

</div>
        
`
        } else {
            newUser.innerHTML = `
            <div class="user-status">

<li class="nickname">
${user.nickname}

</li>

</div>

`
        }
        usersList.appendChild(newUser);

    }
    );
});


/**
 * LOGOUT EVENT
 */

document.getElementById('logout-button').addEventListener('click', () => {

    /**
     * Emit the logout event to the server
     */
    socket.emit('logout', `${currentUser.nickname}`);
    /**
     * Disconnect the socket
     */
    socket.disconnect();
    /**
     * Refresh the page
     * */
    location.reload();

});






/**
 * The Nickname Event where the user is prompted to enter a nickname
 */
socket.on('nickname', (data) => {
    socket.nickname = data;
    console.log(`${data} has joined the chat`);
    users.push(socket.nickname);
    console.log(users);
});

/**
 * Status Update Event
 */
socket.on('statusUpdate', (data) => {
    updateStatusMessage(data);
});



