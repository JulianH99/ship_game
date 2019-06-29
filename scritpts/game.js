(function() {
    const game = new Kiwi.Game();

    const state = new Kiwi.State("state");

    state.preload = function() {
        Kiwi.State.prototype.preload.call(this);
        this.addSpriteSheet('shipSprite', 'images/ship.png', 45, 31);
        this.addSpriteSheet('shoot', 'images/shoot.png', 28, 28);
        this.addImage('background','images/back.jpg');

        this.SHOOTS_NUMBER = 20;
    }

    state.create = function() {
        Kiwi.State.prototype.create.call(this);

        this.background = new Kiwi.GameObjects.StaticImage( this, this.textures.background, 0, 0 );

        this.character = new Kiwi.GameObjects.Sprite( this, this.textures.shipSprite, 350, 530 );


        this.shoots = new Kiwi.Group(this);

        

        for (let i = 0; i < this.SHOOTS_NUMBER; i++) {
            const bullet = new Kiwi.GameObjects.Sprite( this, this.textures.shoot, 350, -100 );

            this.shoots.addChild(bullet);

            bullet.anchorPointX = this.character.width * 0.5;
            bullet.anchorPointY = this.character.height * 0.5;

            bullet.physics = bullet.components.add(new Kiwi.Components.ArcadePhysics(bullet, bullet.box));

            bullet.alive = false;
        }

        this.upKey = this.game.input.keyboard.addKey( Kiwi.Input.Keycodes.W );
        
        this.downKey = this.game.input.keyboard.addKey( Kiwi.Input.Keycodes.S );

        this.spaceKey = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.SPACEBAR);



        this.addChild(this.background);
        this.addChild(this.character);
        this.addChild(this.shoots);
    }


    state.getFirstDeadBullet = function() {
        var bullets = this.shoots.members;

        for (var i = bullets.length - 1; i >= 0; i--) {
            if ( !bullets[i].alive ) {
                return bullets[i];
            }
        };
        return null;
    }

    state.update = function () {
        Kiwi.State.prototype.update.call( this );
        

        if(this.spaceKey.justPressed()) {
            var bullet = this.getFirstDeadBullet();

            console.log(this.shoots.members);

            // If there aren't any bullets available then don't shoot
            if (bullet === null || bullet === undefined) return;
        
            // Revive the bullet
            // This makes the bullet "alive"
            bullet.alive = true;
        
            // Set the bullet position to the gun position.
            bullet.x = this.character.x;
            bullet.y = this.character.y;
        
            // Shoot it
            bullet.physics.velocity.y = -10;
            bullet.physics.velocity.x = 0;
        }

        
    }

    game.states.addState(state);

    game.states.switchState("state");
})()