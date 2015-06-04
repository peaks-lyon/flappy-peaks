const SAFE_ZONE_HEIGHT = 1000;
const SAFE_ZONE_WIDTH = 640;
const INITIAL_DELTA_PIPES = 450;
const MIN_DELTA_PIPES = 300;
const DELTA_VELOCITY = 10;
const DELTA_PIPES = 10;
const MODULO_PIPES = 3;

var ratio = window.innerHeight / 1000;

var width = (window.innerWidth / ratio > SAFE_ZONE_WIDTH) ? window.innerWidth / ratio : SAFE_ZONE_WIDTH;

var game = new Phaser.Game(width, SAFE_ZONE_HEIGHT, Phaser.AUTO, 'flappyBird');
game.transparent = true;

var gameState = {};
// On crée une variable "load" à notre objet gameState
gameState.load = function() { };
gameState.load.prototype = {
    preload: function() {
        this.game = game;

        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;
        this.game.scale.refresh();

        /**** SPRITES *****/
        // bird - png et json
        this.game.load.atlasJSONHash('bird', 'img/bird.png', 'data/bird.json');

        // background
        this.game.load.image('background', 'img/background.png');

        // sol
        this.game.load.image('ground', 'img/ground.png');

        // tuyaux
        this.game.load.image('pipe', 'img/pipe.png');

        // bout des tuyaux
        this.game.load.image('pipeEndTop', 'img/pipe-end-top.png');
        this.game.load.image('pipeEndBottom', 'img/pipe-end-bottom.png');

        // ceiling
        this.game.load.image('ceiling', 'img/ceiling.png');

        // Chiffres pour le score
        this.game.load.atlasJSONHash('numbers', 'img/numbers.png', 'data/numbers.json');

        // Image "Get Ready"
        this.game.load.image('ready', 'img/ready.png');

        // Image "Game Over"
        this.game.load.image('gameOver', 'img/game-over.png');

        // Boutons
        this.game.load.image('buttonPlay', 'img/button-play.png');
        this.game.load.image('buttonRegister', 'img/button-register.png');

        /**** AUDIO *****/

        // Quand l'oiseau touche le sol ou un tuyau
        this.game.load.audio('hit', ['sons/hit.wav', 'sons/hit.ogg']);

        // Quand l'oiseau tombe après touché un tuyau
        this.game.load.audio('fall', ['sons/fall.wav', 'sons/fall.ogg']);

        // Quand l'oiseau vole
        this.game.load.audio('flap', ['sons/flap.wav', 'sons/flap.ogg']);

        // Quand l'oiseau dépasse un tuyau
        this.game.load.audio('point', ['sons/point.wav', 'sons/point.ogg']);

        // Quand on clique sur le bouton play
        this.game.load.audio('menu', ['sons/menu.wav', 'sons/menu.ogg']);
    },

    create: function() {
        game.state.start('main');
    }
};

