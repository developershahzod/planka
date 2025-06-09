module.exports = {
  friendlyName: 'Show tasks by user',
  description: 'Returns tasks for a specific user',

  inputs: {
    userId: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    success: {
      description: 'Tasks retrieved successfully',
    },
  },

  fn: async function () {
    const userId = this.req.query.userId;

    if (!userId) {
      return this.res.badRequest({ message: 'userId is required' });
    }

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
