import React, { useCallback, useContext, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Draggable } from 'react-beautiful-dnd';
import { Button, Checkbox, Icon } from 'semantic-ui-react';
import { useDidUpdate } from '../../../../lib/hooks';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import { usePopupInClosableContext } from '../../../../hooks';
import { isListArchiveOrTrash } from '../../../../utils/record-helpers';
import { ClosableContext } from '../../../../contexts';
import EditName from './EditName';
import SelectAssigneeStep from './SelectAssigneeStep';
import ActionsStep from './ActionsStep';
import Linkify from '../../../common/Linkify';
import UserAvatar from '../../../users/UserAvatar';

import styles from './Task.module.scss';

const Task = React.memo(({ id, index }) => {
  const selectTaskById = useMemo(() => selectors.makeSelectTaskById(), []);
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);

  const task = useSelector((state) => selectTaskById(state, id));
  const currentUserId = useSelector(selectors.selectCurrentUserId);

  const { canEdit, canToggle } = useSelector((state) => {
    const { listId } = selectors.selectCurrentCard(state);
    const list = selectListById(state, listId);

    if (isListArchiveOrTrash(list)) {
      return {
        canEdit: false,
        canToggle: false,
      };
    }

    const task = selectTaskById(state, id);
    const isOwnTask = task.assigneeUserId === currentUserId;

    return {
      canEdit: isOwnTask,
      canToggle: isOwnTask,
    };
  }, shallowEqual);

  const dispatch = useDispatch();
  const [isEditNameOpened, setIsEditNameOpened] = useState(false);
  const [, , setIsClosableActive] = useContext(ClosableContext);

  const handleToggleChange = useCallback(() => {
    if (!canToggle) return;
    dispatch(
      entryActions.updateTask(id, {
        isCompleted: !task.isCompleted,
      }),
    );
  }, [id, task.isCompleted, dispatch, canToggle]);

  const handleUserSelect = useCallback(() => {
    if (!task.assigneeUserId) {
      dispatch(
        entryActions.updateTask(id, {
          assigneeUserId: currentUserId,
        }),
      );
    }
  }, [id, dispatch, task.assigneeUserId, currentUserId]);

  const handleUserDeselect = useCallback(() => {
    if (task.assigneeUserId === currentUserId) {
      dispatch(
        entryActions.updateTask(id, {
          assigneeUserId: null,
        }),
      );
    }
  }, [id, dispatch, task.assigneeUserId, currentUserId]);

  const isEditable = task.isPersisted && canEdit;

  const handleClick = useCallback(() => {
    if (isEditable) {
      setIsEditNameOpened(true);
    }
  }, [isEditable]);

  const handleNameEdit = useCallback(() => {
    setIsEditNameOpened(true);
  }, []);

  const handleEditNameClose = useCallback(() => {
    setIsEditNameOpened(false);
  }, []);

  useDidUpdate(() => {
    setIsClosableActive(isEditNameOpened);
  }, [isEditNameOpened]);

  const SelectAssigneePopup = usePopupInClosableContext(SelectAssigneeStep);
  const ActionsPopup = usePopupInClosableContext(ActionsStep);

  return (
    <Draggable
      draggableId={`task:${id}`}
      index={index}
      isDragDisabled={isEditNameOpened || !isEditable}
    >
      {({ innerRef, draggableProps, dragHandleProps }, { isDragging }) => {
        const contentNode = (
          <div
            {...draggableProps}
            {...dragHandleProps}
            ref={innerRef}
            className={classNames(styles.wrapper, isDragging && styles.wrapperDragging)}
          >
            <span className={styles.checkboxWrapper}>
              <Checkbox
                checked={task.isCompleted}
                disabled={!task.isPersisted || !canToggle}
                className={styles.checkbox}
                onChange={handleToggleChange}
              />
            </span>
            {isEditNameOpened ? (
              <EditName taskId={id} onClose={handleEditNameClose} />
            ) : (
              <div className={classNames(canEdit && styles.contentHoverable)}>
                <span
                  className={classNames(styles.text, canEdit && styles.textEditable)}
                  onClick={handleClick}
                >
                  <span
                    className={classNames(styles.task, task.isCompleted && styles.taskCompleted)}
                  >
                    <Linkify linkStopPropagation>{task.name}</Linkify>
                  </span>
                </span>

                {/* Показывать кнопки только если задача свободна или принадлежит текущему пользователю */}
                {(task.assigneeUserId === currentUserId || !task.assigneeUserId) && (
                  <div
                    className={classNames(styles.actions, isEditable && styles.actionsEditable)}
                  >
                    <SelectAssigneePopup
                      currentUserId={task.assigneeUserId}
                      onUserSelect={handleUserSelect}
                      onUserDeselect={handleUserDeselect}
                    >
                      {task.assigneeUserId ? (
                        <UserAvatar
                          id={task.assigneeUserId}
                          size="tiny"
                          className={styles.assigneeUserAvatar}
                        />
                      ) : (
                        <Button className={styles.button}>
                          <Icon fitted name="add user" size="small" />
                        </Button>
                      )}
                    </SelectAssigneePopup>
                    <ActionsPopup taskId={id} onNameEdit={handleNameEdit}>
                      <Button className={styles.button}>
                        <Icon fitted name="pencil" size="small" />
                      </Button>
                    </ActionsPopup>
                  </div>
                )}

                {/* Отображение аватарки без кнопок — если назначен кто-то другой */}
                {task.assigneeUserId &&
                  task.assigneeUserId !== currentUserId &&
                  !isEditable && (
                    <div className={styles.actions}>
                      <UserAvatar
                        id={task.assigneeUserId}
                        size="tiny"
                        className={styles.assigneeUserAvatar}
                      />
                    </div>
                  )}
              </div>
            )}
          </div>
        );

        return isDragging ? ReactDOM.createPortal(contentNode, document.body) : contentNode;
      }}
    </Draggable>
  );
});

Task.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
};

export default Task;
