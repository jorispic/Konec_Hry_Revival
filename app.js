// canvas API (Konec Hry game)

const startBtn = document.getElementById("startBtn");
const canvas = document.getElementById("myCanvas");
const context = canvas.getContext("2d");
const gameStatus = document.getElementById("gameStatus");
const scoreBoard = document.getElementById("scoreBoard");


startBtn.addEventListener("click", startGame);

const dimensions = {
    width: canvas.width,
    height: canvas.height,
};

const velocity = 1.4;
const angularVel = 0.06;
const probaTransparent = 0.006; // The probability to be transparent evaluated each frame
const frameTransparent = 15;    // Number of Frame when the player stay transparent
const spawnBox = 0.75;  // Proportion of the total box where players can spawn

class Player{
    constructor(color){
        this.color = color;
        this.x = (0.5 * (1 - spawnBox) + Math.random()*spawnBox)*dimensions.width;
        this.y = (0.5 * (1 - spawnBox) + Math.random()*spawnBox)*dimensions.height;
        this.collision = false;
        this.direction = Math.random() * 2 * Math.PI;
        this.path = new Path2D();
        this.path.moveTo(this.x, this.y);
        this.transparent = false;
        this.compteurTranspa = 0;
        this.score = 0;

        this.scoreHTML = document.createElement("label");
        this.scoreHTML.textContent = this.color + " score = ";
        scoreBoard.append(this.scoreHTML);
        scoreBoard.append(document.createElement("br"));
    }

    checkCollision(otherPlayer){
        if(context.isPointInStroke(otherPlayer.path, this.x, this.y)){
            this.collision = true;
            console.log("COLLISION");
        }
        else if(this.x < 0 || this.x > dimensions.width || this.y < 0 || this.y > dimensions.height){
            this.collision = true;
            console.log("SORTIE");
        }
    }

    move(){
        this.x += velocity*Math.cos(this.direction);
        this.y += velocity*Math.sin(this.direction);
        if(this.compteurTranspa == 0){
            this.transparent = randTrue(probaTransparent);
        }
        if(this.transparent){
            this.compteurTranspa = frameTransparent;
            this.transparent = false;
        }
        this.score += 1;
        this.scoreHTML.textContent = this.color + " score = " + this.score;
    }

    drawPath(){
        if(this.compteurTranspa > 0){
            this.path.moveTo(this.x, this.y);
            this.compteurTranspa -= 1;
        }
        else{
            this.path.lineTo(this.x, this.y);
            context.strokeStyle = this.color;
            context.stroke(this.path);
        }
    }

    resetPlayer(){
        this.x = (0.5 * (1 - spawnBox) + Math.random()*spawnBox)*dimensions.width;
        this.y = (0.5 * (1 - spawnBox) + Math.random()*spawnBox)*dimensions.height;
        this.direction = Math.random() * 2 * Math.PI;
        this.collision = false;
        this.path = new Path2D();
        this.path.moveTo(this.x, this.y);
        this.transparent = false;
        this.compteurTranspa = 0;
    }

    turnLeft(){
        this.direction -= angularVel;
    }

    turnRight(){
        this.direction += angularVel;
    }
}


let timerId = null;


let player1 = new Player("red");
let player2 = new Player("green");
let player3 = new Player("blue");


let players = [player1, player2, player3];

let playersInGame = [];

const controller = {
    37: {pressed: false, func: player1.turnLeft.bind(player1)},
    39: {pressed: false, func: player1.turnRight.bind(player1)},
    65: {pressed: false, func: player2.turnLeft.bind(player2)},
    90: {pressed: false, func: player2.turnRight.bind(player2)},
    66: {pressed: false, func: player2.turnLeft.bind(player3)},
    78: {pressed: false, func: player2.turnRight.bind(player3)},
}

document.addEventListener("keydown", e => {
    if(controller[e.keyCode]){
        controller[e.keyCode].pressed = true;
    }
    console.log(e.keyCode);
})

document.addEventListener("keyup", e => {
    if(controller[e.keyCode]){
        controller[e.keyCode].pressed = false;
    }
})

const executeTurns = () => {
    Object.keys(controller).forEach(key => {
        controller[key].pressed && controller[key].func();
    })
}


function startGame(){

    if(timerId != null){
        clearInterval(timerId);
        timerId = null;
    }

    gameStatus.textContent = "";

    context.clearRect(0, 0, dimensions.width, dimensions.height);
    context.lineWidth = 3;

    // Reset player status
    players.forEach(element => element.resetPlayer());
    playersInGame = [...players];
    

    timerId = setInterval(frame, 20);

    function frame(){
        if(playersInGame.length == 0){
            clearInterval(timerId);
            timerId = null;
            gameStatus.textContent = "GAME OVER!      Press start to replay";
        }
        else{
            executeTurns();

            playersInGame.forEach(element => element.move());

            playersInGame.forEach(element1 => {
                players.forEach(element2 => element1.checkCollision(element2));
                if(element1.collision){
                    let index = playersInGame.indexOf(element1);
                    playersInGame.splice(index, 1);
                    console.log(playersInGame);
                }
            });
            
            playersInGame.forEach(element => element.drawPath());
        }
    }
}

function randTrue(p){
    // Fonction qui renvoie true avec une certaine probabilité p et false sinon
    let randNum = Math.random();
    
    if(randNum < p){
        return true;
    }
    else{
        return false;
    }
}
