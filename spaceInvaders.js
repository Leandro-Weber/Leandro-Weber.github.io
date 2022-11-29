"use strict";

var teste = 1;
var gui;
var qtd_triangulos = 0;

var VAO;
var cubeBufferInfo;
var objectsToDraw = [];
var objects = [];
var nodeInfosByName = {};
var scene;
var sceneDescription = {};
var countF = 0;
var countC = 0;
var programInfo;
var canvas;
var endScene;

var arrays_pyramid;
var gl;
var aspect;
var projectionMatrix;
var cameraMatrix;
var viewMatrix;
var viewProjectionMatrix = degToRad(0);
var adjust;
var speed;
var c;
var fieldOfViewRadians;
var temp;
var listOfVertices = [];
var listOfLights = [0, 1, 2];
var palette = {
  corLuz: [255, 255, 255], // RGB array
  corCubo: [255, 255, 255], // RGB array
  corSpec: [255, 255, 255], // RGB array
  corAmbiente: [155, 155, 155], // RGB array
};
var tex;
//var listTex = ["nitro", "isopor", "madeira", "areia", "tri", "d4"];
var selectedCamera = 0;
var deltaTime = 0;
var then = 0;
var selectedObject = 0;
var listOfObjects = [0];
var index = 1;
var shotPosition = 0;
var enemyShotPosition = 0;
var enemiesList = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
];
var bbPadrao = [-1, -1, 1, -1, 1, 1, -1, 1];
var movementStep;
var sumStep = true;
var enemiesKilled = 0;
var elapsedTime = 0;
var startGame = false;
var shotExists = false;
var spawnNewShot = false;
var enemyShotExists = false;
var spawnNewEnemyShot = false;
var chanceOfFire;
var theChosenOne;
var firstPerson = false;
var continueGame = true;
var jumps = 0;
var enemiesTextureList = [
  "alien0",
  "alien1",
  "alien2",
  "leandro",
  "toto",
  "totoBlack",
];
var playerTextureList = ["ship", "ship2"];

var arrLuz = [
  new Luz([4, 0, 0], [0, 0, 0], [0, 0, 0], 300),
  new Luz([-4, 0, 0], [0, 0, 0], [0, 0, 0], 300),
  new Luz([5, 4, 8], [255, 255, 255], [155, 155, 155], 300),
];
var ambiente = [155, 155, 155];
let arrCameras = [
  new Camera([8, 8, 30], [8, 0, 0], [0, 1, 0]),
  new Camera([3, 4, 20], [3.5, -3.5, 0.5], [0, 1, 0]),
  new Camera([5, 4, 8], [2, 5, 0], [0, 1, 0]),
];

//CAMERA VARIABLES
var cameraPosition;
var target;
var up;

//AUDIO
let shotAudio = new Audio("http://127.0.0.1:5500/audio/shot.wav");
shotAudio.volume = 0.02;
let killAudio = new Audio("http://127.0.0.1:5500/audio/kill.wav");
killAudio.volume = 0.02;
//shotAudio.play();

function makeNode(nodeDescription) {
  var trs = new TRS();
  var node = new Node(trs);
  nodeInfosByName[nodeDescription.name] = {
    trs: trs,
    node: node,
    format: nodeDescription.format,
  };
  // console.log(nodeDescription.name + nodeDescription.rotation);
  trs.translation = nodeDescription.translation || trs.translation;
  trs.rotation = nodeDescription.rotation || trs.rotation;
  trs.scale = nodeDescription.scale || trs.scale;
  if (nodeDescription.draw !== false) {
    const bufferInfo = twgl.createBufferInfoFromArrays(
      gl,
      nodeDescription.format
    );

    const vertexArray = twgl.createVAOFromBufferInfo(
      gl,
      programInfo,
      bufferInfo
    );
    node.drawInfo = {
      uniforms: {
        u_color: [0.4, 0.4, 0.4, 1],
        u_texture: nodeDescription.texture,
      },
      format: nodeDescription.format,
      programInfo: programInfo,
      bufferInfo: bufferInfo,
      vertexArray: vertexArray,
      boundingBox: nodeDescription.boundingBox,
    };

    objectsToDraw.push(node.drawInfo);
    objects.push(node);
  }
  makeNodes(nodeDescription.children).forEach(function (child) {
    child.setParent(node);
  });
  return node;
}

