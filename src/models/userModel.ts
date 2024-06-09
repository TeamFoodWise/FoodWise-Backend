import supabase from '../config/supabase';
import {User} from '../utils/interface';

class UserModel {
    static async create(user: User): Promise<User | null> {
        const {data, error} = await supabase
            .from('users')
            .insert(user)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    static async findAll(): Promise<User[]> {
        const {data, error} = await supabase
            .from('users')
            .select('*');

        if (error) {
            throw new Error(error.message);
        }

        return data || [];
    }

    static async findById(id: number): Promise<User | null> {
        const {data, error} = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    static async update(id: number, user: User): Promise<User | null> {
        const {data, error} = await supabase
            .from('users')
            .update(user)
            .eq('id', id)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    static async delete(id: number): Promise<void> {
        const {error} = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(error.message);
        }
    }
}

export default UserModel;
