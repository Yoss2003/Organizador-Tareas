import React, { useState, useEffect } from 'react';
import TaskCard from './components/TaskCard';
import './components/TaskCard.css';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTh, faList } from '@fortawesome/free-solid-svg-icons';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'nuevo',
    dueDate: '',
    dueTime: '',
    priority: 'baja'
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [isChanging, setIsChanging] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;

    const interval = setInterval(() => {
      setTasks(prevTasks => {
        const ahora = new Date();
        return prevTasks.map(task => {
          if (
            task.status === 'nuevo' &&
            task.expiresAt &&
            new Date(task.expiresAt) <= ahora
          ) {
            return {
              ...task,
              status: 'pendiente',
              updatedAt: ahora.toISOString()
            };
          }
          return task;
        });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoaded]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTask = (e) => {
    e.preventDefault();

    if (
      newTask.title.trim() === '' ||
      newTask.description.trim() === '' ||
      !newTask.dueDate ||
      !newTask.dueTime
    ) {
      alert('Por favor, completa título, descripción, fecha y hora antes de agregar la tarea.');
      return;
    }

    const now = new Date();
    const createdAt = newTask.createdAt || now.toISOString();

    let updatedTask = {
      ...newTask,
      createdAt
    };

    if (editIndex === null) {
      const expiresAt = new Date(now.getTime() + 5 * 60000).toISOString();
      updatedTask = {
        ...updatedTask,
        status: updatedTask.status || 'nuevo',
        expiresAt
      };
      setTasks(prev => [...prev, updatedTask]);
    } else {
      const updatedTasks = [...tasks];
      updatedTasks[editIndex] = {
        ...updatedTasks[editIndex],
        ...updatedTask,
        updatedAt: now.toISOString()
      };
      setTasks(updatedTasks);
      setEditIndex(null);
    }

    // CAMBIO: reset con prioridad por defecto
    setNewTask({
      title: '',
      description: '',
      status: 'nuevo',
      dueDate: '',
      dueTime: '',
      priority: 'baja'
    });
    setIsFormOpen(false);
  };

  const handleEditTask = (task, index) => {
    
    setNewTask({
      title: task.title,
      description: task.description,
      status: task.status, 
      dueDate: task.dueDate || '',
      dueTime: task.dueTime || '',
      priority: task.priority || 'baja',
      createdAt: task.createdAt || new Date().toISOString(),
      expiresAt: task.expiresAt || null
    });
    setEditIndex(index);
    setIsFormOpen(true); 
  };

  const handleDeleteTask = (indexToDelete) => {
    const task = tasks[indexToDelete];
    if (task.status === 'completo') {
      alert('No puedes eliminar una tarea que ya está completada.');
      return;
    }
    if (window.confirm(`¿Eliminar la tarea "${task.title}"?`)) {
      setTasks(prev => prev.filter((_, i) => i !== indexToDelete));
    }
  };
  
  const handleCancel = () => {
    setNewTask({ title: '', description: '', status: 'nuevo', dueDate: '', dueTime: '' });
    setEditIndex(null);
    setIsFormOpen(false);
  };

  const getEmptyMessage = () => {
    switch (filterStatus) {
      case 'pendiente':
        return 'No tienes tareas pendientes.';
      case 'completo':
        return 'No tienes tareas completadas.';
      case 'nuevo':
        return 'No tienes tareas agregadas recientemente.';
      default:
        return 'Agrega tu primera tarea para comenzar a organizarte.';
    }
  };

  const statusMap = {
    nuevo: 'nuevo',
    pendiente: 'pendiente',
    completo: 'completo'
  };

  const filteredTasks = tasks.filter(task =>
    filterStatus === 'all' ? true : task.status === statusMap[filterStatus]
  );

  const changeView = (mode) => {
    setIsChanging(true);
    setTimeout(() => {
      setViewMode(mode);
      setIsChanging(false);
    }, 300);
  };

  const handleChangePriority = (index, level) => {
    setTasks(prev =>
      prev.map((t, i) =>
        i === index ? { ...t, priority: level, updatedAt: new Date().toISOString() } : t
      )
    );
  };

  const handleToggleComplete = (index) => {
    setTasks(prev =>
      prev.map((t, i) => {
        if (i !== index) return t;
        const nextStatus = t.status === 'completo' ? 'pendiente' : 'completo';
        return { ...t, status: nextStatus, updatedAt: new Date().toISOString() };
      })
    );
  };


  return (
    <div className="app-root">
      <h1 className="app-title">Organizador de tareas</h1>

      {/* Formulario con animación de despliegue */}
      <form onSubmit={handleAddTask} className={`add-task-form ${isFormOpen ? 'open' : ''}`}>
        <div className="add-task-fields">
          <input
            type="text"
            name="title"
            placeholder="Título"
            value={newTask.title}
            onChange={handleChange}
            className="input-titulo"
          />
          <textarea
            name="description"
            placeholder="Descripción"
            value={newTask.description}
            onChange={handleChange}
            rows="3"
            className="textarea-descripcion"
          />

          <div className="fecha-hora-container">
            <input
              type="date"
              name="dueDate"
              value={newTask.dueDate || ''}
              onChange={handleChange}
              className="input-fecha"
            />
            <input
              type="time"
              name="dueTime"
              value={newTask.dueTime || ''}
              onChange={handleChange}
              className="input-hora"
            />
          </div>

          {/* Estado por defecto: 'nueva'*/}
        </div>

        <div className="add-task-actions">
          {isFormOpen && (
            <>
              <button
                type="submit"
                className="btn primary"
              >
                {editIndex !== null ? 'Guardar cambios' : 'Agregar'}
              </button>

              <button
                type="button"
                className="btn secondary"
                onClick={handleCancel}
              >
                Cancelar
              </button>
            </>
          )}

          {!isFormOpen && (
            <button
              type="button"
              className="btn primary"
              onClick={() => setIsFormOpen(true)}
            >
              Agregar nueva tarea
            </button>
          )}
        </div>
      </form>

      {/* Filtro de estado */}
      <div className="toolbar-tareas">
        <div className="toolbar-left">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Todas</option>
            <option value="nuevo">Nuevas</option>
            <option value="pendiente">Pendientes</option>
            <option value="completo">Completadas</option>
          </select>
        </div>

          
        {/* Botones para cambiar vista */}
        <div className="view-toggle">
          <button
            className={viewMode === 'grid' ? 'active' : ''}
            onClick={() => changeView('grid')}
            title="Vista de cuadrícula"
          >
            <FontAwesomeIcon icon={faTh} />
          </button>

          <button
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => changeView('list')}
            title="Vista de lista"
          >
            <FontAwesomeIcon icon={faList} />
          </button>
        </div>
      </div>

      {/* Renderizado de tareas */}
      <div className={`task-container ${viewMode} ${isChanging ? 'changing' : ''}`}>
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <h2 className="empty-message">📭 Lista vacía</h2>
            <p className="empty-subtext">{getEmptyMessage()}</p>
          </div>
        ) : (
          filteredTasks.map((task, index) => (
            <TaskCard
              key={index}
              title={task.title}
              description={task.description}
              status={task.status}
              dueDate={task.dueDate}
              dueTime={task.dueTime}
              createdAt={task.createdAt}
              updatedAt={task.updatedAt}
              expiresAt={task.expiresAt}
              priority={task.priority}
              onChangePriority={(level) => handleChangePriority(index, level)}
              onDelete={() => handleDeleteTask(index)}
              onEdit={() => handleEditTask(task, index)}
              onToggleComplete={() => handleToggleComplete(index)}  // ← nuevo
            />
          ))
        )}
      </div>
    </div>
  );
}

export default App;