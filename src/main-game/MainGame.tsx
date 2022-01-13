import React from 'react';
import './MainGame.css';

const columnLength: number = 10;
const rowLength: number = 20;

enum shapeEnum {
    sBlock = 1,
    zBlock,
    oBlock,
    lBlock,
    jBlock,
    iBlock,
    tBlock
}

class MainGame extends React.Component<any, any> {
    constructor(props:any) {
        super(props);
        this.state = {
            gridArray: [],
            isGameRunning: false,
            currentPiecePosition: [-1],
            isCurrentPieceActive: false,
            currentPieceShape: 0,
            rotationPosition: 0 //0 - 0 degrees, 1 - 270 degrees, 2 - 180 degrees, 3 - 90 degrees
        };
    }

    componentDidMount() {
        if (!this.state.gridArray || this.state.gridArray.length === 0) {
            const arr = this.initializeGrid();
            this.setState({ gridArray: arr });
        }
    }

    //#region GRID CREATION
    initializeGrid = () => {
        let arr: number[][] = [];
        for (let i = 0; i < rowLength; i++) {
            arr[i] = [];
            for (let j = 0; j < columnLength; j++) {
                arr[i][j] = 0;
            }
        }
        return arr;
    }

    renderColor = (num: number) => {
        let color: string = '';
        switch(num){
            case shapeEnum.sBlock: color = 'green' // s-block
                break;
            case shapeEnum.zBlock : color = 'red' // z-block
                break;
            case shapeEnum.oBlock: color = 'yellow' // o-block
                break;
            case shapeEnum.lBlock: color = 'orange' // L-block
                break;
            case shapeEnum.jBlock: color = 'blue' //J-block
                break;
            case shapeEnum.iBlock: color = '#28d0ed' //i-block, light blue
                break;
            case shapeEnum.tBlock: color = 'purple' //t-block
                break;
            default: color = 'transparent'; //empty space
                break;
        }
        return color;
    }

    renderPiece = (num: number) => {
        let gridArr = [...this.state.gridArray];
        let piecePos: number[] = [];
        switch (num) {
            case shapeEnum.sBlock: // s-block
                gridArr[0][4] = 1;
                gridArr[0][5] = 1;
                gridArr[1][3] = 1;
                gridArr[1][4] = 1;
                piecePos = [4, 5, 13, 14];
                break;
            case shapeEnum.zBlock: // z-block
                gridArr[0][3] = 2;
                gridArr[0][4] = 2;
                gridArr[1][4] = 2;
                gridArr[1][5] = 2;
                piecePos = [3, 4, 14, 15];
                break;
            case shapeEnum.oBlock: // o-block
                gridArr[0][4] = 3;
                gridArr[0][5] = 3;
                gridArr[1][4] = 3;
                gridArr[1][5] = 3;
                piecePos = [4, 5, 14, 15];
                break;
            case shapeEnum.lBlock: // L-block
                gridArr[0][5] = 4;
                gridArr[1][3] = 4;
                gridArr[1][4] = 4;
                gridArr[1][5] = 4;
                piecePos = [5, 13, 14, 15];
                break;
            case shapeEnum.jBlock: //J-block
                gridArr[0][3] = 5;
                gridArr[1][3] = 5;
                gridArr[1][4] = 5;
                gridArr[1][5] = 5;
                piecePos = [3, 13, 14, 15];
                break;
            case shapeEnum.iBlock: //i-block
                gridArr[1][3] = 6;
                gridArr[1][4] = 6;
                gridArr[1][5] = 6;
                gridArr[1][6] = 6;
                piecePos = [13, 14, 15, 16];
                break;
            case shapeEnum.tBlock: //t-block
                gridArr[0][4] = 7;
                gridArr[1][3] = 7;
                gridArr[1][4] = 7;
                gridArr[1][5] = 7;
                piecePos = [4, 13, 14, 15];
                break;
            default: //empty space
                break;
        }
        return [gridArr, piecePos];
    }

