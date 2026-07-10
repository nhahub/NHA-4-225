import { AxiosInstance } from 'axios';
import { Task } from '@/features/tasks/types';

const STORAGE_KEY = 'impulse_tasks_db';

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get data
const getLocalTasks = (): Task[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

// Helper to save data
const saveLocalTasks = (tasks: Task[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

export const setupMockServer = (axios: AxiosInstance) => {
    // Use a custom adapter to intercept requests
    axios.defaults.adapter = async (config) => {
        // Artificial delay
        await delay(300 + Math.random() * 400);

        const { url, method, data } = config;
        const path = url?.replace('/api', '') || '';

        // --- AUTH ---
        if (path === '/auth/login' && method === 'post') {
            const { email } = JSON.parse(data);
            if (!email.includes('@')) {
                return Promise.reject({
                    response: { status: 400, data: { messageEn: 'Invalid email format' } }
                });
            }
            return {
                data: {
                    token: 'mock-jwt-token.' + btoa(JSON.stringify({ sub: email, roles: ['USER'] })),
                    roles: ['USER']
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config
            };
        }

        if (path === '/auth/register' && method === 'post') {
            const { email } = JSON.parse(data);
            return {
                data: {
                    token: 'mock-jwt-token.' + btoa(JSON.stringify({ sub: email, roles: ['USER'] })),
                    roles: ['USER']
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config
            };
        }

        // --- TASKS ---
        if ((path === '/tasks' || path === '/tasks/') && method === 'get') {
            let tasks = getLocalTasks();
            if (tasks.length === 0) {
                tasks = [
                    {
                        id: 1,
                        name: "Welcome to Impulse",
                        description: "This is a local task. Try editing or deleting it!",
                        day: new Date().toISOString().split('T')[0],
                        priority: "high",
                        done: false,
                        expectedTime: 30,
                        points: 10,
                        type: 'regular',
                        createdAt: Date.now()
                    },
                    {
                        id: 2,
                        name: "Try Dark Mode",
                        description: "Click the moon icon in the header.",
                        day: new Date().toISOString().split('T')[0],
                        priority: "medium",
                        done: true,
                        expectedTime: 15,
                        points: 5,
                        type: 'regular',
                        createdAt: Date.now()
                    }
                ];
                saveLocalTasks(tasks);
            }
            return { data: tasks, status: 200, statusText: 'OK', headers: {}, config };
        }

        if ((path === '/tasks' || path === '/tasks/') && method === 'post') {
            const taskData = JSON.parse(data);
            const tasks = getLocalTasks();
            const newTask: Task = {
                id: Date.now(),
                name: taskData.name || 'New Task',
                description: taskData.description || '',
                day: taskData.day || new Date().toISOString().split('T')[0],
                priority: taskData.priority || 'medium',
                done: false,
                expectedTime: taskData.expectedTime || 60,
                points: 10,
                type: taskData.type || 'regular',
                createdAt: Date.now(),
                subTasks: taskData.subTasks || [],
                ...taskData
            };
            tasks.push(newTask);
            saveLocalTasks(tasks);
            return { data: newTask, status: 201, statusText: 'Created', headers: {}, config };
        }

        // Handle /tasks/:id
        const taskMatch = path.match(/^\/tasks\/(\d+)$/);
        if (taskMatch) {
            const id = parseInt(taskMatch[1]);
            const tasks = getLocalTasks();
            const index = tasks.findIndex(t => t.id === id);

            if (index === -1) {
                return Promise.reject({ response: { status: 404, data: { message: 'Task not found' } } });
            }

            if (method === 'patch' || method === 'put') {
                const updates = JSON.parse(data);
                tasks[index] = { ...tasks[index], ...updates };
                saveLocalTasks(tasks);
                return { data: tasks[index], status: 200, statusText: 'OK', headers: {}, config };
            }

            if (method === 'delete') {
                const filtered = tasks.filter(t => t.id !== id);
                saveLocalTasks(filtered);
                return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config };
            }
        }

        // --- DASHBOARD ---
        if ((path === '/dashboard' || path === '/dashboard/') && method === 'get') {
            const tasks = getLocalTasks();
            const pending = tasks.filter(t => !t.done).length;
            const completed = tasks.filter(t => t.done).length;
            const focusTime = tasks
                .filter(t => t.done)
                .reduce((acc, curr) => acc + (curr.actualTime || curr.expectedTime || 0), 0);
            const score = tasks
                .filter(t => t.done)
                .reduce((acc, curr) => acc + (curr.points || 0), 0);

            return {
                data: {
                    pendingTasks: pending,
                    completedTasks: completed,
                    totalFocusTime: focusTime,
                    dailyScore: Math.round(score * 10) / 10,
                    dailyTarget: 100
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config
            };
        }

        // Default Fallback to real network (or 404)
        // For now, since this is mock mode, reject unknown
        return Promise.reject({
            response: { status: 404, data: { message: 'Endpoint not mocked' } }
        });
    };
};
