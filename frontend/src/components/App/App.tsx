import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import '@fontsource/manrope/800.css';
import './App.css';

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Header from '../Header/Header';
import TaskList from '../../Pages/TaskList/TaskList';
import EmployersList from '../../Pages/EmployersList/EmployersList';
import TaskForm from '../../Pages/TaskForm/TaskForm';
import EmployerForm from '../../Pages/EmployerForm/EmployerForm';
import Login from '../../Pages/Login/Login';
import Register from '../../Pages/Register/Register';

function AppLayout() {
  const location = useLocation();
  const hideHeader = ['/login', '/register'].includes(location.pathname);

  return (
    <>
      {!hideHeader && <Header />}
      <Routes>
        <Route path="/" element={<Navigate to="/tasks" replace />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/tasks/new" element={<TaskForm />} />
        <Route path="/tasks/:id/edit" element={<TaskForm />} />
        <Route path="/clients" element={<EmployersList />} />
        <Route path="/clients/new" element={<EmployerForm />} />
        <Route path="/clients/:id/edit" element={<EmployerForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/tasks" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;