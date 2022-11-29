const degToRad = (d) => (d * Math.PI) / 180;

const radToDeg = (r) => (r * 180) / Math.PI;

const compareArray = (array1, array2) =>
  array1[0] == array2[0] && array1[1] == array2[1] && array1[2] == array2[2];

const alreadyExist = (array, index) =>
  (exist = array.find((item) => item == index));

const mapAllVertices = (position, indices) => {
  let mapVertices = {};

  let pontos = [],
    faces = [];

  for (let i = 0; i < position.length; i += 3) {
    pontos.push([position[i], position[i + 1], position[i + 2]]);
  }

  for (let i = 0; i < indices.length; i += 3) {
    faces.push([indices[i], indices[i + 1], indices[i + 2]]);
  }

  let batata = {};

  for (let i = 0, j = 0; i < position.length; i += 3, j++) {
    mapVertices[j] = [j];
    batata[j] = [];
  }

  for (let index in mapVertices) {
    faces.map((item) => {
      item.map((vertice) => {
        if (compareArray(pontos[mapVertices[index]], pontos[vertice]))
          if (!alreadyExist(batata[index], vertice))
            batata[index].push(vertice);

        return batata;
      });
    });
  }

  return batata;
};

const createArray = (type) => {
  const copyFormat =
    type == "cube"
      ? JSON.parse(JSON.stringify(arrays_cube6))
      : JSON.parse(JSON.stringify(pyramidFormat));

  let cubeNormal = calculateNormal(copyFormat.position, copyFormat.indices);
  const newArray = {
    position: { numComponents: 3, data: copyFormat.position },
    indices: { numComponents: 3, data: copyFormat.indices },
    normal: { numComponents: 3, data: cubeNormal },
    texcoord: { numComponents: 2, data: copyFormat.texcoord },
  };

  return newArray;
};

const computeMatrix = (matrix, config) => {
  matrix.trs.translation = [config.x, config.y, config.z];
  matrix.trs.rotation = [
    degToRad(config.spin_x),
    degToRad(config.spin_y),
    degToRad(0),
  ];
  matrix.trs.scale = [config.scalex, config.scaley, config.scalez];
};

const computeMatrixRotate = (matrix, config) => {
  matrix.trs.translation = [config.x, config.y, config.z];
  matrix.trs.rotation = [
    degToRad(config.spin_x),
    degToRad(config.spin_y),
    degToRad(0),
  ];
  matrix.trs.scale = [config.scalex, config.scaley, config.scalez];
};

const computeMatrixLuz = (matrix, config) => {
  matrix.trs.translation = [config.luzx, config.luzy, config.luzz];
  matrix.trs.rotation = [degToRad(0), degToRad(0), degToRad(0)];
  matrix.trs.scale = [0.05, 0.05, 0.05];
};

const computeMatrixCuboVertice = (matrix, config) => {
  matrix.trs.translation = [config.vx, config.vy, config.vz];
  matrix.trs.rotation = [degToRad(0), degToRad(0), degToRad(0)];
  matrix.trs.scale = [0.1, 0.1, 0.1];
};

const computeMatrixShot = (matrix, param) => {
  matrix.trs.translation = [param[0], param[1], param[2]];
  matrix.trs.rotation = [degToRad(0), degToRad(then * 100), degToRad(0)];
};

const computeMatrixBarrier = (nodeInfos, shot) => {
  if (checkColision(nodeInfos, shot)) {
    shotPosition = 0;
    //resetShot(nodeInfosByName["player"], nodeInfosByName["shot"]);
    removeShot();
  }
};
const computeMatrixBarrierEnemy = (nodeInfos, shot) => {
  if (checkColision(nodeInfos, shot)) {
    enemyShotPosition = 0;
    //resetShot(nodeInfosByName["player"], nodeInfosByName["shot"]);
    removeEnemyShot();
  }
};

const updateObjects = (index) => {
  console.log(sceneDescription.children);

  sceneDescription.children[0].children[index].draw = false;
  for (var i = 0; i < enemiesList.length; i++) {
    if (enemiesList[i] === `${index}`) {
      enemiesList.splice(i, 1);
    }
  }
  enemiesKilled++;

  // player
  sceneDescription.children[3].translation =
    nodeInfosByName["player"].trs.translation;

  // shot
  scene = makeNode(sceneDescription);
};

