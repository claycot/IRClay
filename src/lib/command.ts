import { User } from "../types/user.ts";
import Connect from "./connect.ts";

interface IRC_Command {
    name: string;
    tip: string;
    params: string;
    function: (user: User, params: string[]) => Promise<boolean>;
}

const Command = {

    processCommand(user: User, message: string): Promise<boolean> {
        if (!message.startsWith("/")) {
            return Promise.reject(false);
        }

        const [command, ...params] = message.substring(1).split(" ");

        if (commands.hasOwnProperty(command.trim().toLowerCase())) {
            return commands[command.trim().toLowerCase()].function(user, params);
        }
        else {
            user.socketClient?.send(`/info Unrecognized command: "${command.trim().toLowerCase()}", type /help for commands.`);
            return Promise.reject(false);
        }
    },

    joinServer(user: User, params: string[]): Promise<boolean> {
        console.log(params);
        const [host, port] = params[0].split(":");
        return Connect.joinServer(user, host, parseInt(port, 10));
    },

    joinChannel(user: User, params: string[]): Promise<boolean> {
        console.log(params);
        return Connect.joinChannel(user, params);
    },

    quitServer(user: User, params: string[]): Promise<boolean> {
        return new Promise((resolve, _reject) => {
            if (!user.socketServer) {
                return resolve(false);
            }
            else {
                user.socketServer.write(`QUIT${params.length ? `:${params[0]}` : ""}\r\n`, (err) => {
                    if (err) {
                        return resolve(false);
                    }
                    else {
                        return resolve(true);
                    }
                });
            }
        });
    },

    partChannel(user: User, params: string[]): Promise<boolean> {
        return new Promise((resolve, _reject) => {
            if (!user.socketServer) {
                return resolve(false);
            }
            else {
                user.socketServer.write(`PART ${params.join(",")}\r\n`, (err) => {
                    if (err) {
                        return resolve(false);
                    }
                    else {
                        return resolve(true);
                    }
                });
            }
        });
    },
};

const commands: Record<string, IRC_Command> = {
    "server": {
        name: "server",
        tip: "Establish a connection with an IRC server.",
        params: "<hostname>",
        function: Command.joinServer,
    },
    "join": {
        name: "join",
        tip: "Join channel(s) on the current IRC server.",
        params: "<channel>{,<channel>}",
        function: Command.joinChannel,
    },
    "quit": {
        name: "quit",
        tip: "Terminate connection with current IRC server, with an optional message for the current channel(s).",
        params: "{<message>}",
        function: Command.quitServer,
    },
    "part": {
        name: "part",
        tip: "Leave channel(s) on the current IRC server.",
        params: "<channel>{,<channel>}",
        function: Command.partChannel,
    },
}

export default Command;