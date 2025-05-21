// ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Navigate } from 'react-router-dom';
import { auth } from '../../../firebase.js'; 

const ProtectedRoute = ({ element: Component }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setIsEmailVerified(user.emailVerified);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated && isEmailVerified) {
    return <Component />;
  } else if (isAuthenticated && !isEmailVerified) {
    return <Navigate to="/verification" />;
  } else {
    return <Navigate to="/signin" />;
  }
};

export default ProtectedRoute;
