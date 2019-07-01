(function() {
  const game = new Kiwi.Game();

  const state = new Kiwi.State('state');
  const lostState = new Kiwi.State('lostState');

  // #region mainState

  state.preload = function() {
    Kiwi.State.prototype.preload.call(this);
    this.addSpriteSheet('shipSprite', 'images/player.PNG', 45, 36);
    this.addSpriteSheet('shoot', 'images/shoot.png', 28, 28);
    this.addSpriteSheet('enemy', 'images/enemy.png', 45, 62);
    this.addSpriteSheet('enemy_shoot', 'images/enemy_shoot.png', 28, 28);
    this.addImage('background', 'images/back.jpg');
  };

  state.create = function() {
    Kiwi.State.prototype.create.call(this);

    this.GAME_LOST = false;

    // asign constants
    this.SHOOTS_NUMBER = 20;
    this.SHOOT_SPEED = 40;
    this.SHOOT_DELAY = 100;

    // enemy constants
    this.ENEMIES_NUMBER = 10;
    this.ENEMY_SPEED_X = 2;
    this.ENEMY_SPEED_Y = 5;

    // enemy shoot constants
    this.ENEMY_SHOOT_NUMBER = this.ENEMIES_NUMBER * 3;
    this.ENEMY_SHOOT_INTERVAL = 600;

    // create background
    this.background = new Kiwi.GameObjects.StaticImage(
      this,
      this.textures.background,
      0,
      0
    );

    // create main character
    this.character = new Kiwi.GameObjects.Sprite(
      this,
      this.textures.shipSprite,
      350,
      530
    );

    //  create shoots for main character
    this.shoots = new Kiwi.Group(this);
    this.enemies = new Kiwi.Group(this);
    this.enemyShoots = new Kiwi.Group(this);

    for (let i = 0; i < this.SHOOTS_NUMBER; i++) {
      const shoot = new Kiwi.GameObjects.Sprite(
        this,
        this.textures.shoot,
        350,
        -100
      );

      this.shoots.addChild(shoot);

      shoot.anchorPointX = this.character.width * 0.5;
      shoot.anchorPointY = this.character.height * 0.5;

      shoot.physics = shoot.components.add(
        new Kiwi.Components.ArcadePhysics(shoot, shoot.box)
      );

      shoot.alive = false;
    }

    for (let i = 0; i < this.ENEMY_SHOOT_NUMBER; i++) {
      const enemyShoot = new Kiwi.GameObjects.Sprite(
        this,
        this.textures.enemy_shoot,
        350,
        -100
      );

      this.enemyShoots.addChild(enemyShoot);

      enemyShoot.physics = enemyShoot.components.add(
        new Kiwi.Components.ArcadePhysics(enemyShoot, enemyShoot.box)
      );

      enemyShoot.alive = false;
    }

    for (let i = 0; i < this.ENEMIES_NUMBER; i++) {
      const enemy = new Kiwi.GameObjects.Sprite(
        this,
        this.textures.enemy,
        10 + 70 * i + 45,
        50
      );

      this.enemies.addChild(enemy);

      enemy.physics = enemy.components.add(
        new Kiwi.Components.ArcadePhysics(enemy, enemy.box)
      );

      //speed
      enemy.physics.velocity.y = this.ENEMY_SPEED_Y;
      enemy.physics.velocity.x = this.ENEMY_SPEED_X;

      enemy.alive = true;
    }

    this.upKey = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.W);
    this.leftKey = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.A);
    this.rightKey = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.D);
    this.downKey = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.S);

    this.spaceKey = this.game.input.keyboard.addKey(
      Kiwi.Input.Keycodes.SPACEBAR
    );

    this.addChild(this.background);
    this.addChild(this.character);
    this.addChild(this.shoots);
    this.addChild(this.enemies);
    this.addChild(this.enemyShoots);
  };

  state.getFirstDeadBullet = function() {
    var shoots = this.shoots.members;

    for (var i = shoots.length - 1; i >= 0; i--) {
      if (!shoots[i].alive) {
        return shoots[i];
      }
    }
    return null;
  };

  state.getAvailableEnemyBullet = function() {
    const shoots = this.enemyShoots.members;

    for (let i = shoots.length - 1; i >= 0; i--) {
      if (!shoots[i].alive) {
        return shoots[i];
      }
    }
  };

  state.getRandomEnemy = function() {
    return this.enemies.members[
      Math.floor(Math.random() * this.enemies.members.length)
    ];
  };

  state.enemyShoot = function() {
    if (this.lastEnemyShot === undefined) this.lastEnemyShot = 0;
    if (this.game.time.now() - this.lastEnemyShot < this.ENEMY_SHOOT_INTERVAL)
      return;

    this.lastEnemyShot = this.game.time.now();

    const bullet = this.getAvailableEnemyBullet();

    if (!bullet) return;

    bullet.alive = true;

    const enemy = this.getRandomEnemy();

    bullet.x = enemy.x;
    bullet.y = enemy.y;

    bullet.physics.velocity.y = this.SHOOT_SPEED;
    bullet.physics.velocity.x = 0;
  };

  state.checkEnemies = function() {
    const shoots = this.shoots.members;
    const enemies = this.enemies.members;

    for (let i = 0; i < shoots.length; i++) {
      for (let j = 0; j < enemies.length; j++) {
        if (shoots[i].physics.overlaps(enemies[j])) {
          enemies[j].destroy();
          shoots[i].transform.y = -100;
          shoots[i].alive = false;
        }
      }
    }
  };

  state.shoot = function() {
    if (this.lastBulletShotAt === undefined) this.lastBulletShotAt = 0;
    if (this.game.time.now() - this.lastBulletShotAt < this.SHOOT_DELAY) return;
    this.lastBulletShotAt = this.game.time.now();

    var bullet = this.getFirstDeadBullet();

    // If there aren't any bullets available then don't shoot
    if (bullet === null || bullet === undefined) return;

    // Revive the bullet
    // This makes the bullet "alive"
    bullet.alive = true;

    // Set the bullet position to the gun position.
    bullet.x = this.character.x;
    bullet.y = this.character.y;

    // Shoot it
    bullet.physics.velocity.y = -this.SHOOT_SPEED;
    bullet.physics.velocity.x = 0;
  };

  state.destroyOutsideShoot = function(shoot) {
    if (
      shoot.x > this.game.stage.width ||
      shoot.x < 0 ||
      shoot.y > this.game.stage.height ||
      shoot.y < 0
    ) {
      shoot.alive = false;
    }
  };

  state.moveEnemy = function(enemy) {
    if (enemy.transform.x + enemy.width > this.game.stage.width) {
      enemy.transform.x = this.game.stage.width - enemy.width - 1;
      enemy.physics.velocity.x = -this.ENEMY_SPEED_X;
    } else if (enemy.transform.x < 0) {
      enemy.transform.x = 0;
      enemy.physics.velocity.x = this.ENEMY_SPEED_X;
    }
  };

  state.lose = function() {
    this.enemies.members.forEach(enemy => {
      if (enemy.physics.overlaps(this.character)) {
        this.GAME_LOST = true;
      }
    });

    this.enemyShoots.members.forEach(shoot => {
      if (shoot.physics.overlaps(this.character)) {
        this.GAME_LOST = true;
      }
    });

    if (this.GAME_LOST) {
      alert('You lost!');

      this.game.states.switchState('lostState');
    }
  };

  state.win = function() {
    if (this.enemies.members.length == 0) {
      alert('You win!');
      this.game.states.switchState('lostState');
    }
  };

  state.update = function() {
    Kiwi.State.prototype.update.call(this);

    if (this.spaceKey.isDown) {
      this.shoot();
    }

    if (this.leftKey.isDown) {
      this.character.transform.x -= 10;
      if (this.character.transform.x < 0) {
        this.character.transform.x = 0;
      }
    }

    if (this.rightKey.isDown) {
      this.character.transform.x += 10;
      if (
        this.character.transform.x + this.character.width >
        this.game.stage.width
      ) {
        this.character.transform.x =
          this.game.stage.width - this.character.width;
      }
    }

    if (this.downKey.isDown) {
      this.character.transform.y += 10;
      if (
        this.character.transform.y + this.character.height >
        this.game.stage.height
      ) {
        this.character.transform.y =
          this.game.stage.height - this.character.height;
      }
    }

    if (this.upKey.isDown) {
      this.character.transform.y -= 10;
      if (this.character.transform.y < this.game.stage.height / 2) {
        this.character.transform.y = this.game.stage.height / 2;
      }
    }

    this.shoots.forEach(this, this.destroyOutsideShoot);
    this.enemyShoots.forEach(this, this.destroyOutsideShoot);
    this.checkEnemies();

    this.enemyShoot();

    this.enemies.forEach(this, this.moveEnemy);

    this.lose();
    this.win();
  };

  // #endregion

  // #region lost state

  lostState.preload = function() {
    console.log('preload loststae');
  };

  lostState.create = function() {
    Kiwi.State.prototype.create.call(this);

    this.background = new Kiwi.GameObjects.StaticImage(
      this,
      this.textures.background,
      0,
      0
    );
    this.playButton = new Kiwi.HUD.Widget.Button(
      this.game,
      'Play Again',
      this.game.stage.width / 2 - 116,
      this.game.stage.height / 2 - 39
    );
      

    this.game.huds.defaultHUD.addWidget(this.playButton);

    this.playButton.style.color = 'white';
    this.playButton.style.fontSize = '2em';
    this.playButton.style.backgroundColor = 'black';
    this.playButton.style.padding = '20px 30px';
    this.playButton.style.cursor = 'pointer';

    this.playButton.input.onDown.add(this.buttonPressed, this);
    this.addChild(this.background);
  };

  lostState.update = function() {};

  lostState.buttonPressed = function() {
    this.game.huds.defaultHUD.removeAllWidgets();

    this.game.states.switchState('state');
  };
  // #endregion

  game.states.addState(state);
  game.states.addState(lostState);

  game.states.switchState('state');
})();
