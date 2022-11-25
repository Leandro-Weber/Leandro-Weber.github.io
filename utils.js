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
    resetShot(nodeInfosByName["player"], nodeInfosByName["shot"]);
  }
};

const updateObjects = (index) => {
  //index = 3;
  console.log(objeto.children);

  // enemy
  // objeto.children[0].children[index].draw = false;
  // delete objeto.children[0].children[index];
  // console.log(objeto.children);

  // joga o inimigo pra fora da tela, não sei tirar ele de outra forma
  objeto.children[0].children[index].translation = [99, 99, 99];

  // player
  objeto.children[3].translation = nodeInfosByName["player"].trs.translation;

  // shot
  objeto.children[1].translation = nodeInfosByName["player"].trs.translation;
};

const computeMatrixEnemy = (nodes, bbShot) => {
  for (let index = 0; index < enemiesList.length; index++) {
    //console.log(nodes[`enemy${enemiesList[index]}`]);
    if (
      checkColision(
        nodes[`enemy${enemiesList[index]}`].node.drawInfo.boundingBox,
        bbShot
      )
    ) {
      // remove objeto
      shotPosition = 0;
      resetShot(nodeInfosByName["player"], nodeInfosByName["shot"]);
      // delete nodes[`enemy${enemiesList[index]}`];
      // enemiesList = [
      //   ...enemiesList.splice(0, index),
      //   ...enemiesList.splice(index + 1, enemiesList.length),
      // ];
      updateObjects(index);
      killAudio.play();

      objectsToDraw = [];
      objects = [];
      nodeInfosByName = {};
      scene = makeNode(objeto);
      console.log("colidiu enemy");
      break;
    }
  }
};
const convertToZeroOne = (old_value, old_min, old_max) => {
  return (old_value - old_min) / (old_max - old_min);
};
// const checkColision = (obj, shot) => {
//   var size = 1.3; // size representa o raio do objeto

//   // testa se y é positivo
//   if (shot[1] >= 0) {
//     if (shot[0] > obj[0] - size && shot[0] < obj[0] + size) {
//       if (shot[1] > obj[1] - size) {
//         //colidiu
//         console.log("colidiu+");
//         return true;
//       }
//     }
//   } else {
//     if (shot[0] > obj[0] - size && shot[0] < obj[0] + size) {
//       if (shot[1] > obj[1] + size) {
//         //colidiu
//         console.log("colidiu-");

//         return true;
//       }
//     }
//   }
//   return false;
// };

const checkColision = (bbo, bbt) => {
  var size = 1.3; // size representa o raio do objeto
  console.log(`bbo  ${bbo}`);
  console.log(`bbt  ${bbt}`);
  //testa se o canto esquerdo da bb do tiro ta entre os x da bb do objeto
  if (bbo[0] < bbt[6] && bbo[2] > bbt[6]) {
    if (bbo[1] < bbt[7] && bbo[5] > bbt[7]) {
      console.log("colidiu");
      return true;
    }
  } else if (bbo[0] < bbt[4] && bbo[2] > bbt[4]) {
    //testa se o canto direito da bb do tiro ta entre os x da bb do objeto
    if (bbo[1] < bbt[5] && bbo[5] > bbt[5]) {
      console.log("colidiu");
      return true;
    }
  }

  return false;
};

const resetShot = (origin, shot) => {
  shot.trs.translation = origin.trs.translation;
  //shotAudio.load();
  //shotAudio.play();
};

const updateBoundingBoxPlayer = function () {
  //Atualiza a boundingBox do player
  for (
    let index = 0;
    index < objeto.children[3].boundingBox.length;
    index += 2
  ) {
    objeto.children[3].boundingBox[index] =
      objeto.children[3].boundingBox[index] + objeto.children[3].translation[0];
    objeto.children[3].boundingBox[index + 1] =
      objeto.children[3].boundingBox[index] + objeto.children[3].translation[1];
  }
};

const updateBoundingBoxEnemies = function () {
  objeto.children[0].children.forEach((element) => {
    for (let index = 0; index < element.boundingBox.length; index += 2) {
      element.boundingBox[index] =
        element.boundingBox[index] + element.translation[0];
      element.boundingBox[index + 1] =
        element.boundingBox[index] + element.translation[1];
    }
  });
};
const updateBoundingBoxPlayerShot = function () {
  for (
    let index = 0;
    index < objeto.children[1].boundingBox.length;
    index += 2
  ) {
    objeto.children[1].boundingBox[index] =
      (objeto.children[1].boundingBox[index] +
        objeto.children[1].translation[0]) *
      objeto.children[1].scale[0];
    objeto.children[1].boundingBox[index + 1] =
      (objeto.children[1].boundingBox[index] +
        objeto.children[1].translation[1]) *
      objeto.children[1].scale[0];
  }
};

const updateBoundingBoxAll = function () {
  updateBoundingBoxEnemies();
  updateBoundingBoxPlayer();
  updateBoundingBoxPlayerShot();

  //Atualiza a boundingBox das barreiras
  objeto.children[2].children.forEach((element) => {
    for (let index = 0; index < element.boundingBox.length; index += 2) {
      element.boundingBox[index] =
        (element.boundingBox[index] + element.translation[0]) *
        element.scale[0];
      element.boundingBox[index + 1] =
        (element.boundingBox[index] + element.translation[1]) *
        element.scale[1];
    }
  });
};

canvas.addEventListener("keydown", function (e) {
  switch (e.key) {
    case "ArrowRight":
      nodeInfosByName["player"].trs.translation[0] += 0.5;
      break;
    case "ArrowLeft":
      nodeInfosByName["player"].trs.translation[0] -= 0.5;
      break;

    default:
      break;
  }
  //shotAudio.play();
});
