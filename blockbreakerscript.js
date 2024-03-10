let canvas = document.getElementById("canvas");
let context = canvas.getContext('2d');

let shooting = false;
let aiming = true;

let usernumballs = 5;
let ballstoshoot;
let ballsonscreen;
let balls = [];
let blocks = [];

let blockhealth;
let round;

let hoverx;
let hovery;

let clickx;
let clicky;

let originx = 245;
let originy = 635;

let blockwidth = 67;
let blockheight = 67;

let gridID = {row: "row", column: "column", x: "x", y: "y"};
let gridlist = [];

//handles passing the location of the mouse
canvas.addEventListener('mousemove', function(event) {
    let clientrect = canvas.getBoundingClientRect();
    hoverx = event.clientX - clientrect.left;
    hovery = event.clientY - clientrect.top;
    drawaim(hoverx, hovery, originx, originy);
});


let shootdelay;
//handles shooting
canvas.addEventListener('click', function(event) { 
    let clientrect = canvas.getBoundingClientRect();
    clickx = event.clientX - clientrect.left;
    clicky = event.clientY - clientrect.top;
    shooting = true;


    ballstoshoot = usernumballs;
    shootdelay = setInterval(() => {
        if (ballstoshoot > 0) {
            let shootangle = Math.atan2(clicky - originy, clickx - originx);
            let shotspeed = 5;
            let dx = Math.cos(shootangle) * shotspeed;
            let dy = Math.sin(shootangle) * shotspeed;

            balls.push({x: originx, y: originy, dx: dx, dy: dy});

            ballstoshoot--;
        }
        else {
            clearInterval(shootdelay);
        }
    }, 200); 
});

//dimensions of grid are 7 possible blocks per row and 8 blocks per column. Columns start one block from top of game 
function creategrid() {

    //can access gridlist as gridlist[row][column].x .y .blockhere
    for(let rowi = 0; rowi < 8; rowi++) {
        let rowlist = [];
        for (let columni = 0; columni < 7; columni++) {
            let tempx = 0.5 + columni * 70;
            let tempy = 65.5 + rowi * 70;
            rowlist.push({x: tempx, y: tempy, blockhere: false});
        }
        gridlist.push(rowlist);
    }
}


//draws a fading line to help with aim
function drawaim(aimx, aimy, originx, originy) {
    if (originx === undefined || originy === undefined) {
        originx = 245;
        originy = 635;
    }

    context.beginPath();
    context.moveTo(originx, originy);
    context.lineTo(aimx, aimy);
    context.lineWidth = "5";
    context.strokeStyle = "black";
    context.stroke();
     
}


function drawball(x,y) {
    context.beginPath(); 
    context.arc(x,y,5,0, Math.PI * 2, true);
    context.fillStyle = "white";
    context.fill();
}

//spawn blocks
function createblocksfirstrow(round) {
    let difficulty_blockspawn = round / 10;

    //number of blocks to create in new row
    for(let i = 0; i < 7; i++) {
        let chanceofblockspawn = Math.random() + difficulty_blockspawn;
        let blockhealth = round + 1 + (Math.random() - 0.5) * (round / 5); 
        if (chanceofblockspawn > 0.5) {
           gridlist[0][i].blockhere = true;
           blockhealth = Math.floor(blockhealth);
           gridlist[0][i].blockhealth = blockhealth;
        }       
    }
}

function drawblocks() {
    context.font = "32px Arial";
    context.textAlign = "center";
    context.textBaseline = "center";
    for (let row = 0; row < 8; row++) {
        for (let column = 0; column < 7; column++) {
            let gridblock = gridlist[row][column];
            if (gridblock.blockhere) {
                context.fillStyle = "red";
                context.fillRect(gridblock.x, gridblock.y, blockwidth, blockheight);

                context.fillStyle = "white";
                let textX = gridblock.x + blockwidth /2;
                let textY = gridblock.y + blockwidth /2 + 10;

                context.fillText(gridblock.blockhealth, textX, textY);

                if (gridblock.blockhealth === 0) {
                    gridblock.blockhere = false;
                }
            }
        }
    }
}


//populate grid array
creategrid();
createblocksfirstrow(1);

//main animation function
function animate() {
    context.clearRect(0,0, canvas.width, canvas.height);
    context.fillStyle = "grey";
    context.fillRect(0,0,490,635);

    drawblocks();



    if (shooting) {
        aiming = false;
    
        balls.forEach(ball => {
            ball.x = ball.x + ball.dx;
            ball.y = ball.y + ball.dy;


            //store next position of ball for collision purposes
            let nextx = ball.x + ball.dx;
            let nexty = ball.y + ball.dy;


            drawball(ball.x, ball.y);

            if (ball.x < 2 || ball.x > 488) {
                ball.dx = -ball.dx;
            }  
            else if (ball.y < 2) {
                ball.dy = - ball.dy;
            }
            gridlist.forEach(row => {
                row.forEach(block => {
                    if(block.blockhere) {
                        if (nextx + 2 >= block.x && nextx - 2 <= block.x + blockwidth && nexty + 5 >= block.y && nexty - 5 <= block.y+ blockheight) {
                            let leftsidecollision = ball.x - ball.dx < block.x;
                            let rightsidecollision = ball.x - ball.dx > block.x + blockwidth;
                            let topcollision = ball.y - ball.dy < block.y;
                            let bottomcollision = ball.y - ball.dy > block.y + blockheight;
                        
                            if (leftsidecollision || rightsidecollision) {
                                ball.dx = -ball.dx;
                            }
                            else if (topcollision || bottomcollision) {
                                ball.dy = -ball.dy
                            }
                            //decrease block health
                            block.blockhealth = block.blockhealth - 1;
                        }
                        }
            
                }); 
        
            });
        });
    }
    else {
        aiming = true;
    }

    if (aiming) {
        drawaim(hoverx, hovery, originx, originy);
    }
    window.requestAnimationFrame(animate);
}

animate();
