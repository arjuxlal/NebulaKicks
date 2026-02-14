import { create } from "zustand";

interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    size?: string;
}

interface CartStore {
    items: CartItem[];
    isOpen: boolean;
    addItem: (product: Omit<CartItem, 'quantity'>, size?: string) => void;
    removeItem: (id: string, size?: string) => void;
    clearCart: () => void;
    toggleCart: () => void;
    total: () => number;
}

export const useCart = create<CartStore>((set, get) => ({
    items: [],
    isOpen: false,
    toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
    addItem: (product, size) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(
            (item) => item.id === product.id && item.size === size
        );

        if (existingItem) {
            set({
                items: currentItems.map((item) =>
                    item.id === product.id && item.size === size
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                ),
            });
        } else {
            set({
                items: [...currentItems, { ...product, quantity: 1, size }],
            });
        }
    },
    removeItem: (id, size) => {
        const currentItems = get().items;
        set({
            items: currentItems.filter(
                (item) => !(item.id === id && item.size === size)
            ),
        });
    },
    clearCart: () => set({ items: [] }),
    total: () => {
        return get().items.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
        );
    },
}));
