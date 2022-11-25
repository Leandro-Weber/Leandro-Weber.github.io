var config = {
  rotate: 0,
  x: 0,
  y: 0,
  z: 0,
  spin_x: 0,
  spin_y: 0,
  camera_x: 4,
  camera_y: 4,
  camera_z: 10,

  triangulo: 0,

  //time: 0.0,
  targetx: 0,
  targety: 0,
  targetz: 0,
  upVectorx: 0,
  upVectory: 0,
  upVectorz: 0,
  vx: 0,
  vy: 0,
  vz: 0,
  vertice: 0,
  teste0: 5.8,
  teste1: 4.5,
  teste2: 8.1,

  scalex: 1.0,
  scaley: 1.0,
  scalez: 1.0,
  listVertices: 1,
  luzx: 5.8,
  luzy: 4.5,
  luzz: 8.1,
  shininess: 300.0,
  camera_1: true,
  camera_2: false,
  camera_3: false,
  luzIndex: 0,
  tx: 0,
  ty: 0,
  tz: 0,
  textura: "madeira",
  vertice2: 0,
  coordv: 0,
  coordu: 0,
  obj: 0,
  shotSpeed: 10,
};

var folder_vertice;
var folder_camera;
var folder_matrix;
var folder_luz;
var folder_triangulo;
var folder_coordTex;

