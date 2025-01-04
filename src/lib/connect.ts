import { createConnection } from "node:net";
import { User } from "../types/user.ts";
import Message from "./message.ts";
import { sysUser } from "../main.ts";

const Connect = {

    // function to join a new server, returns success boolean
    joinServer(user: User, host: string, port: number): Promise<boolean> {
        return new Promise((resolve, _reject) => {
            // create a connection
            const connection = createConnection({ port, host }, () => {
                console.log('Connected to server\r\n');
                user.socketServer = connection;
                user.socketClient?.send(`/set Server: ${host}:${port}`);
                user.channels = [];
            });

            // for that connection, always print the messages sent by the server
            connection.on('data', (data) => {
                console.log('Received from server:\r\n', data.toString());
                // silently respond to ping messages
                if (data.toString().startsWith("PING")) {
                    Message.sendPong(user, data);
                }
                else {
                    user.socketClient?.send(data.toString().trim());
                }
            });

            // handle the first data message with .once() for NICK registration
            connection.once('data', (data) => {
                console.log('First data received, performing NICK/USER registration:\r\n');

                // register nickname and user info
                connection.write(`NICK ${user.username}\r\n`);
                connection.write(`USER guest 0 * :${user.name}\r\n`);

                // on the first registration ping, mark connection successful
                connection.once('data', (data) => {
                    if (data.toString().startsWith("PING")) {
                        // mark the connection as established
                        resolve(true);
                    }

                });
            });

            // connection failed
            connection.on('error', (err) => {
                console.error('Connection error:', err);
                resolve(false);
            });

            // disconnected before successful communication
            connection.on('end', () => {
                console.log('Disconnected from server');
                resolve(false);
            });
        });
    },

    joinChannel(user: User, params: string[]): Promise<boolean> {
        return new Promise((resolve, _reject) => {
            console.log(`user ${user.uuid} joining ${params.join(", ")}`);
            if (!user.socketServer) {
                return resolve(false);
            }
            else {
                user.socketServer.write(`JOIN ${params.join(",")}\r\n`, (err) => {
                    if (err) {
                        return resolve(false);
                    }
                    else {
                        params.forEach(channel => {
                            user.socketClient?.send(`/set Channel: ${channel}`);
                            user.channels?.push(channel);
                        });
                        return resolve(true);
                    }
                });
            }
        });
    }

    // leaveServer(connection: Socket): boolean {

    // }
}

export default Connect;