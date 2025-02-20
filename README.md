# ShoppingCart

A simple shopping cart application built to demonstrate basic e-commerce functionality. This project allows users to browse products, add them to a cart, and simulate a checkout process.

## Features

- **Add to Cart**: Add products to your shopping cart.
- **Cart Management**: Update quantities or remove items from the cart.
- **Checkout Simulation**: Simulate a checkout process with a summary of the order.

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: In-memory db

## Setup with Docker
1. **Clone the repository**:
   ```sh
   git clone https://github.com/ShyanRoyChoudhury/ShoppingCart.git
    ```
2. **Navigate to the project directory**:
   ```sh
   cd ShoppingCart
   ```
3. **Build image**:
   ```sh
   docker build -t shoppingcart .
   ```
4. **Run Image**:
 ```sh
docker run -p 8000:8000 shoppingcart
```

## Installation

To run this project locally, follow these steps:

1. **Clone the repository**:
   ```sh
   git clone https://github.com/ShyanRoyChoudhury/ShoppingCart.git
    ```
2. **Navigate to the project directory**:
   ```sh
   cd ShoppingCart
   ```
3. **Switch NVM Version**:
   ```sh
   nvm use 20.11
   ```
   
4. **Install dependencies**:
   ```sh
   npm install
   ```
5. **Build the application**:
   ```sh
   npm run build
   ```
6. **Build the application**:
   ```sh
   npm run start
   ```
