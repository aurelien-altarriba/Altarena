Weapons = function(Player) {
  // On permet d'accéder à Player n'importe où dans Weapons
  this.Player = Player

  // Import de l'armurerie depuis Game
  this.Armory = Player.game.armory

  // Positions selon l'arme non utilisée
  this.bottomPosition = new BABYLON.Vector3(1, -2.5, 1.2)

  // Changement de Y quand l'arme est séléctionnée
  this.topPositionY = -0.5

  // Ajout de l'inventaire
  this.inventory = []

  // Armes
  let crook = this.newWeapon('Crook')
  this.inventory[0] = crook

  let ezekiel = this.newWeapon('Ezekiel')
  this.inventory[1] = ezekiel

  let timmy = this.newWeapon('Timmy')
  this.inventory[2] = timmy

  let armageddon = this.newWeapon('Armageddon')
  this.inventory[3] = armageddon

  // Notre arme actuelle est Ezekiel, qui se trouve en deuxième position dans le tableau des armes
  this.actualWeapon = this.inventory.length - 1

  // On dit que notre arme en main est l'arme active
  this.inventory[this.actualWeapon].isActive = true

  // On dit que la cadence de tir est celle de l'arme actuelle (grâce à typeWeapon)
  this.fireRate = this.Armory.weapons[this.inventory[this.actualWeapon].typeWeapon].setup.cadency

  // Delta de calcul pour savoir quand le tir est a nouveau disponible
  this._deltaFireRate = this.fireRate

  this.canFire = true
  this.launchBullets = false

  // Engine va nous être utile pour la cadence de tir
  let engine = Player.game.scene.getEngine()

  Player.game.scene.registerBeforeRender(() => {
    if (!this.canFire) {
      this._deltaFireRate -= engine.getDeltaTime()
      if (this._deltaFireRate <= 0 && this.Player.isAlive) {
        this.canFire = true
        this._deltaFireRate = this.fireRate
      }
    }
  })
}

