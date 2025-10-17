// Polyfill for browser APIs during SSR
if (typeof window === 'undefined') {
  // Mock storage for server-side rendering
  const mockStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    length: 0,
    key: () => null,
  };

  // Mock location for server-side rendering
  const mockLocation = {
    href: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    origin: 'http://localhost:3000',
  };

  // Mock document for server-side rendering
  const mockDocument = {
    documentElement: {
      style: {
        setProperty: () => {},
      },
    },
    cookie: '',
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    getElementsByTagName: () => [],
    getElementsByClassName: () => [],
    createElement: () => ({
      style: {},
      setAttribute: () => {},
      getAttribute: () => null,
      appendChild: () => {},
      removeChild: () => {},
    }),
    head: {
      appendChild: () => {},
      removeChild: () => {},
    },
    body: {
      appendChild: () => {},
      removeChild: () => {},
    },
  };

  // @ts-ignore
  global.localStorage = mockStorage;
  // @ts-ignore  
  global.sessionStorage = mockStorage;
  // @ts-ignore
  global.document = mockDocument;
  // @ts-ignore
  global.window = {
    localStorage: mockStorage,
    sessionStorage: mockStorage,
    location: mockLocation,
    addEventListener: () => {},
    removeEventListener: () => {},
    matchMedia: () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
    innerWidth: 1024,
  };
}