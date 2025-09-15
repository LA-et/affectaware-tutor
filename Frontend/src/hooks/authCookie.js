import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

export function useNavigateAuthorised({ type, options }) {
  let defaultOptions = {};
  if (type === 'admin') {
    defaultOptions = {
      redirect: '/admin',
    };
  } else if (type === 'student') {
    defaultOptions = {
      redirect: '/dashboard',
    };
  }
  // const defaultOptions = {
  //   redirect: "/dashboard",
  // };

  const { redirect } = { ...defaultOptions, ...options };
  const { isAuthenticated } = useContext(authContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirect);
    }
  }, [isAuthenticated, navigate, redirect]);
}
