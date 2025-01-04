import { randomUUID, type UUID } from "node:crypto";
import { User } from "./types/user.ts";
import Message from "./lib/message.ts";
import Command from "./lib/command.ts";

export const sysUser: string = "IRClay (System)";

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  // Connect.joinServer(clay, 'irc.freenode.net', 6667);
  const users: Record<UUID, User> = {};

  // the server connects to individual clients via websockets
  Deno.serve((req) => {
    // if the request is not to create a websocket, return a serv error
    if (req.headers.get("upgrade") != "websocket") {
      return new Response(null, { status: 501 });
    }

    // otherwise, create the websocket!
    const { socket, response } = Deno.upgradeWebSocket(req);

    // the general user is not yet identified
    const user: User = {
      username: 'Unidentified User',
      username_choices: [],
      name: 'Unidentified User',
      socketClient: socket,
      uuid: randomUUID(),
    };
    users[user.uuid] = user;

    // on first connection, log to the mediator and reply to the socket
    socket.addEventListener("open", () => {
      console.log(`Client connected, UUID ${user.uuid} assigned`);
      user.socketClient?.send(`/info Connected to IRC mediator!`);
      user.socketClient?.send(`/info You are required to pick a nickname! Please type one now.`);
    });

    // on socket close, log to the mediator
    socket.addEventListener("close", () => {
      console.log(`Client UUID ${user.uuid} disconnected`);
    });

    // listen for client input
    socket.addEventListener("message", (event) => {
      console.log(`UUID ${user.uuid} sent ${event.data}`);
      // set username on first message
      if (user.username === "Unidentified User") {
        user.username = event.data;
        user.username_choices.push(user.username);
        for (let i = 1; i < 3; i++) {
          user.username_choices.push(user.username_choices[user.username_choices.length - 1] + "_");
        }
        user.socketClient?.send(`/set Nickname assigned: ${user.username}`);
        user.socketClient?.send(`/info Join a server with /server <hostname:port>`);
      }
      // process commands
      else if (event.data.startsWith("/")) {
        Command.processCommand(user, event.data);
      }
      // send messages
      else if (user.socketServer && user.channels) {
        const [channel, message] = event.data.split(":");
        if (!user.channels.includes(channel)) {
          user.socketClient?.send(`/info You are not part of channel ${channel}, try joining with "/join ${channel}"`);
        }
        else {
          Message.send(user, channel, message.trim());
        }
      }
    });

    return response;
  });
}
