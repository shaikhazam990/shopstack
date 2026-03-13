import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMe } from "./store/authSlice";
import { fetchCart } from "./store/cartSlice";
import AppRoutes from "./app.routes";
import Navbar from "./shared/components/Navbar";
import BottomNav from "./shared/components/BottomNav";
import CartDrawer from "./features/cart/components/CartDrawer";

const AppContent = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) dispatch(fetchMe());
  }, [dispatch]);

  useEffect(() => {
    if (user) dispatch(fetchCart());
  }, [user, dispatch]);

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: "480px", margin: "0 auto" }}>
        <AppRoutes />
      </main>
      <BottomNav />
      <CartDrawer />
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;
