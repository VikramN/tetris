// 20 x 12
let config = {
    rows: 30,
    cols: 20,
    cell: 32,
    debug: true,
    pcs: ['T', 'S', 'Z', 'L', 'J', 'B', 'I'],
    colors: ['#9e9e9e', '#5d4037', '#f44336', '#673ab7', '#2196f3', '#4caf50', '#ff9800'],
    pad_x: 4,
    pad_y: 5    
}

let clip = {
    x : config.pad_x * config.cell - 1 * config.cell ,
    y : 0,
    w : (config.cols + 2 - 2*config.pad_x) * config.cell,
    h : (config.rows + 2 - config.pad_y) * config.cell
}

let pc_cycle = 0;

function create_pc() {
    return {
        x: config.cols / 2,
        y: 0,
        size: 0,
        color: 1,
        d: math.zeros(1, 1),
        alive: 0
    }
}

let pc = create_pc()
let next_pc = create_pc()

let board = math.zeros(config.rows, config.cols)

function setup() {
    let [h, w] = [clip.h, clip.w]
    createCanvas(w, h);

    textFont('Courier New', 24);

    for (i of math.range(0, config.rows)._data) {
        board.set([i, 0], 1)
        board.set([i, 1], 1)
        board.set([i, 2], 1)
        board.set([i, 3], 1)
        board.set([i, config.cols - 1], 1)
        board.set([i, config.cols - 2], 1)
        board.set([i, config.cols - 3], 1)
        board.set([i, config.cols - 4], 1)
    }

    for (i of math.range(0, config.cols)._data) {
        board.set([config.rows - 4, i], 1)
        board.set([config.rows - 3, i], 1)
        board.set([config.rows - 2, i], 1)
        board.set([config.rows - 1, i], 1)
        
    }

    set_random_pc(pc)
    set_random_pc(next_pc)

    noLoop();

    requestAnimationFrame(gameLoop);
}

function set_random_pc(p) {
    p.y = 0;
    p.x = config.cols / 2;
    set_pc_as(p, config.pcs[math.randomInt(0, config.pcs.length)])
}

function set_pc_as(p, t) {
    switch (t) {
        case 'I':
            p.d = math.zeros(4, 4)
            p.size = 4
            break

        case 'B':
            p.d = math.zeros(2, 2)
            p.size = 2
            break

        default:
            p.d = math.zeros(3, 3)
            p.size = 3
            break
    }

    p.color = math.randomInt(2, config.colors.length);

    switch (t) {
        case 'T':
            p.d.set([0, 1], p.color)
            p.d.set([1, 0], p.color)
            p.d.set([1, 1], p.color)
            p.d.set([1, 2], p.color)
            break

        case 'S':
            p.d.set([0, 1], p.color)
            p.d.set([0, 2], p.color)
            p.d.set([1, 0], p.color)
            p.d.set([1, 1], p.color)
            break

        case 'Z':
            p.d.set([0, 0], p.color)
            p.d.set([0, 1], p.color)
            p.d.set([1, 1], p.color)
            p.d.set([1, 2], p.color)
            break

        case 'L':
            p.d.set([0, 2], p.color)
            p.d.set([1, 0], p.color)
            p.d.set([1, 1], p.color)
            p.d.set([1, 2], p.color)
            break

        case 'J':
            p.d.set([0, 0], p.color)
            p.d.set([1, 0], p.color)
            p.d.set([1, 1], p.color)
            p.d.set([1, 2], p.color)
            break

        case 'B':
            p.d.set([0, 0], p.color)
            p.d.set([0, 1], p.color)
            p.d.set([1, 0], p.color)
            p.d.set([1, 1], p.color)
            break

        case 'I':
            p.d.set([1, 0], p.color)
            p.d.set([1, 1], p.color)
            p.d.set([1, 2], p.color)
            p.d.set([1, 3], p.color)
            break
    }
}

function get_board_at(x, y, size) {
    return math.subset(
        board,
        math.index(
            math.range(y, y + size),
            math.range(x, x + size))
    )
}

function check_collision(b, p) {
    let r = p.rows()
    let blocked = false;

    for (let i = 0; i < r.length; i++) {
        if (check_row_clash(r[i]._data[0], b._data[i])) {
            blocked = true;
            break;
        }
    }

    return blocked;
}

