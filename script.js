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

    // Store king positions
    window.kingPositions = {
        white: [7, 4],
        black: [0, 4]
    };

    // En passant target
    window.enPassantTarget = null;

    // Castling rights
    window.castlingRights = {
        white: { kingSide: true, queenSide: true },
        black: { kingSide: true, queenSide: true }
    };

    // Current player state
    window.currentPlayer = 'white';

    // Display current player
    displayCurrentPlayer();

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

function displayCurrentPlayer() {
    const blackTurnElement = document.getElementById('black-turn');
    const whiteTurnElement = document.getElementById('white-turn');
    if (window.currentPlayer === 'white') {
        blackTurnElement.style.display = 'none';
        whiteTurnElement.style.display = 'block';
    } else {
        blackTurnElement.style.display = 'block';
        whiteTurnElement.style.display = 'none';
    }
}

let draggedPiece = null;
let startSquare = null;

function handleDragStart(event) {
    draggedPiece = event.target;
    startSquare = draggedPiece.parentElement.id;

    const pieceColor = getPieceColor(draggedPiece.textContent);
    if (pieceColor !== window.currentPlayer) {
        event.preventDefault();
        draggedPiece = null;
        startSquare = null;
    } else {
        setTimeout(() => {
            if (draggedPiece) {
                draggedPiece.style.display = 'none';
            }
        }, 0);
    }
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
    const endSquare = event.target.closest('.square').id;

    if (draggedPiece && endSquare) {
        const [startRow, startCol] = startSquare.split('-').map(Number);
        const [endRow, endCol] = endSquare.split('-').map(Number);

        console.log(`Trying to move from ${startRow}-${startCol} to ${endRow}-${endCol}`);

        if (isValidMove(startRow, startCol, endRow, endCol)) {
            movePiece(startRow, startCol, endRow, endCol);
            updateBoardView(window.boardState);
            togglePlayer();
        } else {
            // Revert the piece to its original position
            const startSquareElement = document.getElementById(startSquare);
            startSquareElement.appendChild(draggedPiece);
            draggedPiece.style.display = 'block'; // Ensure the piece is visible again
            showInvalidMoveMessage();
        }
    }
}

function showInvalidMoveMessage() {
    alert("Invalid move! Please try again.");
}

function movePiece(startRow, startCol, endRow, endCol) {
    const piece = window.boardState[startRow][startCol];
    const capturedPiece = window.boardState[endRow][endCol];
    
    // Log the pieces involved
    console.log(`Moving piece ${piece} from ${startRow}-${startCol} to ${endRow}-${endCol}`);
    if (capturedPiece) {
        console.log(`Captured piece: ${capturedPiece}`);
        document.getElementById(`${endRow}-${endCol}`).innerHTML = '';
    }

    // Handle castling
    if (piece === '♔' || piece === '♚') {
        if (Math.abs(startCol - endCol) === 2) {
            const isKingSide = endCol > startCol;
            const rookStartCol = isKingSide ? 7 : 0;
            const rookEndCol = isKingSide ? 5 : 3;
            const rookPiece = window.boardState[startRow][rookStartCol];
            
            // Move the rook
            window.boardState[startRow][rookStartCol] = null;
            window.boardState[startRow][rookEndCol] = rookPiece;
        }
    }

    window.boardState[startRow][startCol] = null;
    window.boardState[endRow][endCol] = piece;

    // Handle en passant capture
    if ((piece === '♙' || piece === '♟') && startCol !== endCol && window.boardState[endRow][endCol] === null) {
        window.boardState[startRow][endCol] = null;
    }

    // Handle promotion
    if (piece === '♙' && endRow === 0) {
        promotePawn(endRow, endCol, 'white');
    } else if (piece === '♟' && endRow === 7) {
        promotePawn(endRow, endCol, 'black');
    }

    // Update castling rights
    if (piece === '♔') {
        window.castlingRights.white.kingSide = false;
        window.castlingRights.white.queenSide = false;
    } else if (piece === '♚') {
        window.castlingRights.black.kingSide = false;
        window.castlingRights.black.queenSide = false;
    } else if (piece === '♖' && startCol === 0) {
        window.castlingRights.white.queenSide = false;
    } else if (piece === '♖' && startCol === 7) {
        window.castlingRights.white.kingSide = false;
    } else if (piece === '♜' && startCol === 0) {
        window.castlingRights.black.queenSide = false;
    } else if (piece === '♜' && startCol === 7) {
        window.castlingRights.black.kingSide = false;
    }

    // Update king position if a king is moved
    if (piece === '♔') {
        window.kingPositions.white = [endRow, endCol];
    } else if (piece === '♚') {
        window.kingPositions.black = [endRow, endCol];
    }

    console.log("Board after move:", window.boardState);
}

