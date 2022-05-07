export const TokenType = {
  // Single-character tokens.
  LEFT_BRACKET: 'LEFT_BRACKET', 
  RIGHT_BRACKET: 'RIGHT_BRACKET',
  LEFT_PARENTHESES: 'LEFT_PARENTHESES',
  RIGHT_PARENTHESES: 'RIGHT_PARENTHESES',
  COMMA: 'COMMA',
  
  // One or two character tokens.
  EQUAL: 'EQUAL',

  // Literals.
  STRING: 'STRING',
  
  // meaningful keywords
  STRUCT: 'STRUCT',
  VARIABLE_DECLARATION: 'VARIABLE_DECLARATION',
  HTML_ELEMENT: 'HTML_ELEMENT',
}

export const reservedWordsTokensMap = {
  'struct': TokenType.STRUCT,
  'let':  TokenType.VARIABLE_DECLARATION
}

export const symbolsTokensMap = {
  '=': TokenType.EQUAL,
  '{': TokenType.LEFT_BRACKET,
  '}': TokenType.RIGHT_BRACKET,
  '(': TokenType.LEFT_PARENTHESES,
  ')': TokenType.RIGHT_PARENTHESES,
  ',': TokenType.COMMA,
}

export const reservedWords = Object.keys(reservedWordsTokensMap)