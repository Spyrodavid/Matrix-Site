
const canvas = document.getElementById("bordCanvas");
const ctx = canvas.getContext("2d");

const fps = document.getElementById("fps");

width = window.innerWidth
height = window.innerHeight

canvas.width  = width;
canvas.height = height;

math.DenseMatrix.prototype.x = function () {
    return this.get([0]);
}

math.DenseMatrix.prototype.y = function () {
    return this.get([1]);
}

math.DenseMatrix.prototype.z = function () {
    return this.get([2]);
}

var baseBord = {
    pos: math.matrix([width / 2, height / 2]),
    vel: math.matrix([0, 5]),
    accel: math.matrix([0, 0]),
    angle: 0,
    speed: 0,
    Hue: 192,
    Lightness: 45,
    radius: 20

}

var bordArray = []


// Set the fill style and color background
ctx.fillStyle = "black";
ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

var programStart = Date.now()

var t1 = Date.now()
var t2 = Date.now()


function makeBord() {

    var newbord = {...baseBord}
    
    newbord.pos = math.matrix([Math.random() * width, Math.random() * height])

    randAngle = Math.random() * Math.PI * 2
    newbord.vel = math.matrix([Math.cos(randAngle), Math.sin(randAngle)])
    bordArray.push(newbord)
}

for (let index = 0; index < 30; index++) {
    makeBord()
}  

framesInSecond = []

function MainLoop() {

    if (canvas.classList.contains("paused")) {
        setTimeout(MainLoop, 10)
        return
    }


    t1 = Date.now()
    var frameTime = t1 - t2
    t2 = Date.now()

    framesInSecond.push(Date.now())
    framesInSecond = framesInSecond.filter(time => time + 1000 > Date.now())

    let timeElapsed = t2 - programStart

    fps.innerText = framesInSecond.length
    
    

    //console.log(frameTime)

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

    for (let index = 0; index < bordArray.length; index++) {
        const bord = bordArray[index];

        
        bord.vel = math.divide(bord.vel, math.hypot(bord.vel))
        

        // cohesion

        averagePosition = math.matrix([0, 0])

        cohesionForce = math.matrix([0, 0])

        seperationForce = math.matrix([0, 0])

        alignmentForce = math.matrix([0, 0])
        averageVelocity = math.matrix([0, 0])

        inRange = 0

        for (let index = 0; index < bordArray.length; index++) {
            const targetBord = bordArray[index];

            var dist = math.hypot(math.subtract(bord.pos, targetBord.pos))

            if (dist < 300) {
                averagePosition = math.add(averagePosition, targetBord.pos)
                averageVelocity = math.add(averageVelocity, targetBord.vel)
                seperationForce = math.add(seperationForce, math.subtract(bord.pos, targetBord.pos))
                inRange ++
            }
        }


        averagePosition = math.divide(averagePosition, inRange)

        cohesionForce = math.subtract(averagePosition, bord.pos)


        if (math.hypot(cohesionForce) > 0)
            cohesionForce = math.divide(cohesionForce, math.hypot(cohesionForce))

        cohesionForce = math.multiply(cohesionForce, 1000)

        if (math.hypot(seperationForce) > 0)
            seperationForce = math.divide(seperationForce, math.hypot(seperationForce))

        seperationForce = math.multiply(seperationForce, 1)

        
        if (math.hypot(alignmentForce) > 0)
            alignmentForce = math.divide(averageVelocity, math.hypot(averageVelocity))

        alignmentForce = math.multiply(averageVelocity, 10000)


        bord.vel = math.add(bord.vel, alignmentForce)

        bord.vel = math.add(bord.vel, seperationForce)

        bord.vel = math.add(bord.vel, cohesionForce)



        bord.pos = math.add(bord.pos, bord.vel)

        if (outsideBounds1D(bord.pos.x(), width)) {
            bord.pos.set([0], wrapMod(bord.pos.x(), width))
        }

        if (outsideBounds1D(bord.pos.y(), height)) {
            bord.pos.set([1], wrapMod(bord.pos.y(), height))
        }
        

        
        ctx.beginPath();
        ctx.arc(bord.pos.x(), bord.pos.y(), bord.radius, 0, 2 * Math.PI);

        if (math.distance([0, 0], bord.vel) != 0) {
            ctx.moveTo(bord.pos.x(), bord.pos.y())
            normalized = math.divide(bord.vel, math.hypot(bord.vel))
            angleVector = math.multiply(normalized, bord.radius)
            angleEndPos = math.add(angleVector, bord.pos)
            ctx.lineTo(angleEndPos.x(), angleEndPos.y())
        }
        
        ctx.strokeStyle = `hsl(${bord.Hue}, 100%, ${bord.Lightness}%)`
        ctx.stroke();
        
        
    }
    

    setTimeout(MainLoop, 10)

}
MainLoop()


function* pointsInCircle(x, y, r) {
    r++
    x = Math.floor(x)
    y = Math.floor(y)

    for (let xpos = x - r; xpos <= x + r; xpos++) {
        for (let ypos = y - r; ypos <= y + r; ypos++) {
            
            if (((x - xpos) ** 2) + ((y - ypos) ** 2) < r ** 2) {
                
                yield new Vector(xpos, ypos)
            }
        }
    }

}

function Dimension2to1(x, y, width) {
    return  Math.floor(x + y * width)
}

function Dimension1to2(i, width) {
    return [Math.floor(x % width), Math.floor(Math.floor(i / width))]
}

function outsideBounds(x, y, width, height, r=0) {
    outX = (x + r < 0 || x - r > width)
    outY = (y + r < 0 || y - r > height)

    return outX || outY
}

function outsideBounds1D(x, width, r=0) {
    return out = (x + r < 0 || x - r > width)
}

function wrapMod(x, mod) {
    return ((x % mod) + mod) % mod
}

Array.prototype.random = function () {
    return this[Math.floor((Math.random()*this.length))];
}