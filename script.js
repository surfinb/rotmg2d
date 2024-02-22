import { map } from "./map.js"
const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d")
ctx.imageSmoothingEnabled = false

const env = new Image()
env.src = "lofiEnvironment.png"
const cha = new Image()
cha.src = "players.png"
const obj = new Image()
obj.src = "lofiObj2.png"

let kys = [false, false, false, false, false]
let dx = 0
let dy = 0
let dir = 1
let autofire = false

const player = { x: 300, y: 300, w: 40, h: 40, s: 0, s2:0, a:0}
const cam = {x: 600, y: 300, w: 800, h: 600, lock: false}
const tile = {x: 0, y: 0, w: 48, h: 48}

addEventListener(
  "keydown",
  function (event) {
    switch (event.key) {
      case "w":
        kys[0] = true
        break
      case "a":
        kys[1] = true
        dir = autofire ? dir : -1
        break
      case "s":
        kys[2] = true
        break
      case "d":
        kys[3] = true
        dir = autofire ? dir : 1
        break
      case " ":
        kys[4] = true
        break
        case "i":
          kys[5] = true
          break
    }
  },
  true
)
addEventListener(
  "keyup",
  function (event) {
    switch (event.key) {
      case "w":
        break
      case "a":
        kys[1] = false
        player.s = 0
        player.s2 = 0
        break
      case "s":
        kys[2] = false
        break
      case "d":
        kys[3] = false
        player.s = 0
        player.s2 = 0
        break
      case " ":
        kys[4] = false
        break
      case "i":
        kys[5] = false
        autofire = autofire ? false : true
        player.s = autofire ? 0 : 40
        break
    }
  },
  true
)

let startCol, endCol, startRow, endRow, offsetX, offsetY, mapx, mapy

function drawMap() {
  startRow = Math.floor(cam.y / tile.w)
  endRow = startRow + 14
  startCol = Math.floor(cam.x / tile.w)
  endCol = startCol + 18
  offsetX = -cam.x + startRow * tile.w
  offsetY = -cam.y + startCol * tile.w
  for (let row = startRow; row < endRow; row++) {
    for (let col = startCol; col < endCol; col++) {
        mapx = (col - startRow) * tile.w + offsetX
        mapy = (row - startCol) * tile.w + offsetY
        tile.x = mapx
        tile.y = mapy
      switch (map[row][col]) {
        case 0:
        break
        case 1:
          ctx.drawImage(env,48,40,8,8,Math.round(mapx),Math.round(mapy),tile.w,tile.h)
        break
        case 2:
          ctx.drawImage(env,48,40,8,8,Math.round(mapx),Math.round(mapy),tile.w,tile.h)
          if (collision(tile, player.x + dx, player.y, player.w, player.h)) {dx = 0}
          if (collision(tile, player.x, player.y + dy, player.w, player.h)) {
          airborne = dy < 0 ? true : airborne
          gravity = 1 
          dy = 0
          player.a = 0
          x = -3
          jump = false
          }
          if (collision(tile, player.x, player.y + 10, player.w, player.h)) {
          airborne = false
          fallSpeed = 2
          gravity = 1
          }
        break
        case 3:
          ctx.drawImage(env,72,32,8,8,Math.round(mapx),Math.round(mapy),tile.w,tile.h)
        break
        case 9:
          if (collision(tile, cam.x + dx -1, cam.y, cam.w, cam.h)) {cam.lock = true}
        break
      }
    }
  }
}

function collision(rect1, rect2x, rect2y, rect2w, rect2h) {
  if (
    rect1.x < rect2x + rect2w &&
    rect1.x + rect1.w > rect2x &&
    rect1.y < rect2y + rect2h &&
    rect1.y + rect1.h > rect2y
  ) {
    return true
  } else {
    return false
  }
}

function drawBackground(){
ctx.fillStyle = `rgb(${0}, ${25}, ${73})`
ctx.fillRect(0,0,800,600)
}

let airborne = true,
 gravity = 1

