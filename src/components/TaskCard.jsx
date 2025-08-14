import React, { useState, useEffect, useRef } from 'react';
import './TaskCard.css';

function TaskCard({
  title,
  description,
  dueDate,
  dueTime,
  status,
  createdAt,
  updatedAt,
  expiresAt,
  priority,
  onChangePriority,
  onDelete,
  onEdit,
  onToggleComplete
}) {
  const isCompleted = status === 'completo';
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const menuRef = useRef(null);

  const priorityColors = {
    baja: '#90caf9',
    media: '#ffeb3b',
    alta: '#e53935'
  };

  const formatDateTime = (iso) => {
    if (!iso) return '';
    const date = new Date(iso);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  };

  // Temporizador
  useEffect(() => {
    if (!expiresAt || status !== 'nuevo') return;
    const interval = setInterval(() => {
      const diff = new Date(expiresAt) - new Date();
      if (diff <= 0) {
        setTimeLeft('00:00');
        clearInterval(interval);
      } else {
        const mins = String(Math.floor(diff / 60000) % 60).padStart(2, '0');
        const secs = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
        setTimeLeft(`${mins}:${secs}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, status]);

  // Cerrar menú de prioridad
  useEffect(() => {
    if (!showPriorityMenu) return;
    const onClickAway = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowPriorityMenu(false);
      }
    };
    document.addEventListener('mousedown', onClickAway);
    return () => document.removeEventListener('mousedown', onClickAway);
  }, [showPriorityMenu]);

  const handlePriorityChange = (level) => {
    setShowPriorityMenu(false);
    onChangePriority?.(level);
  };

  return (
    <div className={`task-card ${status}`}>
      <div className="task-header">
        <h3 className="task-title">{title}</h3>

        {/*Botones principales*/}
        <div className="task-actions-group">
          <div className="task-actions">
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className={`menu-btn status-${status}`}
              title="Editar tarea"
              aria-label="Editar tarea"
            >
              ⋮
            </button>

            <button
              onClick={onDelete}
              className="delete-btn"
              disabled={isCompleted}
              title={isCompleted ? 'No se puede eliminar una tarea completada' : 'Eliminar tarea'}
              aria-label="Eliminar tarea"
            >
              🗑️
            </button>

            <button
              type="button"
              className="complete-btn"
              onClick={(e) => { e.stopPropagation(); onToggleComplete?.(); }}
              title={isCompleted ? 'Marcar como pendiente' : 'Marcar como completada'}
              aria-label={isCompleted ? 'Marcar como pendiente' : 'Marcar como completada'}
            >
              {isCompleted ? '↩︎' : '✓'}
            </button>
          </div>

          {/*Prioridades*/}
          <button
            type="button"
            className="priority-flag always-visible"
            style={{ backgroundColor: priorityColors[priority] || '#ccc' }}
            onClick={(e) => { e.stopPropagation(); setShowPriorityMenu(v => !v); }}
            title={`Prioridad: ${priority || 'baja'}`}
          >
            🚩
          </button>
        </div>

        {showPriorityMenu && (
          <div className="priority-menu" ref={menuRef} role="menu">
            <button onClick={() => handlePriorityChange('baja')}>
              <span className="dot" style={{ backgroundColor: priorityColors.baja }} /> Baja
            </button>
            <button onClick={() => handlePriorityChange('media')}>
              <span className="dot" style={{ backgroundColor: priorityColors.media }} /> Media
            </button>
            <button onClick={() => handlePriorityChange('alta')}>
              <span className="dot" style={{ backgroundColor: priorityColors.alta }} /> Alta
            </button>
          </div>
        )}
      </div>

      {/* Fechas */}
      <div className="task-dates">
        <span>
          🕓 <strong>{updatedAt ? 'Editado:' : 'Registrado:'}</strong>{' '}
          {formatDateTime(updatedAt || createdAt)}
        </span>
        <br />
        {(dueDate || dueTime) && (
          <span>
            📅 <strong>Para:</strong>{' '}
            {formatDateTime(`${dueDate} ${dueTime}`)}
          </span>
        )}
      </div>


      <p className="task-desc">{description}</p>

      <div className="task-meta">
        <span className={`status status-${status}`}>{status}</span>
      </div>

      {expiresAt && status === 'nuevo' && <span className="timer">⏳ {timeLeft}</span>}
    </div>
  );
}

export default TaskCard;