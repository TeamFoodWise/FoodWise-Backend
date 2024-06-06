import pool from '../config/db';

export interface User {
    id?: number;
    username: string;
    password: string;
}

class UserModel {
    static async create(user: User): Promise<User> {
        const {username, password} = user;
        const result = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
            [username, password]
        );
        return result.rows[0];
    }

    static async findAll(): Promise<User[]> {
        const result = await pool.query('SELECT * FROM users');
        return result.rows;
    }

    static async findById(id: number): Promise<User | null> {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    static async update(id: number, user: Partial<User>): Promise<User | null> {
        const {username, password} = user;
        const result = await pool.query(
            'UPDATE users SET username = $1, password = $2 WHERE id = $3 RETURNING *',
            [username, password, id]
        );
        return result.rows[0] || null;
    }

    static async delete(id: number): Promise<void> {
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
    }
}

export default UserModel;
