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

  // On initie la scène avec une fonction associé à l'objet Game
  this.scene = this._initScene(engine)

  let _player = new Player(this, canvas)
  let _arena = new Arena(this)

  // Permet au jeu de tourner
  engine.runRenderLoop(() => {
    this.fps = Math.round(1000/engine.getDeltaTime())

    // Checker le mouvement du joueur en lui envoyant le ratio de déplacement
    _player._checkMove((this.fps)/60)

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
    return scene
  }
}
