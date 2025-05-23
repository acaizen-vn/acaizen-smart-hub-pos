
import React from 'react';
import LoginForm from '@/components/Login/LoginForm';
import { Toaster } from '@/components/ui/toaster';

const Login = () => {
  return (
    <>
      <LoginForm />
      <Toaster />
    </>
  );
};

export default Login;
