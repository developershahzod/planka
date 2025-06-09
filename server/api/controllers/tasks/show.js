/**
 * GET /api/tasks/show
 * Возвращает все задачи, к которым у пользователя есть доступ
 */

module.exports = {
  friendlyName: 'Show all tasks',
  description: 'Returns all tasks user has access to',

  exits: {
    success: {
      description: 'Tasks retrieved successfully',
    },
    forbidden: {
      description: 'User not logged in',
      responseType: 'forbidden',
    },
  },

  fn: async function () {
    const currentUserId = this.req.session.userId;

    if (!currentUserId) {
      throw 'forbidden';
    }

    const boardMemberships = await BoardMembership.find({
      userId: currentUserId,
    });

    const boardIds = boardMemberships.map((m) => m.boardId);

    if (!boardIds.length) {
      return [];
    }

    const cards = await Card.find({
      boardId: boardIds,
    });

    const cardIds = cards.map((card) => card.id);

    const taskLists = await TaskList.find({
      cardId: cardIds,
    });

    const taskListIds = taskLists.map((list) => list.id);

    const tasks = await Task.find({
      taskListId: taskListIds,
    });

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
