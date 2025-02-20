/***  
 * data store for products. As items are added to cart.  
 * the product quantity in stock will increase/decrease based on the operation
 * */

export type ProductType = {
    id: number;
    name: string;
    price: number;
    quantity: number
}

export const products: ProductType[] = [
    { id: 1, name: "Wireless Mouse", price: 2000, quantity: 7 },
    { id: 2, name: "Mechanical Keyboard", price: 3000, quantity: 3 },
    { id: 3, name: "USB-C Hub", price: 1500, quantity: 5 },
    { id: 4, name: "Noise Cancelling Headphones", price: 15000, quantity: 2 },
    { id: 5, name: "Portable SSD 1TB", price: 10000, quantity: 8 },
    { id: 6, name: "Smartphone Stand", price: 500, quantity: 10 },
    { id: 7, name: "Gaming Chair", price: 15000, quantity: 1 },
    { id: 8, name: "Webcam 1080p", price: 2000, quantity: 6 },
    { id: 9, name: "Bluetooth Speaker", price: 5000, quantity: 4 },
    { id: 10, name: "RGB LED Strip", price: 2300, quantity: 9 }
];
  