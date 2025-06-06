/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';
import { isLocalId } from '../utils/local-id';

export const makeSelectTaskById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Task }, id) => {
      const taskModel = Task.withId(id);

      if (!taskModel) {
        return taskModel;
      }

      return {
        ...taskModel.ref,
        isPersisted: !isLocalId(taskModel.id),
      };
    },
  );

export const selectTaskById = makeSelectTaskById();


export const selectTasks = createSelector(orm, (session) => {
  return session.Task.all().toModelArray().map((taskModel) => ({
    ...taskModel.ref,
  }));
});

export default {
  makeSelectTaskById,
  selectTaskById,
  selectTasks
};
