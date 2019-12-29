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
      this.camera.playerBox.rotation.y += evt.movementX * 0.001 * (this.angularSensibility / 250)
      let nextRotationX = this.camera.playerBox.rotation.x + (evt.movementY * 0.001 * (this.angularSensibility / 250))
      if (nextRotationX < degToRad(90) && nextRotationX > degToRad(-90)) {
        this.camera.playerBox.rotation.x += evt.movementY * 0.001 * (this.angularSensibility / 250)
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
    let playerBox = BABYLON.Mesh.CreateBox("headMainPlayer", 3, scene)
    playerBox.position = new BABYLON.Vector3(-20, 5, 0)
    playerBox.ellipsoid = new BABYLON.Vector3(2, 2, 2)

    // On crée la caméra
    this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, 0), scene)
    this.camera.playerBox = playerBox
    this.camera.parent = this.camera.playerBox

    // Ajout des collisions et de la gravité avec playerBox
    this.camera.playerBox.checkCollisions = true
    this.camera.playerBox.applyGravity = true

    // Si le joueur est en vie ou non
    this.isAlive = true

    // Pour savoir que c'est le joueur principal
    this.camera.isMain = true

    // On crée les armes
    this.camera.weapons = new Weapons(this)

    // On ajoute l'axe de mouvement
    this.camera.axisMovement = [false, false, false, false]

    let hitBoxPlayer = BABYLON.Mesh.CreateBox("hitBoxPlayer", 3, scene)
    hitBoxPlayer.parent = this.camera.playerBox
    hitBoxPlayer.scaling.y = 2
    hitBoxPlayer.isPickable = true
    hitBoxPlayer.isMain = true
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
      forward = new BABYLON.Vector3(
        parseFloat(Math.sin(parseFloat(this.camera.playerBox.rotation.y))) * relativeSpeed,
        0,
        parseFloat(Math.cos(parseFloat(this.camera.playerBox.rotation.y))) * relativeSpeed
      )
      this.camera.playerBox.moveWithCollisions(forward)
    }

    if (this.camera.axisMovement[1]) {
      backward = new BABYLON.Vector3(
        parseFloat(-Math.sin(parseFloat(this.camera.playerBox.rotation.y))) * relativeSpeed,
        0,
        parseFloat(-Math.cos(parseFloat(this.camera.playerBox.rotation.y))) * relativeSpeed
      )
      this.camera.playerBox.moveWithCollisions(backward)
    }

    if (this.camera.axisMovement[2]) {
      left = new BABYLON.Vector3(
        parseFloat(Math.sin(parseFloat(this.camera.playerBox.rotation.y) + degToRad(-90))) * relativeSpeed,
        0,
        parseFloat(Math.cos(parseFloat(this.camera.playerBox.rotation.y) + degToRad(-90))) * relativeSpeed
      )
      this.camera.playerBox.moveWithCollisions(left)
    }

    if (this.camera.axisMovement[3]) {
      right = new BABYLON.Vector3(
        parseFloat(-Math.sin(parseFloat(this.camera.playerBox.rotation.y) + degToRad(-90))) * relativeSpeed,
        0,
        parseFloat(-Math.cos(parseFloat(this.camera.playerBox.rotation.y) + degToRad(-90))) * relativeSpeed
      )
      this.camera.playerBox.moveWithCollisions(right)
    }

    this.camera.playerBox.moveWithCollisions(new BABYLON.Vector3(0,(-1.5) * relativeSpeed, 0))
  }
}
