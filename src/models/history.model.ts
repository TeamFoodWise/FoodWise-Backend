import supabase from '../config/supabase';
import {Inventory} from '../utils/interface';

class HistoryModel {
    static async create(history: History): Promise<History | null> {
        const {data, error} = await supabase
            .from('histories')
            .insert(history)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    static async findAll(): Promise<History[]> {
        const {data, error} = await supabase
            .from('histories')
            .select('*');

        if (error) {
            throw new Error(error.message);
        }

        return data || [];
    }

    static async findById(id: number): Promise<History | null> {
        const {data, error} = await supabase
            .from('histories')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    static async update(id: number, history: History): Promise<History | null> {
        const {data, error} = await supabase
            .from('histories')
            .update(history)
            .eq('id', id)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    static async delete(id: number): Promise<void> {
        const {error} = await supabase
            .from('histories')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(error.message);
        }
    }
}
