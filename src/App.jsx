import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import FarmerProfile from './pages/FarmerProfile.jsx';
import Profile from './pages/Profile.jsx';
import MyProducts from './pages/MyProducts.jsx';
import ProductForm from './pages/ProductForm.jsx';
import Orders from './pages/Orders.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import Messages from './pages/Messages.jsx';
import Notifications from './pages/Notifications.jsx';
import Transactions from './pages/Transactions.jsx';
import Complaints from './pages/Complaints.jsx';
import Admin from './pages/Admin.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/farmers/:id" element={<FarmerProfile />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/messages/:userId" element={<Messages />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/complaints" element={<Complaints />} />
          </Route>

          <Route element={<ProtectedRoute roles={['farmer']} />}>
            <Route path="/farmer/products" element={<MyProducts />} />
            <Route path="/farmer/products/new" element={<ProductForm />} />
            <Route path="/farmer/products/:id/edit" element={<ProductForm />} />
          </Route>

          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/admin" element={<Admin />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="container">
          <strong>Digital Mandi</strong> connects farmers directly with buyers. No middlemen, no commission.
        </div>
      </footer>
    </>
  );
}
