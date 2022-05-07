import { reservedWordsTokensMap, reservedWords, TokenType, symbolsTokensMap } from "./tokens";

export const pipe =
  (...functions) =>
  args =>
    functions.reduce((arg, fn) => fn(arg), args);

const isString = /^[a-zA-Z]+$/
const isNumber = /\d/

const lexer = (program) => {
  let currentString = '';
  const tokens = []

  for(let cursor = 0; cursor < program.length; cursor++) {
    if(isString.test(program[cursor]) || (currentString !== '' && isNumber.test(program[cursor]))) {
      currentString += program[cursor]
      continue;
    } 
    
    if(program[cursor] === '(' && currentString !== '') {
      tokens.push({
        type: TokenType.HTML_ELEMENT,
        value: currentString
      })

      currentString = '';
    }

    if(symbolsTokensMap[program[cursor]]) {
      tokens.push({
        type: symbolsTokensMap[program[cursor]],
        value: program[cursor]
      })
      continue;
    }

    if (currentString === '')
      continue;

    if(reservedWords.includes(currentString)) {
      tokens.push({
        type: reservedWordsTokensMap[currentString]
      })

      currentString = ''
      continue;
    }
    
    tokens.push({
      type: TokenType.STRING,
      value: currentString
    })

    currentString = ''
  }

  return tokens;
}

const parser = (tokens) => {
  console.log(tokens)
  const generateAST = (tokens, index = 0) => {
    console.log(tokens)
    const token = tokens[index];
    
    if(!token) return {}

    if(token.type === TokenType.STRUCT) {
      return {
        type: 'Component',
        ...generateAST(tokens, index + 1)
      }
    }

    if(token.type === 'STRING' && tokens[index - 1].type === TokenType.STRUCT) {
      return {
        name: token.value,
        ...generateAST(tokens, index + 1)
      }
    }


    if(token.type === TokenType.VARIABLE_DECLARATION && tokens[index + 1].value === 'body') {
      return {
        body: [generateAST(tokens, index + 4)]
      }
    }

    if(token.type === TokenType.HTML_ELEMENT && token.value === 'text') {
      const tokenAfterValue = tokens[index + 3].type
      
      if(tokenAfterValue === TokenType.COMMA) {
        const element = tokens[index + 6];

        return {
          type: 'HtmlElement',
          name: element.value,
          children: [{
            type: 'Text',
            value: tokens[index + 2].value
          }]
        }
      }

      return {
        type: 'Text',
        value: tokens[index + 2].value,
      }
    }

    if(token.type === TokenType.HTML_ELEMENT) {
      return {
        type: 'HtmlElement',
        name: token.value,
        children: [generateAST(tokens, index + 4)]
      }
    }

    return generateAST(tokens, index + 1);
  }

  return generateAST(tokens, 0)
}

const generator = (nodeAST) => {
  console.log(nodeAST)

  let program = ''

  if(!nodeAST) return ''

  if(nodeAST.type === 'Component') {
    const bodyProgram = (nodeAST.body ?? []).reduce((prev, next) => {
      console.log(nodeAST.body)
      return prev + generator(next);
    }, '')

    program += `const ${nodeAST.name} = () => {
      return ${bodyProgram !== '' ? bodyProgram : 'null;'}
    }`
  }

  if(nodeAST.type === 'HtmlElement') {
    return `<${nodeAST.name}>
      ${nodeAST.children.reduce((prev, next) => {
        return prev + generator(next);
      }, '')}
    </${nodeAST.name}>`
  }

  if(nodeAST.type === 'Text') {
    return nodeAST.value;
  }

  return program;
}

export default pipe(lexer, parser, generator);