import supabase from '../config/supabase';
import {Inventory} from '../utils/interface';

class InventoryModel {
    static async create(inventory: Inventory): Promise<Inventory | null> {
        const {data, error} = await supabase
            .from('inventories')
            .insert(inventory)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    static async findAll(): Promise<Inventory[]> {
        const {data, error} = await supabase
            .from('inventories')
            .select('*');

        if (error) {
            throw new Error(error.message);
        }

        return data || [];
    }

    static async findById(id: number): Promise<Inventory | null> {
        const {data, error} = await supabase
            .from('inventories')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    static async update(id: number, inventory: Inventory): Promise<Inventory | null> {
        const {data, error} = await supabase
            .from('inventories')
            .update(inventory)
            .eq('id', id)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    static async delete(id: number): Promise<void> {
        const {error} = await supabase
            .from('inventories')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(error.message);
        }
    }
}

export default InventoryModel;