    //render 5x10 rectangle (5 columns, 10 rows)
    renderGrid = () => {       
        let gridArr = this.state.gridArray.map((x:any) => {
            return (
                <div className='gridRow' style={{height: (100 / columnLength) + '%'}}>
                    {x.map((y: any) => {
                        const color = this.renderColor(y);
                        return <span className='gridCell' style={{ backgroundColor: color, width: (100 / columnLength) + '%' }}>  </span>;
                    })}
                </div>
            )
        });
        return gridArr;
    }
    //#endregion

    //#region MOVEMENT
    createEventListener = () => {
        document.addEventListener('keydown', async (e:any) => {
            e.preventDefault();
            await this.onKeyPress(e.key);
        });
    }

    removeEventListener = () => {
        document.removeEventListener('keydown', async (e:any) => {
            e.preventDefault();
            await this.onKeyPress(e.key);
        });
    }

    startGame = async () => {
        await this.setState({ isGameRunning: true });
        await this.spawnPiece();
        this.createEventListener();
        let prevTime: Date = new Date();
        let isPieceActive: boolean = true;
        let isGameOver: boolean = false;
        while(this.state.isGameRunning) {
            if (new Date().getTime() - prevTime.getTime() > 750) {
                isPieceActive = await this.movePieceDown(true);
                if (!isPieceActive) {
                    await this.checkForClears();
                    await this.setState({ rotationPosition: 0 });
                    isGameOver = !(await this.spawnPiece());
                    if (isGameOver) {
                       await this.setState({ isGameRunning: false });
                       break;
                    }
                }
                prevTime = new Date();
            }
            await this.Delay();
        }
        this.removeEventListener();
    }

    onKeyPress = async (e:string) => {
        if (e.toUpperCase() === 'A') {
            await this.movePieceLeft();
        } else if (e.toUpperCase() === 'D') {
            await this.movePieceRight();
        } else if (e.toUpperCase() === 'S') {
            await this.movePieceDown(true);
        } else if (e.toUpperCase() === 'W') {
            //hard drop
        } else if (e.toUpperCase() === 'Q') {
            await this.rotatePiece('counter');
        } else if (e.toUpperCase() === 'E') {
            await this.rotatePiece('clockwise');
        }
    }

    spawnPiece = async () => {
        let randomNum = this.getRandomNumber()+1;
        const arr = this.renderPiece(randomNum);
        const isGameOver: boolean = await this.checkForEndGame(arr[1], randomNum);
        if (!isGameOver) {
            await this.setState({ 
                currentPiecePosition: arr[1],
                gridArray: arr[0],
                currentPieceShape: randomNum,
             });
             return true;
        } else {
            return false;
        }
    }

    movePieceLeft = async () => {
        let arr = [...this.state.gridArray];
        let currentPiecePosition = [...this.state.currentPiecePosition];
        let canMove = true;
        let arrPosition = [];
        let isSameBlockValueLeft: boolean = false;
        for (let i = 0; i < currentPiecePosition.length; i++) {
            currentPiecePosition[i] = [+currentPiecePosition[i]-1];
            arrPosition = this.calculateArrayPosition(+currentPiecePosition[i]);
            isSameBlockValueLeft = this.isSameBlockValueHorizontal(currentPiecePosition, i, 'left');
            if ((arr[arrPosition[0]][arrPosition[1]] !== 0 && !isSameBlockValueLeft) || (+currentPiecePosition[i]+1)%columnLength === 0) {
                canMove = false;
                break;
            }
        }
        if (canMove) {
            arr = await this.updateCurrentPiece(currentPiecePosition, 'left');
            await this.setState({
                gridArray: arr,
                currentPiecePosition: currentPiecePosition
            });
        }
    }

