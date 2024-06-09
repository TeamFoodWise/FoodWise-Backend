import supabase from '../config/supabase';
import {Item} from '../utils/interface';

class ItemModel {
    static async create(item: Item): Promise<Item | null> {
        const {data, error} = await supabase
            .from('items')
            .insert(item)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    static async findAll(): Promise<Item[]> {
        const {data, error} = await supabase
            .from('items')
            .select('*');

        if (error) {
            throw new Error(error.message);
        }

        return data || [];
    }

    static async findById(id: number): Promise<Item | null> {
        const {data, error} = await supabase
            .from('items')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    static async update(id: number, item: Item): Promise<Item | null> {
        const {data, error} = await supabase
            .from('items')
            .update(item)
            .eq('id', id)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    static async delete(id: number): Promise<Item | null> {
        const {data, error} = await supabase
            .from('items')
            .delete()
            .eq('id', id)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }
}

export default ItemModel;
