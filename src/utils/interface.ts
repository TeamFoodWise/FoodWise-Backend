export interface User {
    id?: number;
    full_name: string;
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

export interface JwtPayload {
    userId: string;
}

export interface History {
    id?: number;
    user_id: number;
    item_id: number;
    consumption_id?: number;
    event: string;
    date: Date;
    quantity: number;
}

