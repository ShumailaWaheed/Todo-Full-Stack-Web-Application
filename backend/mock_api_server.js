const express = require('express');
const cors = require('cors');
const app = express();
const port = 8083;

// In-memory storage for tasks and users (for mock purposes)
let tasks = [];
let users = [];
let projects = [];
let nextId = 1;
let nextUserId = 1;
let nextProjectId = 1;

// Middleware
app.use(cors());
app.use(express.json());

// Helper to find user by ID (from token or param)
const findUserById = (userId) => {
  return users.find(u => u.id === userId) || { id: userId, email: 'test@example.com' };
};

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Todo API is running!' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Auth endpoints
app.post('/auth/login', (req, res) => {
  const { email } = req.body;
  let user = users.find(u => u.email === email);

  if (!user) {
    // Create user if doesn't exist
    user = {
      id: `user_${nextUserId++}`,
      email: email
    };
    users.push(user);
  }

  res.json({
    access_token: `mock_access_token_for_${user.id}`,
    refresh_token: `mock_refresh_token_for_${user.id}`,
    token_type: 'bearer'
  });
});

app.post('/auth/refresh', (req, res) => {
  res.json({
    access_token: 'mock_access_token_for_testing',
    refresh_token: 'mock_refresh_token_for_testing',
    token_type: 'bearer'
  });
});

app.post('/auth/check-email', (req, res) => {
  const { email } = req.body;
  const exists = users.some(u => u.email === email);
  res.json({ exists });
});

// More specific routes first to avoid conflicts
// Project endpoints (before the general task ID route)
app.get('/api/:userId/projects', (req, res) => {
  const userId = req.params.userId;

  // Handle unknown/invalid user ID by returning empty results
  if (!userId || userId === 'unknown') {
    return res.json([]);
  }

  const userProjects = projects.filter(p => p.user_id === userId);

  res.json(userProjects);
});

app.post('/api/:userId/projects', (req, res) => {
  const userId = req.params.userId;
  const { name, description, due_date, priority } = req.body;

  // Handle unknown/invalid user ID by returning error
  if (!userId || userId === 'unknown') {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  const newProject = {
    id: `proj_${nextProjectId++}`,
    name: name || 'New Project',
    description: description || '',
    due_date: due_date || null,
    priority: priority || 'medium',
    completed: false,
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  projects.push(newProject);
  res.status(201).json(newProject);
});

app.get('/api/:userId/projects/:projectId', (req, res) => {
  const { userId, projectId } = req.params;

  // Handle unknown/invalid user ID by returning 404
  if (!userId || userId === 'unknown') {
    return res.status(404).json({ error: 'Project not found' });
  }

  const project = projects.find(p => p.id === projectId && p.user_id === userId);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  res.json(project);
});

app.put('/api/:userId/projects/:projectId', (req, res) => {
  const { userId, projectId } = req.params;
  const { name, description, completed, due_date, priority } = req.body;

  // Handle unknown/invalid user ID by returning error
  if (!userId || userId === 'unknown') {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  const projectIndex = projects.findIndex(p => p.id === projectId && p.user_id === userId);

  if (projectIndex === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }

  projects[projectIndex] = {
    ...projects[projectIndex],
    ...(name !== undefined && { name }),
    ...(description !== undefined && { description }),
    ...(completed !== undefined && { completed }),
    ...(due_date !== undefined && { due_date }),
    ...(priority !== undefined && { priority }),
    updated_at: new Date().toISOString()
  };

  res.json(projects[projectIndex]);
});

app.delete('/api/:userId/projects/:projectId', (req, res) => {
  const { userId, projectId } = req.params;

  // Handle unknown/invalid user ID by returning error
  if (!userId || userId === 'unknown') {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  const projectIndex = projects.findIndex(p => p.id === projectId && p.user_id === userId);

  if (projectIndex === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }

  projects.splice(projectIndex, 1);
  res.status(204).send(); // No content
});

// Analytics endpoints (before general task ID route)
app.get('/api/:userId/analytics/completion-trends', (req, res) => {
  const userId = req.params.userId;
  const weeks = parseInt(req.query.weeks) || 8;

  // Handle unknown/invalid user ID by returning empty results
  if (!userId || userId === 'unknown') {
    return res.json({ trends: [] });
  }

  // Generate mock completion trend data
  const trends = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - (i * 7));
    trends.push({
      week: date.toISOString().split('T')[0],
      completed: Math.floor(Math.random() * 10)
    });
  }

  res.json({ trends });
});

app.get('/api/:userId/analytics/weekly-activity', (req, res) => {
  const userId = req.params.userId;
  const weeks = parseInt(req.query.weeks) || 8;

  // Handle unknown/invalid user ID by returning empty results
  if (!userId || userId === 'unknown') {
    return res.json({ activity: [] });
  }

  // Generate mock weekly activity data
  const activity = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - (i * 7));
    activity.push({
      week: date.toISOString().split('T')[0],
      created: Math.floor(Math.random() * 15),
      completed: Math.floor(Math.random() * 10)
    });
  }

  res.json({ activity });
});

