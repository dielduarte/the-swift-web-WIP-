import compiler from '../index'

describe('when generating components', () => {
  it('should generate a function return null', () => {
    const program = `struct App = {}`
    console.log(compiler(program))
    
    expect(compiler(program).replace(/\s/g, '')).toEqual(`const App = () => { return null; }`.replace(/\s/g, ''))
  })

  it('should generate a function returning null', () => {
    const program = `struct MyApp = { let body = {} }`

    expect(compiler(program).replace(/\s/g, '')).toEqual("const MyApp = () => { return null; }".replace(/\s/g, ''))
  })

  it('should generate a function returning null', () => {
    const program = `struct MyAppTest = { 
      let body = {
        button() {
          text('testing')
        }
      } 
    }`

    expect(compiler(program).replace(/\s/g, '')).toEqual(`const MyAppTest = () => { 
      return <button>
        testing
      </button>
    }`.replace(/\s/g, ''))
  })

  it('should generate nested elements', () => {
    const program = `struct MyAppTest = { 
      let body = {
        button() {
          p() {
            text('testing')
          }
        }
      } 
    }`

    expect(compiler(program).replace(/\s/g, '')).toEqual(`const MyAppTest = () => { 
      return <button>
        <p>
          testing
        </p>
      </button>
    }`.replace(/\s/g, ''))
  })

  it('should generate siblings elements within body', () => {
    const program = `struct MyAppTest = { 
      let body = {
        button() {
          text('hello')
        }
        h1() {
          text('hello')
        }
      } 
    }`


    expect(compiler(program).replace(/\s/g, '')).toEqual(`const MyAppTest = () => { 
      return <>
        <button>
          hello
        </button>
        <h1>
          hello
        </h1>
      </>
    }`.replace(/\s/g, ''))
  })

  it('should generate siblings elements within another element', () => {
    const program = `struct MyAppTest = { 
      let body = {
        section() {
          h1() {
            text('hello')
          }
          button() {
            text('click here')
          }
        }
      }   
    }`


    expect(compiler(program).replace(/\s/g, '')).toEqual(`const MyAppTest = () => { 
      return <section>
        <h1>hello</h1>
        <button>
          click here
        </button>
      </section>
    }`.replace(/\s/g, ''))
  })

  it('should generate nested elements', () => {
    const program = `struct MyAppTest = { 
      let body = {
        button() {
          p() {
            text('testing', { as: 'h1' })
          }
        }
      } 
    }`

    expect(compiler(program).replace(/\s/g, '')).toEqual(`const MyAppTest = () => { 
      return <button>
        <p>
          <h1>testing</h1>
        </p>
      </button>
    }`.replace(/\s/g, ''))
  })
})