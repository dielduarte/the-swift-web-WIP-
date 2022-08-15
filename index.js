import prettier from 'prettier'
import { reservedWordsTokensMap, reservedWords, TokenType, symbolsTokensMap } from "./tokens";

export const pipe =
  (...functions) =>
  args =>
    functions.reduce((arg, fn) => fn(arg), args);

const isString = /^[a-zA-Z]+$/
const isNumber = /\d/
const isSpace = /\s/

const lexer = (program, index = 0, tokens = [], currentString = program[index]) => {
  // next chat is a utility helper
  // it increases the index + 1,
  // and sets the currentString value
  // to be the next char.
  const nextChar = () => {
    index++;
    currentString = program[index];
  }

  // skip empty space since we don't care
  while (isSpace.test(currentString)) {
    nextChar();
  }

  // check strings
  if (isString.test(currentString)) {
    let tempString = '';
    do {
      tempString += currentString;
      nextChar();
    } while (isString.test(currentString) || isNumber.test(currentString));

    if(reservedWords.includes(tempString)) {
      tokens.push({
        type: reservedWordsTokensMap[tempString]
      })
      // currentString is already the next index char after the tempString
      // since we only stop creating the temp string, if the next char is not a string
    } else if(currentString === '(') {
      tokens.push({
        type: TokenType.HTML_ELEMENT,
        value: tempString
      })
    } else {
      tokens.push({
        type: TokenType.STRING,
        value: tempString
      })
    }
  }

  if(symbolsTokensMap[currentString]) {
    tokens.push({
      type: symbolsTokensMap[currentString],
      value: currentString
    })
  }

  // while we still have chars to parse
  // we just call lexer again
  if(index < program.length - 1) {
    nextChar();
    return lexer(program, index, tokens, currentString)
  }

  return tokens;
}

// const lexer = (program) => {
//   let currentString = '';
//   const tokens = []

//   for(let cursor = 0; cursor < program.length; cursor++) {
//     if(isString.test(program[cursor]) || (currentString !== '' && isNumber.test(program[cursor]))) {
//       currentString += program[cursor]
//       continue;
//     } 
    
//     if(program[cursor] === '(' && currentString !== '') {
//       tokens.push({
//         type: TokenType.HTML_ELEMENT,
//         value: currentString
//       })

//       currentString = '';
//     }

//     if(symbolsTokensMap[program[cursor]]) {
//       tokens.push({
//         type: symbolsTokensMap[program[cursor]],
//         value: program[cursor]
//       })
//       continue;
//     }

//     if (currentString === '')
//       continue;

//     if(reservedWords.includes(currentString)) {
//       tokens.push({
//         type: reservedWordsTokensMap[currentString]
//       })

//       currentString = ''
//       continue;
//     }
    
//     tokens.push({
//       type: TokenType.STRING,
//       value: currentString
//     })

//     currentString = ''
//   }
//   return tokens;
// }

const parser = (tokens) => {
  console.log(tokens, ' <<<<< tokens')
  let index = 0;
  const generateAST = (tokens) => {
    const token = tokens[index];
    
    if(!token) return {}

    if(token.type === TokenType.STRUCT) {
      index++;
      return {
        type: 'Component',
        ...generateAST(tokens)
      }
    }

    if(token.type === 'STRING' && tokens[index - 1].type === TokenType.STRUCT) {
      index++;
      return {
        name: token.value,
        ...generateAST(tokens)
      }
    }


    if(token.type === TokenType.VARIABLE_DECLARATION && tokens[index + 1].value === 'body') {       
      index+=4;
      let body = []
     
      while(index < tokens.length) {
        const nextTokenIsValidChild = tokens[index].type === TokenType.HTML_ELEMENT
        
        if(!nextTokenIsValidChild) {
          index++;
          continue;
        };

        body.push(generateAST(tokens))
        index++;
      }

      return {
        body
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
      index += 4;
      const hasChildren = tokens[index].type !== TokenType.RIGHT_BRACKET
      let children = hasChildren ? [generateAST(tokens)] : []

      if(hasChildren) {
        // define scope
        
        // while(parentScope) {
        //   children.push(generateAST(tokens))
        //   index++;
        // }
      }
      
      return {
        type: 'HtmlElement',
        name: token.value,
        children
      }
    }

    index++;
    return generateAST(tokens);
  }

  return generateAST(tokens)
}

const generator = (nodeAST) => {
  console.log(nodeAST);

  let program = ''

  if(!nodeAST) return ''

  if(nodeAST.type === 'Component') {
    const body = nodeAST.body ?? [];
    const shouldInsertFragment = body.length > 1

    const bodyProgram = body.reduce((prev, next) => {
      return prev + generator(next);
    },'')

    program += `const ${nodeAST.name} = () => {
      return ${shouldInsertFragment ? '<>' : ''}
        ${bodyProgram !== '' ? bodyProgram : 'null;'}
      ${shouldInsertFragment ? '</>' : ''}  
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