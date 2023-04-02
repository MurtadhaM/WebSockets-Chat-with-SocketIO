/**
 * Author: Murtadha Marzouq
 * 
 */


const express = require('express');
const app = express();
const io = require('socket.io');



const server = app.listen(1644, () => {
    console.log('Server running on http://45.55.32.24:1644');
}
);

let users = [];

let messages = [];

let user = {
    nickname: '',
    state: " ",
    isTyping: " "
}

class User {
    constructor(nickname, state, isTyping) {
        this.nickname = nickname;
        this.state = state;
        this.isTyping = isTyping;
    }
    setNickname(nickname) {
        this.nickname = nickname;
    }

    setState(state) {
        this.state = state;
    }

    setIsTyping(isTyping) {
        this.isTyping = isTyping;
    }

    getNickname() {
        return this.nickname;
    }

    getState() {
        return this.state;
    }

    getIsTyping() {

        return this.isTyping;
    }

}




app.use(express.static('client'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});




const socket = io(server);

socket.on('connection', (socket) => {
    console.log('New client connected,sending the messages and users array');



    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

    socket.on('message', (message) => {
        console.log(message);
        messages.push(message);
        socket.emit('messages', messages);
        socket.broadcast.emit('messages', messages);
    }
    );



    /**
     * Respond to GetInitialData event
     */
    socket.on('getInitialData', () => {
        console.log('Sending the messages and users array');
        socket.emit('messages', messages);
        socket.broadcast.emit('messages', messages);

        socket.emit('updateUsers', users);
        socket.broadcast.emit('updateUsers', users);
    }
    );




    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data);
    }
    );

    socket.on('nickname', (nickname) => {
        /**
         * Create a new user and add it to the users array
         */

        let user = new User(nickname, "online", "false");
        users.push(user);

        console.log(users);
    }
    )
    socket.on('logout', (nickname) => {
        let temp = [];
        console.log(nickname + ' has logged out');
        /**
         * Remove the user from the users array
         */
        users.forEach((user) => {
            if (user.nickname !== nickname) {
                temp.push(user);
            }
        }
        );
        users = temp;
        console.log(users);

        socket.emit('updateUsers', users);
        socket.broadcast.emit('updateUsers', users);



    }
    );


    socket.on('typing', (isTyping) => {

        users.forEach((user) => {
            if (user.nickname === isTyping) {
                console.log(user.isTyping + ' is typing typing');

                user.isTyping = "true";
                socket.emit('updateUsers', users);
                socket.broadcast.emit('updateUsers', users);


                setTimeout(() => {
                    user.isTyping = "false";
                    socket.emit('updateUsers', users);
                    socket.broadcast.emit('updateUsers', users);

                    console.log(user.nickname + ' is not typing');

                }, 2000);
            }




            socket.on('updateUsers', (user) => {
                // Rurn

                socket.broadcast.emit('updateUsers', user);
            }
            );


        });


    });

});




