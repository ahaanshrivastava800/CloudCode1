'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface SnippetLibraryProps {
  isOpen: boolean
  onClose: () => void
  onInsertSnippet: (snippet: string) => void
  language: string
}

// Code snippets organized by language
const SNIPPETS: Record<string, Array<{ name: string; code: string }>> = {
  javascript: [
    {
      name: 'For Loop',
      code: `for (let i = 0; i < array.length; i++) {
  console.log(array[i]);
}`,
    },
    {
      name: 'Function',
      code: `function functionName(param1, param2) {
  // function body
  return result;
}`,
    },
    {
      name: 'Arrow Function',
      code: `const functionName = (param1, param2) => {
  // function body
  return result;
}`,
    },
    {
      name: 'Async/Await',
      code: `async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}`,
    },
    {
      name: 'Array Map',
      code: `const newArray = array.map(item => {
  return item * 2;
});`,
    },
    {
      name: 'Array Filter',
      code: `const filteredArray = array.filter(item => {
  return item > 10;
});`,
    },
    {
      name: 'Class',
      code: `class MyClass {
  constructor(param) {
    this.param = param;
  }

  method() {
    return this.param;
  }
}`,
    },
  ],
  python: [
    {
      name: 'For Loop',
      code: `for i in range(len(array)):
    print(array[i])`,
    },
    {
      name: 'Function',
      code: `def function_name(param1, param2):
    # function body
    return result`,
    },
    {
      name: 'List Comprehension',
      code: `new_list = [item * 2 for item in array]`,
    },
    {
      name: 'Class',
      code: `class MyClass:
    def __init__(self, param):
        self.param = param
    
    def method(self):
        return self.param`,
    },
    {
      name: 'Try/Except',
      code: `try:
    result = some_operation()
except Exception as e:
    print(f"Error: {e}")`,
    },
    {
      name: 'Dict Comprehension',
      code: `new_dict = {key: value * 2 for key, value in dict.items()}`,
    },
  ],
  sql: [
    {
      name: 'SELECT Query',
      code: `SELECT column1, column2
FROM table_name
WHERE condition
ORDER BY column1;`,
    },
    {
      name: 'INSERT Query',
      code: `INSERT INTO table_name (column1, column2)
VALUES (value1, value2);`,
    },
    {
      name: 'UPDATE Query',
      code: `UPDATE table_name
SET column1 = value1
WHERE condition;`,
    },
    {
      name: 'DELETE Query',
      code: `DELETE FROM table_name
WHERE condition;`,
    },
    {
      name: 'JOIN Query',
      code: `SELECT t1.column1, t2.column2
FROM table1 t1
INNER JOIN table2 t2 ON t1.id = t2.id;`,
    },
    {
      name: 'CREATE TABLE',
      code: `CREATE TABLE table_name (
  id INT PRIMARY KEY,
  column1 VARCHAR(255),
  column2 INT
);`,
    },
  ],
  cpp: [
    {
      name: 'For Loop',
      code: `for (int i = 0; i < array.size(); i++) {
  std::cout << array[i] << std::endl;
}`,
    },
    {
      name: 'Function',
      code: `int functionName(int param1, int param2) {
  // function body
  return result;
}`,
    },
    {
      name: 'Vector Loop',
      code: `for (const auto& item : vector) {
  std::cout << item << std::endl;
}`,
    },
    {
      name: 'Class',
      code: `class MyClass {
private:
  int param;
public:
  MyClass(int p) : param(p) {}
  
  int method() {
    return param;
  }
};`,
    },
  ],
  rust: [
    {
      name: 'For Loop',
      code: `for item in array.iter() {
  println!("{}", item);
}`,
    },
    {
      name: 'Function',
      code: `fn function_name(param1: i32, param2: i32) -> i32 {
  // function body
  result
}`,
    },
    {
      name: 'Struct',
      code: `struct MyStruct {
  param: i32,
}

impl MyStruct {
  fn new(param: i32) -> Self {
    MyStruct { param }
  }
  
  fn method(&self) -> i32 {
    self.param
  }
}`,
    },
    {
      name: 'Iterator',
      code: `let result: Vec<i32> = array.iter()
  .map(|x| x * 2)
  .collect();`,
    },
  ],
  go: [
    {
      name: 'For Loop',
      code: `for i, item := range array {
  fmt.Println(i, item)
}`,
    },
    {
      name: 'Function',
      code: `func functionName(param1 int, param2 int) int {
  // function body
  return result
}`,
    },
    {
      name: 'Goroutine',
      code: `go func() {
  // concurrent code
}()`,
    },
    {
      name: 'Struct',
      code: `type MyStruct struct {
  Param int
}

func (m *MyStruct) Method() int {
  return m.Param
}`,
    },
  ],
  java: [
    {
      name: 'For Loop',
      code: `for (int i = 0; i < array.length; i++) {
  System.out.println(array[i]);
}`,
    },
    {
      name: 'For-Each Loop',
      code: `for (String item : array) {
  System.out.println(item);
}`,
    },
    {
      name: 'Method',
      code: `public int methodName(int param1, int param2) {
  // method body
  return result;
}`,
    },
    {
      name: 'Class',
      code: `public class MyClass {
  private int param;
  
  public MyClass(int param) {
    this.param = param;
  }
  
  public int getParam() {
    return param;
  }
}`,
    },
  ],
}

export default function SnippetLibrary({
  isOpen,
  onClose,
  onInsertSnippet,
  language,
}: SnippetLibraryProps) {
  const snippets = SNIPPETS[language] || []

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-30"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="snippet-drawer open z-40"
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {language.charAt(0).toUpperCase() + language.slice(1)} Snippets
              </h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-2">
              {snippets.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No snippets available for {language}
                </p>
              ) : (
                snippets.map((snippet, index) => (
                  <button
                    key={index}
                    onClick={() => onInsertSnippet(snippet.code)}
                    className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="font-medium text-gray-900 dark:text-white mb-1">
                      {snippet.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                      {snippet.code.split('\n')[0]}
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
