module.exports = {
  friendlyName: 'Show tasks by user',
  description: 'Returns tasks assigned to the current user',

  exits: {
    success: {
      description: 'Tasks retrieved successfully',
    },
  },

  fn: async function () {
    const userId = this.req.query.userId

    const tasks = await Task.find({
      assigneeUserId: userId,
    });

    return tasks.map((task) => ({
      id: task.id,
      taskListId: task.taskListId,
      name: task.name,
      position: task.position,
      isCompleted: task.isCompleted,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      assigneeUserId: task.assigneeUserId,
    }));
  },
};
