import type { UUID } from "node:crypto";
import type { Socket } from "node:net";

export interface User {
    uuid: UUID,
    username: string,
    username_choices: string[],
    name: string,
    socketClient?: WebSocket,
    socketServer?: Socket,
    channels?: string[],
}