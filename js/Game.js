// Fonctions
// ---------------------------------
// Conversion degrés -> radians
function degToRad(deg) {
  return (Math.PI * deg) / 180
}

// Conversion radians -> degrés
function radToDeg(rad) {
  return (rad * 180) / Math.PI
}

// Retourne un chiffre entier arrondi entre min et max
function getRandomInt(min, max) {
  return Math.round(Math.random() * (max - min) + min)
}
// ---------------------------------

// Quand la page est chargée
document.addEventListener("DOMContentLoaded", function () {
    new Game('renderCanvas')
}, false)

Game = function(canvasId) {
  // Canvas et engine défini ici
  let canvas = document.getElementById(canvasId)
  let engine = new BABYLON.Engine(canvas, true)
  this.engine = engine
  this.actualTime = Date.now()
  this.allSpawnPoints = [
    new BABYLON.Vector3(-20, 5, 0),
    new BABYLON.Vector3(0, 5, 0),
    new BABYLON.Vector3(20, 5, 0),
    new BABYLON.Vector3(-40, 5, 0)
  ]

  // On initie la scène avec une fonction associé à l'objet Game
  this.scene = this._initScene(engine)

  // Ajout de l'armurerie
  let armory = new Armory(this)
  this.armory = armory

  let _player = new Player(this, canvas)
  this._PlayerData = _player
  let _arena = new Arena(this)
  this._rockets = []
  this._explosionRadius = []
  this._lasers = []

  // Permet au jeu de tourner
  engine.runRenderLoop(() => {
    this.fps = Math.round(1000 / engine.getDeltaTime())

    // Checker le mouvement du joueur en lui envoyant le ratio de déplacement
    _player._checkMove((this.fps)/60)

    this.renderRockets()
    this.renderExplosionRadius()
    this.renderLaser()
    this.renderWeapons()

    this.scene.render()

    // Si launchBullets est a true, on tire
    if (_player.camera.weapons.launchBullets === true) {
      _player.camera.weapons.launchFire()
    }
  })

  // Ajuste la vue 3D si la fenetre est agrandi ou diminué
  window.addEventListener("resize", () => {
    if (engine) {
      engine.resize()
    }
  }, false)
}

// Prototype
Game.prototype = {
  // Prototype d'initialisation de la scène
  _initScene : function(engine) {
    let scene = new BABYLON.Scene(engine)
    scene.clearColor = new BABYLON.Color3(0.7, 0.8, 1)
    scene.gravity = new BABYLON.Vector3(0, -9.81, 0)
    scene.collisionsEnabled = true
    return scene
  },

  renderRockets : function() {
    for (let i = 0; i < this._rockets.length; i++) {
      // On crée un rayon qui part de la base de la roquette vers l'avant
      let rayRocket = new BABYLON.Ray(this._rockets[i].position, this._rockets[i].direction)

      // On regarde quel est le premier objet qu'on touche
      let meshFound = this._rockets[i].getScene().pickWithRay(rayRocket)

      // Si la distance au premier objet touché est inférieure à 10, on détruit la roquette
      if (!meshFound || meshFound.distance < 10) {

        // On vérifie qu'on a bien touché quelque chose
        if (meshFound.pickedMesh && !meshFound.pickedMesh.isMain) {
          // On crée une sphere qui représentera la zone d'impact
          let explosionRadius = BABYLON.Mesh.CreateSphere("sphere", 5.0, 15, this.scene)

          // On positionne la sphère là où il y a eu impact
          explosionRadius.position = meshFound.pickedPoint

          // On fait en sorte que les explosions ne soient pas considérées pour le Ray de la roquette
          explosionRadius.isPickable = false

          // On crée un petit material orange
          explosionRadius.material = new BABYLON.StandardMaterial("textureExplosion", this.scene)
          explosionRadius.material.diffuseColor = new BABYLON.Color3(1, 0.6, 0)
          explosionRadius.material.specularColor = new BABYLON.Color3(0, 0, 0)
          explosionRadius.material.alpha = 0.8

          // Calcule la matrice de l'objet pour les collisions
          explosionRadius.computeWorldMatrix(true)

          if (this._PlayerData.isAlive && this._PlayerData.camera.playerBox &&
            explosionRadius.intersectsMesh(this._PlayerData.camera.playerBox))
          {
            // Envoi à la fonction d'affectation des dégâts
            this._PlayerData.getDamage(30)
          }

          this._explosionRadius.push(explosionRadius)
        }
        this._rockets[i].dispose()
        this._rockets.splice(i, 1)
      }
      else {
        let relativeSpeed = this.armory.weapons[2].setup.ammos.rocketSpeed / (this.fps/60)
        this._rockets[i].position.addInPlace(this._rockets[i].direction.scale(relativeSpeed))
      }
    }
  },

  renderExplosionRadius : function() {
    if (this._explosionRadius.length > 0) {
      for (let i = 0; i < this._explosionRadius.length; i++) {
        this._explosionRadius[i].material.alpha -= 0.02
        if (this._explosionRadius[i].material.alpha <= 0) {
          this._explosionRadius[i].dispose()
          this._explosionRadius.splice(i, 1)
        }
      }
    }
  },

  renderLaser : function() {
    if (this._lasers.length > 0) {
      for (let i = 0; i < this._lasers.length; i++) {
        this._lasers[i].edgesWidth -= 2

        if (this._lasers[i].edgesWidth <= 0) {
          this._lasers[i].dispose()
          this._lasers.splice(i, 1)
        }
      }
    }
  },

  renderWeapons : function() {
    if (this._PlayerData && this._PlayerData.camera.weapons.inventory) {
      // On regarde toutes les armes dans inventory
      let inventoryWeapons = this._PlayerData.camera.weapons.inventory

      for (let i = 0; i < inventoryWeapons.length; i++) {
        // Si l'arme est active et n'est pas à la position haute (topPositionY)
        if (inventoryWeapons[i].isActive &&
        inventoryWeapons[i].position.y < this._PlayerData.camera.weapons.topPositionY)
        {
          inventoryWeapons[i].position.y += 0.1
        }
        else if (!inventoryWeapons[i].isActive &&
        inventoryWeapons[i].position.y != this._PlayerData.camera.weapons.bottomPosition.y)
        {
          // Sinon, si l'arme est inactive et pas encore à la position basse
          inventoryWeapons[i].position.y -= 0.1
        }
      }
    }
  }
}
