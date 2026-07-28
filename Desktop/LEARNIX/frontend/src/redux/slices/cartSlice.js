import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

const loadCartFromStorage = () => {
    try {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    } catch {
        return [];
    }
};

const saveCartToStorage = (items) => {
    localStorage.setItem('cart', JSON.stringify(items));
};

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: loadCartFromStorage(),
        coupon: null,
        couponDiscount: 0,
    },
    reducers: {
        addToCart: (state, action) => {
            const exists = state.items.find(i => i._id === action.payload._id);
            if (exists) {
                toast.error('Already in cart!');
                return;
            }
            state.items.push(action.payload);
            saveCartToStorage(state.items);
            toast.success('Added to cart!');
        },
        removeFromCart: (state, action) => {
            state.items = state.items.filter(i => i._id !== action.payload);
            saveCartToStorage(state.items);
            toast.success('Removed from cart.');
        },
        clearCart: (state) => {
            state.items = [];
            state.coupon = null;
            state.couponDiscount = 0;
            saveCartToStorage([]);
        },
        applyCoupon: (state, action) => {
            state.coupon = action.payload.coupon;
            state.couponDiscount = action.payload.discount;
        },
        removeCoupon: (state) => {
            state.coupon = null;
            state.couponDiscount = 0;
        },
    },
});

export const { addToCart, removeFromCart, clearCart, applyCoupon, removeCoupon } = cartSlice.actions;

export const selectCartTotal = (state) => state.cart.items.reduce((sum, item) => sum + (item.finalPrice || item.price), 0);
export const selectCartCount = (state) => state.cart.items.length;

export default cartSlice.reducer;
