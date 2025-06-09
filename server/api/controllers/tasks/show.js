module.exports = {
  friendlyName: 'Show tasks by user',
  description: 'Returns tasks for a specific user',

  inputs: {
    userId: {
      type: 'string',
      required: true,
      description: 'ID пользователя, чьи задачи нужно вернуть',
    },
  },

  exits: {
    success: {
      description: 'Tasks retrieved successfully',
    },
  },

  fn: async function ({ userId }) {
    const tasks = await Task.find({ userId });

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
