/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import { useSelector } from 'react-redux';

import selectors from '../../../selectors';
import { HomeViews } from '../../../constants/Enums';
import GridProjectsView from './GridProjectsView';
import GroupedProjectsView from './GroupedProjectsView';

import styles from './Home.module.scss';

const Home = React.memo(() => {
  const view = useSelector(selectors.selectHomeView);

  let View;
  switch (view) {
    case HomeViews.GRID_PROJECTS:
      View = GridProjectsView;

      break;
    case HomeViews.GROUPED_PROJECTS:
      View = GroupedProjectsView;

      break;
    default:
  }

  return (
    <div className={styles.wrapper}>
      <div
  style={{
    display: "flex",
    gap: 20,
    flexWrap: "wrap",
    justifyContent: "center"
  }}
>
  <div
    style={{
      backgroundColor: "#3B82F6",
      color: "white",
      padding: 30,
      borderRadius: 16,
      width: 250,
      textAlign: "center",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
    }}
  >
    <h2 style={{ margin: "0 0 10px", fontSize: 20 }}>Общее количество</h2>
    <p style={{ fontSize: 36, margin: 0, fontWeight: "bold" }}>12</p>
  </div>
  <div
    style={{
      backgroundColor: "#10B981",
      color: "white",
      padding: 30,
      borderRadius: 16,
      width: 250,
      textAlign: "center",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
    }}
  >
    <h2 style={{ margin: "0 0 10px", fontSize: 20 }}>Выполнено</h2>
    <p style={{ fontSize: 36, margin: 0, fontWeight: "bold" }}>7</p>
  </div>
  <div
    style={{
      backgroundColor: "#EF4444",
      color: "white",
      padding: 30,
      borderRadius: 16,
      width: 250,
      textAlign: "center",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
    }}
  >
    <h2 style={{ margin: "0 0 10px", fontSize: 20 }}>Невыполнено</h2>
    <p style={{ fontSize: 36, margin: 0, fontWeight: "bold" }}>5</p>
  </div>
</div>

      <View />
    </div>
  );
});

export default Home;
