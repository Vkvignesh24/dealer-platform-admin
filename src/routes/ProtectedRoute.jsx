import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Loader } from '../components/UI';

export default function ProtectedRoute({ children }) {
  const [state, setState] = useState({ checked: false, user: null });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setState({ checked: true, user }));
    return () => unsub();
  }, []);

  if (!state.checked) return <Loader label="Checking session…" />;
  if (!state.user) return <Navigate to="/login" replace />;
  return children;
}