Weapons.prototype = {
  newWeapon : function(typeWeapon) {
    let newWeapon

    for (let i = 0; i < this.Armory.weapons.length; i++) {
      if (this.Armory.weapons[i].name === typeWeapon) {

        newWeapon = BABYLON.Mesh.CreateBox('weapon', 0.5, this.Player.game.scene)

        // Nous faisons en sorte d'avoir une arme d'apparence plus longue que large
        newWeapon.scaling = new BABYLON.Vector3(0.6, 0.3, 2)

        // On l'associe à la caméra pour qu'il bouge de la même facon
        newWeapon.parent = this.Player.camera

        // On positionne le mesh APRÈS l'avoir attaché à la caméra
        newWeapon.position = this.bottomPosition.clone()
        newWeapon.isPickable = false

        // Ajoutons un material de l'arme pour le rendre plus visible
        let materialWeapon = new BABYLON.StandardMaterial('weaponMat', this.Player.game.scene)
        materialWeapon.diffuseColor = this.Armory.weapons[i].setup.colorMesh

        newWeapon.material = materialWeapon

        newWeapon.typeWeapon = i

        newWeapon.isActive = false

        // On sort de la boucle (inutile de faire la suite)
        break
      }
      else if (i === this.Armory.weapons.length - 1) {
        console.log('UNKNOWN WEAPON')
      }
    }

    return newWeapon
  },

  fire : function(pickInfo) {
    this.launchBullets = true
  },

  stopFire : function(pickInfo) {
    this.launchBullets = false
  },

  launchFire : function() {
    if (this.canFire) {
      // Id de l'arme en main
      let idWeapon = this.inventory[this.actualWeapon].typeWeapon

      // Détermine la taille de l'écran
      let renderWidth = this.Player.game.engine.getRenderWidth(true)
      let renderHeight = this.Player.game.engine.getRenderHeight(true)

      // Cast un rayon au centre de l'écran
      let direction = this.Player.game.scene.pick(
        renderWidth / 2,
        renderHeight / 2,
        (item) => {
          return (item.name == "weapon" || item.id == "headMainPlayer" || item.id == "hitBoxPlayer") ? false : true
        }
      )

      // Si l'arme est une arme de distance
      if (this.Armory.weapons[idWeapon].type === 'ranged') {
        if (this.Armory.weapons[idWeapon].setup.ammos.type === 'rocket') {
          // Tir au lance-roquette
          direction = direction.pickedPoint.subtractInPlace(this.inventory[this.actualWeapon].absolutePosition.clone())
          direction = direction.normalize()
          this.createRocket(this.Player.camera.playerBox, direction)
        }
        else if (this.Armory.weapons[idWeapon].setup.ammos.type === 'bullet') {
          // Tir à l'arme à feu
          this.shootBullet(direction)
        }
        else {
          // Tir au laser
          this.createLaser(direction)
        }
      }
      else {
        // Attaque au corps a corps
        this.hitHand(direction)
      }

      this.canFire = false
    }
    else {
      // Nothing to do : cannot fire
    }
  },

  createRocket : function(playerPosition, direction) {
    let positionValue = this.inventory[this.actualWeapon].absolutePosition.clone()
    let rotationValue = playerPosition.rotation
    let newRocket = BABYLON.Mesh.CreateBox("rocket", 1, this.Player.game.scene)
    let idWeapon = this.inventory[this.actualWeapon].typeWeapon
    let setupRocket = this.Armory.weapons[idWeapon].setup.ammos

    newRocket.direction = direction
    newRocket.position = new BABYLON.Vector3(
      positionValue.x + (newRocket.direction.x * 1),
      positionValue.y + (newRocket.direction.y * 1),
      positionValue.z + (newRocket.direction.z * 1)
    )
    newRocket.rotation = new BABYLON.Vector3(rotationValue.x, rotationValue.y, rotationValue.z)
    newRocket.scaling = new BABYLON.Vector3(0.5, 0.5, 1)
    newRocket.material = new BABYLON.StandardMaterial("textureWeapon", this.Player.game.scene)
    newRocket.material.diffuseColor = this.Armory.weapons[idWeapon].setup.colorMesh
    newRocket.paramsRocket = this.Armory.weapons[idWeapon].setup
    newRocket.isPickable = false

    sendGhostRocket(newRocket.position, newRocket.rotation, newRocket.direction)

    this.Player.game._rockets.push(newRocket)
  },

  shootBullet: function(meshFound) {
    // Permet de connaitre l'id de l'arme dans Armory.js
    let idWeapon = this.inventory[this.actualWeapon].typeWeapon

    let setupWeapon = this.Armory.weapons[idWeapon].setup

    if (meshFound.hit && meshFound.pickedMesh.isPlayer) {
      // On a touché un joueur
      let damages = this.Armory.weapons[idWeapon].setup.damage
      sendDamages(damages, meshFound.pickedMesh.name)
    }
    else {
      // L'arme ne touche pas de joueur
      console.log('Not Hit Bullet')
    }
  },

  createLaser : function(meshFound) {
    // Permet de connaitre l'id de l'arme dans Armory.js
    let idWeapon = this.inventory[this.actualWeapon].typeWeapon

    let setupLaser = this.Armory.weapons[idWeapon].setup.ammos
    let positionValue = this.inventory[this.actualWeapon].absolutePosition.clone()

    if (meshFound.hit) {
      let laserPosition = positionValue

      // On crée une ligne tracée entre le pickedPoint et le canon de l'arme
      let line = BABYLON.Mesh.CreateLines("lines", [
        laserPosition,
        meshFound.pickedPoint
      ], this.Player.game.scene)

      let colorLine = new BABYLON.Color3(0.2, 0.4, 0.9)
      line.color = colorLine

      // On élargit le trait pour le rendre visible
      line.enableEdgesRendering()
      line.isPickable = false
      line.edgesWidth = 50.0
      line.edgesColor = new BABYLON.Color4(colorLine.r, colorLine.g, colorLine.b, 0.6)

      if (meshFound.pickedMesh.isPlayer) {
        let damages = this.Armory.weapons[idWeapon].setup.damage
        sendDamages(damages, meshFound.pickedMesh.name)
      }

      // On envoie le point de départ et le point d'arrivée
      sendGhostLaser(laserPosition, directionPoint.pickedPoint)

      this.Player.game._lasers.push(line)
    }
  },

  hitHand : function(meshFound) {
    // Permet de connaitre l'id de l'arme dans Armory.js
    let idWeapon = this.inventory[this.actualWeapon].typeWeapon

    let setupWeapon = this.Armory.weapons[idWeapon].setup

    if (meshFound.hit && meshFound.distance < setupWeapon.range * 5 && meshFound.pickedMesh.isPlayer) {
      // On a touché un joueur
      let damages = this.Armory.weapons[idWeapon].setup.damage
      sendDamages(damages, meshFound.pickedMesh.name)
    }
    else {
      // L'arme frappe dans le vide
      console.log('Not Hit CaC')
    }
  },

  nextWeapon : function(way) {
    // On définit armoryWeapons pour accéder plus facilement à Armory
    let armoryWeapons = this.Armory.weapons

    // On dit que l'arme suivante est logiquement l'arme plus le sens donné
    let nextWeapon = this.inventory[this.actualWeapon].typeWeapon + way

    // On définit actuellement l'arme possible utilisable à 0 pour l'instant
    let nextPossibleWeapon = null

    // Si le sens est positif
    if (way > 0) {

      // La boucle commence depuis nextWeapon
      for (let i = nextWeapon; i < nextWeapon + this.Armory.weapons.length; i++) {
        // L'arme qu'on va tester sera un modulo de i et de la longueur de Weapon
        let numberWeapon = i % this.Armory.weapons.length

        // On compare ce nombre aux armes qu'on a dans l'inventaire
        for (let y = 0; y < this.inventory.length; y++) {
          if (this.inventory[y].typeWeapon === numberWeapon) {
            // Si on trouve quelque chose, c'est donc une arme qui vient arès la nôtre
            nextPossibleWeapon = y
            break
          }
        }

        // Si on a trouvé une arme correspondante, on n'a plus besoin de la boucle for
        if (nextPossibleWeapon != null) { break }
      }
    }
    else {
      // Boucle infinie
      for (let i = nextWeapon; ; i--) {
        if (i < 0) {
          i = this.Armory.weapons.length
        }

        let numberWeapon = i
        for (let y = 0; y < this.inventory.length; y++) {
          if (this.inventory[y].typeWeapon === numberWeapon) {
            nextPossibleWeapon = y
            break
          }
        }

        if (nextPossibleWeapon != null) { break }
      }
    }

    if (this.actualWeapon != nextPossibleWeapon) {
      // On dit à notre arme actuelle qu'elle n'est plus active
      this.inventory[this.actualWeapon].isActive = false

      // On change l'arme actuelle avec celle qu'on a trouvé
      this.actualWeapon = nextPossibleWeapon

      // On dit à notre arme choisie qu'elle est l'arme active
      this.inventory[this.actualWeapon].isActive = true

      // On actualise la cadence de l'arme
      this.fireRate = this.Armory.weapons[this.inventory[this.actualWeapon].typeWeapon].setup.cadency
      this._deltaFireRate = this.fireRate
    }
  }
}