    movePieceRight = async () => {
        let arr = [...this.state.gridArray];
        let currentPiecePosition = [...this.state.currentPiecePosition];
        let canMove = true;
        let arrPosition = [];
        let isSameBlockValueRight: boolean = false;
        for (let i = currentPiecePosition.length-1; i >= 0; i--) {
            currentPiecePosition[i] = [+currentPiecePosition[i]+1];
            arrPosition = this.calculateArrayPosition(+currentPiecePosition[i]);
            isSameBlockValueRight = this.isSameBlockValueHorizontal(currentPiecePosition, i, 'right');
            if ((arr[arrPosition[0]][arrPosition[1]] !== 0 && !isSameBlockValueRight) || (+currentPiecePosition[i]-1)%columnLength === columnLength-1) {
                canMove = false;
            }
        }
        if (canMove) {
            arr = await this.updateCurrentPiece(currentPiecePosition, 'right');
            await this.setState({
                gridArray: arr,
                currentPiecePosition: currentPiecePosition
            });
        }
    }

    movePieceDown = async (isStateUpdated: boolean = true) => {
        let arr = [...this.state.gridArray];
        let currentPiecePosition = [...this.state.currentPiecePosition];
        let canMove = true;
        let arrPosition = [];
        let isSameBlockValueBelow: boolean = false;
        let isBottomPiece: boolean = false;
        let isHangingPiece: boolean = false;
        for (let i = 0; i < currentPiecePosition.length; i++) {
            isBottomPiece = this.isBottomMostPiece(this.state.currentPiecePosition, currentPiecePosition[i]);
            if (!isBottomPiece) isHangingPiece = this.isHangingPiece(this.state.currentPiecePosition, i);
            currentPiecePosition[i] = [+currentPiecePosition[i] + columnLength];
            if (currentPiecePosition[i] < (rowLength - 1) * columnLength) {
                arrPosition = this.calculateArrayPosition(+currentPiecePosition[i]);
                isSameBlockValueBelow = this.isSameBlockValueBelow(currentPiecePosition);
                if (arr[arrPosition[0]][arrPosition[1]] !== 0 && (!isSameBlockValueBelow || isBottomPiece || isHangingPiece)) {
                    canMove = false;
                    break;
                }
            } else if (currentPiecePosition[i] < (rowLength * columnLength)) {
                arrPosition = this.calculateArrayPosition(+currentPiecePosition[i]);
                if (arr[arrPosition[0]][arrPosition[1]] !== 0) {
                    canMove = false;
                    break;
                }
            } else {
                canMove = false;
                break;
            }
        }
        if (canMove && isStateUpdated) {
            arr = await this.updateCurrentPiece(currentPiecePosition, 'down');
            await this.setState({
                gridArray: arr,
                currentPiecePosition: currentPiecePosition
            });
        }
        return canMove;
    }

    updateCurrentPiece = async (currentPiecePosition: number[], direction: string) => {
        let gridArr = [...this.state.gridArray];
        const addVal: number = direction === 'left' ? 1 : direction === 'right' ? -1 : -1*columnLength;
        const reversedPositionList = [...currentPiecePosition].reverse();
        let arrPositionPrev = this.calculateArrayPosition(+currentPiecePosition[0] + +addVal);
        let arrPositionNew = this.calculateArrayPosition(currentPiecePosition[0]);
        let color:number = gridArr[arrPositionPrev[0]][arrPositionPrev[1]];
        for (let i = 0; i < currentPiecePosition.length; i++) {
            if (direction === 'left') {
                arrPositionPrev = this.calculateArrayPosition(+currentPiecePosition[i] + +addVal);
                arrPositionNew = this.calculateArrayPosition(currentPiecePosition[i]);
                gridArr[arrPositionPrev[0]][arrPositionPrev[1]] = 0;
                gridArr[arrPositionNew[0]][arrPositionNew[1]] = color;
            } else if (direction === 'right' || direction === 'down') {
                arrPositionPrev = this.calculateArrayPosition(+reversedPositionList[i] + +addVal);
                arrPositionNew = this.calculateArrayPosition(reversedPositionList[i]);
                gridArr[arrPositionPrev[0]][arrPositionPrev[1]] = 0;
                gridArr[arrPositionNew[0]][arrPositionNew[1]] = color;
            } else {

            }
        }
        return gridArr;
    }