function move() {
  dy = gravity **2
  gravity += 0.08
  gravity = Math.min(gravity,3)
  if (kys[1]) {
      dx = -4
  }
  if (kys[3]) {
    dx = 4
  }
  if(kys[4] && !jump) {
    jump = true
  }
  if(jump){hop()}
  player.s2++
 if(kys[3] || kys[1]){ if(player.s2 % 20 === 0 && !autofire){ 
  player.s = player.s === 8 ? 0 : 8
}}
}

let jump = false,
fallSpeed = 2,
a = 0.1, c = 2, x = -3

function hop(){
player.a += 0.0775 
x += 0.075
x = Math.min(x,3)
dy =  a * x**3 + c * x
if (airborne) {
fallSpeed += 0.25
dy = fallSpeed
jump = false
}
}

function drawSprite() {
  ctx.save()
  ctx.translate(player.x + player.w / 2, player.y + player.h / 2)
  ctx.rotate(player.a)
  ctx.scale(dir, 1)
  ctx.drawImage(cha,player.s,24,8,8,-player.w / 2,-player.h / 2,player.w,player.h)
  ctx.restore()
}

let mouseX, mouseY, mousex2
canvas.addEventListener("mousemove", (e) => {
  mouseX = e.clientX - canvas.offsetLeft;
  mouseY = e.clientY - canvas.offsetTop;
  mousex2 = mouseX
  mouseX -= player.x
  mouseY -= player.y
})

let lastShot = 0
let canShoot = true
canvas.addEventListener("mousedown", (e) => {
  if (e.button === 0) {
    dir = mousex2 > player.x ? 1 : -1
    autofire = true
    if(canShoot){createProjectile()}
  }
})

canvas.addEventListener("mouseup", (event) => {
  if (event.button === 0) {
    player.s = 0
    dir = kys[3] ? 1 : kys[1] ? -1 : dir
    autofire = false
  }
})

class Projectile {
  constructor(angle, live) {
    this.x = player.x
    this.y = player.y
    this.w = 32
    this.h = 32
    this.fx = 0
    this.fy = 0
    this.lifetime = 0
    this.alive = live
    this.rotation
    this.sine = -Math.sin(angle)
    this.cosine = Math.cos(angle)
    this.time = this.sine > 0 ? -3 : 4
  }
}

let projectiles = Array.from({ length: 5 }, () => new Projectile(0,false))

function shoot() {
  if((lastShot + 40) % 80 === frame){
    autofire ? createProjectile() : canShoot = true
  }
  for (let b = 0; b < projectiles.length; b++) {
    if (projectiles[b].alive) {
      const proj = projectiles[b]

      proj.fx = proj.x
      proj.fy = proj.y
      proj.lifetime++
      proj.time += 0.075

      proj.x += proj.cosine * 9

      if(proj.sine > 0){
        proj.time = Math.min(proj.time, 3)
        proj.y += 0.1 * proj.time**3 + proj.sine * proj.time * 4
      }
      else{
        proj.y += -proj.sine / 2 * proj.time ** 2;
      }

      proj.rotation = Math.atan2(proj.y - proj.fy, proj.x - proj.fx)
      ctx.save()
      ctx.translate(proj.x + proj.w / 2, proj.y + proj.h / 2)
      ctx.rotate(proj.rotation + 0.785)
      ctx.drawImage(obj, 48, 48, 8, 8, -proj.w / 2, -proj.h / 2, proj.w, proj.h)
      ctx.restore()

      proj.x -= dx
      proj.y -= dy
      if (proj.lifetime > 200) {
        proj.alive = false
        console.log(`projectile ${b} is dead`)
      }
    }
  }
}

let PC = 0
function createProjectile(){
  if (autofire) {
    dir = mousex2 > player.x ? 1 : -1
    projectiles[PC] = new Projectile(Math.atan2(mouseY,mouseX),true)
    PC = (PC + 1) % 5
    player.s = player.s === 32 ? 40 : 32
    lastShot = frame
    canShoot = false
  }
}

let frame = 0

function gameloop() {
  frame = (frame +1) % 80
  drawBackground()
  move()
  drawSprite()
  drawMap()
  shoot()

  cam.x += dx
  cam.y += dy
  dx = 0

  requestAnimationFrame(gameloop)
}

window.onload = function () {
  gameloop()
}