const loadGUI = () => {
  gui = new dat.GUI();
  //folder_vertice = gui.addFolder("Manipular vertices e triangulos");
  folder_camera = gui.addFolder("Manipular cameras");
  folder_luz = gui.addFolder("Manipular luzes e texturas");
  //folder_matrix = gui.addFolder("Manipular matrizes");
  //folder_triangulo = folder_vertice.addFolder("Manipular triangulos");
  //folder_coordTex = folder_luz.addFolder("Coordenadas textura");
  //folder_matrix.open();

  // gui.add(config, "addCaixa");
  folder_camera.add(config, "camera_x", -20, 20, 0.1).onChange(function () {
    arrCameras[selectedCamera].cameraPosition = [
      config.camera_x,
      config.camera_y,
      config.camera_z,
    ];
  });
  folder_camera.add(config, "camera_y", -20, 20, 0.1).onChange(function () {
    arrCameras[selectedCamera].cameraPosition = [
      config.camera_x,
      config.camera_y,
      config.camera_z,
    ];
  });
  folder_camera.add(config, "camera_z", -20, 60, 0.1).onChange(function () {
    arrCameras[selectedCamera].cameraPosition = [
      config.camera_x,
      config.camera_y,
      config.camera_z,
    ];
  });
  folder_camera.add(config, "upVectorx", -20, 20, 0.1).onChange(function () {
    arrCameras[selectedCamera].up = [
      config.upVectorx,
      config.upVectory,
      config.upVectorz,
    ];
  });
  folder_camera.add(config, "upVectory", -20, 20, 0.1).onChange(function () {
    arrCameras[selectedCamera].up = [
      config.upVectorx,
      config.upVectory,
      config.upVectorz,
    ];
  });

  folder_camera.add(config, "upVectorz", -20, 20, 0.1).onChange(function () {
    arrCameras[selectedCamera].up = [
      config.upVectorx,
      config.upVectory,
      config.upVectorz,
    ];
  });

  folder_camera.add(config, "targetx", -10, 10, 0.01).onChange(function () {
    arrCameras[selectedCamera].target = [
      config.targetx,
      config.targety,
      config.targetz,
    ];
  });
  folder_camera.add(config, "targety", -10, 10, 0.01).onChange(function () {
    arrCameras[selectedCamera].target = [
      config.targetx,
      config.targety,
      config.targetz,
    ];
  });
  folder_camera.add(config, "targetz", -10, 10, 0.01).onChange(function () {
    arrCameras[selectedCamera].target = [
      config.targetx,
      config.targety,
      config.targetz,
    ];
  });

  folder_luz.add(config, "luzIndex", listOfLights).onChange(function () {
    config.luzx = arrLuz[config.luzIndex].position.x;
    config.luzy = arrLuz[config.luzIndex].position.y;
    config.luzz = arrLuz[config.luzIndex].position.z;
    palette.corLuz = arrLuz[config.luzIndex].color;
    palette.corSpec = arrLuz[config.luzIndex].spec;

    gui.updateDisplay();
  });
  folder_luz.add(config, "luzx", -20, 20, 0.01).onChange(function () {
    arrLuz[config.luzIndex].position.x = config.luzx;
    arrLuz[config.luzIndex].position.y = config.luzy;
    arrLuz[config.luzIndex].position.z = config.luzz;
  });
  folder_luz.add(config, "luzy", -20, 20, 0.01).onChange(function () {
    arrLuz[config.luzIndex].position.x = config.luzx;
    arrLuz[config.luzIndex].position.y = config.luzy;
    arrLuz[config.luzIndex].position.z = config.luzz;
  });
  folder_luz.add(config, "luzz", -20, 200, 0.01).onChange(function () {
    arrLuz[config.luzIndex].position.x = config.luzx;
    arrLuz[config.luzIndex].position.y = config.luzy;
    arrLuz[config.luzIndex].position.z = config.luzz;
  });
  folder_luz.add(config, "shininess", 0, 3000, 0.1);
  folder_camera
    .add(config, "camera_1")
    .listen()
    .onChange(function () {
      config.camera_2 = false;
      config.camera_3 = false;
      // config.camera_x = 4;
      // config.camera_y = 4;
      // config.camera_z = 10;
      // cameraPosition = [4, 4, 10];
      selectedCamera = 0;
      cameraMatrix = m4.lookAt(
        arrCameras[selectedCamera].cameraPosition,
        arrCameras[selectedCamera].target,
        arrCameras[selectedCamera].up
      );
      config.camera_x = arrCameras[selectedCamera].cameraPosition[0];
      config.camera_y = arrCameras[selectedCamera].cameraPosition[1];
      config.camera_z = arrCameras[selectedCamera].cameraPosition[2];
      config.upVectorx = arrCameras[selectedCamera].up[0];
      config.upVectory = arrCameras[selectedCamera].up[1];
      config.upVectorz = arrCameras[selectedCamera].up[2];
      config.targetx = arrCameras[selectedCamera].target[0];
      config.targety = arrCameras[selectedCamera].target[1];
      config.targetz = arrCameras[selectedCamera].target[2];
      gui.updateDisplay();
    });

  folder_camera
    .add(config, "camera_2")
    .listen()
    .onChange(function () {
      config.camera_1 = false;
      config.camera_3 = false;
      // config.camera_x = -20;
      // config.camera_y = 4;
      // config.camera_z = 10;
      // cameraPosition = [-20, 4, 10];
      selectedCamera = 1;
      cameraMatrix = m4.lookAt(
        arrCameras[selectedCamera].cameraPosition,
        arrCameras[selectedCamera].target,
        arrCameras[selectedCamera].up
      );
      config.camera_x = arrCameras[selectedCamera].cameraPosition[0];
      config.camera_y = arrCameras[selectedCamera].cameraPosition[1];
      config.camera_z = arrCameras[selectedCamera].cameraPosition[2];
      config.upVectorx = arrCameras[selectedCamera].up[0];
      config.upVectory = arrCameras[selectedCamera].up[1];
      config.upVectorz = arrCameras[selectedCamera].up[2];
      config.targetx = arrCameras[selectedCamera].target[0];
      config.targety = arrCameras[selectedCamera].target[1];
      config.targetz = arrCameras[selectedCamera].target[2];
      gui.updateDisplay();
    });
  folder_camera
    .add(config, "camera_3")
    .listen()
    .onChange(function () {
      config.camera_1 = false;
      config.camera_2 = false;
      // config.camera_x = 4;
      // config.camera_y = 4;
      // config.camera_z = 35;
      // cameraPosition = [4, 4, 35];
      selectedCamera = 2;
      cameraMatrix = m4.lookAt(
        arrCameras[selectedCamera].cameraPosition,
        arrCameras[selectedCamera].target,
        arrCameras[selectedCamera].up
      );
      config.camera_x = arrCameras[selectedCamera].cameraPosition[0];
      config.camera_y = arrCameras[selectedCamera].cameraPosition[1];
      config.camera_z = arrCameras[selectedCamera].cameraPosition[2];
      config.upVectorx = arrCameras[selectedCamera].up[0];
      config.upVectory = arrCameras[selectedCamera].up[1];
      config.upVectorz = arrCameras[selectedCamera].up[2];
      config.targetx = arrCameras[selectedCamera].target[0];
      config.targety = arrCameras[selectedCamera].target[1];
      config.targetz = arrCameras[selectedCamera].target[2];
      gui.updateDisplay();
    });

  folder_luz.addColor(palette, "corLuz").onChange(function () {
    arrLuz[config.luzIndex].color = palette.corLuz;
  });

  folder_luz.addColor(palette, "corSpec").onChange(function () {
    arrLuz[config.luzIndex].spec = palette.corSpec;
  });

  gui.add(config, "shotSpeed", 1, 200, 1);
};
