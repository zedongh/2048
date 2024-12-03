class Game2048 {
    constructor() {
        this.board = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.gameBoard = document.getElementById('game-board');
        this.scoreDisplay = document.getElementById('score');
        this.tiles = new Map();
        this.setupBoard();
        this.setupEventListeners();
        this.initializeGame();
    }

    setupBoard() {
        // Create empty grid cells
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            this.gameBoard.appendChild(cell);
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key.startsWith('Arrow')) {
                e.preventDefault();
                const moved = this.move(e.key.toLowerCase().replace('arrow', ''));
                if (moved) {
                    setTimeout(() => {
                        this.addRandomTile();
                        if (this.hasWon()) {
                            alert('Congratulations! You\'ve reached 2048! You can continue playing if you wish.');
                        } else if (!this.canMove()) {
                            alert('Game Over! No more moves possible. Your score: ' + this.score);
                        }
                    }, 150);
                }
            }
        });
    }

    initializeGame() {
        this.addRandomTile();
        this.addRandomTile();
    }

    createTileElement(value, row, col) {
        const tile = document.createElement('div');
        tile.classList.add('tile', `tile-${value}`);
        tile.textContent = value;
        this.setTilePosition(tile, row, col);
        return tile;
    }

    setTilePosition(tile, row, col) {
        tile.style.top = `${row * (106 + 15) + 15}px`;
        tile.style.left = `${col * (106 + 15) + 15}px`;
    }

    addRandomTile() {
        const emptyCells = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (this.board[r][c] === 0) {
                    emptyCells.push({r, c});
                }
            }
        }

        if (emptyCells.length > 0) {
            const {r, c} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const value = Math.random() < 0.9 ? 2 : 4;
            this.board[r][c] = value;
            
            const tile = this.createTileElement(value, r, c);
            this.gameBoard.appendChild(tile);
            this.tiles.set(`${r}-${c}`, tile);
            
            // Add appear animation
            tile.style.transform = 'scale(0)';
            setTimeout(() => {
                tile.style.transform = 'scale(1)';
            }, 50);
        }
    }

    move(direction) {
        let moved = false;
        const rotatedBoard = this.getRotatedBoard(direction);
        
        for (let r = 0; r < 4; r++) {
            const row = rotatedBoard[r].filter(val => val !== 0);
            let newRow = Array(4).fill(0);
            let position = 0;
            
            for (let i = 0; i < row.length; i++) {
                if (i + 1 < row.length && row[i] === row[i + 1]) {
                    newRow[position] = row[i] * 2;
                    this.score += newRow[position];
                    i++;
                } else {
                    newRow[position] = row[i];
                }
                position++;
            }
            
            if (JSON.stringify(rotatedBoard[r]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            rotatedBoard[r] = newRow;
        }
        
        if (moved) {
            const newBoard = this.getUnrotatedBoard(rotatedBoard, direction);
            this.updateTiles(newBoard);
            this.board = newBoard;
            this.scoreDisplay.textContent = this.score;
        }
        
        return moved;
    }

    updateTiles(newBoard) {
        // Remove old tiles
        this.tiles.forEach(tile => {
            this.gameBoard.removeChild(tile);
        });
        this.tiles.clear();

        // Add new tiles
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (newBoard[r][c] !== 0) {
                    const tile = this.createTileElement(newBoard[r][c], r, c);
                    this.gameBoard.appendChild(tile);
                    this.tiles.set(`${r}-${c}`, tile);
                }
            }
        }
    }

    getRotatedBoard(direction) {
        let board = JSON.parse(JSON.stringify(this.board));
        
        switch(direction) {
            case 'left': 
                return board;
            case 'right': 
                return board.map(row => row.reverse());
            case 'up':
                return this.transpose(board);
            case 'down':
                return this.transpose(board).map(row => row.reverse());
            default:
                return board;
        }
    }

    getUnrotatedBoard(board, direction) {
        switch(direction) {
            case 'left': 
                return board;
            case 'right': 
                return board.map(row => row.reverse());
            case 'up':
                return this.transpose(board);
            case 'down':
                return this.transpose(board.map(row => row.reverse()));
            default:
                return board;
        }
    }

    transpose(board) {
        return board[0].map((_, colIndex) => board.map(row => row[colIndex]));
    }

    canMove() {
        // Check for empty cells
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (this.board[r][c] === 0) return true;
            }
        }
        
        // Check for possible merges
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const current = this.board[r][c];
                if (
                    (r < 3 && current === this.board[r + 1][c]) ||
                    (c < 3 && current === this.board[r][c + 1])
                ) {
                    return true;
                }
            }
        }
        
        return false;
    }

    hasWon() {
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (this.board[r][c] === 2048) {
                    return true;
                }
            }
        }
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
