module.exports = {
  friendlyName: 'Show all tasks',
  description: 'Returns all tasks (no user filtering)',

  exits: {
    success: {
      description: 'Tasks retrieved successfully',
    },
  },

  fn: async function () {
    const tasks = await Task.find();

    return tasks.map((task) => ({
      id: task.id,
      taskListId: task.taskListId,
      name: task.name,
      position: task.position,
      isCompleted: task.isCompleted,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }));
  },
};
