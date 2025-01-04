// grab the input and output elements for repeated usage
const inputForm = document.getElementById("input");
const outputdiv = document.getElementById("output");
const tabTitle = document.getElementById("title");

// establish a connection to the system IRC mediator
const sockMediator = new WebSocket(`ws://localhost:8000`);

// information on the irc server
const sysUser = "IRClay (System)";
let nickname = "Unidentified User";
let server = null;
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

    // send the input to mediator
    if (server && channel && !userInput.startsWith("/")) {
        sendMessage(userInput, channel);
    } else {
        sockMediator.send(userInput);
    }

    // clear the form
    inputForm.reset();
});

sockMediator.addEventListener("open", (event) => {
    // sendOutput("Connected to IRC mediator!");
});

sockMediator.addEventListener("close", (event) => {
    sendOutput(
        "Disconnected from IRC mediator! Please restart the Deno/Node process."
    );
});

sockMediator.addEventListener("message", (event) => {
    // system messages from the mediator send here
    if (event.data.startsWith("/")) {
        if (event.data.startsWith(`/set Nickname`)) {
            setNickname(event.data.split(":")[1].trim());
        } else if (event.data.startsWith(`/set Server`)) {
            connectToServer(event.data.split(":")[1].trim());
        } else if (event.data.startsWith(`/set Channel`)) {
            joinChannel(event.data.split(":")[1].trim());
        }
        sendOutput(event.data.split(" ").slice(1).join(" "));
    }
    // IRC messages come through as a long string with line breaks
    else {
        event.data.split("\r\n").forEach((msg) => {
            let msgParts = msg.split(" ");
            if (msgParts[0].startsWith(":")) {
                sendOutput(msg, msgParts[0].substring(1));
            }
        });
    }
});

function sendOutput(message, user = null) {
    // escape special characters
    message = message
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    // create a new div to hold the message
    const msgDiv = document.createElement("div");
    msgDiv.innerHTML = "";

    // tag the sending user
    if (!user) {
        msgDiv.innerHTML += `<span class="msgSystem">${sysUser}:</span> `;
    } else {
        msgDiv.innerHTML += `<span class="msgUser">${user}:</span> `;
    }

    // include the message
    msgDiv.innerHTML += `${message}<br/>`;

    // append the new message div to the output
    outputdiv.appendChild(msgDiv);

    // scroll to bottom of page
    window.scrollTo(0, document.body.scrollHeight);
}

function setNickname(newName) {
    // TODO: regex the nickname
    nickname = newName;
}

function connectToServer(newServer) {
    // TODO: regex the server:port
    server = newServer;
    tabTitle.innerText = `IRClay | ${server}`;
}

function joinChannel(newChannel) {
    // TODO: regex the channel
    channel = newChannel;
    tabTitle.innerText = `IRClay | ${server} | ${channel}`;
}

function sendMessage(message, channel) {
    sockMediator.send(`${channel}: ${message}`);
}