app.get('/api/:userId/analytics/summary', (req, res) => {
  const userId = req.params.userId;

  // Handle unknown/invalid user ID by returning empty results
  if (!userId || userId === 'unknown') {
    return res.json({
      total_tasks: 0,
      completed_tasks: 0,
      pending_tasks: 0,
      overdue_tasks: 0,
      completion_rate: 0,
      tasks_completed_this_week: 0,
      tasks_created_this_week: 0,
      high_priority_pending: 0,
      medium_priority_pending: 0,
      low_priority_pending: 0
    });
  }

  const userTasks = tasks.filter(t => t.user_id === userId);
  const completedTasks = userTasks.filter(t => t.completed);
  const pendingTasks = userTasks.filter(t => !t.completed);
  const overdueTasks = userTasks.filter(t => {
    if (t.completed || !t.due_date) return false;
    return new Date(t.due_date) < new Date();
  });

  const highPriorityPending = pendingTasks.filter(t => t.priority === 'high').length;
  const mediumPriorityPending = pendingTasks.filter(t => t.priority === 'medium').length;
  const lowPriorityPending = pendingTasks.filter(t => t.priority === 'low').length;

  const completionRate = userTasks.length > 0 ? (completedTasks.length / userTasks.length) * 100 : 0;

  // Calculate tasks for this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const tasksCompletedThisWeek = completedTasks.filter(t => new Date(t.updated_at) > oneWeekAgo).length;
  const tasksCreatedThisWeek = userTasks.filter(t => new Date(t.created_at) > oneWeekAgo).length;

  res.json({
    total_tasks: userTasks.length,
    completed_tasks: completedTasks.length,
    pending_tasks: pendingTasks.length,
    overdue_tasks: overdueTasks.length,
    completion_rate: parseFloat(completionRate.toFixed(2)),
    tasks_completed_this_week: tasksCompletedThisWeek,
    tasks_created_this_week: tasksCreatedThisWeek,
    high_priority_pending: highPriorityPending,
    medium_priority_pending: mediumPriorityPending,
    low_priority_pending: lowPriorityPending
  });
});

// Task endpoints (under /api/:userId/)
app.get('/api/:userId/', (req, res) => {
  const userId = req.params.userId;
  const completedParam = req.query.completed;
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  // Handle unknown/invalid user ID by returning empty results
  if (!userId || userId === 'unknown') {
    return res.json({
      tasks: [],
      total: 0,
      offset,
      limit
    });
  }

  let filteredTasks = tasks.filter(t => t.user_id === userId);

  if (completedParam !== undefined) {
    const completed = completedParam === 'true';
    filteredTasks = filteredTasks.filter(t => t.completed === completed);
  }

  // Apply pagination
  const paginatedTasks = filteredTasks.slice(offset, offset + limit);

  res.json({
    tasks: paginatedTasks,
    total: filteredTasks.length,
    offset,
    limit
  });
});

// Specific task endpoints after more specific routes
app.get('/api/:userId/:taskId', (req, res) => {
  const { userId, taskId } = req.params;

  // Check if this might be a special route (like "projects", "analytics", etc.)
  // or if the taskId is actually a route parameter like "complete"
  const specialPaths = ['projects', 'analytics', 'complete'];
  if (specialPaths.includes(taskId)) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }

  // Handle unknown/invalid user ID by returning 404
  if (!userId || userId === 'unknown') {
    return res.status(404).json({ error: 'Task not found' });
  }

  const task = tasks.find(t => t.id === taskId && t.user_id === userId);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json(task);
});

app.post('/api/:userId/', (req, res) => {
  const userId = req.params.userId;
  const { title, description, due_date, priority } = req.body;

  const newTask = {
    id: nextId.toString(), // Convert to string to match frontend expectations
    title: title || 'New Task',
    description: description || '',
    completed: false,
    user_id: userId,
    due_date: due_date || null,
    priority: priority || 'medium',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  tasks.push(newTask);
  nextId++; // Increment after assignment
  res.status(201).json(newTask);
});

app.put('/api/:userId/:taskId', (req, res) => {
  const { userId, taskId } = req.params;
  const { title, description, completed, due_date, priority } = req.body;

  // Check if this might be a special route (like "projects", "analytics", etc.)
  // or if the taskId is actually a route parameter like "complete"
  const specialPaths = ['projects', 'analytics', 'complete'];
  if (specialPaths.includes(taskId)) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }

  // Handle unknown/invalid user ID by returning 404
  if (!userId || userId === 'unknown') {
    return res.status(404).json({ error: 'Task not found' });
  }

  const taskIndex = tasks.findIndex(t => t.id === taskId && t.user_id === userId);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(completed !== undefined && { completed }),
    ...(due_date !== undefined && { due_date }),
    ...(priority !== undefined && { priority }),
    updated_at: new Date().toISOString()
  };

  res.json(tasks[taskIndex]);
});

app.patch('/api/:userId/:taskId/complete', (req, res) => {
  const { userId, taskId } = req.params;
  const { completed } = req.body;

  const taskIndex = tasks.findIndex(t => t.id === taskId && t.user_id === userId);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  tasks[taskIndex].completed = completed;
  tasks[taskIndex].updated_at = new Date().toISOString();

  res.json(tasks[taskIndex]);
});

app.delete('/api/:userId/:taskId', (req, res) => {
  const { userId, taskId } = req.params;

  // Check if this might be a special route (like "projects", "analytics", etc.)
  // or if the taskId is actually a route parameter like "complete"
  const specialPaths = ['projects', 'analytics', 'complete'];
  if (specialPaths.includes(taskId)) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }

  // Handle unknown/invalid user ID by returning 404
  if (!userId || userId === 'unknown') {
    return res.status(404).json({ error: 'Task not found' });
  }

  const taskIndex = tasks.findIndex(t => t.id === taskId && t.user_id === userId);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  tasks.splice(taskIndex, 1);
  res.status(204).send(); // No content
});

// Catch-all for other routes that the frontend might call
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Todo API Mock Server running at http://localhost:${port}`);
  console.log('Full API functionality available:');
  console.log('- Authentication: /auth/login, /auth/refresh, /auth/check-email');
  console.log('- Tasks: GET/POST/PUT/PATCH/DELETE /api/:userId/');
  console.log('- Projects: GET/POST/PUT/DELETE /api/:userId/projects');
  console.log('- Analytics: GET /api/:userId/analytics/*');
});