    calculateArrayPosition = (index: number) => {
        const row = Math.floor(index/columnLength);
        const column = index%columnLength;
        return [row > 0 ? row : 0, column];
    }

    isSameBlockValueHorizontal = (arr: any, index: number, direction: string) => {
        const isJaggArr: boolean = !!arr[index][0];
        const arrValue: number = isJaggArr ? arr[index][0] : arr[index];
        const valToAdd: number = direction === 'left' ? -1 : 1;
        const valToCheck: number = arrValue + valToAdd;
        let isSameBlock: boolean = false;
        if (isJaggArr) {
            for (let i = 0; i < arr.length; i++) {
                if (i !== index && arr[i][0] === valToCheck) {
                    isSameBlock = true;
                    break;
                }
            }
        } else {
            isSameBlock = !arr.includes(valToCheck)
        }
        return isSameBlock;
    }

    isSameBlockValueBelow = (arr: number[]) => {
        let filteredArr: number[] = [];
        for (let i = 0; i < arr.length; i++) {
            if (!filteredArr.includes(arr[i])) {
                filteredArr.push(arr[i]);
            }
        }
        return arr.length === filteredArr.length;
    }

    isBottomMostPiece = (arr: any, currentVal: number) => {
        let maxVal: number = -1;
        let arrValue = -1;
        for (let i = 0; i < arr.length; i++) {
            arrValue = arr[i][0] ? arr[i][0] : arr[i];
            if (arrValue > maxVal) maxVal = arrValue;
        }
        let floor = Math.floor(maxVal/columnLength);
        if (floor < 0) floor = 0;
        const minRowVal = floor*columnLength;
        const maxRowVal = (floor+1)*columnLength;
        return currentVal >= minRowVal && currentVal < maxRowVal;
    }

    isHangingPiece = (arr: any, index: number) => {
        let isJaggArr = !!arr[index][0];
        let arrValue = isJaggArr ? arr[index][0] : arr[index];
        let isHangingPiece = true;
        const valToCheck: number = +arrValue + +columnLength;
        if (isJaggArr) {
            for (let i = 0; i < arr.length; i++) {
                if (i !== index && arr[i][0] === valToCheck) {
                    isHangingPiece = false;
                    break;
                }
            }
        } else {
            isHangingPiece = !arr.includes(valToCheck)
        }
        return isHangingPiece;
    }
    //#endregion

