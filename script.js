
document.addEventListener("DOMContentLoaded", function() {
    const boardElement = document.getElementById('board');
    const board = createBoard();
    boardElement.append(...board);

    document.getElementById('play-again-button').addEventListener('click', resetGame);
    document.getElementById('close-check-message').addEventListener('click', closeCheckMessage);

    initializeGame();
});

function createBoard() {
    const board = [];
    const letters = 'ABCDEFGH';

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = 'square';
            square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
            square.id = `${row}-${col}`;
            if (col === 0) {
                square.setAttribute('data-row', 'true');
                square.setAttribute('data-row-number', 8 - row);
            }
            if (row === 7) {
                square.setAttribute('data-col', 'true');
                square.setAttribute('data-col-letter', letters[col]);
            }
            square.addEventListener('dragover', handleDragOver);
            square.addEventListener('drop', handleDrop);
            board.push(square);
        }
    }

    return board;
}

function initializeGame() {
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

    window.kingPositions = {
        white: [7, 4],
        black: [0, 4]
    };

    window.enPassantTarget = null;

    window.castlingRights = {
        white: { kingSide: true, queenSide: true },
        black: { kingSide: true, queenSide: true }
    };

    window.currentPlayer = 'white';
    displayCurrentPlayer();
    initializeBoard(window.boardState);
}

function resetGame() {
    const endgamePopup = document.getElementById('endgame-popup');
    endgamePopup.style.display = 'none';
    initializeGame();
    updateBoardView(window.boardState);
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

function updateKingPosition(row, col, piece) {
    if (piece === '♔') {
        window.kingPositions.white = [row, col];
    } else if (piece === '♚') {
        window.kingPositions.black = [row, col];
    }
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
            if (window.enPassantTarget && window.enPassantTarget[0] === startRow + direction && window.enPassantTarget[1] === endCol) {
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
        const side = startCol < endCol ? 'kingSide' : 'queenSide';
        return canCastle(startRow, startCol, side);
    }

    return rowDiff <= 1 && colDiff <= 1;
}

function canCastle(row, col, side) {
    if (window.castlingRights[window.currentPlayer][side]) {
        if (side === 'kingSide') {
            return (
                window.boardState[row][col + 1] === null &&
                window.boardState[row][col + 2] === null &&
                window.boardState[row][col + 3] === (window.currentPlayer === 'white' ? '♖' : '♜')
            );
        } else if (side === 'queenSide') {
            return (
                window.boardState[row][col - 1] === null &&
                window.boardState[row][col - 2] === null &&
                window.boardState[row][col - 3] === null &&
                window.boardState[row][col - 4] === (window.currentPlayer === 'white' ? '♖' : '♜')
            );
        }
    }
    return false;
}

function movePiece(startRow, startCol, endRow, endCol) {
    const piece = window.boardState[startRow][startCol];
    const capturedPiece = window.boardState[endRow][endCol];

    if (capturedPiece) {
        document.getElementById(`${endRow}-${endCol}`).innerHTML = '';
    }

    // Handle castling
    if ((piece === '♔' || piece === '♚') && Math.abs(startCol - endCol) === 2) {
        const isKingSide = endCol > startCol;
        const rookStartCol = isKingSide ? 7 : 0;
        const rookEndCol = isKingSide ? 5 : 3;
        const rookPiece = window.boardState[startRow][rookStartCol];

        window.boardState[startRow][rookStartCol] = null;
        window.boardState[startRow][rookEndCol] = rookPiece;

        const rookElement = document.createElement('div');
        rookElement.textContent = rookPiece;
        rookElement.className = 'piece';
        rookElement.draggable = true;
        rookElement.addEventListener('dragstart', handleDragStart);
        rookElement.addEventListener('dragend', handleDragEnd);
        document.getElementById(`${startRow}-${rookEndCol}`).appendChild(rookElement);
        document.getElementById(`${startRow}-${rookStartCol}`).innerHTML = '';
    }

    window.boardState[startRow][startCol] = null;
    window.boardState[endRow][endCol] = piece;


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

    updateKingPosition(endRow, endCol, piece);
    updateBoardView(window.boardState);
}

function isPathClear(startRow, startCol, endRow, endCol) {
    const rowStep = endRow > startRow ? 1 : endRow < startRow ? -1 : 0;
    const colStep = endCol > startCol ? 1 : endCol < startCol ? -1 : 0;

    let row = startRow + rowStep;
    let col = startCol + colStep;

    while (row !== endRow || col !== endCol) {
        if (window.boardState[row][col] !== null) {
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
                    highlightKingInCheck(kingPosition);  // Highlight the king
                    return true;
                }
            }
        }
    }
    removeKingInCheckHighlight(kingPosition);  // Remove highlight if not in check
    return false;
}

function highlightKingInCheck(kingPosition) {
    const [row, col] = kingPosition;
    const kingSquare = document.getElementById(`${row}-${col}`);
    kingSquare.classList.add('king-in-check');
}

function removeKingInCheckHighlight(kingPosition) {
    const [row, col] = kingPosition;
    const kingSquare = document.getElementById(`${row}-${col}`);
    kingSquare.classList.remove('king-in-check');
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
    const endgameMessage = document.getElementById('endgame-message');
    const endgamePopup = document.getElementById('endgame-popup');
    const closeCheckMessageButton = document.getElementById('close-check-message');
    const blackWritingHeading = document.getElementById('black-writing-heading');

    if (inCheck) {
        if (legalMoves.length === 0) {
            endgameMessage.textContent = currentPlayer === 'white' ? 'Black wins by checkmate!' : 'White wins by checkmate!';
            endgamePopup.style.display = 'block';
        } else {
            showCheckMessage(currentPlayer);
            if (currentPlayer === 'white') {
                closeCheckMessageButton.style.display = 'block';
                blackWritingHeading.style.display = 'block';
            } else {
                closeCheckMessageButton.style.display = 'none';
                blackWritingHeading.style.display = 'none';
            }
        }
    } else {
        if (legalMoves.length === 0) {
            endgameMessage.textContent = 'Stalemate!';
            endgamePopup.style.display = 'block';
        }
        closeCheckMessageButton.style.display = 'none';
        blackWritingHeading.style.display = 'none';
    }
}

function showCheckMessage(player) {
    const checkMessageModal = document.getElementById('check-message-modal');
    const checkMessageText = document.getElementById('check-message-text');
    if (player === 'white') {
        checkMessageText.textContent = "Looks like your king is in a bit of a predicament there, muhaha.";
    } else {
        checkMessageText.textContent = ""; // Empty string to ensure no message for black's check
    }
    checkMessageModal.style.display = player === 'white' ? 'block' : 'none';
}

function closeCheckMessage() {
    document.getElementById('check-message-modal').style.display = 'none';
    document.getElementById('close-check-message').style.display = 'none';
    document.getElementById('black-writing-heading').style.display = 'none';
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