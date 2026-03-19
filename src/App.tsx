import './App.css';
import { Toaster } from 'react-hot-toast';
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <>
      <Outlet />
      <Toaster position="top-center" />
    </>
  );
}

export default App;
