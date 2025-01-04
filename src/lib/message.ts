import { User } from "../types/user.ts";
import { Buffer } from "node:buffer";

const Message = {
    sendPong(user: User, ping: Buffer): Promise<boolean> {
        return new Promise((resolve, _reject) => {
            console.log("Sending PONG");
            if (!user.socketServer) {
                return resolve(false);
            }
            else {
                user.socketServer.write(`PONG${ping.toString().substring(4)}\r\n`, (err) => {
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

    send(user: User, channel: string, msg: string): Promise<boolean> {
        return new Promise((resolve, _reject) => {
            console.log(`user ${user.uuid} sending ${msg} to ${channel}`);
            if (!user.socketServer) {
                return resolve(false);
            }
            else {
                user.socketServer.write(`PRIVMSG ${channel} :${msg}\r\n`, (err) => {
                    if (err) {
                        return resolve(false);
                    }
                    else {
                        return resolve(true);
                    }
                });
            }
        });
    }
}

export default Message;