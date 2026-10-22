import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import '@fontsource/manrope/800.css';
import './App.css';

import Header from './../Header/Header'
import TaskList from './../../Pages/TaskList/TaskList'
import EmployersList from '../../Pages/EmployersList/EmployersList';
import TaskForm from '../../Pages/TaskForm/TaskForm';
import EmployerForm from '../../Pages/EmployerForm/EmployerForm';
import Login from '../../Pages/Login/Login';
import Register from '../../Pages/Register/Register';

function App() {
  return (
    <>
      {/*<Header/>*/}
      {/*<TaskList/>*/}
      {/*<TaskForm subtasks={[{id: 1, text: 'Тестовая задача', done: false, onRemove:true, onEdit:true}]}/>*/}
      {/*<EmployersList/>*/}
      <EmployerForm/>
      {/*<EmployerForm
        id={2}
        name="Игорь Петров"
        company="ИП Петров"
        email="igor.petrov@gmail.com"
        phone="+7 903 111-22-33"
        telegram="igor_dev"
        website="https://petrov.dev"
        notes="Предпочитает общение в Telegram, отвечает вечером"
        status="active"
        projectsCount={3}
      />*/}
      {/*<Login/>*/}
      {/*<Register/>*/}
    </>
  )
}

export default App