const spawnEnemyShot = (index) => {
  sceneDescription.children[4].draw = true;
  sceneDescription.children[4].translation = [
    nodeInfosByName[`enemy${index}`].trs.translation[0] +
      nodeInfosByName["enemies"].trs.translation[0],
    nodeInfosByName[`enemy${index}`].trs.translation[1] +
      nodeInfosByName["enemies"].trs.translation[1],
    0,
  ];
  arrLuz[1].color = [0, 200, 200];
  arrLuz[1].spec = [0, 200, 200];

  enemyShotPosition = 0;

  objectsToDraw = [];
  objects = [];
  scene = makeNode(sceneDescription);

  enemyShotExists = true;
};

const spawnShot = () => {
  sceneDescription.children[1].draw = true;
  sceneDescription.children[1].translation = [
    ...nodeInfosByName["player"].trs.translation,
  ];
  shotPosition = 0;
  arrLuz[0].color = [255, 0, 0];
  arrLuz[0].spec = [255, 0, 0];

  objectsToDraw = [];
  objects = [];
  scene = makeNode(sceneDescription);
  shotAudio.load();
  shotAudio.play();
  shotExists = true;
};

const removeShot = () => {
  sceneDescription.children[1].draw = false;
  arrLuz[0].color = [0, 0, 0];
  arrLuz[0].spec = [0, 0, 0];

  objectsToDraw = [];
  objects = [];
  scene = makeNode(sceneDescription);

  shotExists = false;
  spawnNewShot = false;
};

const removeEnemyShot = () => {
  sceneDescription.children[4].draw = false;
  arrLuz[1].color = [0, 0, 0];
  arrLuz[1].spec = [0, 0, 0];

  objectsToDraw = [];
  objects = [];
  scene = makeNode(sceneDescription);

  enemyShotExists = false;
  spawnNewEnemyShot = false;
};

const computeMatrixEnemy = (nodes, bbShot) => {
  for (let index = 0; index < enemiesList.length; index++) {
    if (
      checkColision(
        nodes[`enemy${enemiesList[index]}`].node.drawInfo.boundingBox,
        bbShot
      )
    ) {
      shotPosition = 0;
      removeShot();
      updateObjects(enemiesList[index]);

      killAudio.play();

      objectsToDraw = [];
      objects = [];
      nodeInfosByName = {};
      scene = makeNode(sceneDescription);
      console.log("colidiu enemy");
      break;
    }
  }
};

const computeMatrixEnemykill = (nodeInfos, shot) => {
  if (checkColision(nodeInfos, shot)) {
    enemyShotPosition = 0;
    //resetShot(nodeInfosByName["player"], nodeInfosByName["shot"]);
    removeEnemyShot();
    alert("Você perdeu!");
    continueGame = false;
  }
};

const convertToZeroOne = (old_value, old_min, old_max) => {
  return (old_value - old_min) / (old_max - old_min);
};

const checkColision = (bbo, bbt) => {
  //testa se o canto direito da bb do tiro ta entre os x da bb do objeto
  if (bbo[0] < bbt[6] && bbo[2] > bbt[6]) {
    //testa colisão entre obj e parte de cima do tiro
    if (bbo[1] < bbt[7] && bbo[5] > bbt[7]) {
      console.log("colidiu");
      return true;
    }
    //testa colisão entre obj e parte de baixo do tiro
    if (bbo[1] < bbt[3] && bbo[5] > bbt[3]) {
      console.log("colidiu");
      return true;
    }
  } else if (bbo[0] < bbt[4] && bbo[2] > bbt[4]) {
    //testa se o canto esquerdo da bb do tiro ta entre os x da bb do objeto
    if (bbo[1] < bbt[5] && bbo[5] > bbt[5]) {
      console.log("colidiu");
      return true;
    }
    if (bbo[1] < bbt[1] && bbo[5] > bbt[1]) {
      console.log("colidiu");
      return true;
    }
  }

  return false;
};