    //#region ROTATIONS
    rotatePiece = async (direction: string) => {
        let arr = [...this.state.gridArray];
        let currentPiecePosition = this.convertJaggedArrayToNumberArray([...this.state.currentPiecePosition]);
        let newPiecePosition: number[] = [];
        const isJaggArr: boolean = !!arr[0][0];
        let centerPoint: number = -1;
        let tempReference: any;
        let piecePosition: number = this.state.rotationPosition;
        if (piecePosition < 0) piecePosition = Math.abs(piecePosition + 4);

        if (this.state.currentPieceShape === shapeEnum.oBlock) return;
        if (this.state.currentPieceShape !== shapeEnum.iBlock) {
            //calculate the central point (figure out the middle coordinate in terms of array position)
            centerPoint = this.getCenterPiecePositionThreebyThree(piecePosition, currentPiecePosition);
            for (let i = 0; i < currentPiecePosition.length; i++) {
                switch (currentPiecePosition[i]) {
                    case centerPoint-columnLength-1: newPiecePosition.push(direction === 'clockwise' ? centerPoint-columnLength+1 : centerPoint+columnLength-1); continue;
                    case centerPoint-columnLength: newPiecePosition.push(direction === 'clockwise' ? centerPoint+1 : centerPoint-1); continue;
                    case centerPoint-columnLength+1: newPiecePosition.push(direction === 'clockwise' ? centerPoint+columnLength+1 : centerPoint-columnLength-1); continue;
                    case centerPoint-1: newPiecePosition.push(direction === 'clockwise' ? centerPoint-columnLength : centerPoint+columnLength); continue;
                    case centerPoint: newPiecePosition.push(centerPoint); continue;
                    case centerPoint+1: newPiecePosition.push(direction === 'clockwise' ? centerPoint+columnLength : centerPoint-columnLength); continue;
                    case centerPoint+columnLength-1: newPiecePosition.push(direction === 'clockwise' ? centerPoint-columnLength-1 : centerPoint+columnLength+1); continue;
                    case centerPoint+columnLength: newPiecePosition.push(direction === 'clockwise' ? centerPoint-1 : centerPoint+1); continue;
                    case centerPoint+columnLength+1: newPiecePosition.push(direction === 'clockwise' ? centerPoint+columnLength-1: centerPoint-columnLength+1); continue;
                    default: continue;
                }
            }
        } else {
            switch (piecePosition) {
                case 0: centerPoint = currentPiecePosition[0] - (2*columnLength);
                    newPiecePosition = [centerPoint+1, centerPoint+columnLength+1, centerPoint+(2*columnLength)+1, centerPoint+(3*columnLength)+1];
                    break;
                case 1: centerPoint = currentPiecePosition[0] - 1;
                    newPiecePosition = [centerPoint+columnLength, centerPoint+columnLength+1, centerPoint+columnLength+2, centerPoint+columnLength+3];
                    break;
                case 2: centerPoint = currentPiecePosition[0] - columnLength;
                    newPiecePosition = [centerPoint+2, centerPoint+columnLength+2, centerPoint+(2*columnLength)+2, centerPoint+(3*columnLength)+2];
                    break;
                case 3: centerPoint = currentPiecePosition[0] - 2;
                    newPiecePosition = [centerPoint+(2*columnLength), centerPoint+(2*columnLength)+1, centerPoint+(2*columnLength)+2, centerPoint+(2*columnLength)+3];
                    break;
                default: break;
            }

        }
        newPiecePosition.sort((a,b) => b-a).reverse();
            for (let i = 0; i < newPiecePosition.length; i++) {
                tempReference = this.calculateArrayPosition(currentPiecePosition[i]);
                arr[tempReference[0]][tempReference[1]] = 0;
            }
            for (let i = 0; i < newPiecePosition.length; i++) {
                tempReference = this.calculateArrayPosition(newPiecePosition[i]);
                arr[tempReference[0]][tempReference[1]] = this.state.currentPieceShape;
            }
            const newRotationUpdate: number = direction === 'clockwise' ? 1 : -1;
            
            await this.setState({
                gridArray: arr,
                currentPiecePosition: newPiecePosition,
                rotationPosition: (this.state.rotationPosition+newRotationUpdate)%4
            }, async () => await this.Delay());
    }

    getCenterPiecePositionThreebyThree(piecePosition: number, currentPiecePosition: number[]) {
        let centerPoint: number = -1;
        switch (this.state.currentPieceShape) {
            case shapeEnum.sBlock:
                centerPoint = piecePosition === 0 ? currentPiecePosition[0] : 
                              piecePosition === 1 ? currentPiecePosition[2] :
                              piecePosition === 2 ? currentPiecePosition[3] :
                              currentPiecePosition[1];
                break;
            case shapeEnum.zBlock:
                centerPoint = piecePosition === 0 ? currentPiecePosition[1] :
                              piecePosition === 1 ? currentPiecePosition[2] :
                              piecePosition === 2 ? currentPiecePosition[2] :
                              currentPiecePosition[1];
                break;
            case shapeEnum.lBlock:
                centerPoint = piecePosition === 0 ? currentPiecePosition[2] :
                              piecePosition === 1 ? currentPiecePosition[1] :
                              piecePosition === 2 ? currentPiecePosition[1] :
                              currentPiecePosition[2];
                break;
            case shapeEnum.jBlock:
                centerPoint = piecePosition === 0 ? currentPiecePosition[2] :
                              piecePosition === 1 ? currentPiecePosition[2] :
                              piecePosition === 2 ? currentPiecePosition[1] :
                              currentPiecePosition[1];
                break;
            case shapeEnum.tBlock:
                centerPoint = piecePosition === 0 ? currentPiecePosition[2] :
                              piecePosition === 1 ? currentPiecePosition[1] :
                              piecePosition === 2 ? currentPiecePosition[1] :
                              currentPiecePosition[2];
                break;
            default:
                break;
        }
        return centerPoint;
    }
    //#endregion

