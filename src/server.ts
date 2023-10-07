import {Socket} from "bun";


export class ServerManager {

    constructor(
        private config: {hostname: string, port: number}
    ) {}

    onopen: (socket: Socket<any>) => void | Promise<void>  = () => {};
    ondata: (socket: Socket<any>, data: Buffer) => void | Promise<void> = () => {};

    run() {
        console.log('Started on port', this.config.port);

        Bun.listen({
            ...this.config,
            socket: {
                open: this.onopen.bind(this),
                data: this.ondata.bind(this)
            }
        });
    }
}