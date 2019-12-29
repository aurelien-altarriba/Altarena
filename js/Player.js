Player = function(game, canvas) {
  this.game = game
  this.angularSensibility = 200
  this.speed = 1
  this.weaponShoot = false

  // Axe de mouvement X et Z
  this.axisMovement = [false, false, false, false]

  window.addEventListener("keyup", (evt) => {
    switch(evt.keyCode) {
      case 90:
        this.camera.axisMovement[0] = false
        break
      case 83:
        this.camera.axisMovement[1] = false
        break
      case 81:
        this.camera.axisMovement[2] = false
        break
      case 68:
        this.camera.axisMovement[3] = false
        break
    }
  }, false)

  // Quand les touches sont relachés
  window.addEventListener("keydown", (evt) => {
    switch(evt.keyCode) {
      case 90:
        this.camera.axisMovement[0] = true
        break
      case 83:
        this.camera.axisMovement[1] = true
        break
      case 81:
        this.camera.axisMovement[2] = true
        break
      case 68:
        this.camera.axisMovement[3] = true
        break
    }
  }, false)

  window.addEventListener("mousemove", (evt) => {
    if (this.rotEngaged === true) {
      this.camera.rotation.y += evt.movementX * 0.001 * (this.angularSensibility / 250)
      let nextRotationX = this.camera.rotation.x + (evt.movementY * 0.001 * (this.angularSensibility / 250))
      if (nextRotationX < degToRad(90) && nextRotationX > degToRad(-90)) {
        this.camera.rotation.x += evt.movementY * 0.001 * (this.angularSensibility / 250)
      }
    }
  }, false)

  // On récupère le canvas de la scène
  // var au lieu de let pour redéfinir (erreur canvas déjà existant sinon)
  var canvas = this.game.scene.getEngine().getRenderingCanvas()

  // On affecte le clic et on vérifie qu'il est bien utilisé dans la scène (this.controlEnabled)
  canvas.addEventListener("mousedown", (evt) => {
    if (this.controlEnabled && !this.weaponShoot) {
      this.weaponShoot = true
      this.handleUserMouseDown()
    }
  }, false)

  // On fait pareil quand l'utilisateur relâche le clic de la souris
  canvas.addEventListener("mouseup", (evt) => {
      if (this.controlEnabled && this.weaponShoot) {
          this.weaponShoot = false
          this.handleUserMouseUp()
      }
  }, false)

  // Initialisation de la caméra
  this._initCamera(this.game.scene, canvas)

  // Le joueur doit cliquer dans la scène pour que controlEnabled soit changé
  this.controlEnabled = false

  // On lance l'event _initPointerLock pour checker le clic dans la scène
  this._initPointerLock()
}

Player.prototype = {
  _initCamera : function(scene, canvas) {
    // On crée la caméra
    this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(-20, 5, 0), scene)

    // On demande a la caméra de regarder au point zéro de la scène
    this.camera.setTarget(BABYLON.Vector3.Zero())

    // Axe de mouvement X et Z
    this.camera.axisMovement = [false, false, false, false]

    // Appel de la création des armes
    this.camera.weapons = new Weapons(this)

    // Si le joueur est en vie ou non
    this.isAlive = true
  },

  handleUserMouseDown : function() {
    if (this.isAlive === true) {
      this.camera.weapons.fire()
    }
  },

  handleUserMouseUp : function() {
    if (this.isAlive === true) {
      this.camera.weapons.stopFire()
    }
  },

  _initPointerLock : function() {
    // Requête pour la capture du pointeur
    let canvas = this.game.scene.getEngine().getRenderingCanvas()
    canvas.addEventListener("click", (evt) => {
      canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock ||
        canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock

      if (canvas.requestPointerLock) {
        canvas.requestPointerLock()
      }
    }, false)

    // Événement pour changer le paramètre de rotation
    let pointerlockchange = (event) => {
      this.controlEnabled = (document.mozPointerLockElement === canvas || document.webkitPointerLockElement === canvas ||
        document.msPointerLockElement === canvas || document.pointerLockElement === canvas)

      this.rotEngaged = !this.controlEnabled ? false : true
    }

    // Event pour changer l'état du pointeur, sous tout les types de navigateur
    document.addEventListener("pointerlockchange", pointerlockchange, false)
    document.addEventListener("mspointerlockchange", pointerlockchange, false)
    document.addEventListener("mozpointerlockchange", pointerlockchange, false)
    document.addEventListener("webkitpointerlockchange", pointerlockchange, false)
  },

  _checkMove : function(ratioFps) {
    let relativeSpeed = this.speed / ratioFps
    if (this.camera.axisMovement[0]) {
      this.camera.position = new BABYLON.Vector3(
        this.camera.position.x + (Math.sin(this.camera.rotation.y) * relativeSpeed),
        this.camera.position.y,
        this.camera.position.z + (Math.cos(this.camera.rotation.y) * relativeSpeed)
      )
    }

    if (this.camera.axisMovement[1]) {
      this.camera.position = new BABYLON.Vector3(
        this.camera.position.x + (Math.sin(this.camera.rotation.y) * -relativeSpeed),
        this.camera.position.y,
        this.camera.position.z + (Math.cos(this.camera.rotation.y) * -relativeSpeed)
      )
    }

    if (this.camera.axisMovement[2]) {
      this.camera.position = new BABYLON.Vector3(
        this.camera.position.x + Math.sin(this.camera.rotation.y + degToRad(-90)) * relativeSpeed,
        this.camera.position.y,
        this.camera.position.z + Math.cos(this.camera.rotation.y + degToRad(-90)) * relativeSpeed
      )
    }

    if (this.camera.axisMovement[3]) {
      this.camera.position = new BABYLON.Vector3(
        this.camera.position.x + Math.sin(this.camera.rotation.y + degToRad(-90)) * - relativeSpeed,
        this.camera.position.y,
        this.camera.position.z + Math.cos(this.camera.rotation.y + degToRad(-90)) * - relativeSpeed
      )
    }
  }
}
