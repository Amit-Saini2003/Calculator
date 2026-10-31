/**
 * Simple Calculator
 * Handles user interactions, arithmetic operations, and display updates.
 */

class Calculator {
  constructor(previousOperandElement, currentOperandElement) {
    this.previousOperandElement = previousOperandElement;
    this.currentOperandElement = currentOperandElement;
    this.clear();
  }

  clear() {
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = undefined;
    this.shouldResetScreen = false;
  }

  delete() {
    if (this.shouldResetScreen) {
      this.clear();
      return;
    }
    if (this.currentOperand === '0' || this.currentOperand === 'Error') {
      return;
    }
    if (this.currentOperand.length === 1 || (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))) {
      this.currentOperand = '0';
    } else {
      this.currentOperand = this.currentOperand.slice(0, -1);
    }
  }

  appendNumber(number) {
    if (this.shouldResetScreen || this.currentOperand === 'Error') {
      this.currentOperand = '';
      this.shouldResetScreen = false;
    }

    if (number === '.') {
      if (this.currentOperand.includes('.')) return;
      if (this.currentOperand === '') this.currentOperand = '0';
    }

    if (this.currentOperand === '0' && number !== '.') {
      this.currentOperand = number.toString();
    } else {
      this.currentOperand = this.currentOperand.toString() + number.toString();
    }
  }

  toggleSign() {
    if (this.currentOperand === '0' || this.currentOperand === 'Error') return;
    if (this.currentOperand.startsWith('-')) {
      this.currentOperand = this.currentOperand.slice(1);
    } else {
      this.currentOperand = '-' + this.currentOperand;
    }
  }

  percent() {
    if (this.currentOperand === 'Error') return;
    const current = parseFloat(this.currentOperand);
    if (isNaN(current)) return;
    const result = current / 100;
    this.currentOperand = this.formatPrecision(result).toString();
  }

  chooseOperation(operation) {
    if (this.currentOperand === 'Error') {
      this.clear();
    }

    // Allow changing operator if no new number has been entered
    if (this.currentOperand === '' && this.previousOperand !== '') {
      this.operation = operation;
      return;
    }

    if (this.previousOperand !== '') {
      this.compute();
    }

    this.operation = operation;
    this.previousOperand = this.currentOperand;
    this.currentOperand = '';
  }

  compute() {
    let computation;
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);

    if (isNaN(prev) || isNaN(current)) return;

    switch (this.operation) {
      case '+':
        computation = prev + current;
        break;
      case '-':
        computation = prev - current;
        break;
      case '×':
      case '*':
        computation = prev * current;
        break;
      case '÷':
      case '/':
        if (current === 0) {
          this.currentOperand = 'Error';
          this.previousOperand = '';
          this.operation = undefined;
          this.shouldResetScreen = true;
          return;
        }
        computation = prev / current;
        break;
      default:
        return;
    }

    // Fix floating point precision issues (e.g. 0.1 + 0.2 = 0.3)
    this.currentOperand = this.formatPrecision(computation).toString();
    this.operation = undefined;
    this.previousOperand = '';
    this.shouldResetScreen = true;
  }

  formatPrecision(num) {
    return Math.round((num + Number.EPSILON) * 1e12) / 1e12;
  }

  formatDisplayNumber(numberStr) {
    if (numberStr === 'Error' || numberStr === '') return numberStr;

    const parts = numberStr.split('.');
    const integerPart = parseFloat(parts[0]);
    const decimalPart = parts[1];

    let formattedInteger = '';
    if (isNaN(integerPart)) {
      formattedInteger = '';
    } else {
      formattedInteger = integerPart.toLocaleString('en-US');
    }

    if (decimalPart != null) {
      return `${formattedInteger}.${decimalPart}`;
    } else {
      return formattedInteger;
    }
  }

  updateDisplay() {
    this.currentOperandElement.innerText = this.formatDisplayNumber(this.currentOperand);

    if (this.operation != null && this.previousOperand !== '') {
      this.previousOperandElement.innerText = `${this.formatDisplayNumber(this.previousOperand)} ${this.operation}`;
    } else {
      this.previousOperandElement.innerText = '';
    }
  }
}

// Initialize Calculator DOM Bindings
document.addEventListener('DOMContentLoaded', () => {
  const previousOperandElement = document.getElementById('previous-operand');
  const currentOperandElement = document.getElementById('current-operand');

  const calculator = new Calculator(previousOperandElement, currentOperandElement);

  // Number Buttons
  document.querySelectorAll('[data-number]').forEach(button => {
    button.addEventListener('click', () => {
      calculator.appendNumber(button.dataset.number);
      calculator.updateDisplay();
    });
  });

  // Operator Buttons
  document.querySelectorAll('[data-operator]').forEach(button => {
    button.addEventListener('click', () => {
      calculator.chooseOperation(button.dataset.operator);
      calculator.updateDisplay();
    });
  });

  // Action Buttons
  document.querySelectorAll('[data-action]').forEach(button => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      switch (action) {
        case 'clear':
          calculator.clear();
          break;
        case 'delete':
          calculator.delete();
          break;
        case 'sign':
          calculator.toggleSign();
          break;
        case 'percent':
          calculator.percent();
          break;
        case 'equals':
          calculator.compute();
          break;
      }
      calculator.updateDisplay();
    });
  });

  // Keyboard Support
  window.addEventListener('keydown', (e) => {
    if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
      calculator.appendNumber(e.key);
      calculator.updateDisplay();
    } else if (e.key === '+' || e.key === '-') {
      calculator.chooseOperation(e.key);
      calculator.updateDisplay();
    } else if (e.key === '*') {
      calculator.chooseOperation('×');
      calculator.updateDisplay();
    } else if (e.key === '/') {
      e.preventDefault(); // Prevent browser search shortcut
      calculator.chooseOperation('÷');
      calculator.updateDisplay();
    } else if (e.key === 'Enter' || e.key === '=') {
      e.preventDefault();
      calculator.compute();
      calculator.updateDisplay();
    } else if (e.key === 'Backspace') {
      calculator.delete();
      calculator.updateDisplay();
    } else if (e.key === 'Escape') {
      calculator.clear();
      calculator.updateDisplay();
    } else if (e.key === '%') {
      calculator.percent();
      calculator.updateDisplay();
    }
  });

  calculator.updateDisplay();
});