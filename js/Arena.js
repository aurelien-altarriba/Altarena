/*
---------- OBJETS ----------
// PLAN
BABYLON.Mesh.CreateGround(name, width, depth, subdivision, scene)

// CUBE
(simplifié) : BABYLON.Mesh.CreateBox(name, size, scene)
(complète)  : BABYLON.Mesh.CreateBox(name, size, scene, updatable, orientation)

// SPHERE
(simplifié) : BABYLON.Mesh.CreateSphere(name, segments, size, scene)
(complète)  : BABYLON.Mesh.CreateSphere(name, segments, size, scene, updatable, orientation)

// CYLINDRE
(simplifié) : BABYLON.Mesh.CreateCylinder(name, height, diamTop, diamBottom, tesselation, subdivision, scene)
(complète)  : BABYLON.Mesh.CreateCylinder(name, height, diamTop, diamBottom, tesselation, subdivision, scene, updatable, orientation)

*/

Arena = function(game) {
  // Appel des variables nécéssaires
  this.game = game
  let scene = game.scene

  // Création de notre lumière principale
  let light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene)

  // Material pour le sol
  let materialGround = new BABYLON.StandardMaterial("wallTexture", scene)
  materialGround.diffuseTexture = new BABYLON.Texture("assets/images/brick.jpg", scene)
  materialGround.diffuseTexture.uScale = 4.0
  materialGround.diffuseTexture.vScale = 4.0

  // Material pour les objets
  let materialWall = new BABYLON.StandardMaterial("groundTexture", scene)
  materialWall.diffuseTexture = new BABYLON.Texture("assets/images/wood.jpg", scene)

  // Création du sol
  let ground = BABYLON.Mesh.CreateGround("ground1", 20, 20, 2, scene)
  ground.scaling = new BABYLON.Vector3(2,10,3)
  ground.scaling.z = 2
  ground.material = materialGround

  // SUR TOUS LES AXES Y -> On monte les meshes de la moitié de la hauteur du mesh en question.
  let mainBox = BABYLON.Mesh.CreateBox("box1", 3, scene)
  mainBox.scaling.y = 1
  mainBox.position = new BABYLON.Vector3(5,((3/2)*mainBox.scaling.y),5)
  mainBox.rotation.y = (Math.PI*45)/180
  mainBox.material = materialWall

  let mainBox2 = mainBox.clone("box2")
  mainBox2.scaling.y = 2
  mainBox2.position = new BABYLON.Vector3(5,((3/2)*mainBox2.scaling.y),-5)

  let mainBox3 = mainBox.clone("box3")
  mainBox3.scaling.y = 3
  mainBox3.position = new BABYLON.Vector3(-5,((3/2)*mainBox3.scaling.y),-5)

  let mainBox4 = mainBox.clone("box4")
  mainBox4.scaling.y = 4
  mainBox4.position = new BABYLON.Vector3(-5,((3/2)*mainBox4.scaling.y),5)

  let cylinder = BABYLON.Mesh.CreateCylinder("cyl1", 20, 5, 5, 20, 4, scene)
  cylinder.position.y = 20/2
  cylinder.material = materialGround
}
