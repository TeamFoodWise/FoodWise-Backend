import supabase from '../config/supabase';
import {Inventory} from '../utils/interface';

class InventoryModel {
    static async create(inventory: { user_id: number | undefined; name: string }): Promise<Inventory> {
        const {data, error} = await supabase
            .from('inventories')
            .insert(inventory)
            .select()
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

    static async findByUserId(userId: number | undefined): Promise<Inventory[]> {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const {data, error} = await supabase
            .from('inventories')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            throw new Error(error.message);
        }

        return data || [];
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

    static async findByName(name: string): Promise<Inventory | null> {
        const {data, error} = await supabase
            .from('inventories')
            .select('*')
            .eq('name', name)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }
}

export default InventoryModel;
