enum Direction {
  UP, RIGHT, DOWN, LEFT
}

class Tile {
  constructor(readonly x: number, readonly y: number) { }

  move(direction: Direction) {
    switch (direction) {
      case Direction.UP: return new Tile(this.x, this.y - 1)
      case Direction.RIGHT: return new Tile(this.x + 1, this.y)
      case Direction.DOWN: return new Tile(this.x, this.y + 1)
      case Direction.LEFT: return new Tile(this.x - 1, this.y)
    }
  }

  getId(): string {
    return Tile.getId(this.x, this.y)
  }

  static getId(x: number, y: number): string {
    return `tile_${x}_${y}`
  }
}

class Scaffolding {
  readonly tiles: string[][] = []
  startDirection: Direction | null = null
  startTile: Tile | null = null

  constructor(text: String) {
    text.split("\n").forEach((row: string, y: number) => {
      this.tiles[y] = []
      for (let x = 0; x < row.length; ++x) {
        let char = row.charAt(x)
        this.tiles[y][x] = char
        switch (char) {
          case ".": break
          case "#": break
          case "^":
          case ">":
          case "v":
          case "<":
            this.setStartLocation(char, x, y)
            break
          default:
            throw new Error(`Unexpected map input: ${char}`)
        }
      }
    })
  }

  setStartLocation(char: String, x: number, y: number) {
    console.log(`Found start tile ${char} at ${x}, ${y}`)
    this.startTile = new Tile(x, y)
    if (char == "^") this.startDirection = Direction.UP
    else if (char == ">") this.startDirection = Direction.RIGHT
    else if (char == "v") this.startDirection = Direction.DOWN
    else if (char == "<") this.startDirection = Direction.LEFT
  }
}

class Grid {
  readonly table: HTMLTableElement = document.createElement("table")
  constructor(readonly scaffolding: Scaffolding) {
    scaffolding.tiles.forEach((row, y) => {
      let tr: HTMLTableRowElement = document.createElement("tr")
      row.forEach((char, x) => {
        let td: HTMLTableCellElement = document.createElement("td")
        td.id = Tile.getId(x, y)
        td.innerHTML = char
        tr.appendChild(td)
      })
      this.table.appendChild(tr)
    })
  }

  paint(tile: Tile) {
    let selector = `#${tile.getId()}`
    console.log(`painting ${tile.x}, ${tile.y}`)
    let cell = document.querySelector(selector)
    if (cell == null) {
      throw new Error(`No cell at ${selector}`)
    }
    switch (cell.innerHTML) {
      case ".": cell.classList.add("red"); break
      case "#": cell.classList.add("green"); break
      default: throw Error(`Unexpected cell content at tile ${tile}`)
    }
  }
}

let scaffolding: Scaffolding | null = null
let grid: Grid | null = null
let submitMapButton = document.querySelector<HTMLInputElement>("#submit_map")!
let submissionPane = document.querySelector<HTMLDivElement>("#submission")!
let mapPane = document.querySelector<HTMLDivElement>("#map")!
let pathInput = document.querySelector<HTMLInputElement>("#path")!

submitMapButton.onclick = () => {
  try {
    let mapInput = document.querySelector<HTMLTextAreaElement>("#map_input")?.value
    scaffolding = new Scaffolding(mapInput!)
    grid = new Grid(scaffolding)
  } catch (e) {
    setError("Failed to parse map input", e)
    throw e
  }
  submissionPane.classList.add("hidden")
  mapPane.classList.remove("hidden")
  mapPane.appendChild(grid.table)
  pathInput.oninput = () => updateMap(pathInput.value)
}
function updateMap(path: string) {
  document.querySelectorAll("td").forEach(cell => {
    cell.classList.remove("green")
    cell.classList.remove("red")
  })
  let position = scaffolding!.startTile!
  let direction = scaffolding!.startDirection!
  for (let instruction of path.split(",").filter(item => item.length > 0)) {
    console.log(instruction)
    switch (instruction) {
      case "R":
        direction = (direction + 1) % 4
        console.log(`turned R to face ${direction}`)
        break;
      case "L":
        direction = (direction - 1) % 4
        if (direction < 0) direction += 4
        console.log(`turned L to face ${direction}`)
        break;
      default:
        console.log(`moving ${instruction} steps in ${direction}`)
        for (let x = 0; x < Number.parseInt(instruction); x++) {
          position = position.move(direction)
          grid!.paint(position)
        }
    }
  }
}

function setError(message: String, e: any) {
  document.querySelector<HTMLDivElement>("#error")!.innerText = `${message}: ${e}`
}
