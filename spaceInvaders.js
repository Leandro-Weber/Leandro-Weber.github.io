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
var objeto = {};
var countF = 0;
var countC = 0;
var programInfo;
var wireframe = false;
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
};
var tex;
var listTex = ["nitro", "isopor", "madeira", "areia", "tri", "d4"];
var selectedCamera = 0;
var deltaTime = 0;
var then = 0;
var selectedObject = 0;
var listOfObjects = [0];
var index = 1;
var shotPosition = 0;
var enemiesList = ["0", "1", "2", "3"];

var arrLuz = [
  new Luz([4, 0, 0], [255, 255, 255], [255, 255, 255], 300),
  new Luz([-4, 0, 0], [255, 255, 255], [255, 255, 255], 300),
  new Luz([5, 4, 8], [255, 255, 255], [155, 155, 155], 300),
];
let arrCameras = [
  new Camera([0, 0, 30], [0, 1, 0], [0, 1, 0]),
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
  var canvas = document.querySelector("#canvas");
  gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }

  tex = twgl.createTextures(gl, {
    nitro: {
      src: "http://127.0.0.1:5500/texture/nitro.png",
    },
    areia: {
      src: "http://127.0.0.1:5500/texture/areia.jpg",
    },
    isopor: {
      src: "http://127.0.0.1:5500/texture/isopor.jpg  ",
    },
    madeira: {
      src: "http://127.0.0.1:5500/texture/madeira.jpg",
    },
    tri: {
      src: "http://127.0.0.1:5500/texture/tri.jpg",
    },
    d4: {
      src: "http://127.0.0.1:5500/texture/d4.jpg",
    },
    raio: {
      src: "http://127.0.0.1:5500/texture/raio.jpg",
    },
    alien0: {
      src: "http://127.0.0.1:5500/texture/alien0.png",
    },
    alien1: {
      src: "http://127.0.0.1:5500/texture/alien1.jpg",
    },
    ship: {
      src: "http://127.0.0.1:5500/texture/ship.png",
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
  console.log(arrayCube);
  // Let's make all the nodes
  objeto = {
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
            texture: tex.alien0,
            format: arrayCube,
            boundingBox: [-1, -1, 1, -1, 1, 1, -1, 1],

            children: [],
          },
          {
            name: "enemy1",
            draw: true,
            type: "cube",
            translation: [4, 10, 0],
            rotation: [degToRad(0), degToRad(0), degToRad(0)],
            texture: tex.alien0,
            format: arrayCube,
            boundingBox: [-1, -1, 1, -1, 1, 1, -1, 1],

            children: [],
          },
          {
            name: "enemy2",
            draw: true,
            type: "cube",
            translation: [8, 10, 0],
            rotation: [degToRad(0), degToRad(0), degToRad(0)],
            texture: tex.alien0,
            format: arrayCube,
            boundingBox: [-1, -1, 1, -1, 1, 1, -1, 1],

            children: [],
          },
          {
            name: "enemy3",
            draw: true,
            type: "cube",
            translation: [12, 10, 0],
            rotation: [degToRad(0), degToRad(0), degToRad(0)],
            texture: tex.alien0,
            format: arrayCube,
            boundingBox: [-1, -1, 1, -1, 1, 1, -1, 1],

            children: [],
          },
        ],
      },
      {
        name: "shot",
        draw: true,
        type: "cube",
        translation: [0, -10, 0],
        rotation: [degToRad(0), degToRad(0), degToRad(0)],
        scale: [0.2, 0.4, 0.2],
        texture: tex.raio,
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
            translation: [0, 0, 0],
            rotation: [degToRad(0), degToRad(0), degToRad(0)],
            scale: [1, 0.25, 0.5],
            texture: tex.madeira,
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
        texture: tex.ship,
        format: arrayCube,
        boundingBox: [-1, -1, 1, -1, 1, 1, -1, 1],

        children: [],
      },
    ],
  };
  //console.log(objeto);
  scene = makeNode(objeto);
  //console.log(objectsToDraw);
  console.log(nodeInfosByName);

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

  requestAnimationFrame(drawScene);
  console.log(objectsToDraw);
  // Draw the scene.
  //updateObjects();
  updateBoundingBoxAll();
}
function drawScene(now) {
  now *= 0.001;
  deltaTime = now - then;
  then = now;
  shotPosition += deltaTime * config.shotSpeed;
  if (shotPosition > 25) {
    shotPosition = 0;
    resetShot(nodeInfosByName["player"], nodeInfosByName["shot"]);
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
  cameraMatrix = m4.lookAt(
    arrCameras[selectedCamera].cameraPosition,
    arrCameras[selectedCamera].target,
    arrCameras[selectedCamera].up
  );

  // Make a view matrix from the camera matrix.
  viewMatrix = m4.inverse(cameraMatrix);

  viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

  //computeMatrix(nodeInfosByName[`${selectedObject}`], config);
  //nodeInfosByName["player"].trs.translation = [config.x, config.y, config.z];
  computeMatrixShot(nodeInfosByName[`shot`], [
    nodeInfosByName[`shot`].trs.translation[0],
    nodeInfosByName[`player`].trs.translation[1] + shotPosition,
    nodeInfosByName[`shot`].trs.translation[2],
  ]);
  updateBoundingBoxPlayerShot();

  computeMatrixBarrier(
    nodeInfosByName[`barrier0`].node.drawInfo.boundingBox,
    nodeInfosByName[`shot`].node.drawInfo.boundingBox
  );
  computeMatrixEnemy(
    nodeInfosByName,
    nodeInfosByName[`shot`].node.drawInfo.boundingBox
  );

  // console.log(nodeInfosByName[`${selectedObject}`]);
  //console.log(objeto);
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
    object.drawInfo.uniforms.u_specularColor2 = [
      convertToZeroOne(arrLuz[2].spec[0], 0, 255),
      convertToZeroOne(arrLuz[2].spec[1], 0, 255),
      convertToZeroOne(arrLuz[2].spec[2], 0, 255),
    ];

    object.drawInfo.uniforms.u_world = object.worldMatrix;

    object.drawInfo.uniforms.u_worldInverseTranspose = m4.transpose(
      m4.inverse(object.worldMatrix)
    );

    object.drawInfo.uniforms.u_viewWorldPosition = cameraPosition;

    object.drawInfo.uniforms.u_shininess = config.shininess;

    //object.drawInfo.uniforms.u_texture = tex[config.textura];
  });

  // ------ Draw the objects --------

  twgl.drawObjectList(gl, objectsToDraw);

  requestAnimationFrame(drawScene);
}

main();
