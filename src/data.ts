import {Pool, PoolConfig, PoolConnection, createPool} from 'mariadb';


export class DataManager {

    private pool: Pool;
    private connect: PoolConnection;

    constructor(config: PoolConfig) {
        this.pool = createPool(config);
    }

    async init() {
        this.connect = await this.pool.getConnection();
    }

    async checkAuthData(name: string): Promise<number | null> {
        try {
            const result = await this.connect.query('SELECT id FROM servers.servers WHERE name = ? LIMIT 1', [name]);
            return result.length ? result[0].id : null;

        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async sendUpdateData(data: {
        server_id: number,
        uptime: number,
        load: number,
        memory_total: number,
        memory_used: number,
        swap_total: number,
        swap_used: number,
        hdd_total: number,
        hdd_used: number,
        cpu: number,
        network_rx: number,
        network_tx: number
    }): Promise<boolean> {
        try {
            const fields = [
                'server_id',
                'uptime',
                'load',
                'memory_total',
                'memory_used',
                'swap_total',
                'swap_used',
                'hdd_total',
                'hdd_used',
                'cpu',
                'network_rx',
                'network_tx'
            ];

            const selectFields = fields.map(field => `\`${field}\``).join(', ');
            const selectValues = fields.map(() => '?').join(', ');

            const result = await this.connect.query(
                `INSERT INTO servers.statuses(${selectFields}) value (${selectValues})`,
                fields.map(field => (data as any)[field])
            );
    
            return Boolean(result);

        } catch (err) {
            console.error(err);
            return false;
        }
    }
}