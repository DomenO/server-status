import {randomInt} from "node:crypto";
import {DataManager} from "./data";
import {ServerManager} from "./server";


const dataManager = new DataManager({
    host: String(Bun.env.DB_HOST),
    port: Number(Bun.env.DB_PORT),
    user: String(Bun.env.DB_USER),
    password: String(Bun.env.DB_PASSWORD)
});

await dataManager.init();

const serverManager = new ServerManager({
    hostname: String(Bun.env.HOST),
    port: Number(Bun.env.PORT)
});

const clientServer = new Map<number, number>()

serverManager.onopen = (socket) => {
    let id: number;

    do {
        id = randomInt(1_000_000);

    } while (clientServer.has(id))

    socket.data = {clientId: id};
}

serverManager.ondata = async (socket, data) => {
    const json = JSON.parse(data.toString());
    const clientId = socket.data.clientId;

    if (json.type === 'auth') {
        const serverId = await dataManager.checkAuthData(json.name);

        if (!serverId) {
            socket.end();
            return;
        }

        console.log(json.name, 'connected');

        clientServer.set(clientId, serverId);

    } else if (json.type === 'update') {

        const res = await dataManager.sendUpdateData({
            server_id: clientServer.get(socket.data.clientId)!,
            uptime: json.uptime,
            load: json.load,
            memory_total: json.memory_total,
            memory_used: json.memory_used,
            swap_total: json.swap_total,
            swap_used: json.swap_used,
            hdd_total: json.hdd_total,
            hdd_used: json.hdd_used,
            cpu: json.cpu,
            network_rx: json.network_rx,
            network_tx: json.network_tx
        });

        if (!res) {
            socket.end();
        }
    } else {
        socket.end();
    }
}

serverManager.run();