function check_row_clash(r1, r2) {
    let s = r1.length;
    for (let i = 0; i < s; i++) {
        if (r1[i] * r2[i] != 0) return true;
    }

    return false;
}

function try_rotate(t) {
    let s = Math.ceil(pc.size / 2);

    for (let i = 0; i <= s; i++) {
        let b = get_board_at(pc.x + i, pc.y, pc.size)
        let blocked = check_collision(b, t);
        if (!blocked) {
            done = true;
            pc.d = t;
            pc.x += i;
            return true
        }
    }

    for (let i = -1; i >= -s; i--) {
        console.log(i)
        let b = get_board_at(pc.x + i, pc.y, pc.size)
        let blocked = check_collision(b, t);
        if (!blocked) {
            pc.d = t;
            pc.x += i;
            return true;
        }
    }

    return false
}

function keyPressed() {
    // if(keyCode == 32 && config.debug) {
    //     pc_cycle  = (pc_cycle + 1) % config.pcs.length;
    //     set_pc_as(config.pcs[pc_cycle])
    //     redraw();
    //     return
    // }

    if (keyCode == 32) {
        paused = !paused
        if (!paused) requestAnimationFrame(gameLoop)
        return
    }

    if (paused) return;

    if (keyCode === UP_ARROW) {
        let t = math.matrix(
            math.range(0, pc.size)._data.reverse().map(function (i) {
                let s = math.subset(pc.d, math.index(math.range(0, pc.size), i));
                let z = math.squeeze(s)._data;
                return z;
            })
        );

        if (try_rotate(t)) redraw();


    } 
    // else if (keyCode === DOWN_ARROW) {
    //     let t = math.matrix(
    //         math.range(0, pc.size)._data.map(function (i) {
    //             let s = math.subset(pc.d, math.index(math.range(0, pc.size), i));
    //             let z = math.squeeze(s)._data.reverse();
    //             return z;
    //         })
    //     );

    //     if (try_rotate(t)) redraw();
    // }

    if (keyCode === LEFT_ARROW) {
        let b = get_board_at(pc.x - 1, pc.y, pc.size)
        let blocked = check_collision(b, pc.d);
        if (!blocked) {
            pc.x -= 1;
            redraw();
        }


    } else if (keyCode === RIGHT_ARROW) {
        let b = get_board_at(pc.x + 1, pc.y, pc.size)
        let blocked = check_collision(b, pc.d);
        if (!blocked) {
            pc.x += 1;
            redraw();
        }
    }
}

function draw_grid() {
    for (let i = 0; i < config.rows; i++) {
        line(0, i * config.cell, config.cols * config.cell, i * config.cell)
    }

    for (let i = 0; i < config.cols; i++) {
        line(i * config.cell, 0, i * config.cell, config.rows * config.cell)
    }
}

function draw_board() {
    for (let i = 0; i < config.rows; i++) {
        for (let j = 0; j < config.cols; j++) {
            let x = board.get([i, j])
            if (x != 0) {
                fill(config.colors[x])
                rect(j * config.cell - clip.x, i * config.cell - clip.y, config.cell, config.cell)
            }
        }
    }
}

function draw_pc() {
    for (let i = 0; i < pc.size; i++) {
        for (let j = 0; j < pc.size; j++) {
            if (pc.d.get([i, j]) != 0) {
                fill(config.colors[pc.color])
                rect(pc.x * config.cell + j * config.cell - clip.x, pc.y * config.cell + i * config.cell, config.cell, config.cell)
            }
        }
    }
}

function draw_next_pc() {
    for (let i = 0; i < next_pc.size; i++) {
        for (let j = 0; j < next_pc.size; j++) {
            if (next_pc.d.get([i, j]) != 0) {
                fill(config.colors[next_pc.color])
                rect(
                    (config.cols - config.pad_x * 2) * config.cell + j * config.cell - clip.x, 
                    (1) * config.cell + i * config.cell, 
                    config.cell, config.cell)
            } else {
                fill(config.colors[0])
                rect(
                    (config.cols - config.pad_x * 2) * config.cell + j * config.cell - clip.x, 
                    (1) * config.cell + i * config.cell, 
                    config.cell, config.cell)
            }
        }
    }
}


