
const socket = io();

const chess= new Chess();

const boardElement=document.querySelector('.chessboard');

let draggedPiece=null;
let sourceSquare=null;
let playerRole=null;



const renderBoard=()=>{
    const board=chess.board()
    boardElement.innerHTML="";
    board.forEach((row,rowIndex)=>{
        row.forEach((square,squareIndex)=>{
            const squareElement=document.createElement('div');
            squareElement.classList.add('square', (rowIndex + squareIndex) % 2=== 0 ? 'light' :'dark');

            squareElement.dataset.row=rowIndex;
            squareElement.dataset.col=squareIndex;

            if(square){
                const pieceElement=document.createElement('div');
                pieceElement.classList.add('piece',(square.color=='w')? 'white':'black');

                pieceElement.innerText=getPieceUniCode(square);
                pieceElement.draggable=playerRole===square.color;

                pieceElement.addEventListener('dragstart',(e)=>{
                    if(pieceElement.draggable){
                        draggedPiece=pieceElement;
                        sourceSquare={row:rowIndex,column:squareIndex}
                        e.dataTransfer.setData('text/plain','');
                    }
                })

                pieceElement.addEventListener('dragend',(e)=>{
                    draggedPiece=null;
                    sourceSquare=null;
                })
                squareElement.append(pieceElement)
            }
            squareElement.addEventListener('dragover',(e)=>{
                e.preventDefault();
            })
            squareElement.addEventListener('drop',(e)=>{
                if(draggedPiece){
                    const targetSquare={
                        row:parseInt(squareElement.dataset.row),
                        col:parseInt(squareElement.dataset.col)
                    }

                    handleMove(sourceSquare,targetSquare)
                }
            })
            boardElement.appendChild(squareElement)
        })
    })
    if(playerRole==='b'){
        boardElement.classList.add("flipped")
    }
    else{
        boardElement.classList.remove("flipped")
    }
}


function getPieceUniCode({type}){
    const piecesUniCode={
      p:'♙',
      r:'♜',
      n:'♞',
      b:'♝',
      q:'♛',
      k:'♚',
      P:'♙',
      R:'♖',
      N:'♘',
      B:'♗',
      Q:'♕',
      K:'♔', 
  
  }
//   console.log(piecesUniCode.p)
  return piecesUniCode[type] || "";
  }

function handleMove(source,target){
    const move={
        from:`${String.fromCharCode(97+source.column)}${8-source.row}` ,
        to:`${String.fromCharCode(97+target.col)}${8-target.row}` ,
        promotion:'q',
    }
    socket.emit('move',move)
}
socket.on("playerRole",(role)=>{
    playerRole=role;
    renderBoard()
})
socket.on("spectatorRole",()=>{
    playerRole=null;
    renderBoard(); 
}) 
socket.on("boardState",(fen)=>{
    chess.load(fen)
    renderBoard();
})
socket.on('move',(move)=>{
    chess.move(move);
    renderBoard()
})
renderBoard()


