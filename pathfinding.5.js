"use strict";
class MinHeap {
    
    constructor() {
        this.heapArray = [];       
    }

    insert(obj) {
        this.heapArray.push(obj);
        this.bubbleUp(this.heapArray.length - 1);
    }

    remove() {
        // wenn mehr als 1 Element:
        // letztes Element wird entfernt
        // und dem ersten Element im Heap zugeordnet
        // dadurch wird letztendlich das erste Element gelöscht

        if (this.heapArray.length == 1) {
            return this.heapArray.pop();
        }

        let firstobj = this.heapArray[0]; 
        this.heapArray[0] = this.heapArray.pop();   
        this.sinkDown(0);
        return firstobj;                    
    }   
    
    bubbleUp(child) {
        if (child > 0) {
            const parent = Math.floor((child -1) / 2);
            if (this.heapArray[parent].val > this.heapArray[child].val) {
                //Elternteil hat den größeren Wert, dann tauschen
                const tmp = this.heapArray[parent];
                this.heapArray[parent] = this.heapArray[child];
                this.heapArray[child] = tmp;
                //ein Elternteil hoch und wieder prüfen
                this.bubbleUp(parent);
            }            
        }
    }

    sinkDown(parent) {
        let smallest = parent; //Elternteil ist aktueller Knoten und mit kleinstem Wert angenommen
        //Kinder des Knoten werden ermittelt
        const leftchild = smallest * 2 + 1;
        const rightchild = smallest * 2 + 2;
        //Prüfung ob Kinder den kleineren Wert haben
        //dabei wird der kleinere Kinderwert herangezogen und getauscht
        if (leftchild < this.heapArray.length && this.heapArray[leftchild].val < this.heapArray[smallest].val) {
            smallest = leftchild;
        }
        if (rightchild < this.heapArray.length && this.heapArray[rightchild].val < this.heapArray[smallest].val) {
            smallest = rightchild;
        }
        if (smallest != parent) { //Kinderwert war kleiner
            //dann tauschen
            const tmp = this.heapArray[parent];
            this.heapArray[parent] = this.heapArray[smallest];
            this.heapArray[smallest] = tmp;
            //danach weiter Prüfen auf nächste Kinder
            this.sinkDown(smallest);
        }
    }

    resort() {
        const tmpArray = this.heapArray.slice();
        this.heapArray = [];
        for (const element of tmpArray) {
            this.insert(element);
        }
    }

    returnArr() {
        return this.heapArray;
    }
}

class Spot {
    
    constructor(i, j) {
        this.i = i;
        this.j = j;
        this.val = 0; //Gesamtwert
        this.g = 0; //bisherige Kosten
        this.h = 0; //Heuristik
        this.block = false;
        this.neighbors = [];
        this.prev = null;

        if (Math.random() < 0.2) {
            this.block = true;
        }
    }

    addNeighbors(grid, cols, rows) {
        let i = this.i;
        let j = this.j;
        if (i > 0) { this.neighbors.push(grid[i-1][j]); }
        if (i > 0 && j > 0) { this.neighbors.push(grid[i-1][j-1]); }
        if (i > 0 && j < rows-1) { this.neighbors.push(grid[i-1][j+1]); }
        if (i < cols-1) { this.neighbors.push(grid[i+1][j]); }
        if (i < cols-1 && j > 0) { this.neighbors.push(grid[i+1][j-1]); }
        if (i < cols-1 && j < rows-1) { this.neighbors.push(grid[i+1][j+1]); }
        if (j > 0) { this.neighbors.push(grid[i][j-1]); }
        if (j < rows-1) { this.neighbors.push(grid[i][j+1]); }
    }
}

class Spielfeld {
    