function makeNodes(nodeDescriptions) {
  return nodeDescriptions ? nodeDescriptions.map(makeNode) : [];
}
function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  canvas = document.querySelector("#canvas");
  gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }

  tex = twgl.createTextures(gl, {
    raio: {
      src: "http://127.0.0.1:5500/texture/raio.jpg",
    },
    alien0: {
      src: "http://127.0.0.1:5500/texture/alien0.png",
    },
    alien1: {
      src: "http://127.0.0.1:5500/texture/alien1.jpg",
    },
    alien2: {
      src: "http://127.0.0.1:5500/texture/alien3.png",
    },
    ship: {
      src: "http://127.0.0.1:5500/texture/ship.png",
    },
    ship2: {
      src: "http://127.0.0.1:5500/texture/ship2.png",
    },
    asteroid: {
      src: "http://127.0.0.1:5500/texture/asteroid.jpg",
    },
    raioVermelho: {
      src: "http://127.0.0.1:5500/texture/raioVermelho.jpg",
    },
    toto: {
      src: "http://127.0.0.1:5500/texture/toto.png",
    },
    totoBlack: {
      src: "http://127.0.0.1:5500/texture/totoBlack.png",
    },
    leandro: {
      src: "http://127.0.0.1:5500/texture/leandro.png",
    },
    valeu: {
      src: "http://127.0.0.1:5500/texture/valeu.png",
    },
  });
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);

  twgl.setAttributePrefix("a_");

  arrays_pyramid = arrays_cube6;

  arrays_pyramid.normal = calculateNormal(
    arrays_pyramid.position,
    arrays_pyramid.indices
  );

  cubeBufferInfo = twgl.createBufferInfoFromArrays(gl, arrays_pyramid);

  programInfo = twgl.createProgramInfo(gl, [vs3luz, fs3luz]);

  VAO = twgl.createVAOFromBufferInfo(gl, programInfo, cubeBufferInfo);

  listOfVertices = arrays_pyramid.indices;

  function degToRad(d) {
    return (d * Math.PI) / 180;
  }

  fieldOfViewRadians = degToRad(60);

  objectsToDraw = [];
  objects = [];
  nodeInfosByName = {};
  const arrayCube = createArray("cube");
  //console.log(arrayCube);
  // Let's make all the nodes
  endScene = {
    name: "valeu",
    draw: true,
    type: "cube",
    translation: [5, 0, 0],
    rotation: [degToRad(0), degToRad(0), degToRad(0)],
    scale: [8, 8, 1],
    texture: tex.valeu,
    format: arrayCube,
    boundingBox: [-1, -1, 1, -1, 1, 1, -1, 1],

    children: [],
  };
  sceneDescription = {
    name: "Center of the world",
    draw: false,
    children: [
      {
        name: "enemies",
        draw: false,
        type: "cube",
        translation: [0, 0, 0],
        rotation: [degToRad(0), degToRad(0), degToRad(0)],
        texture: tex.alien0,
        format: arrayCube,

        children: [
          {
            name: "enemy0",
            draw: true,
            type: "cube",
            translation: [0, 10, 0],
            rotation: [degToRad(0), degToRad(0), degToRad(0)],
            texture: tex.alien2,
            format: arrayCube,
            boundingBox: [-1, -1, 1, -1, 1, 1, -1, 1],

            children: [],
          },
          {
            name: "enemy1",
            draw: true,
            type: "cube",
            translation: [3, 10, 0],
            rotation: [degToRad(0), degToRad(0), degToRad(0)],
            texture: tex.alien2,
            format: arrayCube,
            boundingBox: [-1, -1, 1, -1, 1, 1, -1, 1],

            children: [],
          },
          {
            name: "enemy2",
            draw: true,
            type: "cube",
            translation: [6, 10, 0],
            rotation: [degToRad(0), degToRad(0), degToRad(0)],
            texture: tex.alien2,
            format: arrayCube,
            boundingBox: [-1, -1, 1, -1, 1, 1, -1, 1],

            children: [],
          },
          {
            name: "enemy3",
            draw: true,
            type: "cube",
            translation: [9, 10, 0],
            rotation: [degToRad(0), degToRad(0), degToRad(0)],
            texture: tex.alien2,
            format: arrayCube,
            boundingBox: [-1, -1, 1, -1, 1, 1, -1, 1],

            children: [],
          },
          {
            name: "enemy4",
            draw: true,
            type: "cube",
            translation: [12, 10, 0],
            rotation: [degToRad(0), degToRad(0), degToRad(0)],
            texture: tex.alien2,
            format: arrayCube,
            boundingBox: [-1, -1, 1, -1, 1, 1, -1, 1],

            children: [],
          },
          {
            name: "enemy5",
            draw: true,
            type: "cube",
            translation: [15, 10, 0],
            rotation: [degToRad(0), degToRad(0), degToRad(0)],
            texture: tex.alien2,
            format: arrayCube,
            boundingBox: [-1, -1, 1, -1, 1, 1, -1, 1],

            children: [],
          },
          {
            name: "enemy6",
            draw: true,
            type: "cube",
            translation: [0, 12.5, 0],
            rotation: [degToRad(0), degToRad(0), degToRad(0)],
            texture: tex.alien2,
            format: arrayCube,
            boundingBox: [-1, -1, 1, -1, 1, 1, -1, 1],

            children: [],
          },
          {
            name: "enemy7",
            draw: true,
            type: "cube",
            translation: [3, 12.5, 0],
            rotation: [degToRad(0), degToRad(0), degToRad(0)],
            texture: tex.alien2,
            format: arrayCube,
            boundingBox: [-1, -1, 1, -1, 1, 1, -1, 1],

            children: [],
          },
          {
            name: "enemy8",
            draw: true,
            type: "cube",
            translation: [6, 12.5, 0],
            rotation: [degToRad(0), degToRad(0), degToRad(0)],
            texture: tex.alien2,
            format: arrayCube,
            boundingBox: [-1, -1, 1, -1, 1, 1, -1, 1],

            children: [],
          },
          {
            name: "enemy9",
            draw: true,
            type: "cube",
            translation: [9, 12.5, 0],
            rotation: [degToRad(0), degToRad(0), degToRad(0)],
            texture: tex.alien2,
            format: arrayCube,
            boundingBox: [-1, -1, 1, -1, 1, 1, -1, 1],

            children: [],
          },
          {
            name: "enemy10",
            draw: true,
            type: "cube",
            translation: [12, 12.5, 0],
            rotation: [degToRad(0), degToRad(0), degToRad(0)],
            texture: tex.alien2,
            format: arrayCube,
            boundingBox: [-1, -1, 1, -1, 1, 1, -1, 1],

            children: [],
          },
          {
            name: "enemy11",
            draw: true,
            type: "cube",
            translation: [15, 12.5, 0],
            rotation: [degToRad(0), degToRad(0), degToRad(0)],
            texture: tex.alien2,
            format: arrayCube,
            boundingBox: [-1, -1, 1, -1, 1, 1, -1, 1],

            children: [],
          },
        ],
      },
      {
        name: "shot",
        draw: false,
        type: "cube",
        translation: [0, -10, 0],
        rotation: [degToRad(0), degToRad(0), degToRad(0)],
        scale: [0.2, 0.4, 0.2],
        texture: tex.raioVermelho,
        format: arrayCube,
        boundingBox: [-1, -1, 1, -1, 1, 1, -1, 1],

        children: [],
      },
      {
        name: "barrier",
        draw: false,
        type: "cube",
        translation: [0, 0, 0],
        rotation: [degToRad(0), degToRad(0), degToRad(0)],

        texture: tex.madeira,
        format: arrayCube,

        children: [
          {
            name: "barrier0",
            draw: true,
            type: "cube",
            translation: [0, -5, 0],
            rotation: [degToRad(0), degToRad(0), degToRad(0)],
            scale: [1, 0.7, 0.5],
            texture: tex.asteroid,
            format: arrayCube,
            boundingBox: [-1, -1, 1, -1, 1, 1, -1, 1],
            children: [],
          },
          {
            name: "barrier1",
            draw: true,
            type: "cube",
            translation: [6, -5, 0],
            rotation: [degToRad(0), degToRad(0), degToRad(0)],
            scale: [1, 0.7, 0.5],
            texture: tex.asteroid,
            format: arrayCube,
            boundingBox: [-1, -1, 1, -1, 1, 1, -1, 1],
            children: [],
          },
          {
            name: "barrier2",
            draw: true,
            type: "cube",
            translation: [12, -5, 0],
            rotation: [degToRad(0), degToRad(0), degToRad(0)],
            scale: [1, 0.7, 0.5],
            texture: tex.asteroid,
            format: arrayCube,
            boundingBox: [-1, -1, 1, -1, 1, 1, -1, 1],
            children: [],
          },
        ],
      },
      {
        name: "player",
        draw: true,
        type: "cube",
        translation: [0, -10, 0],
        rotation: [degToRad(0), degToRad(0), degToRad(0)],
        texture: tex.ship2,
        format: arrayCube,
        boundingBox: [-1, -1, 1, -1, 1, 1, -1, 1],

        children: [],
      },
      {
        name: "enemyShot",
        draw: false,
        type: "cube",
        translation: [0, 0, 0],
        rotation: [degToRad(0), degToRad(0), degToRad(0)],
        scale: [0.2, 0.4, 0.2],
        texture: tex.raio,
        format: arrayCube,
        boundingBox: [-1, -1, 1, -1, 1, 1, -1, 1],

        children: [],
      },
      {
        name: "leandro",
        draw: true,
        type: "cube",
        translation: [-100, -100, 2],
        rotation: [degToRad(0), degToRad(0), degToRad(0)],
        scale: [0.2, 0.4, 0.2],
        texture: tex.leandro,
        format: arrayCube,
        boundingBox: [-1, -1, 1, -1, 1, 1, -1, 1],

        children: [],
      },
    ],
  };
  //console.log(sceneDescription);
  scene = makeNode(sceneDescription);
  //console.log(objectsToDraw);
  //console.log(nodeInfosByName);

  objects.forEach(function (object) {
    object.drawInfo.uniforms.u_lightWorldPosition0 = [
      arrLuz[0].position.x,
      arrLuz[0].position.y,
      arrLuz[0].position.z,
    ];
    object.drawInfo.uniforms.u_lightWorldPosition1 = [
      arrLuz[1].position.x,
      arrLuz[1].position.y,
      arrLuz[1].position.z,
    ];
    object.drawInfo.uniforms.u_lightWorldPosition2 = [
      arrLuz[2].position.x,
      arrLuz[2].position.y,
      arrLuz[2].position.z,
    ];

    object.drawInfo.uniforms.u_lightColor0 = [
      convertToZeroOne(arrLuz[0].color[0], 0, 255),
      convertToZeroOne(arrLuz[0].color[1], 0, 255),
      convertToZeroOne(arrLuz[0].color[2], 0, 255),
    ];
    object.drawInfo.uniforms.u_lightColor1 = [
      convertToZeroOne(arrLuz[1].color[0], 0, 255),
      convertToZeroOne(arrLuz[1].color[1], 0, 255),
      convertToZeroOne(arrLuz[1].color[2], 0, 255),
    ];
    object.drawInfo.uniforms.u_lightColor2 = [
      convertToZeroOne(arrLuz[2].color[0], 0, 255),
      convertToZeroOne(arrLuz[2].color[1], 0, 255),
      convertToZeroOne(arrLuz[2].color[2], 0, 255),
    ];

    object.drawInfo.uniforms.u_specularColor0 = [
      convertToZeroOne(arrLuz[0].spec[0], 0, 255),
      convertToZeroOne(arrLuz[0].spec[1], 0, 255),
      convertToZeroOne(arrLuz[0].spec[2], 0, 255),
    ];
    object.drawInfo.uniforms.u_specularColor1 = [
      convertToZeroOne(arrLuz[1].spec[0], 0, 255),
      convertToZeroOne(arrLuz[1].spec[1], 0, 255),
      convertToZeroOne(arrLuz[1].spec[2], 0, 255),
    ];
    object.drawInfo.uniforms.u_specularColor2 = [
      convertToZeroOne(arrLuz[2].spec[0], 0, 255),
      convertToZeroOne(arrLuz[2].spec[1], 0, 255),
      convertToZeroOne(arrLuz[2].spec[2], 0, 255),
    ];
    object.drawInfo.uniforms.u_ambient = [
      convertToZeroOne(ambiente[0], 0, 255),
      convertToZeroOne(ambiente[1], 0, 255),
      convertToZeroOne(ambiente[2], 0, 255),
    ];
  });
  //temp = mapAllVertices(arrays_pyramid.position, arrays_pyramid.indices);
  //console.log(mapAllVertices(arrays_pyramid.position, arrays_pyramid.indices));
  //cameraPosition = [4, 4, 10];
  cameraPosition = arrCameras[0].cameraPosition;
  config.camera_x = arrCameras[0].cameraPosition[0];
  config.camera_y = arrCameras[0].cameraPosition[1];
  config.camera_z = arrCameras[0].cameraPosition[2];
  config.targetx = arrCameras[0].target[0];
  config.targety = arrCameras[0].target[1];
  config.targetz = arrCameras[0].target[2];

  const temp = arrays_pyramid.position.slice(
    config.vertice * 3,
    config.vertice * 3 + 3
  );

  config.vx = temp[0];
  config.vy = temp[1];
  config.vz = temp[2];

  updateBoundingBoxAll();
  alert(
    `Use "a", "d", "ArrowLeft" or "ArrowRight" to move and "w" or "SpaceBar" to shoot.`
  );

  requestAnimationFrame(drawScene);
  // console.log(objectsToDraw);
  console.log(sceneDescription.children);
  // console.log(nodeInfosByName["barrier0"].node.drawInfo.boundingBox);

  // Draw the scene.
  //updateObjects();
}

