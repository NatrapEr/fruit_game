class Drawable {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 0;
        this.w = 0;
        this.h = 0;
        this.offsets = {
            x: 0,
            y: 0
        }
    }
    createElement() {
        this.element = this.stringToHTML(`<div class="element ${this.constructor.name.toLowerCase()}"></div>`);
        $('.elements').append(this.element);
    }

    stringToHTML(str) {
        let parser = new DOMParser();
        let elem = parser.parseFromString(str, 'text/html');
        return elem.querySelector('.element');
    }
    draw() {
        this.element.style = `
        left: ${this.x}px;
        top: ${this.y}px;
        width: ${this.w}px;
        height: ${this.h}px;
        `;
    }

    removeElement() {
        this.element.remove();
    }
    update() {
        this.x += this.offsets.x;
        this.y += this.offsets.y;
    }
    isCollision(element) {
        let fruit = {
            x1: this.x,
            x2: this.x + this.w,
            y1: this.y,
            y2: this.y + this.h
        };
        let player = {
            x1: element.x,
            x2: element.x + element.w,
            y1: element.y,
            y2: element.y + element.h
        };
        return fruit.x1 < player.x2 && player.x1 < fruit.x2 && fruit.y1 < player.x2 && player.y1 < fruit.y2;
    }
}
class Player extends Drawable {
    constructor(game) {
        super(game);
        this.w = 244;
        this.h = 109;
        this.x = window.innerWidth / 2 - this.w / 2;
        this.y = window.innerHeight - this.h;
        this.speedPerFrame = 30;
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            Space: false
        };
        this.skillTimer = 0;
        this.couldownTimer = 0;
        this.createElement();
        this.bindKeyEvents();
    }
    bindKeyEvents() {
        document.addEventListener('keydown', ev => this.changeKeyStatus(ev.code, true));
        document.addEventListener('keyup', ev => this.changeKeyStatus(ev.code, false));
    }
    changeKeyStatus(code, value) {
        if (code in this.keys) this.keys[code] = value;
    }
    update() {
        if (this.keys.ArrowLeft && this.x > 0) {
            this.offsets.x = -this.speedPerFrame;
        } else if (this.keys.ArrowRight && this.x < window.innerWidth - this.w) {
            this.offsets.x = this.speedPerFrame;
        } else {
            this.offsets.x = 0;
        }
        if(this.keys.Space && this.couldownTimer === 0) {
            this.skillTimer++;
            $('#skill').innerHTML = `осталось ${Math.ceil((240 - this.skillTimer / 60))}`;
            this.applySkill();
        }
        if(this.skillTimer > 240 || (!this.keys.Space && this.skillTimer > 1)) {
            this.couldownTimer++;
            $('#skill').innerHTML = `в откате ещё ${Math.ceil((300 - this.couldownTimer) / 60)}`;
        }
        if(this.couldownTimer > 300) {
            this.skillTimer = 0;
            this.couldownTimer;
            $('#skill').innerHTML = 'Готово';
        }
        super.update();
    }
    applySkill() {
        for(let i = 1; i < this.game.elements.length; i++) {
            if(this.game.elements[i].x < this.x + (this.w / 2)) {
                this.game.elements[i].x += 15;
            }
            if(this.game.elements[i].x > this.x + (this.w / 2)) {
                this.game.elements[i].x -= 15;
            }
        }
    }
}
class Fruits extends Drawable {
    constructor(game) {
        super(game);
        this.w = 70;
        this.h = 70;
        this.x = random(0, window.innerWidth - this.w);
        this.y = 60;
        this.offsets.y = 3;
        this.createElement();
    }
    update(){
        if(this.isCollision(this.game.player) && this.offsets.y > 0) {
            this.takePoint();
        } if(this.y > window.innerHeight) {
            this.takeDamage();
        }
        super.update();
    }
    takePoint() {
        if(this.game.remove(this)) {
            this.removeElement();
            this.game.points++;
        }
    }
    takeDamage() {
        if(this.game.remove(this)) {
            this.removeElement();
            this.game.hp--;
        }
    }
}

