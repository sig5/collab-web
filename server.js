module.exports = (port) => {
    const express = require('express')
    const path = require('path')
    const bodyparser = require('body-parser')
    const router = require('./routes/router.js')
    const cors = require('cors')
    const app = express()
    const http = require('http').Server(app)
    const io = require('socket.io')(http);
    const redis = require('redis');
    const instance_check = require('./middleware/if_logged_in')
    app.use(cors())
    app.use(bodyparser.urlencoded({ extended: false }))
    app.use(bodyparser.json())
    app.use(express.static('views/images'))
    app.use(express.static('views/js'))
    app.use(express.static('views/css'))
    app.use(router);
    http.listen(port, () => {
        console.log(`server up on port ${port}`)
    });

    let pub = redis.createClient();
    let sub = redis.createClient();

    io.use(async (socket, next) => {
        instance_check.handleAuth(socket.handshake, next);
    });
    function processCookie(cookies, obj) {

        cookies.forEach(element => {
            let a = element.split('=');
            a[0] = a[0].trim();
            if (a[0] == 'room_id')
                obj.room = a[1];
            if (a[0] == 'user')
                obj.user = a[1];
        });
        return obj;
    }
    function updateOccupants(userData) {
        pub.get(userData.room + 'list', (err, res) => {
            if (res === null) {
                rooms = [];
                rooms.push(userData.user);
                rooms = Array.from(new Set(rooms));
                pub.set(userData.room + 'list', JSON.stringify(rooms));
            }
            else {
                lst = JSON.parse(res);
                lst.push(userData.user);
                lst = Array.from(new Set(lst));
                pub.set(userData.room + 'list', JSON.stringify(lst));

            }

        });
    }
    function manageReadOnly() {

    }
    io.on('connection', (client) => {
        let room, user;
        let obj = { room: room, user: user };
        obj = processCookie(client.handshake.headers.cookie.split(';'), obj);
        room = obj.room
        user = obj.user
        pub.set(room + "read", "false");
        sub.subscribe(room);
        let key;
        pub.get(room, (err, res) => {
            if (res)
                key = res
            client.emit('cache', key);
        });
        updateOccupants(obj);
        let current = user;
        client.on('read-only', (message) => {
            var state;
            pub.get(room + 'read', (err, res) => {
                console.log('result' + res);
                state = res;
                if (message.localeCompare('false') == 0 && user.localeCompare(state) == 0) {
                    console.log('read not')
                    pub.set(room + 'read', 'false');
                }

            });
            console.log('making board readonly')
            if (message.localeCompare('true') == 0)
                pub.set(room + 'read', user);
        });

        client.on('disconnect', () => {
            pub.get(room + 'list', (err, res) => {
                if (!(res === null)) {
                    rooms = JSON.parse(res);
                    rooms = rooms.filter(item => item != user);
                    pub.set(room + 'list', JSON.stringify(rooms));
                    console.log(rooms);
                }
                else {
                    console.log("lol");

                }
            });
            console.log('closed');

        });

        console.log('registered' + room)
        sub.on('message', (channel, message) => {
            client.emit("data", message);
            console.log('message recieved on redis instance' + message.substr(1, 100));
        });

        {
            client.on('message', (message) => {
                pub.get(room + 'read', (err, res) => {
                    console.log(res);
                    if (res.localeCompare("false") == 0)
                        pub.publish(room, message);
                    else if (current.localeCompare(res) == 0) {
                        console.log(user + res);
                        pub.publish(room, message);
                    }

                });
                //pub.publish(room,message);
            });

        }
        client.on('cache', (data) => {
            // console.log("recieved cache")
            pub.set(room, data);
        });

        setInterval(async () => {
            pub.get(room + 'list', (err, res) => {
                client.emit('occupants', res);
            })

        }, 10000);


    });
}
