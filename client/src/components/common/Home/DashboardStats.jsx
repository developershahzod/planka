import React, { useMemo, useEffect, useState } from 'react';
import axios from 'axios';
import styles from './DashboardStats.module.scss';
import { getAccessToken } from '../../../utils/access-token-storage';
import userApi from '../../../api/users';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const DashboardStats = () => {
  const [tasks, setTasks] = useState([]);
  const [tasksall, setTasksall] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [searchProject, setSearchProject] = useState('');
  const [searchAssignee, setSearchAssignee] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const BASE_URL = 'https://planka-production-f920.up.railway.app';

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = getAccessToken();
        const user = await userApi.getCurrentUser(false, { Authorization: `Bearer ${token}` });
        const response = await axios.get(`${BASE_URL}/api/tasks/show`, {
          params: { userId: user.item.id },
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(response.data);
      } catch (error) {
        console.log('Ошибка при загрузке задач:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchTasksAll = async () => {
      try {
        const token = getAccessToken();
        await userApi.getCurrentUser(false, { Authorization: `Bearer ${token}` });
        const response = await axios.get(`${BASE_URL}/api/tasks/show`, {
          params: { userId: undefined },
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasksall(response.data);
      } catch (error) {
        console.log('Ошибка при загрузке всех задач:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
    fetchTasksAll();
  }, []);

  const taskStats = useMemo(() => {
    let completed = 0, inProgress = 0, overdue = 0;
    const now = Date.now();
    tasks.forEach((task) => {
      if (task.isCompleted) completed++;
      else {
        inProgress++;
        if (task.dueDate && new Date(task.dueDate).getTime() < now) overdue++;
      }
    });
    return [
      { name: 'Завершено', value: completed, color: '#4caf50' },
      { name: 'В процессе', value: inProgress, color: '#ff9800' },
      { name: 'Просрочено', value: overdue, color: '#f44336' },
    ];
  }, [tasks]);

  const activityData = useMemo(() => {
    const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    const map = new Array(7).fill(0);
    tasks.forEach((task) => {
      const day = new Date(task.createdAt).getDay();
      map[day]++;
    });
    return map.map((count, i) => ({ day: days[i], tasks: count }));
  }, [tasks]);

  const filteredTasks = tasksall.filter((task) => {
    const nameMatch = task.name.toLowerCase().includes(searchName.toLowerCase());
    const projectMatch = task.projectName?.toLowerCase().includes(searchProject.toLowerCase());
    const assigneeMatch = task.assigneeUsername?.toLowerCase().includes(searchAssignee.toLowerCase());
    const now = Date.now();
    let statusMatch = true;
    if (filterStatus === 'completed') statusMatch = task.isCompleted;
    else if (filterStatus === 'inProgress') statusMatch = !task.isCompleted && (!task.dueDate || new Date(task.dueDate).getTime() >= now);
    else if (filterStatus === 'overdue') statusMatch = !task.isCompleted && task.dueDate && new Date(task.dueDate).getTime() < now;
    return nameMatch && projectMatch && assigneeMatch && statusMatch;
  });

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const exportToExcel = () => {
    const dataToExport = filteredTasks.map((task, index) => ({
      '№': index + 1,
      'ФИО': task.assigneeUsername,
      'Название': task.name,
      'Проект': task.projectName,
      'Доска': task.boardName,
      'Статус': task.isCompleted
        ? 'Завершено'
        : task.dueDate && new Date(task.dueDate).getTime() < Date.now()
        ? 'Просрочено'
        : 'В процессе',
      'Дата': formatDate(task.createdAt),
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Задачи');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(file, 'Задачи.xlsx');
  };

  if (loading) return <div>Загрузка задач...</div>;

  return (
    <div className={styles.gridWrapper}>
      {taskStats.map((item) => (
        <div key={item.name} className={styles.card}>
          <h2 className={styles.sectionTitle}>{item.name}</h2>
          <div className={styles.statRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, backgroundColor: item.color, borderRadius: '50%' }} />
              <span>{item.name}</span>
            </div>
            <strong>{item.value}</strong>
          </div>
        </div>
      ))}

      <div className={`${styles.card} ${styles.activityBlock}`}>
        <h2 className={styles.sectionTitle}>Активность по дням</h2>
        {activityData.map((item) => (
          <div key={item.day} style={{ marginBottom: 10 }}>
            <div className={styles.statRow}>
              <span>{item.day}</span>
              <span>{item.tasks} задач</span>
            </div>
            <div className={styles.progressBarBackground}>
              <div className={styles.activityBar} style={{ width: `${item.tasks * 10}%`, backgroundColor: '#2196f3' }} />
            </div>
          </div>
        ))}
      </div>

      <div className={`${styles.card} ${styles.tableBlock}`}>
        <h2 className={styles.sectionTitle}>Список задач</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>№</th>
                <th>Название</th>
                <th>Проект</th>
                <th>Доска</th>
                <th>Статус</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {tasks.slice(0, 10).map((task, index) => (
                <tr key={task.id}>
                  <td>{index + 1}</td>
                  <td>{task.name}</td>
                  <td>{task.projectName}</td>
                  <td>{task.boardName}</td>
                  <td>
                    {task.isCompleted ? (
                      <span className={styles.statusCompleted}>Завершено</span>
                    ) : task.dueDate && new Date(task.dueDate).getTime() < Date.now() ? (
                      <span className={styles.statusOverdue}>Просрочено</span>
                    ) : (
                      <span className={styles.statusInProgress}>В процессе</span>
                    )}
                  </td>
                  <td>{formatDate(task.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`${styles.card} ${styles.tableBlock}`} style={{ width: '100%', gridColumn: 'span 3' }}>
        <h2 className={styles.sectionTitle}>Все задачи, количество: {filteredTasks.length}</h2>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            style={{ background: '#1d1f23', border: '1px solid #000000', padding: '10px', borderRadius: '5px', color: 'white' }}
          />
          <input
            type="text"
            placeholder="Поиск по проекту..."
            value={searchProject}
            onChange={(e) => setSearchProject(e.target.value)}
            style={{ background: '#1d1f23', border: '1px solid #000000', padding: '10px', borderRadius: '5px', color: 'white' }}
          />
          <input
            type="text"
            placeholder="Поиск по исполнителю..."
            value={searchAssignee}
            onChange={(e) => setSearchAssignee(e.target.value)}
            style={{ background: '#1d1f23', border: '1px solid #000000', padding: '10px', borderRadius: '5px', color: 'white' }}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ background: '#1d1f23', border: '1px solid #000000', padding: '10px', borderRadius: '5px', color: 'white' }}
          >
            <option value="">Все статусы</option>
            <option value="completed">Завершено</option>
            <option value="inProgress">В процессе</option>
            <option value="overdue">Просрочено</option>
          </select>
          <button onClick={exportToExcel} style={{ backgroundColor: '#4caf50', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            📥 Экспорт в Excel
          </button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>№</th>
                <th>ФИО</th>
                <th>Название</th>
                <th>Проект</th>
                <th>Доска</th>
                <th>Статус</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task, index) => (
                <tr key={task.id}>
                  <td>{index + 1}</td>
                  <td>{task.assigneeUsername}</td>
                  <td>{task.name}</td>
                  <td>{task.projectName}</td>
                  <td>{task.boardName}</td>
                  <td>
                    {task.isCompleted ? (
                      <span className={styles.statusCompleted}>Завершено</span>
                    ) : task.dueDate && new Date(task.dueDate).getTime() < Date.now() ? (
                      <span className={styles.statusOverdue}>Просрочено</span>
                    ) : (
                      <span className={styles.statusInProgress}>В процессе</span>
                    )}
                  </td>
                  <td>{formatDate(task.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