class Banana extends Fruits {
    constructor(game) {
        super(game);
    }
}
class Apple extends Fruits {
    constructor(game) {
        super(game);
        this.offsets.y = 5;
    }
}
class Orange extends Fruits {
    constructor(game) {
        super(game);
        this.offsets.y = 7;
    }
}
class Game {
    constructor() {
        this.name = name;
        this.elements = [];
        this.player = this.generate(Player);
        this.fruits = [Apple, Banana, Orange];
        this.counterForTimer = 0;
        this.points = 0;
        this.hp = 3;
        this.time = {
            m1: 0,
            m2: 0,
            s1: 0,
            s2: 0
        };
        this.ended = false;
        this.pause = false;
        this.keyEvents();
    }

    keyEvents() {
        addEventListener('keydown', (e) => {
            if(e.key === "Escape") {
                this.pause = !this.pause;
            }
        })
    }
    start() {
        this.loop();
    }

    randomFruitGenerate() {
        this.generate(this.fruits[random(0, 2)]);
    }

    generate(className) {
        let element = new className(this);
        this.elements.push(element);
        return element;
    }
    loop() {
        requestAnimationFrame(() => {
            if(!this.pause) {
            this.counterForTimer++;
            if(this.counterForTimer % 60 == 0) {
                this.timer();
                this.randomFruitGenerate();
            }
            if(this.hp <= 0) {
                this.end();
            }
            $('.pause').style.display = 'none';
            this.setParams();
            this.updateElements();
        } else {
            $('.pause').style.display = 'flex';
            for(let i = 1; i < this.elements.length; i++) {
                this.elements[i].element.style.animation = 'none';
            }
        }
            if(!this.ended) {
                this.loop();
            }
        });
    }

    end() {
        this.ended = true;
        let time = this.time;
        if(time.s1 >= 1 || time.m1 >= 1 || time.m2 >= 1) {
            $('#playerName').innerHTML = `Поздравляем, ${this.name}`;
            $('#endTime').innerHTML = `Ваше время: ${time.m1}${time.m2}:${time.s1}${time.s2} `;
            $('#collectedFruits').innerHTML = `Вы собрали: ${this.points} фруктов`;
            $('#congratulation').innerHTML = `Вы выиграли!!!`;
        } else {
            $('#playerName').innerHTML = `Печалька, ${this.name}`;
            $('#endTime').innerHTML = `Ваше время: ${time.m1}${time.m2}:${time.s1}${time.s2} `;
            $('#collectedFruits').innerHTML = `Вы собрали: ${this.points} фруктов`;
            $('#congratulation').innerHTML = `Вы проиграли =(`;
        }
        go('end', 'panel d-flex justify-content-center align-items-center');
    }
    timer() {
        let time = this.time;
        time.s2++;
        if(time.s2 >= 10) {
            time.s2 = 0;
            time.s1++;
        }
        if(time.s1 >= 6) {
            time.s1 = 0;
            time.m2++
        }
        if(time.m2 >= 10) {
            time.m2 = 0;
            time.m1++;
        }
        $('#timer').innerHTML = `${time.m1}${time.m2}:${time.s1}${time.s2}`;
    }
    updateElements() {
        this.elements.forEach(elem => {
            elem.update();
            elem.draw();
        });
    }

    remove(element) {
        let indexOfElement = this.elements.indexOf(element);
        if(indexOfElement !== -1) {
            this.elements.splice(indexOfElement, 1);
            return true;
        }
        return false;
    }
    setParams() {
        let params = ['name', 'points', 'hp'];
        let values = [this.name, this.points, this.hp];
        params.forEach((elem, id) => {
            $(`#${elem}`).innerHTML = values[id];
        });
    }
}