//-----------------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------------------------

function drawScene(now) {
  if (enemiesKilled >= 12) {
    alert("You win!");
    continueGame = false;
  }
  if (jumps >= 13) {
    alert("You lost!");
    continueGame = false;
  }

  if (!spawnNewEnemyShot) chanceOfFire = Math.random();
  else chanceOfFire = 0;

  if (spawnNewShot && !shotExists) {
    spawnShot();
    spawnNewShot = false;
  }

  if (chanceOfFire > 0.98) {
    spawnNewEnemyShot = true;
  }

  if (!enemyShotExists && spawnNewEnemyShot) {
    theChosenOne = Math.floor(Math.random() * enemiesList.length);
    //console.log(`the chosen: ${theChosenOne}`);
    spawnEnemyShot(enemiesList[theChosenOne]);

    //console.log(`lista : ${enemiesList}`);
  }
  now *= 0.001;
  deltaTime = now - then;
  elapsedTime += deltaTime;
  then = now;
  if (deltaTime > 1) {
    deltaTime = 0.2;
  }
  //console.log(shotPosition);
  twgl.resizeCanvasToDisplaySize(gl.canvas);

  listOfVertices = arrays_pyramid.indices;

  if (gui == null) loadGUI(gl);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);

  // Compute the projection matrix
  var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, 1, 200);

  // Compute the camera's matrix using look at.
  //target = [config.targetx, config.targety, config.targetz];
  //up = [0, 1, 0];
  // arrCameras[selectedCamera].cameraPosition = [
  //   nodeInfosByName[`player`].trs.translation,
  // ];
  if (firstPerson) {
    cameraMatrix = m4.lookAt(
      [
        nodeInfosByName["player"].trs.translation[0],
        nodeInfosByName["player"].trs.translation[1] - 2,
        2,
      ],
      [nodeInfosByName["player"].trs.translation[0], 0, 0],
      [0, 1, 0]
    );
  } else {
    cameraMatrix = m4.lookAt(
      arrCameras[selectedCamera].cameraPosition,
      arrCameras[selectedCamera].target,
      arrCameras[selectedCamera].up
    );
  }
  // Make a view matrix from the camera matrix.
  viewMatrix = m4.inverse(cameraMatrix);

  viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

  //computeMatrix(nodeInfosByName[`${selectedObject}`], config);
  //nodeInfosByName["player"].trs.translation = [config.x, config.y, config.z];
  if (nodeInfosByName["enemies"].trs.translation[0] > 2) sumStep = false;

  if (nodeInfosByName["enemies"].trs.translation[0] < 0) sumStep = true;

  if (sumStep) nodeInfosByName["enemies"].trs.translation[0] += deltaTime;
  else nodeInfosByName["enemies"].trs.translation[0] -= deltaTime;

  if (elapsedTime >= 5) {
    nodeInfosByName["enemies"].trs.translation[1] -= 1;
    jumps++;
    //console.log(jumps);
    //continueGame = false;
    elapsedTime = 0;
  }

  updateBoundingBoxEnemies();

  if (shotExists) {
    shotPosition += deltaTime * config.shotSpeed;
    if (shotPosition > 25) {
      shotPosition = 0;
      //resetShot(nodeInfosByName["player"], nodeInfosByName["shot"]);
      removeShot();
    }

    // Move o tiro
    if (shotExists) {
      computeMatrixShot(nodeInfosByName[`shot`], [
        nodeInfosByName[`shot`].trs.translation[0],
        nodeInfosByName[`player`].trs.translation[1] + shotPosition,
        nodeInfosByName[`shot`].trs.translation[2],
      ]);
      updateBoundingBoxPlayerShot();

      // Testa as colisões
      computeMatrixBarrier(
        nodeInfosByName[`barrier0`].node.drawInfo.boundingBox,
        nodeInfosByName[`shot`].node.drawInfo.boundingBox
      );
      if (shotExists)
        computeMatrixBarrier(
          nodeInfosByName[`barrier1`].node.drawInfo.boundingBox,
          nodeInfosByName[`shot`].node.drawInfo.boundingBox
        );

      if (shotExists)
        computeMatrixBarrier(
          nodeInfosByName[`barrier2`].node.drawInfo.boundingBox,
          nodeInfosByName[`shot`].node.drawInfo.boundingBox
        );

      if (shotExists)
        computeMatrixEnemy(
          nodeInfosByName,
          nodeInfosByName[`shot`].node.drawInfo.boundingBox
        );
    }
  }

  if (enemyShotExists) {
    enemyShotPosition -= deltaTime * config.shotSpeed;
    if (enemyShotPosition < -25) {
      enemyShotPosition = 0;
      // resetShot(nodeInfosByName["enemy0"], nodeInfosByName["enemyShot"]);
      removeEnemyShot();
    }

    if (enemyShotExists) {
      computeMatrixShot(nodeInfosByName[`enemyShot`], [
        nodeInfosByName[`enemyShot`].trs.translation[0],
        nodeInfosByName[`enemy${theChosenOne}`].trs.translation[1] +
          nodeInfosByName["enemies"].trs.translation[1] +
          enemyShotPosition,
        0,
      ]);

      updateBoundingBoxEnemyShot();
      updateBoundingBoxPlayer();

      // Testa as colisões
      computeMatrixBarrierEnemy(
        nodeInfosByName[`barrier0`].node.drawInfo.boundingBox,
        nodeInfosByName[`enemyShot`].node.drawInfo.boundingBox
      );

      if (enemyShotExists)
        computeMatrixBarrierEnemy(
          nodeInfosByName[`barrier1`].node.drawInfo.boundingBox,
          nodeInfosByName[`enemyShot`].node.drawInfo.boundingBox
        );

      if (enemyShotExists)
        computeMatrixBarrierEnemy(
          nodeInfosByName[`barrier2`].node.drawInfo.boundingBox,
          nodeInfosByName[`enemyShot`].node.drawInfo.boundingBox
        );

      if (enemyShotExists)
        computeMatrixEnemykill(
          nodeInfosByName[`player`].node.drawInfo.boundingBox,
          nodeInfosByName[`enemyShot`].node.drawInfo.boundingBox
        );
    }
  }
  // console.log(nodeInfosByName[`${selectedObject}`]);
  //console.log(sceneDescription);
  // Update all world matrices in the scene graph
  scene.updateWorldMatrix();

  // Compute all the matrices for rendering
  objects.forEach(function (object) {
    object.drawInfo.uniforms.u_matrix = m4.multiply(
      viewProjectionMatrix,
      object.worldMatrix
    );
    object.drawInfo.uniforms.u_lightWorldPosition0 = [
      // arrLuz[0].position.x,
      // arrLuz[0].position.y,
      // arrLuz[0].position.z,
      nodeInfosByName[`shot`].trs.translation[0],
      nodeInfosByName[`shot`].trs.translation[1],
      2,
    ];
    object.drawInfo.uniforms.u_lightWorldPosition1 = [
      nodeInfosByName[`enemyShot`].trs.translation[0],
      nodeInfosByName[`enemyShot`].trs.translation[1],
      2,
    ];
    // object.drawInfo.uniforms.u_lightWorldPosition2 = [
    //   arrLuz[2].position.x,
    //   arrLuz[2].position.y,
    //   arrLuz[2].position.z,
    // ];

    object.drawInfo.uniforms.u_lightColor0 = [
      convertToZeroOne(arrLuz[0].color[0], 0, 255),
      convertToZeroOne(arrLuz[0].color[1], 0, 255),
      convertToZeroOne(arrLuz[0].color[2], 0, 255),
    ];
    object.drawInfo.uniforms.u_lightColor1 = [
      convertToZeroOne(arrLuz[1].color[0], 0, 255),
      convertToZeroOne(arrLuz[1].color[1], 0, 255),
      convertToZeroOne(arrLuz[1].color[2], 0, 255),
    ];
    // object.drawInfo.uniforms.u_lightColor2 = [
    //   convertToZeroOne(arrLuz[2].color[0], 0, 255),
    //   convertToZeroOne(arrLuz[2].color[1], 0, 255),
    //   convertToZeroOne(arrLuz[2].color[2], 0, 255),
    // ];
    // console.log(object.drawInfo.uniforms.u_lightColor);
    // console.log(object.drawInfo.uniforms.u_color);
    object.drawInfo.uniforms.u_specularColor0 = [
      convertToZeroOne(arrLuz[0].spec[0], 0, 255),
      convertToZeroOne(arrLuz[0].spec[1], 0, 255),
      convertToZeroOne(arrLuz[0].spec[2], 0, 255),
    ];
    object.drawInfo.uniforms.u_specularColor1 = [
      convertToZeroOne(arrLuz[1].spec[0], 0, 255),
      convertToZeroOne(arrLuz[1].spec[1], 0, 255),
      convertToZeroOne(arrLuz[1].spec[2], 0, 255),
    ];
    // object.drawInfo.uniforms.u_specularColor2 = [
    //   convertToZeroOne(arrLuz[2].spec[0], 0, 255),
    //   convertToZeroOne(arrLuz[2].spec[1], 0, 255),
    //   convertToZeroOne(arrLuz[2].spec[2], 0, 255),
    // ];
    object.drawInfo.uniforms.u_ambient = [
      convertToZeroOne(ambiente[0], 0, 255),
      convertToZeroOne(ambiente[1], 0, 255),
      convertToZeroOne(ambiente[2], 0, 255),
    ];

    object.drawInfo.uniforms.u_world = object.worldMatrix;

    object.drawInfo.uniforms.u_worldInverseTranspose = m4.transpose(
      m4.inverse(object.worldMatrix)
    );

    object.drawInfo.uniforms.u_viewWorldPosition = cameraPosition;

    object.drawInfo.uniforms.u_shininess = config.shininess;
  });

  // ------ Draw the objects --------

  twgl.drawObjectList(gl, objectsToDraw);
  if (continueGame) requestAnimationFrame(drawScene);
  else {
    objectsToDraw = [];
    objects = [];
    nodeInfosByName = {};
    scene = makeNode(endScene);
    requestAnimationFrame(drawEndScene);
  }
}

