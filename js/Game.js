// Quand la page est chargée
document.addEventListener("DOMContentLoaded", function () {
    new Game('renderCanvas')
}, false)

Game = function(canvasId) {

  // Canvas et engine défini ici
  let canvas = document.getElementById(canvasId)
  let engine = new BABYLON.Engine(canvas, true)

  // On initie la scène avec une fonction associé à l'objet Game
  this.scene = this._initScene(engine)

  // Permet au jeu de tourner
  engine.runRenderLoop(() => {
    this.scene.render()
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
    scene.clearColor = new BABYLON.Color3(0.8,0.8,0.8)
    return scene
  }
}
