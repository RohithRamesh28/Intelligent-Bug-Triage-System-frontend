import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    // Not logged in → redirect to Login
    return <Navigate to="/" replace />;
  }

  // Logged in → show children
  return children;
}

export default PrivateRoute;