gameState.main = function() { };
gameState.main.prototype = {
    create: function() {
        this.gameStart = false;
        this.gameEnd = false;

        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        this.gameVelocity = -250;
        this.deltaPipes = 0;

        /**** SPRITES ****/

        // création de l'arrière-plan
        this.background = this.game.add.sprite(0, 0, 'background');
        this.background.width = this.game.world.width;
        this.background.height = this.game.world.height;

        // Tuyaux
        this.pipes = game.add.group();
        this.pipes.createMultiple(60, 'pipe');
        this.pipesEndTop = game.add.group();
        this.pipesEndTop.createMultiple(6, 'pipeEndTop');
        this.pipesEndBottom = game.add.group();
        this.pipesEndBottom.createMultiple(6, 'pipeEndBottom');

        this.game.physics.enable(this.pipes);
        this.game.physics.enable(this.pipesEndTop);
        this.game.physics.enable(this.pipesEndBottom);

        this.arrayPipes = new Array();

        // Ceiling
        this.ceiling = this.game.add.sprite(0, 0, 'ceiling');
        this.ceiling.width = this.game.world.width * 2;
        this.game.physics.enable(this.ceiling);
        this.ceiling.body.immovable = true;
        this.ceiling.body.velocity.x = -250;
        this.ceiling.body.rebound = false;

        // création du sol
        this.ground = this.game.add.sprite(0, 0, 'ground');
        this.ground.y = this.game.world.height - this.ground.height + this.ceiling.height;
        this.ground.width = this.game.world.width * 2;

        this.game.physics.enable(this.ground);
        this.ground.body.immovable = true;
        this.ground.body.velocity.x = -250;
        this.ground.body.rebound = false;

        // Création de l'oiseau en tant que sprite dans le jeu avec coordonnées x = 200px et y = 0
        this.bird = this.game.add.sprite(200, 0, 'bird');
        this.bird.width = this.bird.width / 6.5;
        this.bird.height = this.bird.height / 6.5;
        this.bird.y = this.game.world.height / 2 - this.bird.height / 2;
        this.game.physics.enable(this.bird);

        this.bird.body.rebound = false;
        this.bird.anchor.setTo(0.5, 0.5);
        this.birdHitGround = false;
        this.birdHitPipe = false;
        // Rotation du polygone de l'oiseau
        this.birdRotatePolygon = 0;

        // Tuyaux à vérifier pour savoir si l'oiseau l'a dépassé (permet d'augmenter le score)
        // On vérifiera toujours le premier élément seulement
        this.pipesToCheckForScore = new Array();
        // Tuyaux à vérifier pour savoir quand ajouter un tuyau
        // On vérifiera toujours le premier élément seulement
        this.pipesToCheckForAdd = new Array();

        // Score
        this.score = 0;
        this.spritesScore = new Array();
        var spriteScore = this.game.add.sprite(this.game.width / 2, 100, 'numbers');
        this.spritesScore.push(spriteScore);
        this.spritesScore[0].animations.add('number');
        this.spritesScore[0].animations.frame = 0;
        this.spritesScore[0].x -= this.spritesScore[0].width / 2;

        // Image "ready"
        this.ready = this.game.add.sprite(this.game.width / 2, 250, 'ready');
        this.ready.x -= this.ready.width / 2;

        // Image "gameOver"
        this.gameOver = this.game.add.sprite(this.game.width / 2, 300, 'gameOver');
        this.gameOver.x -= this.gameOver.width / 2;
        this.gameOver.alpha = 0;

        // Bouton play
        this.buttonPlay = this.game.add.sprite(this.game.width / 2, 430, 'buttonPlay');
        this.buttonPlay.x -= this.buttonPlay.width / 2;
        this.buttonPlay.alpha = 0;
        this.buttonPlay.inputEnabled = true;// Bouton play

        // Bouton register
        this.buttonRegister = this.game.add.sprite(this.game.width / 2, 580, 'buttonRegister');
        this.buttonRegister.x -= this.buttonRegister.width / 2;
        this.buttonRegister.alpha = 0;
        this.buttonRegister.inputEnabled = true;

        // On ajoute l'animation du battement des ailes, animation contenu dans le JSON
        this.bird.animations.add('fly');
        // On fait démarrer l'animation, avec 8 images par seconde et répétée en boucle
        this.bird.animations.play('fly', 8, true);

        // On ajoute l'animation qui va permettre à l'oiseau de flotter dans les airs
        this.tweenFlap = this.game.add.tween(this.bird);
        this.tweenFlap.to({ y: this.bird.y + 20}, 400, Phaser.Easing.Quadratic.InOut, true, 0, 10000000000, true);

        // Au click, on appelle la fonction "start()"
        this.game.input.onTap.add(this.start, this);

        /**** AUDIO ****/

        this.soundHit = game.add.audio('hit', 1);
        this.soundFall = game.add.audio('fall', 1);
        this.soundFlap = game.add.audio('flap', 1);
        this.soundPoint = game.add.audio('point', 1);
        this.soundMenu = game.add.audio('menu', 1);

        this.registerModal = new Modal('#modalRegisterForm');
    },

    start: function() {
        // on fait disparaître le ready
        this.game.add.tween(this.ready).to( { alpha: 0 }, 500).start();

        this.gameStart = true;

        // On supprime l'événement qui se déclenchait au click sur le jeu
        this.game.input.onTap.removeAll();
        // Pour ajouter le jump à l'événement down sur le jeu
        this.game.input.onDown.add(this.jump, this);

        // gravité
        this.bird.body.gravity.y = 2000;
        this.bird.body.velocity.y = -500; // l'oiseau saute moins haute => plus facile entre les pipes

        this.soundFlap.play();

        this.birdInJump = true;
        this.tweenFlap.stop();
        this.bird.animations.stop('fly');
        this.bird.animations.play('fly', 15, true);

        // On fait sauter l'oiseau au démarrage du jeu
        this.tweenJump = game.add.tween(this.bird);
        this.tweenJump.to({rotation: -Math.PI / 8}, 100, Phaser.Easing.Default, true);

        // Timer qui va appeler la méthode addGroupPipes au bout de 1.5 secondes
        this.timer = this.game.time.events.loop(1500, this.addGroupPipes, this);
    },

    jump: function() {
        // Quand l'oiseau est encore visible (ne dépasse pas le haut de l'écran)
        if(this.bird.y + this.bird.height >= 0) {

            this.soundFlap.play();

            // On note que l'oiseau est dans l'action jump
            this.birdInJump = true;
            // Saut
            this.bird.body.velocity.y = -600;

            // On stop l'animation de rotation quand l'oiseau tombe
            if(this.tweenFall != null)
                this.tweenFall.stop();

            // On ajoute l'animation de rotation quand l'oiseau saute
            this.tweenJump = game.add.tween(this.bird);
            this.tweenJump.to({rotation: -Math.PI / 8}, 100).start();

            // On relance l'animation de battements d'ailes (coupée lorsque l'oiseau tombe)
            this.bird.animations.play('fly');
            this.bird.animations.frame = 0;
        }
    },

    update: function() {
        // On répète le sol
        if(this.ground.body.center.x <= 0) {
            this.ground.x = 0;
        }

        // On répète le plafond
        if(this.ceiling.body.center.x <= 0) {
            this.ceiling.x = 0;
        }

        if(this.gameStart) {
            // Quand l'oiseau retombe après un jump
            // Donc quand la vitesse vers le haut atteint 0 (à cause de la gravité)
                if(this.bird.body.velocity.y > 0 && this.birdInJump) {
                    this.birdInJump = false;

                    // on stop l'animation de rotation quand l'oiseau saute
                    if(this.tweenJump != null)
                        this.tweenJump.stop();

                    // On ajoute l'animation de rotation quand l'oiseau tombe
                    // On la fait démarrer avec un délai de 200 ms
                    this.tweenFall = this.game.add.tween(this.bird);
                    this.tweenFall.to({rotation: Math.PI / 2}, 500).start();

                    var self = this;
                    // Lorsque l'animation de rotation "tweenFall" commence
                    this.tweenFall.onStart.add(function() {
                        // On stop l'animation des battements d'ailes
                        self.bird.animations.stop('fly');
                        self.bird.animations.frame = 1;
                    });
                }
            // Si l'oiseau touche le sol
            this.game.physics.arcade.collide(this.bird, this.ground, this.hitGround, null, this);
            // Si l'oiseau touche le plafond
            this.game.physics.arcade.collide(this.bird, this.ceiling, this.setFriction, null, this);
            // Si l'oiseau touche un tuyau
            this.game.physics.arcade.collide(this.bird, this.pipes, this.hitPipe, null, this);
            // Si l'oiseau touche le bout d'un tuyau
            this.game.physics.arcade.collide(this.bird, this.pipesEndTop, this.hitPipe, null, this);
            this.game.physics.arcade.collide(this.bird, this.pipesEndBottom, this.hitPipe, null, this);

            // Si l'oiseau dépasse un tuyau
            if(this.pipesToCheckForScore.length != 0 && this.pipesToCheckForScore[0].x + this.pipesToCheckForScore[0].width / 2 < this.bird.body.center.x) {

                this.soundPoint.play();

                this.pipesToCheckForScore.splice(0, 1);
                this.score++;

                if(this.score % MODULO_PIPES == 0) {
                    this.gameVelocity -= DELTA_VELOCITY;
                    this.deltaPipes = ((INITIAL_DELTA_PIPES - this.deltaPipes) <= MIN_DELTA_PIPES) ? MIN_DELTA_PIPES : this.deltaPipes + DELTA_PIPES;

                    this.ground.body.velocity.x = this.gameVelocity;
                    this.ceiling.body.velocity.x = this.gameVelocity;

                    for (var i = 0; i < this.pipes.children.length; i++) {
                        this.pipes.children[i].body.velocity.x = this.gameVelocity;
                    }

                    for (var i = 0; i < this.pipesEndTop.children.length; i++) {
                        this.pipesEndTop.children[i].body.velocity.x = this.gameVelocity;
                    }

                    for (var i = 0; i < this.pipesEndBottom.children.length; i++) {
                        this.pipesEndBottom.children[i].body.velocity.x = this.gameVelocity;
                    }
                }

                // on découpe le nombre en des chiffres individuels
                var digits = this.score.toString().split('');
                var widthNumbers = 0;

                for(var j = 0; j < this.spritesScore.length; j++)
                    this.spritesScore[j].kill();
                this.spritesScore = new Array();

                // on met en forme le score avec les sprites
                for(var i = 0; i < digits.length; i++) {
                    var spriteScore = this.game.add.sprite(widthNumbers, 100, 'numbers');
                    spriteScore.animations.add('number');
                    spriteScore.animations.frame = +digits[i];
                    this.spritesScore.push(spriteScore);
                    widthNumbers += spriteScore.width;
                }

                // on centre le score
                for(var i = 0; i < this.spritesScore.length; i++) {
                    this.spritesScore[i].x += this.game.width / 2 - widthNumbers / 2;
                }
            }

            // On rajoute un tuyau tous les INITIAL_DELTA_PIPES - this.deltaPipes pixel
            if(this.pipesToCheckForAdd.length != 0 && this.pipesToCheckForAdd[0].x + this.pipesToCheckForAdd[0].width / 2 < (this.game.world.width - (INITIAL_DELTA_PIPES - this.deltaPipes))) {
                this.pipesToCheckForAdd.splice(0, 1);
                // On ajoute un nouveau tuyau
                this.addGroupPipes();
            }

            for(var i = 0; i < this.arrayPipes.length; i++) {
                // si les bouts de tuyau du tuyau i se trouvent en dehors de la fenêtre (à gauche)
                if(this.arrayPipes[i][0].x + this.arrayPipes[i][0].width < 0) {
                    // on les supprime
                    for(var j = 0; j < this.arrayPipes[i].length; j++) {
                        this.arrayPipes[i][j].kill();
                    }
                }
            }
        }
    },

    // Permet d'ajouter un morceau de tuyau
    addPieceOfPipe: function(x, y, i, hole, nbPipe) {
        // On prend le premier élément "mort" du groupe pipes
        var pipe = this.pipes.getFirstDead();
        if(pipe) {
            // On change la position du bout de tuyau
            pipe.reset(x, y);
            // On change la vitesse pour qu'il se déplace en même temps que le sol
            pipe.body.velocity.x = this.gameVelocity;
            pipe.body.immovable = true;
            pipe.body.rebound = false;

            // on enregistre les tuyaux présents sur le terrain dans un tableau
            // this.arrayPipes[index] = tuyau index en entier
            // this.arrayPipes[index][2] = bout n°2 du tuyau index
            if(i == 0) {
                this.pipesToCheckForScore.push(pipe);
                this.pipesToCheckForAdd.push(pipe);
                this.arrayPipes.push(new Array());
                this.arrayPipes[this.arrayPipes.length - 1].push(pipe);
            } else {
                this.arrayPipes[this.arrayPipes.length - 1].push(pipe);
            }

            // Si le trou est juste avant ou juste après, on place les pipeEnd
            if(i == hole + 2 || i == hole - 2) {
                var pipeEnd;

                if(i == hole + 2) {
                    // On prend le premier élément "mort" du groupe pipesEndTop
                    pipeEnd = this.pipesEndTop.getFirstDead();
                } else {
                    // On prend le premier élément "mort" du groupe pipesEndBottom
                    pipeEnd = this.pipesEndBottom.getFirstDead();
                }

                // On change la position du bout de tuyau
                pipeEnd.reset(x - 4, y);
                // On change la vitesse pour qu'il se déplace en même temps que le sol
                pipeEnd.body.velocity.x = this.gameVelocity;
                pipeEnd.body.immovable = true;
                pipeEnd.body.rebound = false;

                var pipesTemp = this.arrayPipes[this.arrayPipes.length - 1];
                pipesTemp[pipesTemp.length - 1].kill();
                pipesTemp.splice(pipesTemp.length, 1);
                pipesTemp.push(pipeEnd);
            }
        }
    },

    // On ajoute un groupe (une colonne) de 12 tuyaux avec un trou quelque part au milieu
    addGroupPipes: function() {
        // On supprime le timer qui ne nous sert plus à rien
        this.game.time.events.remove(this.timer);

        var nbPiecesOfPipes = 12;
        var hole = Math.round(Math.random() * (nbPiecesOfPipes - 7)) + 3;

        for (var i = 0; i <= nbPiecesOfPipes; i++)
            if (i > hole + 1 || i < hole - 1)
                this.addPieceOfPipe(this.game.world.width, this.game.world.height - this.ground.height + this.ceiling.height - i * this.game.world.height / nbPiecesOfPipes, i, hole);
    },

    hitGround: function() {
        if(!this.birdHitGround) {
            this.bird.body.gravity.y = 0;
            this.bird.body.velocity.y = 0;

            if(!this.birdHitPipe)
                this.soundHit.play();

            this.gameFinish();

            this.birdHitGround = true;
            this.bird.animations.stop('fly');
        }
    },

    hitPipe: function() {
        if(!this.birdHitPipe) {
            this.soundHit.play();
            var self = this;
            setTimeout(function(){self.soundFall.play();}, 300);

            this.gameFinish();

            this.birdHitPipe = true;
        }
    },

    setFriction: function () {
        this.bird.body.x -= this.ceiling.body.x - this.ceiling.body.prev.x;
    },

    gameFinish: function() {
        // on arrête le sol
        this.ground.body.velocity.x = 0;

        // on arrête le ceiling
        this.ceiling.body.velocity.x = 0;

        // on arrête les tuyaux
        for(var i = 0; i < this.arrayPipes.length; i++)
            for(var j = 0; j < this.arrayPipes[i].length; j++)
                this.arrayPipes[i][j].body.velocity.x = 0;

        this.game.input.onDown.removeAll();

        this.gameEnd = true;

        // on fait apparaitre le game over et le bouton play
        this.game.add.tween(this.gameOver).to( { alpha: 1 }, 300, Phaser.Easing.Default, true);
        this.game.add.tween(this.buttonPlay).to( { alpha: 1 }, 300, Phaser.Easing.Default, true);
        this.game.add.tween(this.buttonRegister).to( { alpha: 1 }, 300, Phaser.Easing.Default, true);
        this.bird.body.checkCollision.down = false;

        var self = this;

        // Evénements sur le bouton play
        this.buttonPlay.events.onInputDown.add(function() {
            self.buttonPlay.y += 10;
        });
        this.buttonPlay.events.onInputUp.add(function() {
            self.buttonPlay.y -= 10;
            self.restart();
        });

        // Evénements sur le bouton register
        this.buttonRegister.events.onInputDown.add(function() {
            self.buttonRegister.y += 10;
        });
        this.buttonRegister.events.onInputUp.add(function() {
            self.buttonRegister.y -= 10;
            document.querySelector('#score').value = self.score;
            self.registerModal.show();
        });

        // On supprime le timer
        this.game.time.events.remove(this.timer);
    },

    restart: function() {
        this.soundMenu.play();
        // On redémarre la partie
        this.game.state.start('main');
    }
};

// On ajoute les 2 objet load et main à notre objet Phaser
game.state.add('load', gameState.load);
game.state.add('main', gameState.main);
// Il ne reste plus qu'à lancer l'état "load"
game.state.start('load');