function promotePawn(row, col, color) {
    const promotionPiece = prompt(`Promote your pawn to: Q (Queen), R (Rook), B (Bishop), N (Knight)`, 'Q').toUpperCase();
    let newPiece = '♕';
    if (color === 'black') {
        if (promotionPiece === 'Q') newPiece = '♛';
        if (promotionPiece === 'R') newPiece = '♜';
        if (promotionPiece === 'B') newPiece = '♝';
        if (promotionPiece === 'N') newPiece = '♞';
    } else {
        if (promotionPiece === 'Q') newPiece = '♕';
        if (promotionPiece === 'R') newPiece = '♖';
        if (promotionPiece === 'B') newPiece = '♗';
        if (promotionPiece === 'N') newPiece = '♘';
    }
    window.boardState[row][col] = newPiece;
    updateBoardView(window.boardState);
}

function isValidMove(startRow, startCol, endRow, endCol, ignoreCheck = false) {
    const piece = window.boardState[startRow][startCol];
    const target = window.boardState[endRow][endCol];
    const currentPlayer = getPieceColor(piece);

    if (!ignoreCheck) {
        // Simulate the move and check if it puts the king in check
        const tempBoard = JSON.parse(JSON.stringify(window.boardState));
        tempBoard[endRow][endCol] = tempBoard[startRow][startCol];
        tempBoard[startRow][startCol] = null;
        const kingPosition = window.kingPositions[currentPlayer];
        if (isKingInCheck(tempBoard, kingPosition, currentPlayer)) {
            console.log("Move would put king in check");
            return false;
        }
    }

    // Validating different piece moves
    if (piece === '♙' || piece === '♟') return isValidPawnMove(startRow, startCol, endRow, endCol, piece, target);
    if (piece === '♘' || piece === '♞') return isValidKnightMove(startRow, startCol, endRow, endCol, target);
    if (piece === '♗' || piece === '♝') return isValidBishopMove(startRow, startCol, endRow, endCol, target);
    if (piece === '♖' || piece === '♜') return isValidRookMove(startRow, startCol, endRow, endCol, target);
    if (piece === '♕' || piece === '♛') return isValidQueenMove(startRow, startCol, endRow, endCol, target);
    if (piece === '♔' || piece === '♚') return isValidKingMove(startRow, startCol, endRow, endCol, target);

    return false;
}

function isValidPawnMove(startRow, startCol, endRow, endCol, piece, target) {
    const direction = piece === '♙' ? -1 : 1;
    const startRowForPawn = piece === '♙' ? 6 : 1;

    // Normal forward moves
    if (startCol === endCol && target === null) {
        if (startRow + direction === endRow) return true;
        if (startRow === startRowForPawn && startRow + 2 * direction === endRow && window.boardState[startRow + direction][startCol] === null) {
            window.enPassantTarget = [endRow, endCol];
            return true;
        }
    }

    // Diagonal capture
    if (Math.abs(startCol - endCol) === 1) {
        if (startRow + direction === endRow) {
            if (target !== null) return true;
            if (window.enPassantTarget && window.enPassantTarget[0] === startRow && window.enPassantTarget[1] === endCol) {
                return true;
            }
        }
    }

    return false;
}

function isValidKnightMove(startRow, startCol, endRow, endCol, target) {
    const rowDiff = Math.abs(startRow - endRow);
    const colDiff = Math.abs(startCol - endCol);
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
}

function isValidBishopMove(startRow, startCol, endRow, endCol, target) {
    if (Math.abs(startRow - endRow) !== Math.abs(startCol - endCol)) return false;
    return isPathClear(startRow, startCol, endRow, endCol);
}

function isValidRookMove(startRow, startCol, endRow, endCol, target) {
    if (startRow !== endRow && startCol !== endCol) return false;
    return isPathClear(startRow, startCol, endRow, endCol);
}

function isValidQueenMove(startRow, startCol, endRow, endCol, target) {
    if (Math.abs(startRow - endRow) === Math.abs(startCol - endCol)) return isPathClear(startRow, startCol, endRow, endCol);
    if (startRow === endRow || startCol === endCol) return isPathClear(startRow, startCol, endRow, endCol);
    return false;
}

function isValidKingMove(startRow, startCol, endRow, endCol, target) {
    const rowDiff = Math.abs(startRow - endRow);
    const colDiff = Math.abs(startCol - endCol);

    // Check for castling
    if (rowDiff === 0 && colDiff === 2) {
        if (startCol < endCol) {
            // King-side castling
            return canCastle(startRow, startCol, 'king-side');
        } else {
            // Queen-side castling
            return canCastle(startRow, startCol, 'queen-side');
        }
    }

    return rowDiff <= 1 && colDiff <= 1;
}