function drawEndScene(now) {
  var soma = true;
  now *= 0.001;
  deltaTime = now - then;

  then = now;

  elapsedTime += deltaTime * 30;

  //console.log(shotPosition);
  twgl.resizeCanvasToDisplaySize(gl.canvas);

  listOfVertices = arrays_pyramid.indices;

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);

  // Compute the projection matrix
  var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, 1, 200);

  // Compute the camera's matrix using look at.
  //target = [config.targetx, config.targety, config.targetz];
  //up = [0, 1, 0];
  // arrCameras[selectedCamera].cameraPosition = [
  //   nodeInfosByName[`player`].trs.translation,
  // ];

  cameraMatrix = m4.lookAt(
    arrCameras[selectedCamera].cameraPosition,
    arrCameras[selectedCamera].target,
    arrCameras[selectedCamera].up
  );

  // Make a view matrix from the camera matrix.
  viewMatrix = m4.inverse(cameraMatrix);

  viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

  nodeInfosByName["valeu"].trs.rotation = [0, degToRad(now * 10), 0];

  scene.updateWorldMatrix();

  // Compute all the matrices for rendering
  objects.forEach(function (object) {
    object.drawInfo.uniforms.u_matrix = m4.multiply(
      viewProjectionMatrix,
      object.worldMatrix
    );
    object.drawInfo.uniforms.u_lightWorldPosition0 = [
      // arrLuz[0].position.x,
      // arrLuz[0].position.y,
      // arrLuz[0].position.z,
      5, 5, 10,
    ];
    object.drawInfo.uniforms.u_lightWorldPosition1 = [-5, -5, 10];

    object.drawInfo.uniforms.u_lightColor0 = [1, 1, 1];
    object.drawInfo.uniforms.u_lightColor1 = [0, 0, 0];

    object.drawInfo.uniforms.u_specularColor0 = [1, 0, 0];
    object.drawInfo.uniforms.u_specularColor1 = [
      convertToZeroOne(arrLuz[1].spec[0], 0, 255),
      convertToZeroOne(arrLuz[1].spec[1], 0, 255),
      convertToZeroOne(arrLuz[1].spec[2], 0, 255),
    ];

    object.drawInfo.uniforms.u_ambient = [
      convertToZeroOne(ambiente[0], 0, 255),
      convertToZeroOne(ambiente[1], 0, 255),
      convertToZeroOne(ambiente[2], 0, 255),
    ];

    object.drawInfo.uniforms.u_world = object.worldMatrix;

    object.drawInfo.uniforms.u_worldInverseTranspose = m4.transpose(
      m4.inverse(object.worldMatrix)
    );

    object.drawInfo.uniforms.u_viewWorldPosition = cameraPosition;

    object.drawInfo.uniforms.u_shininess = config.shininess;
  });

  // ------ Draw the objects --------

  twgl.drawObjectList(gl, objectsToDraw);

  requestAnimationFrame(drawEndScene);
}

main();
