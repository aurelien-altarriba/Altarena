Player = function(game, canvas) {
  this.weaponShoot = false
  this.ghostPlayers = []
  this.game = game
  this.speed = 1
  this.angularSensibility = 200
  this.axisMovement = [false, false, false, false]

  // Quand les touches sont pressées
  window.addEventListener("keyup", (evt) => {
    let keys = [68, 81, 83, 90]
    if (keys.indexOf(evt.keyCode) !== -1) {
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

      let data = { axisMovement: this.camera.axisMovement }
      this.sendNewData(data)
    }
  }, false)

  // Quand les touches sont relachées
  window.addEventListener("keydown", (evt) => {
    let keys = [68, 81, 83, 90]
    if (keys.indexOf(evt.keyCode) !== -1) {
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

      let data = { axisMovement: this.camera.axisMovement }
      this.sendNewData(data)
    }
  }, false)

  // Quand on bouge la souris
  window.addEventListener("mousemove", (evt) => {
    if (this.rotEngaged === true) {
      this.camera.playerBox.rotation.y += evt.movementX * 0.001 * (this.angularSensibility / 250)
      let nextRotationX = this.camera.playerBox.rotation.x + (evt.movementY * 0.001 * (this.angularSensibility / 250))
      if (nextRotationX < degToRad(90) && nextRotationX > degToRad(-90)) {
        this.camera.playerBox.rotation.x += evt.movementY * 0.001 * (this.angularSensibility / 250)
      }

      let data = { rotation: this.camera.playerBox.rotation }
      this.sendNewData(data)
    }
  }, false)

  // On récupère le canvas de la scène
  // var au lieu de let pour redéfinir (erreur variable canvas déjà existante sinon)
  // TODO: Voir si c'est utile de garder la variable ou d'utiliser directement le canvas en paramètre
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

  // Changement des armes
  this.previousWheeling = 0

  canvas.addEventListener("wheel", (evt) => {
    // Si la différence entre les deux tours de souris sont minimes
    if (Math.round(evt.timeStamp - this.previousWheeling) > 10) {
      if (evt.deltaY < 0) {
        // Si on scroll vers le haut, on va chercher l'arme suivante
        this.camera.weapons.nextWeapon(1)
      }
      else {
        // Si on scroll vers le bas, on va chercher l'arme précédente
        this.camera.weapons.nextWeapon(-1)
      }

      //On affecte a previousWheeling la valeur actuelle
      this.previousWheeling = evt.timeStamp
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
    let randomPoint = Math.round(Math.random() * (this.game.allSpawnPoints.length - 1))

    // Le spawnPoint est celui choisi selon le random plus haut
    this.spawnPoint = this.game.allSpawnPoints[randomPoint]

    let playerBox = BABYLON.Mesh.CreateBox("headMainPlayer", 3, scene)
    playerBox.position = this.spawnPoint.clone()
    playerBox.ellipsoid = new BABYLON.Vector3(2, 2, 2)
    playerBox.isPickable = false

    // On crée la caméra
    this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, 0), scene)
    this.camera.playerBox = playerBox
    this.camera.parent = this.camera.playerBox

    // Ajout des collisions et de la gravité avec playerBox
    this.camera.playerBox.checkCollisions = true
    this.camera.playerBox.applyGravity = true

    // Si le joueur est en vie ou non
    this.isAlive = true

    // Attributs
    this.camera.health = 100
    this.camera.isMain = true
    this.camera.armor = 0

    // On crée les armes
    this.camera.weapons = new Weapons(this)

    // On ajoute l'axe de mouvement
    this.camera.axisMovement = [false, false, false, false]

    // On réinitialise la position de la caméra
    // this.camera.setTarget(BABYLON.Vector3.Zero())
    this.game.scene.activeCamera = this.camera

    let hitBoxPlayer = BABYLON.Mesh.CreateBox("hitBoxPlayer", 3, scene)
    hitBoxPlayer.parent = this.camera.playerBox
    hitBoxPlayer.scaling.y = 2
    hitBoxPlayer.isPickable = true
    hitBoxPlayer.isMain = true
  },

  handleUserMouseDown : function() {
    if (this.isAlive) {
      this.camera.weapons.fire()
    }
  },

  handleUserMouseUp : function() {
    if (this.isAlive) {
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
    // On bouge le player en lui attribuant la caméra
    this._checkUniqueMove(ratioFps, this.camera)

    for (let i = 0; i < this.ghostPlayers.length; i++) {
      // On bouge chaque ghost présent dans ghostPlayers
      this._checkUniqueMove(ratioFps, this.ghostPlayers[i])
    }
  },

  _checkUniqueMove : function(ratioFps, player) {
    let relativeSpeed = this.speed / ratioFps

    // On regarde si c'est un ghost ou non (seul les ghost on un élément head)
    if (player.head) {
      let rotationPoint = player.head.rotation
    }
    else {
      let rotationPoint = player.playerBox.rotation
    }

    if (player.axisMovement[0]) {
      forward = new BABYLON.Vector3(
        parseFloat(Math.sin(parseFloat(this.camera.playerBox.rotation.y))) * relativeSpeed,
        0,
        parseFloat(Math.cos(parseFloat(this.camera.playerBox.rotation.y))) * relativeSpeed
      )
      player.playerBox.moveWithCollisions(forward)
    }
    if (player.axisMovement[1]) {
      backward = new BABYLON.Vector3(
        parseFloat(-Math.sin(parseFloat(this.camera.playerBox.rotation.y))) * relativeSpeed,
        0,
        parseFloat(-Math.cos(parseFloat(this.camera.playerBox.rotation.y))) * relativeSpeed
      )
      player.playerBox.moveWithCollisions(backward)
    }
    if (player.axisMovement[2]) {
      left = new BABYLON.Vector3(
        parseFloat(Math.sin(parseFloat(this.camera.playerBox.rotation.y) + degToRad(-90))) * relativeSpeed,
        0,
        parseFloat(Math.cos(parseFloat(this.camera.playerBox.rotation.y) + degToRad(-90))) * relativeSpeed
      )
      player.playerBox.moveWithCollisions(left)
    }
    if (player.axisMovement[3]) {
      right = new BABYLON.Vector3(
        parseFloat(-Math.sin(parseFloat(this.camera.playerBox.rotation.y) + degToRad(-90))) * relativeSpeed,
        0,
        parseFloat(-Math.cos(parseFloat(this.camera.playerBox.rotation.y) + degToRad(-90))) * relativeSpeed
      )
      player.playerBox.moveWithCollisions(right)
    }

    player.playerBox.moveWithCollisions(new BABYLON.Vector3(0,(-1.5) * relativeSpeed ,0))
  },

  getDamage : function(damage, whoDamage) {
    let damageTaken = damage

    // Tampon des dégâts par l'armure
    if (this.camera.armor > Math.round(damageTaken / 2)) {
      this.camera.armor -= Math.round(damageTaken / 2)
      damageTaken = Math.round(damageTaken / 2)
    }
    else {
      damageTaken -= this.camera.armor
      this.camera.armor = 0
    }

    // Prise des dégâts avec le tampon de l'armure
    if (this.camera.health > damageTaken) {
      this.camera.health -= damageTaken
    }
    else {
      this.playerDead(whoDamage)
    }
  },

  playerDead : function(whoKilled) {
    // Fonction appelée pour annoncer la destruction du joueur
    sendPostMortem(whoKilled)

    this.deadCamera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 1, 0.8, 10,
      new BABYLON.Vector3(
        this.camera.playerBox.position.x,
        this.camera.playerBox.position.y,
        this.camera.playerBox.position.z
      ),
      this.game.scene
    )

    this.game.scene.activeCamera = this.deadCamera
    this.deadCamera.attachControl(this.game.scene.getEngine().getRenderingCanvas())

    // Suppression des éléments
    this.camera.playerBox.dispose()
    this.camera.dispose()
    let inventoryWeapons = this.camera.weapons.inventory
    for (let i = 0; i < inventoryWeapons.length; i++) {
      inventoryWeapons[i].dispose()
    }
    inventoryWeapons = []

    this.isAlive = false

    let canvas = this.game.scene.getEngine().getRenderingCanvas()
    setTimeout(() => {
      this._initCamera(this.game.scene, canvas, this.spawnPoint)
      this.launchRessurection()
    }, 4000)
  },

  // MULTIJOUEUR
  sendNewData: function(data) {
    updateGhost(data)
  },

  launchRessurection: function() {
    ressurectMe()
  },

  sendActualData: function() {
    return {
      actualTypeWeapon: this.camera.weapons.actualWeapon,
      armor: this.camera.armor,
      life: this.camera.health,
      position: this.camera.playerBox.position,
      rotation: this.camera.playerBox.rotation,
      axisMovement: this.camera.axisMovement
    }
  },

  updateLocalGhost: function(data) {
    ghostPlayers = this.ghostPlayers

    for (let i = 0; i < ghostPlayers.length; i++) {
      if (ghostPlayers[i].idRoom === data.id) {
        let boxModified = ghostPlayers[i].playerBox

        // On applique un correctif sur Y, qui semble être au mauvais endroit
        if (data.position) {
          boxModified.position = new BABYLON.Vector3(
            data.position.x,
            data.position.y - 2.76,
            data.position.z
          )
        }
        if (data.axisMovement) {
          ghostPlayers[i].axisMovement = data.axisMovement
        }
        if (data.rotation) {
          ghostPlayers[i].head.rotation.y = data.rotation.y
        }
        if (data.axisMovement) {
          ghostPlayers[i].axisMovement = data.axisMovement
        }
      }
    }
  }
}
