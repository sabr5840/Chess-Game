document.addEventListener("DOMContentLoaded", function() {
    const boardElement = document.getElementById('board');
    const board = createBoard();
    boardElement.append(...board);

    // 2D array to represent the board
    window.boardState = [
        ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
        ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
        ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
    ];

    // Initialize the board with pieces based on boardState
    initializeBoard(window.boardState);
});

function createBoard() {
    const board = [];
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = 'square';
            square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
            square.id = `${row}-${col}`;
            square.addEventListener('dragover', handleDragOver);
            square.addEventListener('drop', handleDrop);
            board.push(square);
        }
    }
    return board;
}

function initializeBoard(boardState) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = boardState[row][col];
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.textContent = piece;
                pieceElement.className = 'piece';
                pieceElement.draggable = true;
                pieceElement.addEventListener('dragstart', handleDragStart);
                pieceElement.addEventListener('dragend', handleDragEnd);
                document.getElementById(`${row}-${col}`).appendChild(pieceElement);
            }
        }
    }
}

function updateBoardView(boardState) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.getElementById(`${row}-${col}`);
            square.innerHTML = ''; // Clear the square

            const piece = boardState[row][col];
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.textContent = piece;
                pieceElement.className = 'piece';
                pieceElement.draggable = true;
                pieceElement.addEventListener('dragstart', handleDragStart);
                pieceElement.addEventListener('dragend', handleDragEnd);
                square.appendChild(pieceElement);
            }
        }
    }
}

let draggedPiece = null;
let startSquare = null;

function handleDragStart(event) {
    draggedPiece = event.target;
    startSquare = draggedPiece.parentElement.id;
    setTimeout(() => {
        if (draggedPiece) {
            draggedPiece.style.display = 'none';
        }
    }, 0);
}

function handleDragEnd(event) {
    setTimeout(() => {
        if (draggedPiece) {
            draggedPiece.style.display = 'block';
        }
    }, 0);
    draggedPiece = null;
    startSquare = null;
}

function handleDragOver(event) {
    event.preventDefault();
}

function handleDrop(event) {
    event.preventDefault();
    const endSquare = event.target.id;

    if (draggedPiece && event.target.classList.contains('square')) {
        const [startRow, startCol] = startSquare.split('-').map(Number);
        const [endRow, endCol] = endSquare.split('-').map(Number);

        // Update the boardState array
        movePiece(startRow, startCol, endRow, endCol);

        // Update the board view
        updateBoardView(window.boardState);
    }
}

function movePiece(startRow, startCol, endRow, endCol) {
    // Update the boardState array
    const piece = window.boardState[startRow][startCol];
    window.boardState[startRow][startCol] = null;
    window.boardState[endRow][endCol] = piece;

    console.log(window.boardState);
}