const resetShot = (origin, shot) => {
  shot.trs.translation = origin.trs.translation;
  updateBoundingBoxPlayerShot();
  //shotAudio.load();
  //shotAudio.play();
};

const updateBoundingBoxPlayer = function () {
  //Atualiza a boundingBox do player
  for (let index = 0; index < 8; index += 2) {
    nodeInfosByName["player"].node.drawInfo.boundingBox[index] =
      bbPadrao[index] + nodeInfosByName["player"].trs.translation[0];
    nodeInfosByName["player"].node.drawInfo.boundingBox[index + 1] =
      bbPadrao[index] + nodeInfosByName["player"].trs.translation[1];
  }
};

const updateBoundingBoxEnemies = function () {
  for (let i = 0; i < enemiesList.length; i++) {
    for (let index = 0; index < 8; index += 2) {
      nodeInfosByName[`enemy${enemiesList[i]}`].node.drawInfo.boundingBox[
        index
      ] =
        nodeInfosByName[`enemy${enemiesList[i]}`].trs.scale[0] *
          bbPadrao[index] +
        nodeInfosByName[`enemy${enemiesList[i]}`].trs.translation[0] +
        nodeInfosByName[`enemies`].trs.translation[0];

      nodeInfosByName[`enemy${enemiesList[i]}`].node.drawInfo.boundingBox[
        index + 1
      ] =
        nodeInfosByName[`enemy${enemiesList[i]}`].trs.scale[1] *
          bbPadrao[index + 1] +
        nodeInfosByName[`enemy${enemiesList[i]}`].trs.translation[1] +
        nodeInfosByName[`enemies`].trs.translation[1];
    }
  }
};
const updateBoundingBoxPlayerShot = function () {
  for (let index = 0; index < 8; index += 2) {
    nodeInfosByName["shot"].node.drawInfo.boundingBox[index] =
      nodeInfosByName["shot"].trs.scale[0] * bbPadrao[index] +
      nodeInfosByName["shot"].trs.translation[0];

    nodeInfosByName["shot"].node.drawInfo.boundingBox[index + 1] =
      nodeInfosByName["shot"].trs.scale[1] * bbPadrao[index + 1] +
      nodeInfosByName["shot"].trs.translation[1];
  }
};

const updateBoundingBoxEnemyShot = function () {
  for (let index = 0; index < 8; index += 2) {
    nodeInfosByName["enemyShot"].node.drawInfo.boundingBox[index] =
      nodeInfosByName["enemyShot"].trs.scale[0] * bbPadrao[index] +
      nodeInfosByName["enemyShot"].trs.translation[0];

    nodeInfosByName["enemyShot"].node.drawInfo.boundingBox[index + 1] =
      nodeInfosByName["enemyShot"].trs.scale[1] * bbPadrao[index + 1] +
      nodeInfosByName["enemyShot"].trs.translation[1];
  }
};

const updateBoundingBoxAll = function () {
  updateBoundingBoxEnemies();
  updateBoundingBoxPlayer();
  //updateBoundingBoxPlayerShot();

  //Atualiza a boundingBox das barreiras
  for (let i = 0; i < sceneDescription.children[2].children.length; i++) {
    for (let index = 0; index < 8; index += 2) {
      nodeInfosByName[`barrier${i}`].node.drawInfo.boundingBox[index] =
        nodeInfosByName[`barrier${i}`].trs.scale[0] * bbPadrao[index] +
        nodeInfosByName[`barrier${i}`].trs.translation[0];

      nodeInfosByName[`barrier${i}`].node.drawInfo.boundingBox[index + 1] =
        nodeInfosByName[`barrier${i}`].trs.scale[1] * bbPadrao[index + 1] +
        nodeInfosByName[`barrier${i}`].trs.translation[1];
    }
  }
};

canvas.addEventListener("keydown", function (e) {
  switch (e.key) {
    case "ArrowRight":
      nodeInfosByName["player"].trs.translation[0] += 0.5;
      break;
    case "ArrowLeft":
      nodeInfosByName["player"].trs.translation[0] -= 0.5;
      break;

    case "ArrowUp":
      spawnNewShot = true;
      break;

    default:
      break;
  }
  //shotAudio.play();
});