    //#region GAME CONDITION CHECKS
    clearLine = async (rowNumber: number) => {
        let gridArr = [...this.state.gridArray];
        for (let i = rowNumber; i > 0; i--) {
            if (i !== 0) {
                for (let j = 0; j < columnLength; j++) {
                    gridArr[i][j] = gridArr[i-1][j];
                }
            }
        }
        gridArr[0] = [];
        for (let i = 0; i < columnLength; i++) {
            gridArr[0].push(0);
        }
        await this.setState({
            gridArray: gridArr
        });
    }

    checkForClears = async () => {
        let gridArr = this.state.gridArray;
        let isRowClear: boolean = true;
        for (let i = 0; i < rowLength; i++) {
            isRowClear = true;
            for (let j = 0; j < columnLength; j++) {
                if (gridArr[i][j] === 0) {
                    isRowClear = false;
                    break;
                }
            }
            if (isRowClear && !(await this.movePieceDown(false))) {
                await this.clearLine(i);
            }
        }
    }

    checkForEndGame = async (newCurrentPiecePositionArray: any, currentPieceShape: number) => {
        // FAILING, CHECK TO SEE WHY PIECES ARE NOT BEING UPDATED
        //check if 3,4,5 is populated
        if (!(await this.movePieceDown(false))) {
            const gridArr = [...this.state.gridArray];
            if (currentPieceShape === shapeEnum.iBlock) {
                if (gridArr[0][3] !== 0 && newCurrentPiecePositionArray.includes(13) ||
                    gridArr[0][4] !== 0 && newCurrentPiecePositionArray.includes(14) ||
                    gridArr[0][5] !== 0 && newCurrentPiecePositionArray.includes(15)) {
                    return true;
                }
            } else {
                if (gridArr[0][3] !== 0 && newCurrentPiecePositionArray.includes(3) ||
                    gridArr[0][4] !== 0 && newCurrentPiecePositionArray.includes(4) ||
                    gridArr[0][5] !== 0 && newCurrentPiecePositionArray.includes(5)) {
                        return true;
                    }
            }
        }
        return false;
    }
    //#endregion

    //#region Common Logic
    Delay = async (amount: number = 50) => {
        return new Promise((res) => {
            setTimeout(res, amount);
        });
    }

    getRandomNumber = () => {
        return Math.floor(Math.random() * Object.keys(shapeEnum).length/2);
    }

    convertJaggedArrayToNumberArray = (arr:any) => {
        const isJaggArr: boolean = !!arr[0][0];
        if (isJaggArr) {
            let numArr: number[] = [];
            for (let i = 0; i < arr.length; i++) {
                numArr.push(arr[i][0]);
            }
            return numArr;
        }
        return arr;
    }
    //#endregion

    render() {
        return this.state.gridArray && this.state.gridArray.length > 0 ? (
            <div onClick={!this.state.isGameRunning ? async () => await this.startGame() : () => {}} tabIndex={1}>
                <div className='overallGrid'>{this.renderGrid()}</div>
                {!this.state.isGameRunning && <div className='overallGrid startMessage'>CLICK the board to start</div>}
            </div>
        ) : <div>GENERATING BOARD...</div>
    }
}

export default MainGame