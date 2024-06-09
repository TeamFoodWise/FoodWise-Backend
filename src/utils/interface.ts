export interface User {
    id?: number;
    name: string;
    email: string;
    hashed_password: string;
    preferences?: object;
}

export interface Inventory {
    id?: number;
    name: string;
    user_id: number;
}

export interface Item {
    id?: number;
    name: string;
    quantity: number;
    category: string;
    purchase_date: Date;
    expiration_date: Date;
    inventory_id: number;
}

