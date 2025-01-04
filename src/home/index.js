// grab the input and output elements for repeated usage
const inputForm = document.getElementById("input");
const outputdiv = document.getElementById("output");

const sysUser = "IRClay (System)";
let nickname = "Unidentified User";
const server = {
    name: null,
    socket: null,
};
let channel = null;

// on submit of the input field, process different input types
inputForm.addEventListener("submit", (event) => {
    // stop the page from refreshing
    event.preventDefault();

    // fetch the input
    const form = new FormData(inputForm);
    let userInput = "";

    for (let [key, val] of form.entries()) {
        userInput += val;
    }

    // cancel on empty input
    if (!userInput || !userInput.length) {
        return;
    }

    // append the input to the form
    sendOutput(userInput, nickname);

    // handle the input according to the lifecycle of the user's visit
    // if the nickname is not set, ask the user to set their nickname
    if (nickname === "Unidentified User") {
        setNickname(userInput);
    }
    // else if the user is not connected to a server, prompt for a server connection
    else if (!server.socket) {
        connectToServer(userInput);
    }
    // else if the user is not connected to a channel, prompt for a channel connection
    else if (!channel) {
    }
    // else send message
    else {
    }

    // clear the form
    inputForm.reset();
});

function sendOutput(message, user = null) {
    if (!user) {
        outputdiv.innerHTML += `<span class="msgSystem">${sysUser}:</span> `;
    } else {
        outputdiv.innerHTML += `<span class="msgUser">${nickname}:</span> `;
    }

    outputdiv.innerHTML += `${message}<br/>`;
}

function setNickname(newName) {
    nickname = newName;
    sendOutput(`Nickname has been set to ${nickname}`);
    sendOutput(`Please type the address of a server (host:port) to connect.`);
}

function connectToServer(newServer) {
    server.name = newServer;
    sendOutput(`Connecting to server ${server.name}...`);

    try {
        server.socket = new WebSocket(`ws://${server.name}`);
    } catch (err) {
        sendOutput(`An error occurred: ${err}`);
        server.name = null;
        server.socket = null;
        return;
    }

    server.socket.onopen = function (event) {
        sendOutput(`Connection established to ${server.name}!`);
    };

    server.socket.onmessage = function (event) {
        sendOutput(event.data, server.name);
    };
}