function draw_pc_box() {
    noFill()
    stroke('red')
    rect(pc.x * config.cell - clip.x, pc.y * config.cell, pc.size * config.cell, pc.size * config.cell)
    stroke('black')
}

function draw() {
    stroke(0, 40)
    background(220);
    draw_board()
    draw_pc()
    // draw_grid();
    fill(config.colors[1])
    rect(
        config.pad_x * config.cell - clip.x, 
        0, 
        (-config.pad_x * 2 + config.cols) * config.cell, 
        config.pad_y * config.cell)

    fill('black')
    text('SCORE', config.pad_x * config.cell + 5 - clip.x, 5, 90, 90)
    text(score, config.pad_x * config.cell + 5 - clip.x, 5  + config.cell, 90, 90)
    text('SPEED', config.pad_x * config.cell + 5 - clip.x, config.cell * 3 + 5, 90, 90)
    text(10 - speed, config.pad_x * config.cell + 5 - clip.x, config.cell * 4 +  5, 90, 90)
    draw_next_pc()

    if (config.debug) draw_pc_box()
}

function check_fills() {

    let r = math.subset(board, math.index(
        math.range(config.pad_y + 1, config.rows - config.pad_y + 1),
        math.range(config.pad_x, config.cols - config.pad_x))
    )

    let a = r._data.filter(row => row.indexOf(0) != -1);

    let lines = r._data.length - a.length

    if (lines < 1) return;

    let points = 0

    switch(lines) {
        case 1 : points = (10-speed) * 40;  break;
        case 2 : points = (10-speed) * 100;  break;
        case 3 : points = (10-speed) * 300;  break;
        case 4 : points = (10-speed) * 1200;  break;
    }

    let allZ = math.sum(a)

    if(allZ == 0) {
        points = points * 1.5        
    }

    score += points;

    let b1 = math.zeros(config.rows - config.pad_y * 2, config.cols - config.pad_x * 2);

    b1.subset(math.index(
        math.range(lines, lines + a.length),
        math.range(0, a[0].length)
    ), a)

    board.subset(
        math.index(
            math.range(config.pad_y + 1, config.pad_y + b1._data.length + 1),
            math.range(config.pad_x, config.pad_x + b1._data[0].length)
        ), b1)

}

function check_gameover() {
    // not needed?
    let r = math.subset(board, math.index(
        math.range(0, config.pad_y),
        math.range(config.pad_x, config.cols - config.pad_x))
    )

    let reached = r._data.filter(row => row.indexOf(1) != -1);

    if(reached.length > 0) {
        // Game over
        paused = true
    }


}

let t1 = new Date();
let t2 = new Date();
let f = 0;
let speed = 9;
let paused = false;
let score = 0

function gameLoop() {
    if (paused) return;
    let t2 = new Date();
    let elapsed = t2 - t1;
    if (elapsed > 30) {
        f += 1;
        t1 = t2;
        if (f >= speed || (keyIsDown(DOWN_ARROW))) {
            f = 0;
            let b = get_board_at(pc.x, pc.y + 1, pc.size)
            let blocked = check_collision(b, pc.d);
            if (!blocked) {
                pc.y += 1;
            } else {

                if(pc.y < config.pad_y) {
                    // Game over
                    paused = true
                }

                let b = math.subset(
                    board,
                    math.index(
                        math.range(pc.y, pc.y + pc.size),
                        math.range(pc.x, pc.x + pc.size))
                )

                for(let r = 0; r < pc.size; r++) {
                    for(let c = 0; c < pc.size; c++) {
                        let v = pc.d.get([r, c])
                        if(v) b.set([r,c], pc.color)
                    }
                }
                
                let n = b;

                board.subset(
                    math.index(
                        math.range(pc.y, pc.y + pc.size),
                        math.range(pc.x, pc.x + pc.size)),
                    n
                )

                check_fills()
                // check_gameover()

                set_random_pc(pc)

                let tmp = next_pc
                next_pc = pc
                pc = tmp
            }

            redraw();
        }
    }
    requestAnimationFrame(gameLoop);
}