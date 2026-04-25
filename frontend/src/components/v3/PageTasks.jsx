import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ListTodo, Plus, CheckCircle2, Clock, AlertCircle, Trash2, User, Tag, RefreshCcw } from 'lucide-react';
import { C } from '../../utils/designTokens';

/**
 * Gen Audius - System Task Manager
 * Allows admins to manage server tasks, deployments, and AI reminders.
 */
export default function PageTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium", assigned_to: "admin" });

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/backend/api/admin/tasks');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      const res = await fetch('/api/backend/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      if (res.ok) {
        setNewTask({ title: "", description: "", priority: "medium", assigned_to: "admin" });
        setShowAdd(false);
        fetchTasks();
      }
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  const updateTaskStatus = async (id, status) => {
    try {
      await fetch(`/api/backend/api/admin/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchTasks();
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const deleteTask = async (id) => {
    if (!confirm("¿Eliminar esta tarea?")) return;
    try {
      await fetch(`/api/backend/api/admin/tasks/${id}`, { method: 'DELETE' });
      fetchTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const getPriorityColor = (p) => {
    if (p === 'critical') return C.err;
    if (p === 'high') return C.warn;
    if (p === 'medium') return C.aLt;
    return C.t3;
  };

  return (
    <div style={{ animation: "v3-fadeUp 0.3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: C.t1, display: "flex", alignItems: "center", gap: 10 }}>
            <ListTodo size={28} color={C.a} /> Gestión de Tareas
          </h2>
          <p style={{ fontSize: 13, color: C.t2 }}>Tareas internas del sistema y recordatorios del servidor.</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="v3-btn v3-btn-pr">
          <Plus size={18} style={{ marginRight: 6 }} /> Nueva Tarea
        </button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="v3-card" style={{ marginBottom: 20 }}>
          <form onSubmit={handleAddTask} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="v3-card-title">Añadir Tarea</div>
            <input 
              className="v3-inp" placeholder="Título de la tarea..." 
              value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})}
            />
            <textarea 
              className="v3-textarea" placeholder="Descripción adicional..."
              value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})}
            />
            <div className="v3-g3">
              <select className="v3-sel" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                <option value="low">Prioridad Baja</option>
                <option value="medium">Prioridad Media</option>
                <option value="high">Prioridad Alta</option>
                <option value="critical">Crítica</option>
              </select>
              <select className="v3-sel" value={newTask.assigned_to} onChange={e => setNewTask({...newTask, assigned_to: e.target.value})}>
                <option value="admin">Admin</option>
                <option value="system">Sistema</option>
                <option value="ai_agent">IA Agente</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
              <button type="submit" className="v3-btn v3-btn-pr" style={{ flex: 1 }}>Guardar Tarea</button>
              <button type="button" onClick={() => setShowAdd(false)} className="v3-btn v3-btn-gh">Cancelar</button>
            </div>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: C.t3 }}>Cargando tareas...</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {tasks.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", background: 'rgba(255,255,255,0.02)', borderRadius: 12, color: C.t3, border: `1px dashed ${C.div}` }}>
              No hay tareas pendientes.
            </div>
          )}
          {tasks.map(t => (
            <div key={t.id} className="v3-card" style={{ 
              display: "flex", alignItems: "center", gap: 20, 
              borderLeft: `4px solid ${getPriorityColor(t.priority)}`,
              opacity: t.status === 'completed' ? 0.6 : 1
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: t.status === 'completed' ? C.t3 : C.t1, textDecoration: t.status === 'completed' ? 'line-through' : 'none' }}>
                    {t.title}
                  </span>
                  <span className="v3-tag" style={{ fontSize: 9, opacity: 0.7 }}>{t.assigned_to.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: 12, color: C.t2 }}>{t.description}</div>
                <div style={{ display: "flex", gap: 15, marginTop: 8, fontSize: 10, color: C.t3, fontFamily: "'JetBrains Mono', monospace" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={10} /> {new Date(t.created_at).toLocaleDateString()}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, color: getPriorityColor(t.priority) }}><Tag size={10} /> {t.priority.toUpperCase()}</span>
                </div>
              </div>
              
              <div style={{ display: "flex", gap: 10 }}>
                {t.status !== 'completed' ? (
                  <button onClick={() => updateTaskStatus(t.id, 'completed')} className="v3-btn v3-btn-sm" style={{ padding: '8px 12px', background: `${C.ok}15`, color: C.ok, border: `1px solid ${C.ok}30` }}>
                    <CheckCircle2 size={16} />
                  </button>
                ) : (
                  <button onClick={() => updateTaskStatus(t.id, 'pending')} className="v3-btn v3-btn-sm" style={{ padding: '8px 12px', background: `${C.a}15`, color: C.a, border: `1px solid ${C.a}30` }}>
                    <RefreshCcw size={16} />
                  </button>
                )}
                <button onClick={() => deleteTask(t.id)} className="v3-btn v3-btn-sm" style={{ padding: '8px 12px', background: `${C.err}15`, color: C.err, border: `1px solid ${C.err}30` }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