    constructor(cols, rows) {
        this.grafik = new Grafik(cols, rows)
        this.grid = [];
        this.cols = cols;
        this.rows = rows;
        this.start = null;
        this.end = null;

        for (let i = 0; i < this.cols; i++) {
            this.grid[i] = new Array(this.rows);
        }

        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                this.grid[i][j] = new Spot(i, j);   
            }
        }        
    }

    ZeichneBrett() {
        for (const col of this.grid) {
            for (const spot of col) {
                if (!spot.block) {
                    this.grafik.show(spot, "white");
                } else {
                    this.grafik.show(spot, "black");
                }
            }
        }
    }

    ZeichneWeg(openlist, closedlist, current) {
        
        for (const spot of openlist.returnArr()) {
            this.grafik.show(spot, "green");        
        }

        for (const spot of closedlist) {
            this.grafik.show(spot, "red");     
        }

        let spot = current;
        while (spot) {
            this.grafik.show(spot, "blue");
            spot = spot.prev;
        }
    }

    Reset() {
        this.start = null;
        this.end = null;
        this.grid = [];
        for (let i = 0; i < this.cols; i++) {
            this.grid[i] = new Array(this.rows);
        }

        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                this.grid[i][j] = new Spot(i, j);   
            }
        }
        this.ZeichneBrett();        
    }

    setPos(x,y) {
        let i = Math.floor(x / this.grafik.w);
        let j = Math.floor(y / this.grafik.h);

        if (this.start == null) {
            this.start = this.grid[i][j];
            this.grafik.show(this.start, "blue");
            return;
        }    

        if (this.end == null) {
            this.end = this.grid[i][j];
            this.grafik.show(this.end, "blue");
            return;
        }

        this.grid[i][j].block = true;
        this.grafik.show(this.grid[i][j], "black");    
    }
}

class Grafik {
    constructor(cols, rows) {
        this.canvas = document.querySelector("canvas");
        this.ctx = this.canvas.getContext("2d"); 
        this.w = this.canvas.width / cols;
        this.h = this.canvas.height / rows;
    }

    static addEvLis() {
        document.querySelector("canvas").addEventListener("mousedown",fnSetPos)
        document.querySelector("#btnstart").addEventListener("click", Pathfinder.Start);
        document.querySelector("#btninit").addEventListener("click", fnReset);
    }

    show(spot, color) {
        this.ctx.strokeStyle ="black";
        this.ctx.fillStyle = color;
        this.ctx.strokeRect(spot.i * this.w, spot.j * this.h, this.w, this.h);
        this.ctx.fillRect((spot.i * this.w) + 1, (spot.j * this.h) + 1, this.w-2, this.h-2);
    }
}

class Pathfinder {

    static getDistance(a, b) {
        return Math.sqrt(Math.pow(a.i - b.i, 2) + Math.pow(a.j - b.j, 2)) 
    }
    
    static Start() {
        const openlist = new MinHeap();
        const closedlist = [];
        let current = null;
        const brett = FactorySpielfeld.getInstance();
        if (brett.start == null) {
            brett.start = brett.grid[0][0];
            brett.end = brett.grid[brett.cols - 1][brett.rows - 1];    
        }
    
        openlist.insert(brett.start);
        do {
            current = openlist.remove();
            if (current != brett.end) {
                current.addNeighbors(brett.grid, brett.cols, brett.rows);
                closedlist.push(current);
                for (const element of current.neighbors) {
                    if (!element.block && !closedlist.includes(element)) {
                        const tmp_g = Pathfinder.getDistance(current, element) + current.g;
                        if (element.g == 0 || tmp_g < element.g) {
                            element.g = tmp_g;
                            element.h = Pathfinder.getDistance(element, brett.end);
                            element.val = element.g + element.h;
                            element.prev = current;
                            if (openlist.returnArr().includes(element)) {
                                openlist.resort();
                            } else {
                                openlist.insert(element);
                            }
                        }
                    }
                }
            
            }
        } while (openlist.returnArr().length > 0 && current != brett.end);
        brett.ZeichneWeg(openlist, closedlist, current);
    }
}

let FactorySpielfeld = {
    instanz: null,

    makeInstance(cols, rows) {
        if (this.instanz == null) {
            this.instanz = new Spielfeld(cols, rows);
        }
        return this.instanz;
    },
    
    getInstance() {
        return this.instanz;
    }
}


const fnInit = (cols, rows) => {
    const brett = FactorySpielfeld.makeInstance(cols, rows);
    Grafik.addEvLis();
    brett.ZeichneBrett();
}

const fnReset = () => {
    const brett = FactorySpielfeld.getInstance();
    brett.Reset();
}

const fnSetPos = (event) => {
    const brett = FactorySpielfeld.getInstance();
    brett.setPos(event.offsetX, event.offsetY);

}

fnInit(30,30);



