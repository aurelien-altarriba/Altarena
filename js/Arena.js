Arena = function(game) {
  // Appel des variables nécéssaires
  this.game = game
  let scene = game.scene

  // Création de notre lumière principale
  let ciel = new BABYLON.HemisphericLight("ciel", new BABYLON.Vector3(0, 1, 0), scene)
  ciel.diffuse = new BABYLON.Color3(0.8, 0.8, 0.8)
  ciel.specular = new BABYLON.Color3(1, 1, 1)

  let lum_interne = new BABYLON.HemisphericLight("lum_interne", new BABYLON.Vector3(0, -1, 0), scene)
  lum_interne.intensity = 0.5

  // Material sol
  let materialSol = new BABYLON.StandardMaterial("materialSol", scene)
  materialSol.diffuseTexture = new BABYLON.Texture("assets/images/beton.jpg", scene)
  materialSol.diffuseTexture.uScale = 1.0
  materialSol.diffuseTexture.vScale = 1.0

  // Material bois
  let materialBois = new BABYLON.StandardMaterial("materialBois", scene)
  materialBois.diffuseTexture = new BABYLON.Texture("assets/images/wood.jpg", scene)

  // Material mur
  let materialMur = new BABYLON.StandardMaterial("materialMur", scene)
  materialMur.diffuseTexture = new BABYLON.Texture("assets/images/brick.jpg", scene)
  materialMur.diffuseTexture.uScale = 10.0
  materialMur.diffuseTexture.vScale = 1.0

  // Taille de la map
  let w_map = 500
  let hauteur = 30

  // SOL
  let ground = BABYLON.Mesh.CreateGround("ground1", w_map, w_map, 2, scene)
  ground.material = materialSol
  ground.checkCollisions = true

  // MURS
  let mur1 = BABYLON.Mesh.CreateBox("mur1", 1, scene)
  mur1.scaling.x = hauteur
  mur1.scaling.y = 1
  mur1.scaling.z = w_map
  mur1.position = new BABYLON.Vector3((w_map + mur1.scaling.y)/2, mur1.scaling.x/2, 0)
  mur1.rotation.z = degToRad(90)
  mur1.checkCollisions = true
  mur1.material = materialMur

  let mur2 = mur1.clone("mur2")
  mur2.position = new BABYLON.Vector3((-w_map + mur2.scaling.y)/2, mur2.scaling.x/2, 0)
  mur2.rotation.x = degToRad(180)

  let mur3 = mur1.clone("mur3")
  mur3.position = new BABYLON.Vector3(0, mur3.scaling.x/2, (w_map + mur3.scaling.y)/2)
  mur3.rotation.y = degToRad(90)
  mur3.rotation.x = degToRad(180)

  let mur4 = mur1.clone("mur4")
  mur4.position = new BABYLON.Vector3(0, mur4.scaling.x/2, -w_map/2)
  mur4.rotation.y = degToRad(90)

  let plafond = BABYLON.Mesh.CreateBox("plafond", 1, scene)
  plafond.scaling.x = w_map
  plafond.scaling.y = 1
  plafond.scaling.z = w_map
  plafond.position = new BABYLON.Vector3(0, hauteur, 0)
  plafond.visibility = 0
  plafond.checkCollisions = true

  // Obstacles
  let obs = []
  obs[0] = BABYLON.Mesh.CreateBox("obs0", 1, scene)
  obs[0].position = new BABYLON.Vector3(10, -5, 25)
  obs[0].checkCollisions = true
  obs[0].material = materialBois

  let nbElem = getRandomInt(10, 40)
  console.log("Génération de " + nbElem + " obstacles")
  for (let i = 1; i < nbElem; i++) {
    obs[i] = obs[0].clone(`obs${i}`)
    obs[i].scaling.x = getRandomInt(3, 25)
    obs[i].scaling.y = getRandomInt(8, 25)
    obs[i].scaling.z = getRandomInt(3, 20)
    obs[i].position = new BABYLON.Vector3(getRandomInt(-(w_map/2), w_map/2), obs[i].scaling.y/2, getRandomInt(-(w_map/2), w_map/2))
    obs[i].rotation.y = degToRad(getRandomInt(0, 89))
  }
}
