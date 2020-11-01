# collab-web
# Architecture

![](https://github.com/sig5/collab-web/blob/master/views/images/archi.png)

1-> A completely horizontally scalable system is implemented.  
2-> n number of instances can be run simultanously on different ports thus mimicking the existence of different servers.  
3-> each client is allotted a specific server on sticky server strategy and load is horizontally distributed.  
4->The independence of the servers is overcome by using i Publisher Subscriber model using a Redis server and node js servers modelled as  redis clients.  
5->Also Redis key value store is being used to keep the current state of room in cache to make data available at all times.  

# Major Libraries used:
## JS
1->Loadbalancer.js-> For setting up a sticky server.  
2->Express->HTTP server setup
3->bcrypt,jwt
4->Redis
5->socket.io
## css
1-> Materialize CSS

# Features
1->Login Sign-up with maintainenence of session
2->Different colors and size of pens and Erasers
3->Saving the whiteboards locally as images.
4->Share room using a link.
5->Room management (Custom generation and random)
6->ReadOnly->limit the writing privileges on the board
7->Ability to add text(Pannable).
8->Ability to add Shapes (Pnnable).
9->Realtime Group Chats.
10->Realtime occupants status independent of servers.
11->Undo/redo operations are Supported.
# Major attractions
1->Fully Horizontally Scalable backend design.
2->REDIS caching to store state of the user at small intervals of time.
