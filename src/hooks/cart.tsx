import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // LOAD ITEMS FROM ASYNC STORAGE
      const cartProducts = await AsyncStorage.getItem(
        'GOMARKETPLACE@CARTPRODUCTS',
      );

      if (cartProducts) {
        setProducts(JSON.parse(cartProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // ADD A NEW ITEM TO THE CART
      const hasOne = products.filter(prod => prod.id === product.id && prod);

      if (hasOne.length === 0) {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      AsyncStorage.setItem(
        'GOMARKETPLACE@CARTPRODUCTS',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // INCREMENTS A PRODUCT QUANTITY IN THE CART
      const productsArray = products;

      productsArray.map(product => product.id === id && product.quantity++);

      setProducts([...productsArray]);

      AsyncStorage.setItem(
        'GOMARKETPLACE@CARTPRODUCTS',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // DECREMENTS A PRODUCT QUANTITY IN THE CART
      const [product] = products.filter(prod => prod.id === id && prod);

      if (product.quantity >= 1) {
        product.quantity--;
      }

      if (product.quantity >= 1) {
        setProducts([...products.filter(prodt => prodt.id !== id), product]);
      } else {
        setProducts([...products.filter(prodt => prodt.id !== id)]);
      }

      AsyncStorage.setItem(
        'GOMARKETPLACE@CARTPRODUCTS',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