function canCastle(row, kingCol, side) {
    console.log("Attempting to castle", side);

    const isWhite = window.boardState[row][kingCol] === '♔';
    const king = isWhite ? '♔' : '♚';
    const rook = isWhite ? '♖' : '♜';
    const opponent = isWhite ? 'black' : 'white';

    if (side === 'king-side') {
        const rookCol = 7;
        if (window.boardState[row][rookCol] !== rook) {
            console.log("No rook at the expected position for king-side castling.");
            return false;
        }
        if (!isPathClear(row, kingCol, row, rookCol - 1)) {
            console.log("Path is not clear for king-side castling.");
            return false;
        }
        if (isKingInCheck(window.boardState, [row, kingCol], opponent) ||
            isKingInCheck(window.boardState, [row, kingCol + 1], opponent) ||
            isKingInCheck(window.boardState, [row, kingCol + 2], opponent)) {
            console.log("King would be in check during king-side castling.");
            return false;
        }

        // Move the rook as well
        window.boardState[row][rookCol] = null;
        window.boardState[row][kingCol + 1] = rook;

        return true;
    } else if (side === 'queen-side') {
        const rookCol = 0;
        if (window.boardState[row][rookCol] !== rook) {
            console.log("No rook at the expected position for queen-side castling.");
            return false;
        }
        if (!isPathClear(row, kingCol, row, rookCol + 1)) {
            console.log("Path is not clear for queen-side castling.");
            return false;
        }
        if (isKingInCheck(window.boardState, [row, kingCol], opponent) ||
            isKingInCheck(window.boardState, [row, kingCol - 1], opponent) ||
            isKingInCheck(window.boardState, [row, kingCol - 2], opponent)) {
            console.log("King would be in check during queen-side castling.");
            return false;
        }

        // Move the rook as well
        window.boardState[row][rookCol] = null;
        window.boardState[row][kingCol - 1] = rook;

        return true;
    }

    return false;
}

function isPathClear(startRow, startCol, endRow, endCol) {
    const rowStep = endRow > startRow ? 1 : endRow < startRow ? -1 : 0;
    const colStep = endCol > startCol ? 1 : endCol < startCol ? -1 : 0;

    let row = startRow + rowStep;
    let col = startCol + colStep;

    console.log(`Checking path from (${startRow}, ${startCol}) to (${endRow}, ${endCol})`);
    while (row !== endRow || col !== endCol) {
        console.log(`Checking square (${row}, ${col})`);
        if (window.boardState[row][col] !== null) {
            console.log(`Path blocked at (${row}, ${col}) by ${window.boardState[row][col]}`);
            return false;
        }
        row += rowStep;
        col += colStep;
    }

    return true;
}

function isKingInCheck(boardState, kingPosition, currentPlayer) {
    const opponent = currentPlayer === 'white' ? 'black' : 'white';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = boardState[row][col];
            if (piece && getPieceColor(piece) === opponent) {
                if (isValidMove(row, col, kingPosition[0], kingPosition[1], true)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function getAllLegalMoves(boardState, currentPlayer) {
    const moves = [];
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = boardState[row][col];
            if (piece && getPieceColor(piece) === currentPlayer) {
                for (let targetRow = 0; targetRow < 8; targetRow++) {
                    for (let targetCol = 0; targetCol < 8; targetCol++) {
                        if (isValidMove(row, col, targetRow, targetCol, true)) {  // Skip check simulation for performance
                            // Simulate the move
                            const tempBoard = JSON.parse(JSON.stringify(boardState));
                            tempBoard[targetRow][targetCol] = tempBoard[row][col];
                            tempBoard[row][col] = null;
                            const kingPosition = window.kingPositions[currentPlayer];
                            if (kingPosition && !isKingInCheck(tempBoard, kingPosition, currentPlayer)) {
                                moves.push({start: [row, col], end: [targetRow, targetCol]});
                            }
                        }
                    }
                }
            }
        }
    }
    return moves;
}

function checkForCheckmateOrStalemate(currentPlayer) {
    const kingPosition = window.kingPositions[currentPlayer];
    if (!kingPosition) {
        console.error("King position not found for player", currentPlayer);
        return;
    }
    console.log(`King position for ${currentPlayer}:`, kingPosition);
    const inCheck = isKingInCheck(window.boardState, kingPosition, currentPlayer);
    const legalMoves = getAllLegalMoves(window.boardState, currentPlayer);
    if (inCheck) {
        if (legalMoves.length === 0) {
            alert(currentPlayer === 'white' ? 'Black wins by checkmate!' : 'White wins by checkmate!');
        } else {
            alert('Check!');
        }
    } else {
        if (legalMoves.length === 0) {
            alert('Stalemate!');
        }
    }
}

function togglePlayer() {
    window.currentPlayer = window.currentPlayer === 'white' ? 'black' : 'white';
    console.log(`Current player: ${window.currentPlayer}`);
    displayCurrentPlayer();
    checkForCheckmateOrStalemate(window.currentPlayer);
}

function getPieceColor(piece) {
    if (piece === '♙' || piece === '♘' || piece === '♗' || piece === '♖' || piece === '♕' || piece === '♔') {
        return 'white';
    } else {
        return 'black';
    }
}
