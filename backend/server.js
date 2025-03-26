const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

let currentLocation = { lat: 2, lng: 2 };

// Endpoint to receive GPS data
app.post("/location", (req, res) => {
    const { lat, lng } = req.body;
    console.log(lat, lng);
    if (!lat || !lng) return res.status(400).send("Invalid data");

    currentLocation = { lat, lng };

    // Emit real-time data to clients
    io.emit("locationUpdate", currentLocation);

    res.send({ success: true });
});

// Endpoint to get the latest location
app.get("/latest-location", (req, res) => {
    res.send(currentLocation);
});

// WebSocket connection
io.on("connection", (socket) => {
    console.log("Client connected");

    // Send the latest location when a client connects
    if (currentLocation.lat && currentLocation.lng) {
        socket.emit("locationUpdate", currentLocation);
    }

    socket.on("disconnect", () => console.log("Client disconnected"));
});

server.listen(5000, () => console.log("Server running on port 5000"));
