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
      background: "linear-gradient(145deg, #2e2e3e, #1a1a26)",
      color: "#ffffff",
      padding: 30,
      borderRadius: 16,
      width: 250,
      textAlign: "center",
      boxShadow: "0 0 20px rgba(0, 255, 255, 0.1)",
      border: "1px solid #3a3a50"
    }}
  >
    <h2 style={{ margin: "0 0 10px", fontSize: 20, color: "#00FFFF" }}>
      Общее количество
    </h2>
    <p style={{ fontSize: 36, margin: 0, fontWeight: "bold" }}>12</p>
  </div>
  <div
    style={{
      background: "linear-gradient(145deg, #1d2e1d, #132113)",
      color: "#ffffff",
      padding: 30,
      borderRadius: 16,
      width: 250,
      textAlign: "center",
      boxShadow: "0 0 20px rgba(0, 255, 128, 0.1)",
      border: "1px solid #285f38"
    }}
  >
    <h2 style={{ margin: "0 0 10px", fontSize: 20, color: "#32CD32" }}>
      Выполнено
    </h2>
    <p style={{ fontSize: 36, margin: 0, fontWeight: "bold" }}>7</p>
  </div>
  <div
    style={{
      background: "linear-gradient(145deg, #3e1e1e, #2b1313)",
      color: "#ffffff",
      padding: 30,
      borderRadius: 16,
      width: 250,
      textAlign: "center",
      boxShadow: "0 0 20px rgba(255, 64, 64, 0.1)",
      border: "1px solid #5a2a2a"
    }}
  >
    <h2 style={{ margin: "0 0 10px", fontSize: 20, color: "#FF6B6B" }}>
      Невыполнено
    </h2>
    <p style={{ fontSize: 36, margin: 0, fontWeight: "bold" }}>5</p>
  </div>
</div>


      <View />
    </div>
  );
});

export default Home;
