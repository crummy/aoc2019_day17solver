"use strict";
var Direction;
(function (Direction) {
    Direction[Direction["UP"] = 0] = "UP";
    Direction[Direction["RIGHT"] = 1] = "RIGHT";
    Direction[Direction["DOWN"] = 2] = "DOWN";
    Direction[Direction["LEFT"] = 3] = "LEFT";
})(Direction || (Direction = {}));
var Tile = (function () {
    function Tile(x, y) {
        this.x = x;
        this.y = y;
    }
    Tile.prototype.move = function (direction) {
        switch (direction) {
            case Direction.UP: return new Tile(this.x, this.y - 1);
            case Direction.RIGHT: return new Tile(this.x + 1, this.y);
            case Direction.DOWN: return new Tile(this.x, this.y + 1);
            case Direction.LEFT: return new Tile(this.x - 1, this.y);
        }
    };
    Tile.prototype.getId = function () {
        return Tile.getId(this.x, this.y);
    };
    Tile.getId = function (x, y) {
        return "tile_" + x + "_" + y;
    };
    return Tile;
}());
var Scaffolding = (function () {
    function Scaffolding(text) {
        var _this = this;
        this.tiles = [];
        this.startDirection = null;
        this.startTile = null;
        text.split("\n").forEach(function (row, y) {
            _this.tiles[y] = [];
            for (var x = 0; x < row.length; ++x) {
                var char = row.charAt(x);
                _this.tiles[y][x] = char;
                switch (char) {
                    case ".": break;
                    case "#": break;
                    case "^":
                    case ">":
                    case "v":
                    case "<":
                        _this.setStartLocation(char, x, y);
                        break;
                    default:
                        throw new Error("Unexpected map input: " + char);
                }
            }
        });
    }
    Scaffolding.prototype.setStartLocation = function (char, x, y) {
        console.log("Found start tile " + char + " at " + x + ", " + y);
        this.startTile = new Tile(x, y);
        if (char == "^")
            this.startDirection = Direction.UP;
        else if (char == ">")
            this.startDirection = Direction.RIGHT;
        else if (char == "v")
            this.startDirection = Direction.DOWN;
        else if (char == "<")
            this.startDirection = Direction.LEFT;
    };
    return Scaffolding;
}());
var Grid = (function () {
    function Grid(scaffolding) {
        var _this = this;
        this.scaffolding = scaffolding;
        this.table = document.createElement("table");
        scaffolding.tiles.forEach(function (row, y) {
            var tr = document.createElement("tr");
            row.forEach(function (char, x) {
                var td = document.createElement("td");
                td.id = Tile.getId(x, y);
                td.innerHTML = char;
                tr.appendChild(td);
            });
            _this.table.appendChild(tr);
        });
    }
    Grid.prototype.paint = function (tile) {
        var selector = "#" + tile.getId();
        console.log("painting " + tile.x + ", " + tile.y);
        var cell = document.querySelector(selector);
        if (cell == null) {
            throw new Error("No cell at " + selector);
        }
        switch (cell.innerHTML) {
            case ".":
                cell.classList.add("red");
                break;
            case "#":
                cell.classList.add("green");
                break;
            default: throw Error("Unexpected cell content at tile " + tile);
        }
    };
    return Grid;
}());
var scaffolding = null;
var grid = null;
var submitMapButton = document.querySelector("#submit_map");
var submissionPane = document.querySelector("#submission");
var mapPane = document.querySelector("#map");
var pathInput = document.querySelector("#path");
submitMapButton.onclick = function () {
    var _a;
    try {
        var mapInput = (_a = document.querySelector("#map_input")) === null || _a === void 0 ? void 0 : _a.value;
        scaffolding = new Scaffolding(mapInput);
        grid = new Grid(scaffolding);
    }
    catch (e) {
        setError("Failed to parse map input", e);
        throw e;
    }
    submissionPane.classList.add("hidden");
    mapPane.classList.remove("hidden");
    mapPane.appendChild(grid.table);
    pathInput.oninput = function () { return updateMap(pathInput.value); };
};
function updateMap(path) {
    document.querySelectorAll("td").forEach(function (cell) {
        cell.classList.remove("green");
        cell.classList.remove("red");
    });
    var position = scaffolding.startTile;
    var direction = scaffolding.startDirection;
    for (var _i = 0, _a = path.split(",").filter(function (item) { return item.length > 0; }); _i < _a.length; _i++) {
        var instruction = _a[_i];
        console.log(instruction);
        switch (instruction) {
            case "R":
                direction = (direction + 1) % 4;
                console.log("turned R to face " + direction);
                break;
            case "L":
                direction = (direction - 1) % 4;
                if (direction < 0)
                    direction += 4;
                console.log("turned L to face " + direction);
                break;
            default:
                console.log("moving " + instruction + " steps in " + direction);
                for (var x = 0; x < Number.parseInt(instruction); x++) {
                    position = position.move(direction);
                    grid.paint(position);
                }
        }
    }
}
function setError(message, e) {
    document.querySelector("#error").innerText = message + ": " + e;
}
//# sourceMappingURL=index.js.map