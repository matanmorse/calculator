// set watermark
const watermark = document.querySelector('h4.watermark');
watermark.innerHTML = `© ${(new Date).getFullYear()} Matan Morse`

// setup variables
var firstNumber = '';
var secondNumber = '';
var operator = '';
var tmpResult = '';
// get all buttons
const calculator = document.querySelector('div.calculator');
const buttonslist = Array.from(calculator.querySelectorAll('button'));
const result = document.querySelector('div.result');

// map operator symbols to their values
const OPERATORS = {
    'times':'x',
    'divide':'/',
    'minus':'-',
    'plus':'+',
    '' : '',
}

// map buttons to a dict where key is the name of the button and value is the button DOM obj
buttons = {}
buttonslist.forEach(button => {
    buttons[button.value] = button;
});


const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.']

const special = {
    'Control': flipsign,
    'Backspace': backspace,
    'e': evaluate,
    'Escape': clear,
}

const operators = {
    'x': 'times',
    '-': 'minus',
    '+': 'plus',
    '/': 'divide',
    '*': 'times',
}

// add keyboard functions
document.addEventListener('keydown', event => {
    key = event.key;
    // point towards correct function for type of keyboard press
    if (numbers.includes(key)) numberPressed(key);
    if (key in operators) operatorPressed(operators[key]);
    if (key in special) special[key]();
});

// to all operator buttons add functions
const operatorButtons = document.querySelectorAll('button.operator');
operatorButtons.forEach( button => {
    button.addEventListener('click', event => {
        operator = event.target.value;
        operatorPressed(operator);
    });
});

// to all the numbers add function for when they are pressed
const numberButtons = document.querySelectorAll('button.number');
numberButtons.forEach( button => {
    button.addEventListener('click', event => {
        let number = event.target.value;
        numberPressed(number)
    });
});

buttons['A/C'].addEventListener('click', clear);
buttons['eval'].addEventListener('click', evaluate);
buttons['posneg'].addEventListener('click', flipsign);
buttons['backspace'].addEventListener('click', backspace)

function numberPressed(number) {
    // if an operator hasn't been pressed write to the first number
    if (!operator) {
        firstNumber = firstNumber + number;
        updateDisplay(firstNumber);
    }
    // if an operator has been pressed we should start writing the second number
    if (operator && firstNumber) {
        secondNumber = secondNumber + number;
        updateDisplay(secondNumber);
    }
};

function operatorPressed( userPressedOperator ) {
    // check if there is a temporary value
    if (tmpResult && !firstNumber) {
        // start using it as the first number
        firstNumber = String(tmpResult);
        // reset the value
        tmpResult = '';
    }
    // if user hasn't put a number yet this doesnt matter
    if (!firstNumber) return;

    // if we're ready to evaluate and the user presses the operator
    // we should evaluate and set the result to the target number
    if (firstNumber && secondNumber && operator) {
        evaluate();
        firstNumber = String(tmpResult);
    }

    operator = userPressedOperator;
    updateSecondaryDisplay(firstNumber, secondNumber, operator);
}

const display = document.querySelector('div.display');
// update the display with a supplied value
function updateDisplay ( toDisplay ) {
    result.textContent = toDisplay;
    // check if there's an overflow error
    if (result.clientWidth > display.clientWidth ) {
        error('OVERFLOW');
        return;
    }

    updateSecondaryDisplay(firstNumber, secondNumber, operator);
};

// updates secondary display which shows whole calculation, called whenever updateDisplay is called
// has optional parameter "evaluating" which tells whether or not to use the equal sign
const secondaryDisplay = calculator.querySelector('div.secondary');
const updateSecondaryDisplay = (firstNumber, secondNumber, operator, evaluating = false) => {
    toDisplay = `${firstNumber} ${OPERATORS[operator]} ${secondNumber}`
    if (evaluating) toDisplay = `${toDisplay} =`;

    secondaryDisplay.textContent = toDisplay;

}

// removes one character from the active button
function backspace() {
    console.log('backspace!')
    // if theres nothing and the user hits backspace assume they want to clear
    if (!secondNumber && !firstNumber) {
        clear();
    }
    // determine what the active number is
    let activeNumber = secondNumber ? secondNumber : firstNumber;
    activeNumber = activeNumber.split('')
    activeNumber.pop()
    activeNumber = activeNumber.join('')
    secondNumber ? secondNumber = activeNumber : firstNumber = activeNumber;
    secondNumber ? updateDisplay(secondNumber) : updateDisplay(firstNumber);
    return;
}


// flip sign of number with pos/neg button
function flipsign() {
    console.log('flipping!')
    if (!firstNumber) {
        error('NO NUMBER');
        return;
    }
    // find which number is the active number
    number = secondNumber ? secondNumber : firstNumber;
    number = number < 0 ? Math.abs(number) : -Math.abs(number);

    // update the active number
    number = String(number);

    // if the second number exists (is active) update it otherwise update the first number
    secondNumber ? secondNumber = number : firstNumber = number;
    updateDisplay( number )
}

// clear the result display
function clear() {
    result.textContent = "";
    firstNumber = "";
    secondNumber = "";
    operator = "";
    tmpResult = "";
    updateSecondaryDisplay(firstNumber, secondNumber, operator);
};

// evaluate an expression
function evaluate() {
    console.log(firstNumber, operator, secondNumber)
    // cast strings we've been concating on to numbers so we can perform calculations on them
    x = +firstNumber;
    y = +secondNumber;

    // check for invalid eval cases
    // x or y will be falsy if they are NaN
    if (!operator || !firstNumber || !secondNumber || (typeof x !== 'number') || typeof y !== 'number') {
        error('ERROR')
        return;
    }
    
    // perform the correct operation depending on the operator 
    // and store the result in a temporary value in case user wants to use it in the next calculation
    if ( operator === 'plus' ) {
        tmpResult = add(x, y);
    }
    else if (operator === 'minus') {
        tmpResult = subtract(x, y);
    }       

    else if (operator === 'times') {
        tmpResult = multiply(x, y);
    }
    else if (operator === 'divide') {
        tmpResult = divide(x, y);
    }

    updateSecondaryDisplay(firstNumber, secondNumber, operator, evaluating = true);
    firstNumber = "";
    secondNumber = "";
    operator = ""; 
}

const add = (x, y) => {
    sum = x + y;
    updateDisplay(sum);
    return sum;
    
}

const subtract = (x, y) => {
    sum = x - y;
    updateDisplay(sum);
    return sum;
}

const multiply = (x, y) => {
    console.log('multiplying')
    let product = x * y
    // do some dumb stuff to make the number look nice
    product = Math.round(10000000000 * product) / 10000000000
    updateDisplay(product);
    return product;
}

const divide = (x, y) => {
    console.log('dividing')
    let quotient = x / y
    // do some dumb stuff to make the number look nice
    quotient = Math.round(10000000000 * quotient) / 10000000000
    updateDisplay(quotient);
    return quotient;
};

// function to deal with errors
const error = err => {
    clear();
    updateDisplay(err);
    firstNumber = '';
    secondNumber = '';
    operator = '';
}

