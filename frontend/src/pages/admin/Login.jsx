import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminLogin = () => {
    return <Navigate to="/login" state={{ from: { pathname: '/admin' } }} replace />;
};

export default AdminLogin;
