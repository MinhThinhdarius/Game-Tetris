function Tetris() {
    var self = this;
    this.stats = new Stats();
    this.puzzle = null;
    this.area = null;
    this.paused = false;
    //biến để kiểm tra xem đang ở level nào
    var checkLv2 = false;
    var checkLv3 = false;
    var checkLv4 = false;
    var checkLv5 = false;
    var checkLv6 = false;
    var gameOver = false;
    this.start = function () {
        //nếu không phải level 2 thì hiển thị popup new game vì level 2 có cơ chế riêng để ẩn nextPuzzle
        if (!checkLv2) {
            //kiểm tra xem khi trong trò chơi game đã Over hay chưa để hiển thị popup
            if (!gameOver && !confirm('Do you dare to start a new challenge ?')) return;

            self.reset();
            self.stats.start();
            nextPuzzle.style.display = "block";
            document.getElementById("key-help").style.display = "none";
            // Khởi tạo đối tượng
            self.area = new Area(self.unit, self.areaX, self.areaY, "area-game");
            self.puzzle = new Puzzle(self, self.area);
            // Nếu puzzle có thể đặt được thì thực hiện, không thì gameOver
            if (self.puzzle.canPlace()) {
                self.puzzle.place();
            } else {
                self.gameOver();
            }
        }
        //khi là level 2 thì thực hện hàm phụ để hiện thị popup new game riêng của level 2
        else {
            self.supportLv2();
            checkLv2 = true;
        }
        gameOver = false;
    };
    this.reset = function () {
        //clear khu vực chơi nếu tồn tại puzzle và area
        if (self.puzzle) {
            self.puzzle.destroy();
            self.puzzle = null;
        }
        if (self.area) {
            self.area.destroy();
            self.area = null;
        }
        self.stats.reset();
        self.paused = false;
        document.getElementById("next-puzzle").style.display = "none";
        document.getElementById("key-help").style.display = "block";
        document.getElementById('tetris-pause').style.display = 'block';
        document.getElementById('tetris-resume').style.display = 'none';
    };
    this.pause = function () {
        if (self.puzzle == null) return;
        if (self.paused) {
            //nếu game đang chạy thì thực hiện set time và đặt fallId
            self.puzzle.running = true;
            self.puzzle.fallDownID = setTimeout(self.puzzle.fallDown, self.puzzle.speed);
            self.stats.timerId = setInterval(self.stats.uptime, 1000);
            self.paused = false;
            //hoán đổi 2 nút
            document.getElementById('tetris-pause').style.display = 'block';
            document.getElementById('tetris-resume').style.display = 'none';
        } else {
            //nếu không thì cho dừng game và hiển thị nút resume
            document.getElementById('tetris-pause').style.display = 'none';
            document.getElementById('tetris-resume').style.display = 'block';
            //reset thời gian
            clearTimeout(self.stats.timerId);
            self.paused = true;
            self.puzzle.running = false;
        }
    };
    this.gameOver = function () {
        self.stats.stop();
        self.puzzle.stop();
        if (self.puzzle && !confirm('Game Over !!! PLAY AGAIN ?')) return self.reset();
        gameOver = true;
        self.start();
    };
    //khi nút up được nhấn thì gọi hàm này và thực hiện rotate block
    //kiểm tra xem block có thể rotate thì thực hiện
    this.up = function () {
        var decreasedValue = self.decreaseRotate();
        if (decreasedValue !== 0) {
            if (self.puzzle.canRotate()) {
                self.puzzle.rotate();
                self.stats.setActions(self.stats.getActions() + 1);
                self.puzzle.touch();
            }
        }
    };

    //cho block di chuyển xuống nhanh hơn
    this.down = function () {
        if (self.puzzle.canMoveDown()) {
            self.stats.setScore(self.stats.getScore() + 5);
            self.puzzle.moveDown();
            self.stats.setActions(self.stats.getActions() + 1);
            self.puzzle.touch();
        }
    };

    //cho block di chuyển sang trái
    this.left = function () {
        if (self.puzzle.canMoveLeft()) {
            self.puzzle.moveLeft();
            self.stats.setActions(self.stats.getActions() + 1);
            self.puzzle.touch();
        }
    };

    //cho block di chuyển sang phải
    this.right = function () {
        if (self.puzzle.canMoveRight()) {
            self.puzzle.moveRight();
            self.stats.setActions(self.stats.getActions() + 1);
            self.puzzle.touch();
        }
    };

    //cho block rơi tự do fallDown
    this.space = function () {
        self.puzzle.stop();
        self.puzzle.forceMoveDown();
    };

    //bật nhạc nền
    this.sound = function () {
        var audio = new Audio('sound/Original_Tetris_theme.mp3');
        audio.volume = 0.2;
        var isSoundOn = true;
        var soundIcon = document.getElementById('soundIcon');

        function toggleSound() {
            if (isSoundOn) {
                audio.pause();
                soundIcon.style.backgroundImage = "url('img/sound-off-svgrepo-com.png')";
                isSoundOn = false;
            } else {
                audio.play();
                soundIcon.style.backgroundImage = "url('img/sound-svgrepo-com.png')";
                isSoundOn = true;
            }
        }

        toggleSound();
        document.getElementById('soundIcon').onclick = function () {
            toggleSound();
        };
    };

    //khi thực hiện removeLine thì kêu 1 tiếng, action sound game play
    this.ting = function () {
        var ting = new Audio('sound/ting.mp3');
        ting.volume = 0.8;

        function tingg() {
            ting.play();
        }

        tingg();
    }

    var rotaNumElement = document.getElementById('rota-num');

    //để giảm ngược số lần rotate khi nhấn nút Up cho level
    this.decreaseRotate = function () {
        var newValue = 0;
        var currentValue = parseInt(rotaNumElement.textContent);

        function decreaseRotaNum() {
            if (!isNaN(currentValue) && currentValue > 0) {
                newValue = currentValue - 1;
                rotaNumElement.textContent = newValue.toString();
            }
        }

        if (currentValue === 20) {
            return currentValue;
        } else decreaseRotaNum();
        return newValue;
    };

    //hiển thị thông tin cá nhân
    var aboutPopup = new Popup("popup-about");

    //action khi nhấn nút menu
    document.getElementById("soundIcon").onclick = function () {
        self.sound();
    }
    document.getElementById("btn-start").onclick = function () {
        aboutPopup.close();
        self.start();
        this.blur();
    };
    document.getElementById("btn-pause").onclick = function () {
        self.pause();
        this.blur();
    };
    document.getElementById("btn-resume").onclick = function () {
        self.pause();
        this.blur();
    };
    //hiển thị popup
    document.getElementById("btn-about").onclick = function () {
        aboutPopup.activate();
        this.blur();
    };
    //đóng cửa sổ
    document.getElementById("btn-close").onclick = aboutPopup.close;

    //khởi tạo biến cho level
    var bugBoolean = false;
    var bugClass = document.querySelector(".lv4");
    var nextPuzzle = document.getElementById("next-puzzle");
    var idLevel = document.getElementById("id-level");
    var rota = document.getElementById("rota");

    //action khi click btn level
    document.getElementById("lv1").onclick = function () {
        self.showIdLevel(1);
        self.clean();
        self.start();
    };
    document.getElementById("lv2").onclick = function () {
        self.clean();
        self.showIdLevel(2);
        self.supportLv2();
        checkLv2 = true;
    };
    document.getElementById("lv3").onclick = function () {
        self.clean();
        checkLv3 = true;
        self.showIdLevel(3);
        self.supportRotate(3);
        self.start();
    };
    document.getElementById("lv4").onclick = function () {
        self.clean();
        checkLv4 = true;
        self.showIdLevel(4);
        self.supportRotate(4);
        bugClass.classList.add('lv4');
        bugClass.setAttribute("id", "bug");
        bugBoolean = true;
        self.start();
    };
    document.getElementById("lv5").onclick = function () {
        self.clean();
        checkLv4 = true;
        checkLv5 = true;
        self.showIdLevel(5);
        self.supportRotate(4);
        bugBoolean = true;
        self.supportLv5(700);
        self.cleanBug();
        self.start();
    };
    document.getElementById("lv6").onclick = function () {
        self.clean();
        checkLv6 = true;
        checkLv2 = true;
        self.showIdLevel(6);
        self.supportRotate(6);
        bugBoolean = true;
        self.supportLv6(300);
        self.supportLv2();
    };

    //giúp level 5 di chuyển block bug
    this.supportLv5 = function (speed) {
        function addClassLv5() {
            var grids = document.getElementsByClassName("gridLv5");
            var currentGridIndex = 0;
            let intervalId = setInterval(function () {
                if (!checkLv5) {
                    clearInterval(intervalId); // Dừng vòng lặp khi checkLv5 = false
                    return;
                }
                //duyệt qua các phần tử và thực hiện lần lượt add và remove class, id để tạo hiệu ứng di chuyển bug
                for (var i = 0; i < grids.length; i++) {
                    var grid = grids[i];
                    grid.classList.remove('lv5');
                    grid.removeAttribute('id');
                }
                var currentGrid = grids[currentGridIndex];
                currentGrid.classList.add('lv5');
                currentGrid.setAttribute('id', 'bug');
                currentGridIndex++;
                //khi node hiện tại ở cuối danh sách thì cho nó về 0 và duyệt lại
                if (currentGridIndex >= grids.length) {
                    currentGridIndex = 0;
                }
            }, speed);
        }

        addClassLv5();
    };

    //tương tự level 5
    this.supportLv6 = function (speed) {
        function addClassLv6() {
            var grids = document.getElementsByClassName("gridLv6");
            var currentGridIndex = 0;
            let intervalId = setInterval(function () {
                if (!checkLv6) {
                    clearInterval(intervalId); // Dừng vòng lặp khi checkLv6 = false
                    return;
                }
                //duyệt qua các phần tử và thực hiện lần lượt add và remove class, id để tạo hiệu ứng di chuyển bug
                for (var i = 0; i < grids.length; i++) {
                    var grid = grids[i];
                    grid.classList.remove('lv6');
                    grid.removeAttribute('id');
                }
                var currentGrid = grids[currentGridIndex];
                //nếu node hiện tại là số lẻ thì mới thực hiện add class - tạo hiệu ứng nhấp nháy bug
                if (currentGridIndex % 2 === 1) {
                    currentGrid.classList.add('lv6');
                }
                currentGrid.setAttribute('id', 'bug');
                currentGridIndex++;
                if (currentGridIndex >= grids.length) {
                    currentGridIndex = 0;
                }
            }, speed);

        }

        addClassLv6();
    };

    //giúp level 2 ẩn hiển thị next puzzle
    this.supportLv2 = function () {
        //chức năng tương tự với start nhưng dành riêng cho level 2
        nextPuzzle.style.display = "none";
        if (self.puzzle && !confirm('Again ?')) return;
        self.reset();
        self.stats.start();
        document.getElementById("key-help").style.display = "none";
        self.area = new Area(self.unit, self.areaX, self.areaY, "area-game");
        self.puzzle = new Puzzle(self, self.area);
        if (self.puzzle.canPlace()) {
            self.puzzle.place();
        } else {
            self.gameOver();
        }
    };

    //giúp set rotate cho các level
    this.supportRotate = function (level) {
        if (level === 3) {
            rota.style.display = 'block';
            rotaNumElement.textContent = 12;
        } else if (level === 4) {
            rota.style.display = 'block';
            rotaNumElement.textContent = 8;
        } else if (level === 6) {
            rota.style.display = 'block';
            rotaNumElement.textContent = 4;
        }
    };

    //xóa các bug trong game
    this.cleanBug = function () {
        function cleanBug() {
            let grids = document.getElementsByClassName("gridLv6");
            for (var i = 0; i < grids.length; i++) {
                var grid = grids[i];
                grid.classList.remove('lv6');
                grid.classList.remove('lv5');
                grid.classList.remove('lv4');
                grid.removeAttribute('id');
            }
        }
        cleanBug()
    }

    //reset chế độ chơi khi nhấn level khác
    this.clean = function () {
        bugBoolean = false;
        checkLv2 = false;
        checkLv3 = false;
        checkLv4 = false;
        checkLv5 = false;
        checkLv6 = false;
        self.cleanBug();
        rotaNumElement.textContent = 20;
        rota.style.display = 'none';
    };

    //hiển thị màn đang chơi
    this.showIdLevel = function (x) {
        idLevel.textContent = x.toString();
    };

    //quy ước các nút trên bàn phím
    let key = new Keyboard();
    key.set(key.n, this.start);
    key.set(key.p, this.pause);
    key.set(key.r, this.pause);
    key.set(key.up, this.up);
    key.set(key.down, this.down);
    key.set(key.left, this.left);
    key.set(key.right, this.right);
    key.set(key.space, this.space);
    document.onkeydown = key.event;
    function Keyboard() {
        let myKey = this;
        myKey.n = 78;
        myKey.p = 80;
        myKey.r = 82;
        myKey.up = 38;
        myKey.down = 40;
        myKey.left = 37;
        myKey.right = 39;
        myKey.space = 32;
        this.keys = [];
        this.funcs = [];
        let self = this;
        this.set = function (key, func) {
            //thêm key và func vào mảng
            this.keys.push(key);
            this.funcs.push(func);
        };
        //nếu không có sự kiện thì gán nó bằng sự kiện window
        this.event = function (e) {
            if (!e) {
                e = window.event;
            }
            //duyệt qua mảng
            for (let i = 0; i < self.keys.length; i++) {
                //nếu có key thì thực hiện function
                if (e.keyCode === self.keys[i]) {
                    self.funcs[i]();
                }
            }
        };
    }

    //random block
    function random(i) {
        return Math.floor(Math.random() * i);
    }

    //xử lý hiển thị popup
    function Popup(id) {
        this.id = id;
        this.ele = document.getElementById(this.id);
        let self = this;
        //nhấn nút close thì đóng
        this.close = function () {
            self.ele.style.display = "none";
        };
        //nhấn nút about thì mở hoặc đóng
        this.activate = function () {
            self.ele.style.display = (self.ele.style.display === "block" ? "none" : "block");
        };
    }

    //thông số khi chơi game
    function Stats() {
        this.ele = {
            "speed": document.getElementById("stat-speed"),
            "time": document.getElementById("stat-time"),
            "lines": document.getElementById("stat-line"),
            "score": document.getElementById("stat-score")
        }
        var self = this;
        //constructor
        this.start = function () {
            this.reset();
            this.timerId = setInterval(this.uptime, 1000);
        };
        this.stop = function () {
            if (this.timerId) {
                clearInterval(this.timerId);
            }
        };
        this.reset = function () {
            this.stop();
            this.speed = 1;
            this.time = 0;
            this.lines = 0;
            this.score = 0;
            this.puzzle = 0;
            this.actions = 0;
            this.ele.speed.innerHTML = this.speed;
            this.ele.time.innerHTML = this.time;
            this.ele.lines.innerHTML = this.lines;
            this.ele.score.innerHTML = this.score;
        };
        this.uptime = function () {
            self.time++;
            self.ele.time.innerHTML = self.time;
        };
        this.setScore = function (i) {
            this.score = i;
            this.ele.score.innerHTML = this.score;
        };
        this.setSpeed = function (i) {
            this.speed = i;
            this.ele.speed.innerHTML = this.speed;
        };
        this.setLines = function (i) {
            this.lines = i;
            this.ele.lines.innerHTML = this.lines;
        };
        this.setPuzzles = function (i) {
            this.puzzle = i;
        };
        this.setActions = function (i) {
            this.actions = i;
        };
        this.getScore = function () {
            return this.score;
        };
        this.getSpeed = function () {
            return this.speed;
        };
        this.getLines = function () {
            return this.lines;
        };
        this.getPuzzles = function () {
            return this.puzzle;
        };
        this.getActions = function () {
            return this.actions;
        };
    }

    function Area(unit, x, y, id) {
        this.unit = unit;
        this.x = x;
        this.y = y;
        this.el = document.getElementById(id);
        this.board = [];
        for (let y = 0; y < this.y; y++) {
            this.board.push([]);
            for (let x = 0; x < this.x; x++) {
                this.board[y].push(0);
            }
        }
        //clear khu vực chơi
        this.destroy = function () {
            for (let y = 0; y < this.board.length; y++) {
                for (let x = 0; x < this.board[y].length; x++) {
                    if (this.board[y][x]) {
                        this.el.removeChild(this.board[y][x]);
                        this.board[y][x] = 0;
                    }
                }
            }
        };
        //xóa khi line đầy, đếm line đã xóa để hiển thị ra stat
        this.removeAllLine = function () {
            var lines = 0;
            for (let y = this.y - 1; y > 0; y--) {
                if (this.isLineFull(y)) {
                    this.removeLine(y);
                    lines++;
                    y++;
                }
            }
            return lines;
        };
        //kiểm tra line đầy thì báo
        this.isLineFull = function (y) {
            for (let x = 0; x < this.x; x++) {
                if (!this.board[y][x]) {
                    return false;
                }
            }
            return true;
        };
        //thực hiện xóa line
        this.removeLine = (y) => {
            for (let x = 0; x < this.x; x++) {
                const cell = this.board[y][x];
                this.el.removeChild(cell);
                this.board[y][x] = 0;
            }
            y--;
            for (; y > 0; y--) {
                for (let x = 0; x < this.x; x++) {
                    if (this.board[y][x]) {
                        const cell = this.board[y][x];
                        cell.style.top = `${cell.offsetTop + this.unit}px`;
                        this.board[y + 1][x] = cell;
                        this.board[y][x] = 0;
                    }
                }
            }
            self.ting();
        };
        //trả về cái block
        this.getBlock = function (y, x) {
            //xem block đã chạm đáy chưa
            if (y < 0) {
                return 0;
            }
            //trả về giá trị trên board
            if (y < this.y && x < this.x) {
                return this.board[y][x];
            }
        };
        this.addElemetor = function (el) {
            //tih toán giá trị x,y dựa trên top và left
            let x = Math.floor(el.offsetLeft / this.unit);
            let y = Math.floor(el.offsetTop / this.unit);
            //nếu y nằm trong khoảng của area game
            if (y >= 0 && y < this.y && x >= 0 && x < this.x) {
                this.board[y][x] = el;
                //trả về cái board
            }
        };
    }

    function Puzzle(tetris, area) {
        let self = this;
        this.tetris = tetris;
        this.nextElements = [];
        this.board = [];
        this.elements = [];

        this.area = area;
        //tạo mảng cho block
        this.puzzle = [
            [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0]
            ], [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0]
            ],
            [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0]
            ],
            [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            [
                [1, 1],
                [1, 1]
            ],
            [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ]
        ];
        //chọn block tiếp theo bằng random
        this.nextType = random(self.puzzle.length);
        //khởi tạo lại ban đầu các thuộc tính
        self.reset = function() {
            if (this.fallDownID) {
                clearTimeout(this.fallDownID);
                this.fallDownID = null;
            }
            if (this.forceMoveDownID) {
                clearTimeout(this.forceMoveDownID);
                this.forceMoveDownID = null;
            }
            this.type = this.nextType;
            this.nextType = random(self.puzzle.length);
            this.speed = 80 + (700 / this.tetris.stats.getSpeed());
            this.running = false;
            this.stopped = false;
            this.board = [];
            this.elements = [];
            for (let i = 0; i < this.nextElements.length; i++) {
                let nextPuzzleElement = document.getElementById("next-puzzle");
                if (nextPuzzleElement.contains(this.nextElements[i])) {
                    nextPuzzleElement.removeChild(this.nextElements[i]);
                }
            }
            this.nextElements = [];
            this.x = null;
            this.y = null;
        };        self.reset();
        //constructor
        this.isRunning = function () {
            return this.running;
        };
        this.isStopped = function () {
            return this.stopped;
        };
        this.getX = function () {
            return this.x;
        };
        this.getY = function () {
            return this.y;
        };
        //hàm kiểm tra có thể đặt block được nữa không, xem block đã chạm đỉnh chưa, nếu trả về false = game Over
        this.canPlace = function () {
            let puzzle = this.puzzle[this.type];
            let areaStartX = Math.floor((this.area.x - puzzle[0].length) / 2);
            let areaStartY = 1;
            let lineFound = false;
            let lines = 0;
            for (let y = puzzle.length - 1; y >= 0; y--) {
                for (let x = 0; x < puzzle[y].length; x++) {
                    if (puzzle[y][x]) {
                        lineFound = true;
                        if (this.area.getBlock(areaStartY, areaStartX + x)) {
                            return false;
                        }
                    }
                }
                if (lineFound) {
                    lines++;
                }
                if (areaStartY - lines < 0) {
                    break;
                }
            }
            return true;
        };
        //đặt block
        this.place = function () {
            this.tetris.stats.setPuzzles(this.tetris.stats.getPuzzles() + 1);
            if (this.tetris.stats.getPuzzles() >= (10 + this.tetris.stats.getSpeed() * 2)) {
                this.tetris.stats.setSpeed(this.tetris.stats.getSpeed() + 1);
                this.tetris.stats.setPuzzles(0);
            }
            let puzzle = this.puzzle[this.type];
            let areaStartX = parseInt((this.area.x - puzzle[0].length) / 2);
            let areaStartY = 1;
            let lineFound = false;
            let lines = 0;
            this.x = areaStartX;
            this.y = 1;
            //tạo ra block rỗng
            this.board = this.createEmptyPuzzle(puzzle.length, puzzle[0].length);
            //hiển thị ra block, di chuyển block xuống 1 ô với top và left xác định
            for (let y = puzzle.length - 1; y >= 0; y--) {
                for (let x = 0; x < puzzle[y].length; x++) {
                    if (puzzle[y][x]) {
                        lineFound = true;
                        let ele = document.createElement("div");
                        ele.className = "block" + this.type;
                        ele.style.left = (areaStartX + x) * this.area.unit + "px";
                        ele.style.top = (areaStartY - lines) * this.area.unit + "px";
                        this.area.el.appendChild(ele);
                        this.board[y][x] = ele;
                        this.elements.push(ele);
                    }
                }
                if (lines) {
                    this.y--;
                }
                if (lineFound) {
                    lines++;
                }
            }
            //reset rotate cho các khối ở level
            let lv;
            if (checkLv3) {
                lv = 3
            } else if (checkLv4) {
                lv = 4
            } else if (checkLv6) {
                lv = 6
            }
            self.tetris.supportRotate(lv);

            //hiển thị next puzzle bằng cách tạo ra div v append div với top và left đã có
            //next puzzle dùng random để tạo ra
            this.running = true;
            this.fallDownID = setTimeout(this.fallDown, this.speed);
            var nextPuzzle = this.puzzle[this.nextType];
            for (var y = 0; y < nextPuzzle.length; y++) {
                for (var x = 0; x < nextPuzzle[y].length; x++) {
                    if (nextPuzzle[y][x]) {
                        let ele = document.createElement("div");
                        ele.className = "block" + this.nextType;
                        ele.style.left = (x * this.area.unit) + "px";
                        ele.style.top = (y * this.area.unit) + "px";
                        document.getElementById("next-puzzle").appendChild(ele);
                        this.nextElements.push(ele);
                    }
                }
            }
        };
        //clear block
        this.destroy = function () {
            for (let i = 0; i < this.elements.length; i++) {
                this.area.el.removeChild(this.elements[i]);
            }
            this.elements = [];
            this.board = [];
            this.reset();
        };
        //tạo 1 khối block rỗng
        this.createEmptyPuzzle = function (y, x) {
            let puzzle = [];
            for (let y2 = 0; y2 < y; y2++) {
                puzzle.push([]);
                for (let x2 = 0; x2 < x; x2++) {
                    puzzle[y2].push(0);
                }
            }
            return puzzle;
        };
        //block cập nhật vị trí mới với fallDownID
        this.fallDown = function () {
            if (self.isRunning()) {
                if (self.canMoveDown()) {
                    self.moveDown();
                    self.fallDownID = setTimeout(self.fallDown, self.speed);
                }
                //duyệt qua các khối,nếu khối không rơi được nữa thì thực hiện rơi với khối tiếp theo
                else {
                    for (var i = 0; i < self.elements.length; i++) {
                        self.area.addElemetor(self.elements[i]);
                    }
                    var lines = self.area.removeAllLine();
                    if (lines) {
                        self.tetris.stats.setLines(self.tetris.stats.getLines() + lines);
                        self.tetris.stats.setScore(self.tetris.stats.getScore() + (1000 * self.tetris.stats.getSpeed() * lines));
                    }
                    self.reset();
                    if (self.canPlace()) {
                        self.place();
                    } else {
                        self.tetris.gameOver();
                    }
                }
            }
            //nếu là level 4 và level 6 thì sử dụng hàm touch để check khi khối va vào bug
            if (checkLv4 || checkLv6) {
                if (self.touch()) {
                    self.tetris.gameOver();
                }
            }
        };
        //tương tự như moveDown nhưng khi bấm space rơi với tốc độ nhanh hơn
        this.forceMoveDown = function () {
            if (!self.isRunning() && !self.isStopped()) {
                if (self.canMoveDown()) {
                    self.tetris.stats.setScore(self.tetris.stats.getScore() + 5 + self.tetris.stats.getSpeed());
                    self.tetris.stats.setActions(self.tetris.stats.getActions() + 1);
                    self.moveDown();
                    self.forceMoveDownID = setTimeout(self.forceMoveDown, 30);
                } else {
                    for (let i = 0; i < self.elements.length; i++) {
                        self.area.addElemetor(self.elements[i]);
                    }
                    let lines = self.area.removeAllLine();
                    if (lines) {
                        self.tetris.stats.setLines(self.tetris.stats.getLines() + lines);
                        self.tetris.stats.setScore(self.tetris.stats.getScore() + (1000 * self.tetris.stats.getSpeed() * lines));
                    }

                    self.reset();
                    if (self.canPlace()) {
                        self.place();
                    } else {
                        self.tetris.gameOver();
                    }
                }
            }
            if (checkLv4 || checkLv6) {
                if (self.touch()) {
                    self.tetris.gameOver();
                }
            }
        };

        //hàm check bug va chạm với block
        this.touch = function () {
            var bug = document.getElementById('bug');
            var blocks = document.querySelectorAll('[class^="block"]');
            var collision = false;

            blocks.forEach(function (block) {
                if (checkCollision(bug, block)) {
                    collision = true;
                }
            });
            return collision;
        };

        function checkCollision(element1, element2) {
            var rect1 = element1.getBoundingClientRect();
            var rect2 = element2.getBoundingClientRect();

            return !(
                rect1.right < rect2.left ||
                rect1.left > rect2.right ||
                rect1.bottom < rect2.top ||
                rect1.top > rect2.bottom
            );
        }

        this.stop = function () {
            this.running = false;
        };

        //check khối có thể rotate
        this.canRotate = function () {
            for (let y = 0; y < this.board.length; y++) {
                for (let x = 0; x < this.board[y].length; x++) {
                    if (this.board[y][x]) {
                        let newY = this.getY() + this.board.length - 1 - x;
                        let newX = this.getX() + y;
                        if (newY >= this.area.y) {
                            return false;
                        }
                        if (newX < 0) {
                            return false;
                        }
                        if (newX >= this.area.x) {
                            return false;
                        }
                        if (this.area.getBlock(newY, newX)) {
                            return false;
                        }
                    }
                }
            }
            return true;
        };
        //thực hiện rotate với vị trí các khối mới của nhóm block
        this.rotate = function () {
            let puzzle = this.createEmptyPuzzle(this.board.length, this.board[0].length);
            for (let y = 0; y < this.board.length; y++) {
                for (let x = 0; x < this.board[y].length; x++) {
                    if (this.board[y][x]) {
                        let ele = this.board[y][x];
                        let newX = y;
                        let newY = puzzle.length - 1 - x;
                        let moveX = newX - x;
                        let moveY = newY - y;
                        ele.style.left = ele.offsetLeft + (moveX * this.area.unit) + "px";
                        ele.style.top = ele.offsetTop + (moveY * this.area.unit) + "px";
                        puzzle[newY][newX] = ele;
                    }
                }
            }
            this.board = puzzle;
        };
        //check move down nếu như khối còn trong board và không chạm vào khu vực y
        this.canMoveDown = function () {
            let boolean = true;
            for (let y = 0; y < this.board.length; y++) {
                for (let x = 0; x < this.board[y].length; x++) {
                    if (this.board[y][x] && boolean) {
                        if ((this.getY() + y + 1 >= this.area.y) && boolean) {
                            this.stopped = true;
                            return false;
                        }
                        if (this.area.getBlock(this.getY() + y + 1, this.getX() + x)) {
                            this.stopped = true;
                            return false;
                        }
                    }
                }
            }
            return true;
        };
        //thực hiện move down theo 1 khoảng px cố định
        this.moveDown = function () {
            for (let i = 0; i < this.elements.length; i++) {
                this.elements[i].style.top = this.elements[i].offsetTop + this.area.unit + "px";
            }
            this.y++;
        };

        //tương tự với left và right

        //check move right
        this.canMoveLeft = function () {
            for (let y = 0; y < this.board.length; y++) {
                for (let x = 0; x < this.board[y].length; x++) {
                    if (this.board[y][x]) {
                        if (this.getX() + x - 1 < 0) {
                            return false;
                        }
                        if (this.area.getBlock(this.getY() + y, this.getX() + x - 1)) {
                            return false;
                        }
                    }
                }
            }
            return true;
        };
        //thực hiện move right
        this.moveLeft = function () {
            for (let i = 0; i < this.elements.length; i++) {
                this.elements[i].style.left = this.elements[i].offsetLeft - this.area.unit + "px";
            }
            this.x--;
        };
        //check move right
        this.canMoveRight = function () {
            const boolean = true;
            for (let y = 0; y < this.board.length; y++) {
                for (let x = 0; x < this.board[y].length; x++) {
                    if (this.board[y][x] && boolean) {
                        if (this.getX() + x + 1 >= this.area.x) { return false; }
                        if (this.area.getBlock(this.getY() + y, this.getX() + x + 1)) { return false; }
                    }
                }
            }
            return true;
        };
        //thực hiện move right
        this.moveRight = function () {
            for (let i = 0; i < this.elements.length; i++) {
                this.elements[i].style.left = this.elements[i].offsetLeft + this.area.unit + "px";
            }
            this.x++;
        };
    }

}
